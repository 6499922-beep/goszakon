import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import mammoth from "mammoth";
import { createExtractorFromData } from "node-unrar-js";
import * as XLSX from "xlsx";

export type TenderUploadedFile = {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
};

export type TenderPreparedSourceDocument = {
  title: string;
  fileName: string;
  documentKind: string;
  extractedText: string | null;
  extractionNote: string;
  file: TenderUploadedFile;
};

function isZipArchiveFile(file: TenderUploadedFile) {
  const normalizedName = (file.name || "").toLowerCase().trim();
  if (normalizedName.endsWith(".zip")) {
    return true;
  }

  if (file.buffer.length < 4) {
    return false;
  }

  // ZIP magic: PK\x03\x04, PK\x05\x06, PK\x07\x08
  return (
    file.buffer[0] === 0x50 &&
    file.buffer[1] === 0x4b &&
    (file.buffer[2] === 0x03 || file.buffer[2] === 0x05 || file.buffer[2] === 0x07) &&
    (file.buffer[3] === 0x04 || file.buffer[3] === 0x06 || file.buffer[3] === 0x08)
  );
}

function isRarArchiveFile(file: TenderUploadedFile) {
  const normalizedName = (file.name || "").toLowerCase().trim();
  if (normalizedName.endsWith(".rar")) {
    return true;
  }

  if (file.buffer.length < 7) {
    return false;
  }

  // RAR4/5 magic: "Rar!\x1A\x07"
  return (
    file.buffer[0] === 0x52 &&
    file.buffer[1] === 0x61 &&
    file.buffer[2] === 0x72 &&
    file.buffer[3] === 0x21 &&
    file.buffer[4] === 0x1a &&
    file.buffer[5] === 0x07
  );
}

function toExactArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}

export function normalizeTenderString(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized.length ? normalized : null;
}

export function slugifyTenderFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function buildTenderIntakeTitle(input: {
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

export async function persistTenderUpload(file: TenderUploadedFile) {
  const safeName = slugifyTenderFileName(file.name || "document");
  const stampedName = `${Date.now()}-${safeName || "document.bin"}`;
  const relativePath = path.join("docs", "tender-intake", stampedName);
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, file.buffer);

  return {
    storedRelativePath: relativePath.replaceAll(path.sep, "/"),
    originalFileName: file.name || stampedName,
  };
}

export async function extractTextFromTenderUpload(file: TenderUploadedFile) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const buffer = file.buffer;

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
      return {
        extractedText: null,
        extractionNote:
          "PDF сохранён в системе, но текст из него пока не удалось извлечь автоматически. Его можно проверить вручную или загрузить версию в DOCX/XLSX, если она есть.",
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

function normalizeArchiveEntryName(value: string) {
  return value.replace(/\\/g, "/").replace(/^\/+/, "").trim();
}

function joinArchiveChain(parts: string[]) {
  return parts.filter(Boolean).join(" / ");
}

async function prepareDirectTenderDocument(
  file: TenderUploadedFile,
  archiveChain: string[] = []
): Promise<TenderPreparedSourceDocument[]> {
  const { extractedText, extractionNote } = await extractTextFromTenderUpload(file);
  const visibleName = joinArchiveChain([...archiveChain, file.name || "document"]);

  return [
    {
      title: visibleName,
      fileName: file.name || visibleName,
      documentKind: inferSourceDocumentKind(file.name || visibleName),
      extractedText,
      extractionNote,
      file,
    },
  ];
}

async function prepareZipArchiveDocuments(
  file: TenderUploadedFile,
  archiveChain: string[] = [],
  depth = 0
): Promise<TenderPreparedSourceDocument[]> {
  const archiveTitle = joinArchiveChain([...archiveChain, file.name || "archive.zip"]);
  const archiveDocument: TenderPreparedSourceDocument = {
    title: archiveTitle,
    fileName: file.name || "archive.zip",
    documentKind: "Архив закупки",
    extractedText: null,
    extractionNote: "ZIP-архив сохранён в системе.",
    file,
  };

  if (depth >= 3) {
    archiveDocument.extractionNote =
      "ZIP-архив сохранён, но глубина вложенных архивов превышает допустимый предел. Нужна ручная проверка.";
    return [archiveDocument];
  }

  try {
    const zip = new AdmZip(file.buffer);
    const entries = zip
      .getEntries()
      .filter((entry) => !entry.isDirectory)
      .slice(0, 200);

    if (entries.length === 0) {
      archiveDocument.extractionNote = "ZIP-архив сохранён, но внутри не найдено файлов для анализа.";
      return [archiveDocument];
    }

    const extractedDocuments: TenderPreparedSourceDocument[] = [];

    for (const entry of entries) {
      const entryName = normalizeArchiveEntryName(entry.entryName);
      const nestedFile: TenderUploadedFile = {
        name: path.basename(entryName),
        type: "",
        size: entry.header.size,
        buffer: entry.getData(),
      };

      const nestedDocs = await prepareTenderUploadDocuments(
        nestedFile,
        [...archiveChain, file.name || "archive.zip", entryName],
        depth + 1
      );
      extractedDocuments.push(...nestedDocs);
    }

    const analyzableCount = extractedDocuments.filter((item) => item.extractedText?.trim()).length;
    archiveDocument.extractionNote =
      analyzableCount > 0
        ? `ZIP-архив сохранён. Внутри найдено ${entries.length} файлов, для анализа извлечено ${analyzableCount}.`
        : `ZIP-архив сохранён. Внутри найдено ${entries.length} файлов, но текста для анализа извлечь не удалось.`;

    return [archiveDocument, ...extractedDocuments];
  } catch {
    archiveDocument.extractionNote =
      "ZIP-архив сохранён, но его не удалось автоматически раскрыть. Нужна ручная проверка.";
    return [archiveDocument];
  }
}

async function prepareRarArchiveDocuments(
  file: TenderUploadedFile,
  archiveChain: string[] = [],
  depth = 0
): Promise<TenderPreparedSourceDocument[]> {
  const archiveTitle = joinArchiveChain([...archiveChain, file.name || "archive.rar"]);
  const archiveDocument: TenderPreparedSourceDocument = {
    title: archiveTitle,
    fileName: file.name || "archive.rar",
    documentKind: "Архив закупки",
    extractedText: null,
    extractionNote: "RAR-архив сохранён в системе.",
    file,
  };

  if (depth >= 3) {
    archiveDocument.extractionNote =
      "RAR-архив сохранён, но глубина вложенных архивов превышает допустимый предел. Нужна ручная проверка.";
    return [archiveDocument];
  }

  try {
    const extractor = await createExtractorFromData({ data: toExactArrayBuffer(file.buffer) });
    const extracted = extractor.extract();
    const files = [...extracted.files].filter(
      (item) => !item.fileHeader.flags.directory && item.extraction
    );

    if (files.length === 0) {
      archiveDocument.extractionNote = "RAR-архив сохранён, но внутри не найдено файлов для анализа.";
      return [archiveDocument];
    }

    const nestedDocuments: TenderPreparedSourceDocument[] = [];

    for (const item of files.slice(0, 200)) {
      const entryName = normalizeArchiveEntryName(item.fileHeader.name);
      const nestedFile: TenderUploadedFile = {
        name: path.basename(entryName),
        type: "",
        size: item.extraction?.byteLength ?? item.fileHeader.unpSize ?? 0,
        buffer: Buffer.from(item.extraction ?? new Uint8Array()),
      };

      const nestedDocs = await prepareTenderUploadDocuments(
        nestedFile,
        [...archiveChain, file.name || "archive.rar", entryName],
        depth + 1
      );
      nestedDocuments.push(...nestedDocs);
    }

    const analyzableCount = nestedDocuments.filter((item) => item.extractedText?.trim()).length;
    archiveDocument.extractionNote =
      analyzableCount > 0
        ? `RAR-архив сохранён. Внутри найдено ${files.length} файлов, для анализа извлечено ${analyzableCount}.`
        : `RAR-архив сохранён. Внутри найдено ${files.length} файлов, но текста для анализа извлечь не удалось.`;

    return [archiveDocument, ...nestedDocuments];
  } catch {
    archiveDocument.extractionNote =
      "RAR-архив сохранён, но его не удалось автоматически раскрыть. Нужна ручная проверка.";
    return [archiveDocument];
  }
}

export async function prepareTenderUploadDocuments(
  file: TenderUploadedFile,
  archiveChain: string[] = [],
  depth = 0
): Promise<TenderPreparedSourceDocument[]> {
  if (isZipArchiveFile(file)) {
    return prepareZipArchiveDocuments(file, archiveChain, depth);
  }

  if (isRarArchiveFile(file)) {
    return prepareRarArchiveDocuments(file, archiveChain, depth);
  }

  return prepareDirectTenderDocument(file, archiveChain);
}

export function inferSourceDocumentKind(fileName: string) {
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
