import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import WordExtractor from "word-extractor";
import * as XLSX from "xlsx";

const execFileAsync = promisify(execFile);

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

async function withTemporaryFile<T>(
  file: TenderUploadedFile,
  callback: (absolutePath: string) => Promise<T>
) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "tender-intake-"));
  const absolutePath = path.join(tempDir, file.name || "document.bin");

  try {
    await writeFile(absolutePath, file.buffer);
    return await callback(absolutePath);
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function extractLegacyDocText(file: TenderUploadedFile) {
  try {
    const extractor = new WordExtractor();
    const extractedDocument = await extractor.extract(file.buffer);
    const extractedText = extractedDocument.getBody().trim();

    if (extractedText.length > 0) {
      return {
        extractedText,
        extractionNote: "Текст из DOC удалось извлечь автоматически.",
      };
    }
  } catch {
    // fallback below
  }

  try {
    return await withTemporaryFile(file, async (absolutePath) => {
      const { stdout } = await execFileAsync("antiword", [absolutePath], {
        maxBuffer: 20 * 1024 * 1024,
      });
      const extractedText = String(stdout ?? "").replace(/\u0000/g, "").trim();

      return {
        extractedText: extractedText.length > 0 ? extractedText : null,
        extractionNote:
          extractedText.length > 0
            ? "Текст из DOC удалось извлечь автоматически."
            : "DOC загружен, но текст для анализа извлечь не удалось.",
      };
    });
  } catch {
    return {
      extractedText: null,
      extractionNote:
        "Файл DOC сохранён, но его не удалось автоматически разобрать. Нужна ручная проверка или версия в DOCX.",
    };
  }
}

async function extractPdfText(file: TenderUploadedFile) {
  try {
    const parser = new PDFParse({ data: file.buffer });
    const pdfResult = await parser.getText();
    await parser.destroy();
    const extractedText = pdfResult.text.trim();

    if (extractedText.length > 0) {
      return {
        extractedText,
        extractionNote: "Текст из PDF удалось извлечь автоматически.",
      };
    }
  } catch {
    // fallback below
  }

  try {
    return await withTemporaryFile(file, async (absolutePath) => {
      const textPath = `${absolutePath}.txt`;
      await execFileAsync("pdftotext", ["-layout", absolutePath, textPath], {
        maxBuffer: 20 * 1024 * 1024,
      });
      const extractedText = (await readFile(textPath, "utf-8")).trim();

      return {
        extractedText: extractedText.length > 0 ? extractedText : null,
        extractionNote:
          extractedText.length > 0
            ? "Текст из PDF удалось извлечь автоматически."
            : "PDF сохранён в системе, но текст из него пока не удалось извлечь автоматически. Его можно проверить вручную или загрузить версию в DOCX/XLSX, если она есть.",
      };
    });
  } catch {
    return {
      extractedText: null,
      extractionNote:
        "PDF сохранён в системе, но текст из него пока не удалось извлечь автоматически. Его можно проверить вручную или загрузить версию в DOCX/XLSX, если она есть.",
    };
  }
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

function normalizeSheetCell(value: unknown) {
  const normalized = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized;
}

function isMeaningfulSheetRow(row: unknown[]) {
  return row.some((cell) => normalizeSheetCell(cell).length > 0);
}

function chooseHeaderRowIndex(rows: string[][]) {
  const maxScan = Math.min(8, rows.length);
  let bestIndex = 0;
  let bestScore = -1;

  for (let index = 0; index < maxScan; index += 1) {
    const row = rows[index];
    const filledCells = row.filter((cell) => cell.length > 0).length;
    if (filledCells > bestScore) {
      bestScore = filledCells;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function isNumericLikeCell(value: string) {
  return /^\d+(?:[.,]\d+)?$/.test(value.replace(/\s+/g, ""));
}

function isLikelyWorkbookDataRow(row: string[]) {
  const nonEmpty = row.filter((cell) => cell.length > 0);
  if (nonEmpty.length < 3) return false;

  const numericCells = nonEmpty.filter(isNumericLikeCell).length;
  const longTextCells = nonEmpty.filter((cell) => /[а-яa-z]/i.test(cell) && cell.length >= 12).length;

  return numericCells >= 2 && longTextCells >= 1;
}

function findFirstLikelyDataRowIndex(rows: string[][]) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const nonEmpty = row.filter((cell) => cell.length > 0);
    if (nonEmpty.length < 3) continue;

    const numericCells = nonEmpty.filter(isNumericLikeCell).length;
    const firstCell = row[0] ?? "";

    if ((isNumericLikeCell(firstCell) && numericCells >= 2) || isLikelyWorkbookDataRow(row)) {
      return index;
    }
  }

  return null;
}

function mergeHeaderRows(headerRows: string[][]) {
  const width = Math.max(...headerRows.map((row) => row.length), 0);

  return Array.from({ length: width }, (_, columnIndex) => {
    const parts = headerRows
      .map((row) => row[columnIndex] ?? "")
      .map((cell) => cell.trim())
      .filter(Boolean);

    const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index);
    return uniqueParts.join(" / ") || `Колонка ${columnIndex + 1}`;
  });
}

function normalizeWorkbookNumeric(value: string) {
  const normalized = value.replace(/\s+/g, "").replace(",", ".").trim();
  if (!normalized) return "";
  return /^\d+(?:\.\d+)?$/.test(normalized) ? normalized : value;
}

function getWorkbookColumnIndexes(headers: string[]) {
  const findIndex = (pattern: RegExp) =>
    headers.findIndex((header) => pattern.test(header.toLowerCase()));

  return {
    ordinal: findIndex(/^(п\/п|№|номер|n)$/i),
    name: findIndex(/наимен|товар|продукц|оборуд|материал|работ|услуг|позици|номенклатур/i),
    unit: findIndex(/ед\.? ?изм|единиц|unit|ед\./i),
    quantity: findIndex(/колич|объем|объ[её]м|qty/i),
    price: findIndex(/цена|стоим.*ед|unit.?price|за единиц/i),
    amount: findIndex(/сумм|стоим(?!.*ед)|итого|total/i),
  };
}

function inferWorkbookHeadersFromDataRow(row: string[]) {
  return row.map((cell, index) => {
    const normalized = cell.trim();
    if (index === 0 && isNumericLikeCell(normalized)) return "№";
    if (index === 1 && /[а-яa-z]/i.test(normalized) && normalized.length >= 8) return "Наименование";
    if (index === 2 && normalized.length <= 10 && /[а-яa-z]/i.test(normalized)) return "Ед. изм.";
    if (index === 3 && isNumericLikeCell(normalized)) return "Количество";
    if (index === 4 && isNumericLikeCell(normalized)) return "Цена";
    if (index === 5 && isNumericLikeCell(normalized)) return "Сумма";
    return `Колонка ${index + 1}`;
  });
}

function isWorkbookTotalRow(row: string[]) {
  const haystack = row.join(" | ").toLowerCase();
  return /(^|[^\w])(итого|всего|итог|total)([^\w]|$)/i.test(haystack);
}

function inferWorkbookTableNature(headers: string[], rows: string[][]) {
  const headerHaystack = headers.join(" | ").toLowerCase();
  const rowHaystack = rows.slice(0, 12).map((row) => row.join(" | ").toLowerCase()).join(" ");

  if (
    /нмц|нмцк|нмцд|обоснован|цена|стоим|ндс|итого|всего/i.test(headerHaystack) ||
    /нмц|нмцк|нмцд|обоснован|ндс/i.test(rowHaystack)
  ) {
    return "pricing";
  }

  if (/наимен|товар|продукц|оборуд|материал|ед\.? ?изм|колич/i.test(headerHaystack)) {
    return "goods";
  }

  return "mixed";
}

function buildWorkbookTotalLines(headers: string[], rows: string[][]) {
  const totalRows = rows.filter(isWorkbookTotalRow).slice(0, 8);
  if (totalRows.length === 0) return [];

  return totalRows.map((row, rowIndex) => {
    const pairs = headers
      .map((header, index) => {
        const value = row[index] ?? "";
        return value ? `${header}: ${normalizeWorkbookNumeric(value)}` : null;
      })
      .filter(Boolean);

    return `Итог ${rowIndex + 1}. ${pairs.join(" | ")}`;
  });
}

function buildWorkbookTableLines(headers: string[], rows: string[][]) {
  const columns = getWorkbookColumnIndexes(headers);
  const selectedColumns = [
    columns.ordinal,
    columns.name,
    columns.unit,
    columns.quantity,
    columns.price,
    columns.amount,
  ].filter((index) => index >= 0);

  if (selectedColumns.length < 2 || columns.name < 0) return [];

  const headerLine = selectedColumns.map((index) => headers[index]).join(" | ");
  const lines = [`Таблица позиций: ${headerLine}`];

  rows.forEach((row) => {
    if (isWorkbookTotalRow(row)) return;
    const nameValue = row[columns.name] ?? "";
    if (!nameValue) return;

    const values = selectedColumns
      .map((index) => normalizeWorkbookNumeric(row[index] ?? ""))
      .map((value) => value.trim())
      .filter(Boolean);

    if (values.length > 0) {
      lines.push(values.join(" | "));
    }
  });

  return lines.slice(0, 160);
}

function collectWorkbookPositionLines(headers: string[], rows: string[][]) {
  const headerHaystack = headers.join(" | ").toLowerCase();
  const likelyPositionTable =
    /наимен|товар|продукц|оборуд|материал|позици|ед\.? ?изм|колич|цена|стоим|сумм/i.test(
      headerHaystack
    );

  if (!likelyPositionTable) return [];

  const interestingColumns = headers.map((header, index) => {
    const normalized = header.toLowerCase();
    const isInteresting =
      /п\/п|№|наимен|товар|продукц|оборуд|материал|характер|марк|модел|артикул|ед\.? ?изм|колич|цена|стоим|сумм/i.test(
        normalized
      );

    return isInteresting ? index : -1;
  }).filter((index) => index >= 0);

  const lines: string[] = [];

  rows.forEach((row, rowIndex) => {
    if (isWorkbookTotalRow(row)) return;
    const parts = interestingColumns
      .map((columnIndex) => {
        const header = headers[columnIndex];
        const value = row[columnIndex] ?? "";
        if (!value) return null;
        return `${header}: ${value}`;
      })
      .filter(Boolean);

    if (parts.length > 0) {
      lines.push(`Позиция ${rowIndex + 1}. ${parts.join(" | ")}`);
    }
  });

  return lines.slice(0, 120);
}

function extractStructuredTextFromWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    }) as unknown[][];

    const rows = rawRows
      .map((row) => row.map(normalizeSheetCell))
      .filter(isMeaningfulSheetRow);

    if (rows.length === 0) {
      return "";
    }

    const firstDataRowIndex = findFirstLikelyDataRowIndex(rows);
    const headerlessTable = firstDataRowIndex === 0 && isLikelyWorkbookDataRow(rows[0] ?? []);
    const headerRows =
      !headerlessTable && firstDataRowIndex && firstDataRowIndex > 0
        ? rows.slice(0, firstDataRowIndex)
        : [rows[chooseHeaderRowIndex(rows)]];
    const headers = headerlessTable
      ? inferWorkbookHeadersFromDataRow(rows[0] ?? [])
      : mergeHeaderRows(headerRows);
    const dataRows = rows
      .slice(
        headerlessTable
          ? 0
          : firstDataRowIndex ?? chooseHeaderRowIndex(rows) + 1
      )
      .filter((row) => row.some((cell) => cell.length > 0))
      .slice(0, 80);

    const summaryLines = [
      `Лист: ${sheetName}`,
      `Тип таблицы: ${
        inferWorkbookTableNature(headers, dataRows) === "pricing"
          ? "НМЦК и цены"
          : inferWorkbookTableNature(headers, dataRows) === "goods"
            ? "Товарная таблица"
            : "Смешанная таблица"
      }`,
      `Колонки: ${headers.join(" | ")}`,
    ];

    const positionLines = collectWorkbookPositionLines(headers, dataRows);
    const tableLines = buildWorkbookTableLines(headers, dataRows);
    const totalLines = buildWorkbookTotalLines(headers, dataRows);

    if (dataRows.length > 0 && tableLines.length === 0) {
      summaryLines.push("Строки таблицы:");
      dataRows.forEach((row, rowIndex) => {
        const pairs = headers
          .map((header, index) => {
            const value = row[index] ?? "";
            return value ? `${header}: ${value}` : null;
          })
          .filter(Boolean);

        if (pairs.length > 0) {
          summaryLines.push(`${rowIndex + 1}. ${pairs.join(" | ")}`);
        }
      });
    } else {
      summaryLines.push("Строки таблицы автоматически не выделены.");
    }

    if (positionLines.length > 0) {
      summaryLines.push("Позиции для анализа:");
      summaryLines.push(...positionLines);
    }

    if (tableLines.length > 0) {
      summaryLines.push("Компактная таблица позиций:");
      summaryLines.push(...tableLines);
    }

    if (totalLines.length > 0) {
      summaryLines.push("Итоги таблицы:");
      summaryLines.push(...totalLines);
    }

    return summaryLines.join("\n");
  })
    .filter(Boolean)
    .join("\n\n");

  return sheets.trim();
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

    if (name.endsWith(".doc")) {
      return extractLegacyDocText(file);
    }

    if (name.endsWith(".pdf")) {
      return extractPdfText(file);
    }

    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const extractedText = extractStructuredTextFromWorkbook(buffer);

      return {
        extractedText: extractedText.length > 0 ? extractedText : null,
        extractionNote:
          extractedText.length > 0
            ? "Таблицы и текст из Excel удалось извлечь автоматически."
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

async function prepareDirectTenderDocument(
  file: TenderUploadedFile
): Promise<TenderPreparedSourceDocument[]> {
  const { extractedText, extractionNote } = await extractTextFromTenderUpload(file);
  const visibleName = file.name || "document";

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

export async function prepareTenderUploadDocuments(
  file: TenderUploadedFile
): Promise<TenderPreparedSourceDocument[]> {
  return prepareDirectTenderDocument(file);
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
