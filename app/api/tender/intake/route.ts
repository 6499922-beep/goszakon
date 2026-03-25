import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import * as XLSX from "xlsx";
import {
  TenderActionType,
  TenderProcurementStatus,
  TenderSourceDocumentAutofillStatus,
  TenderSourceDocumentStatus,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { runTenderPrimaryAnalysis } from "@/lib/tender-primary-analysis";
import { logTenderEvent } from "@/lib/tender-workflow";

function normalizeString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length ? normalized : null;
}

function slugifyTenderFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildTenderIntakeTitle(input: {
  sourceUrl: string | null;
  uploadedNames: string[];
}) {
  if (input.uploadedNames.length > 0) {
    return `Закупка по файлам: ${input.uploadedNames[0]}`;
  }

  if (input.sourceUrl?.trim()) {
    return "Закупка по ссылке";
  }

  return "Новая закупка";
}

async function persistTenderUpload(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = slugifyTenderFileName(file.name || "document");
  const stampedName = `${Date.now()}-${safeName || "document.bin"}`;
  const relativePath = path.join("docs", "tender-intake", stampedName);
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);

  return {
    storedRelativePath: relativePath.replaceAll(path.sep, "/"),
    originalFileName: file.name || stampedName,
  };
}

async function extractTextFromTenderUpload(file: File) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  const isPlainText =
    type.startsWith("text/") ||
    type.includes("json") ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv") ||
    name.endsWith(".json");

  if (!isPlainText) {
    if (name.endsWith(".docx")) {
      const docxResult = await mammoth.extractRawText({ buffer });
      const extractedText = docxResult.value.trim();

      return {
        extractedText: extractedText.length > 0 ? extractedText : null,
        extractionNote:
          extractedText.length > 0
            ? "Текст из DOCX удалось извлечь автоматически."
            : "DOCX загружен, но текст для анализа извлечь не удалось.",
      };
    }

    if (name.endsWith(".pdf")) {
      const parser = new PDFParse({ data: buffer });
      const pdfResult = await parser.getText();
      await parser.destroy();
      const extractedText = pdfResult.text.trim();

      return {
        extractedText: extractedText.length > 0 ? extractedText : null,
        extractionNote:
          extractedText.length > 0
            ? "Текст из PDF удалось извлечь автоматически."
            : "PDF загружен, но текст для анализа извлечь не удалось.",
      };
    }

    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const extractedText = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet, { blankrows: false }).trim();
        return csv ? `Лист: ${sheetName}\n${csv}` : "";
      })
        .filter(Boolean)
        .join("\n\n")
        .trim();

      return {
        extractedText: extractedText.length > 0 ? extractedText : null,
        extractionNote:
          extractedText.length > 0
            ? "Текст из Excel удалось извлечь автоматически."
            : "Excel-файл загружен, но данных для анализа извлечь не удалось.",
      };
    }

    return {
      extractedText: null,
      extractionNote:
        "Файл сохранён в системе, но этот формат пока не удалось разобрать автоматически. Его можно использовать дальше как исходный документ закупки.",
    };
  }

  const extractedText = buffer.toString("utf-8").trim();

  return {
    extractedText: extractedText.length > 0 ? extractedText : null,
    extractionNote:
      extractedText.trim().length > 0
        ? "Текст из файла удалось извлечь автоматически."
        : "Файл загружен, но текста для анализа внутри не найдено.",
  };
}

function inferSourceDocumentKind(fileName: string) {
  const normalized = fileName.toLowerCase();

  if (normalized.includes("тз") || normalized.includes("техническ")) {
    return "Техническое задание";
  }
  if (normalized.includes("договор")) {
    return "Проект договора";
  }
  if (normalized.includes("цен") || normalized.includes("price")) {
    return "Ценовая форма";
  }
  if (normalized.includes("анкет")) {
    return "Анкета";
  }
  if (normalized.includes("заявк") || normalized.includes("соглас")) {
    return "Форма заявки";
  }

  return "Документ закупки";
}

export async function POST(request: Request) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
    return NextResponse.json(
      { ok: false, error: "Недостаточно прав для создания закупки" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const prisma = getPrisma();
  const actorName =
    currentUser.name?.trim() || currentUser.email?.trim() || "Сотрудник";
  const sourceUrl = normalizeString(formData.get("sourceUrl"));
  const uploadedFiles = formData
    .getAll("documents")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (uploadedFiles.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Нужно загрузить хотя бы один документ." },
      { status: 400 }
    );
  }

  const procurementTitle = buildTenderIntakeTitle({
    sourceUrl,
    uploadedNames: uploadedFiles.map((file) => file.name),
  });

  const record = await prisma.tenderProcurement.create({
    data: {
      title: procurementTitle,
      sourceUrl,
      status: TenderProcurementStatus.NEW,
      aiAnalysisStatus: "queued",
    },
  });

  const extractedChunks: string[] = [];
  const extractionWarnings: string[] = [];

  for (const file of uploadedFiles) {
    const stored = await persistTenderUpload(file);
    const { extractedText, extractionNote } = await extractTextFromTenderUpload(file);

    if (extractedText) {
      extractedChunks.push(`Файл: ${stored.originalFileName}\n${extractedText}`);
    } else if (extractionNote) {
      extractionWarnings.push(`${stored.originalFileName}: ${extractionNote}`);
    }

    await prisma.tenderSourceDocument.create({
      data: {
        procurementId: record.id,
        title: stored.originalFileName,
        fileName: stored.originalFileName,
        documentKind: inferSourceDocumentKind(stored.originalFileName),
        contentSnippet: extractedText?.slice(0, 4000) ?? null,
        status: extractedText
          ? TenderSourceDocumentStatus.READY_FOR_ANALYSIS
          : TenderSourceDocumentStatus.UPLOADED,
        autofillStatus: TenderSourceDocumentAutofillStatus.NOT_ANALYZED,
        note: extractionNote
          ? `${extractionNote}\nФайл сохранён: /${stored.storedRelativePath}`
          : `Файл сохранён: /${stored.storedRelativePath}`,
      },
    });
  }

  await logTenderEvent({
    procurementId: record.id,
    actionType: TenderActionType.CREATED,
    title: "Закупка загружена",
    description: "Сотрудник загрузил пакет исходной документации.",
    actorName,
  });

  const combinedSourceText = extractedChunks.join("\n\n").trim();

  if (!combinedSourceText) {
    const message =
      extractionWarnings.length > 0
        ? `Не удалось автоматически извлечь текст из загруженных файлов.\n${extractionWarnings.join("\n")}`
        : "Для первичного анализа не хватило текста документации.";

    await prisma.tenderProcurement.update({
      where: { id: record.id },
      data: {
        aiAnalysisStatus: "needs_text",
        aiAnalysisError: message,
        sourceText: null,
      },
    });

    return NextResponse.json({
      ok: true,
      procurementId: record.id,
      status: "needs_text",
    });
  }

  await prisma.tenderProcurement.update({
    where: { id: record.id },
    data: {
      sourceText: combinedSourceText,
      aiAnalysisStatus: "running",
      aiAnalysisError: null,
      status: TenderProcurementStatus.ANALYSIS,
    },
  });

  try {
    await runTenderPrimaryAnalysis({
      procurementId: record.id,
      sourceText: combinedSourceText,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось выполнить первичный AI-анализ";

    await prisma.tenderProcurement.update({
      where: { id: record.id },
      data: {
        aiAnalysisStatus: "failed",
        aiAnalysisError: message,
      },
    });

    await logTenderEvent({
      procurementId: record.id,
      actionType: TenderActionType.NOTE_ADDED,
      title: "Первичный анализ не завершён",
      description: message,
      actorName: "AI",
    });
  }

  return NextResponse.json({
    ok: true,
    procurementId: record.id,
    status: "processed",
  });
}
