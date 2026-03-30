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

function decodeBasicHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function normalizeHtmlText(value: string) {
  return decodeBasicHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripHtmlTagsPreservingText(value: string) {
  return normalizeHtmlText(value.replace(/<[^>]+>/g, " "));
}

function extractStructuredTextFromDocxHtml(html: string) {
  const sections: string[] = [];

  const tableMatches = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)];
  let normalizedHtml = html;

  tableMatches.forEach((match, tableIndex) => {
    const tableHtml = match[0];
    const rowMatches = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
    const tableLines = rowMatches
      .map((rowMatch, rowIndex) => {
        const cellMatches = [...rowMatch[0].matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)];
        const cells = cellMatches
          .map((cellMatch) => stripHtmlTagsPreservingText(cellMatch[1]))
          .map((cell) => cell.trim())
          .filter(Boolean);

        if (cells.length === 0) return null;
        return rowIndex === 0
          ? `Колонки: ${cells.join(" | ")}`
          : `Строка ${rowIndex}: ${cells.join(" | ")}`;
      })
      .filter((line): line is string => Boolean(line));

    const replacement =
      tableLines.length > 0
        ? `\n\nТаблица ${tableIndex + 1}:\n${tableLines.join("\n")}\n\n`
        : "\n\n";
    normalizedHtml = normalizedHtml.replace(tableHtml, replacement);
  });

  const headingMatches = [
    ...normalizedHtml.matchAll(/<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi),
  ];

  headingMatches.forEach((match) => {
    const tag = match[1].toLowerCase();
    const text = stripHtmlTagsPreservingText(match[2]);
    if (!text) return;

    if (tag.startsWith("h")) {
      sections.push(`Раздел: ${text}`);
      return;
    }

    if (tag === "li") {
      sections.push(`- ${text}`);
      return;
    }

    sections.push(text);
  });

  const structured = normalizeHtmlText(sections.join("\n"));
  return structured.length > 0 ? structured : null;
}

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

function getWorksheetCellDisplayValue(cell: XLSX.CellObject | undefined) {
  if (!cell) return "";
  if (typeof cell.w === "string" && cell.w.trim()) {
    return normalizeSheetCell(cell.w);
  }
  if (cell.v == null) return "";
  return normalizeSheetCell(cell.v);
}

function extractWorksheetRows(worksheet: XLSX.WorkSheet) {
  const ref = worksheet["!ref"];
  if (!ref) return [];

  const range = XLSX.utils.decode_range(ref);
  const merges = Array.isArray(worksheet["!merges"]) ? worksheet["!merges"] : [];

  const mergeValueByAnchor = new Map<string, string>();
  merges.forEach((merge) => {
    const anchorRef = XLSX.utils.encode_cell(merge.s);
    const anchorValue = getWorksheetCellDisplayValue(worksheet[anchorRef]);
    mergeValueByAnchor.set(anchorRef, anchorValue);
  });

  const rows: string[][] = [];

  for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
    const row: string[] = [];

    for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
      let value = getWorksheetCellDisplayValue(worksheet[cellRef]);

      if (!value) {
        const mergedRange = merges.find(
          (merge) =>
            rowIndex >= merge.s.r &&
            rowIndex <= merge.e.r &&
            columnIndex >= merge.s.c &&
            columnIndex <= merge.e.c
        );
        if (mergedRange) {
          const anchorRef = XLSX.utils.encode_cell(mergedRange.s);
          value = mergeValueByAnchor.get(anchorRef) ?? "";
        }
      }

      row.push(value);
    }

    rows.push(row);
  }

  return rows;
}

function splitWorksheetIntoBlocks(rows: string[][]) {
  const blocks: string[][][] = [];
  let currentBlock: string[][] = [];

  rows.forEach((row) => {
    const hasMeaning = row.some((cell) => cell.length > 0);
    if (!hasMeaning) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
      return;
    }

    currentBlock.push(row);
  });

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
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
  const compact = value.replace(/\u00A0/g, " ").replace(/\s+/g, "").trim();
  if (!compact) return "";

  const trimmed = compact.replace(/[^\d,.\-]/g, "");
  if (!trimmed) return value;

  const decimalMatch = trimmed.match(/([.,])(\d{1,2})$/);
  if (decimalMatch && decimalMatch.index != null) {
    const integerPart = trimmed.slice(0, decimalMatch.index).replace(/[.,]/g, "");
    const fractionalPart = decimalMatch[2];
    const normalized = `${integerPart}.${fractionalPart}`;
    return /^-?\d+(?:\.\d+)?$/.test(normalized) ? normalized : value;
  }

  const normalized = trimmed.replace(/[.,]/g, "");
  return /^-?\d+$/.test(normalized) ? normalized : value;
}

function parseWorkbookAmount(value: string) {
  const normalized = normalizeWorkbookNumeric(value);
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
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

function areWorkbookHeadersTooGeneric(headers: string[]) {
  const meaningful = headers.filter(
    (header) => !/^колонка \d+$/i.test(header) && /[а-яa-z]/i.test(header)
  );
  return meaningful.length < Math.max(2, Math.ceil(headers.length / 3));
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

function scoreWorkbookBlock(tableNature: "pricing" | "goods" | "mixed", rows: string[][]) {
  const totalRows = rows.filter(isWorkbookTotalRow).length;
  const numericCells = rows
    .flatMap((row) => row)
    .filter((cell) => parseWorkbookAmount(cell) != null).length;
  const textCells = rows
    .flatMap((row) => row)
    .filter((cell) => /[а-яa-z]/i.test(cell)).length;

  const base =
    tableNature === "pricing"
      ? 120
      : tableNature === "goods"
        ? 100
        : 60;

  return base + totalRows * 30 + Math.min(40, numericCells) + Math.min(30, textCells);
}

function buildWorkbookPricingLines(headers: string[], rows: string[][]) {
  const headerHaystack = headers.join(" | ").toLowerCase();
  const columns = getWorkbookColumnIndexes(headers);
  const amountColumnCandidates = [columns.amount, columns.price].filter((index) => index >= 0);
  const lines: string[] = [];

  const pricingRows = rows.filter((row) => {
    const haystack = row.join(" | ").toLowerCase();
    const hasNumericAmount = amountColumnCandidates.some((index) => {
      const raw = row[index] ?? "";
      const amount = parseWorkbookAmount(raw);
      return Number.isFinite(amount) && (amount ?? 0) > 0;
    });
    return (
      isWorkbookTotalRow(row) ||
      (hasNumericAmount &&
        /нмцк|нмцд|нмц|итого|всего|ндс|без ндс|с ндс|общая сумма|цена договора|цена лота|стоимость|руб/i.test(
          haystack
        ))
    );
  });

  if (pricingRows.length === 0 && /нмц|нмцк|нмцд|цена|стоим|ндс|итого|всего/i.test(headerHaystack)) {
    rows.slice(0, 20).forEach((row) => pricingRows.push(row));
  }

  pricingRows.slice(0, 24).forEach((row, rowIndex) => {
    const pairs = headers
      .map((header, index) => {
        const value = row[index] ?? "";
        if (!value) return null;
        return `${header}: ${normalizeWorkbookNumeric(value)}`;
      })
      .filter(Boolean);

    if (pairs.length > 0) {
      lines.push(`Ценовая строка ${rowIndex + 1}. ${pairs.join(" | ")}`);
    }
  });

  const numericCandidates = rows
    .flatMap((row) =>
      amountColumnCandidates.map((index) => {
        const raw = row[index] ?? "";
        const amount = parseWorkbookAmount(raw);
        if (!amount || amount <= 0) return null;
        const haystack = row.join(" | ").toLowerCase();
        const score =
          (isWorkbookTotalRow(row) ? 100 : 0) +
          (/нмцк|нмцд|нмц|цена договора|цена лота/i.test(haystack) ? 90 : 0) +
          (/итого|всего|общая сумма/i.test(haystack) ? 80 : 0) +
          (/ндс/i.test(haystack) ? 30 : 0);

        return {
          amount,
          score,
          line: row.join(" | "),
        };
      })
    )
    .filter((item): item is { amount: number; score: number; line: string } => Boolean(item))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.amount - left.amount;
    })
    .slice(0, 5);

  if (numericCandidates.length > 0) {
    lines.push("Кандидаты на НМЦК:");
    numericCandidates.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.amount.toFixed(2)} | ${item.line}`);
    });
  }

  return lines;
}

function buildWorkbookSheetOverview(rows: string[][]) {
  const nonEmptyRows = rows.filter((row) => row.some((cell) => cell.length > 0));
  const numericCells = nonEmptyRows
    .flatMap((row) => row)
    .filter((cell) => parseWorkbookAmount(cell) != null).length;
  const totalRows = nonEmptyRows.filter(isWorkbookTotalRow).length;

  return {
    rowCount: nonEmptyRows.length,
    numericCells,
    totalRows,
  };
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
    const rows = extractWorksheetRows(worksheet).map((row) => row.map(normalizeSheetCell));

    if (rows.length === 0) {
      return "";
    }
    const blocks = splitWorksheetIntoBlocks(rows)
      .map((blockRows, blockIndex) => {
        const firstDataRowIndex = findFirstLikelyDataRowIndex(blockRows);
        const headerlessTable =
          firstDataRowIndex === 0 && isLikelyWorkbookDataRow(blockRows[0] ?? []);
        const headerRows =
          !headerlessTable && firstDataRowIndex && firstDataRowIndex > 0
            ? blockRows.slice(0, firstDataRowIndex)
            : [blockRows[chooseHeaderRowIndex(blockRows)]];
        let headers = headerlessTable
          ? inferWorkbookHeadersFromDataRow(blockRows[0] ?? [])
          : mergeHeaderRows(headerRows);
        const dataRows = blockRows
          .slice(
            headerlessTable
              ? 0
              : firstDataRowIndex ?? chooseHeaderRowIndex(blockRows) + 1
          )
          .filter((row) => row.some((cell) => cell.length > 0))
          .slice(0, 120);

        if (!headerlessTable && areWorkbookHeadersTooGeneric(headers) && dataRows.length > 0) {
          const inferredHeaders = inferWorkbookHeadersFromDataRow(dataRows[0] ?? []);
          if (!areWorkbookHeadersTooGeneric(inferredHeaders)) {
            headers = inferredHeaders;
          }
        }

        const tableNature = inferWorkbookTableNature(headers, dataRows);
        const positionLines = collectWorkbookPositionLines(headers, dataRows);
        const tableLines = buildWorkbookTableLines(headers, dataRows);
        const totalLines = buildWorkbookTotalLines(headers, dataRows);
        const pricingLines = buildWorkbookPricingLines(headers, dataRows);

        return {
          blockIndex,
          headers,
          dataRows,
          tableNature,
          positionLines,
          tableLines,
          totalLines,
          pricingLines,
          score: scoreWorkbookBlock(tableNature, dataRows),
        };
      })
      .filter((block) => block.dataRows.length > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);

    if (blocks.length === 0) {
      return "";
    }

    const summaryLines = [`Лист: ${sheetName}`];
    const overview = buildWorkbookSheetOverview(rows);
    summaryLines.push(
      `Сводка листа: строк ${overview.rowCount}, числовых ячеек ${overview.numericCells}, итоговых строк ${overview.totalRows}`
    );

    blocks.forEach((block, index) => {
      summaryLines.push(
        `Блок ${index + 1}. Тип: ${
          block.tableNature === "pricing"
            ? "НМЦК и цены"
            : block.tableNature === "goods"
              ? "Товарная таблица"
              : "Смешанная таблица"
        }`
      );
      summaryLines.push(`Колонки: ${block.headers.join(" | ")}`);

      if (block.positionLines.length > 0) {
        summaryLines.push("Позиции для анализа:");
        summaryLines.push(...block.positionLines.slice(0, 40));
      }

      if (block.tableLines.length > 0) {
        summaryLines.push("Компактная таблица позиций:");
        summaryLines.push(...block.tableLines.slice(0, 50));
      } else {
        summaryLines.push("Строки таблицы:");
        block.dataRows.slice(0, 20).forEach((row, rowIndex) => {
          const pairs = block.headers
            .map((header, columnIndex) => {
              const value = row[columnIndex] ?? "";
              return value ? `${header}: ${value}` : null;
            })
            .filter(Boolean);

          if (pairs.length > 0) {
            summaryLines.push(`${rowIndex + 1}. ${pairs.join(" | ")}`);
          }
        });
      }

      if (block.totalLines.length > 0) {
        summaryLines.push("Итоги таблицы:");
        summaryLines.push(...block.totalLines.slice(0, 12));
      }

      if (block.pricingLines.length > 0) {
        summaryLines.push("Ценовые строки и кандидаты на НМЦК:");
        summaryLines.push(...block.pricingLines.slice(0, 30));
      }
    });

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
      const [rawTextResult, htmlResult] = await Promise.all([
        mammoth.extractRawText({ buffer }),
        mammoth.convertToHtml({ buffer }),
      ]);
      const rawText = rawTextResult.value.trim();
      const structuredHtmlText = extractStructuredTextFromDocxHtml(htmlResult.value || "");
      const extractedText =
        structuredHtmlText && structuredHtmlText.length >= Math.max(200, rawText.length * 0.45)
          ? structuredHtmlText
          : rawText;

      return {
        extractedText: extractedText.length > 0 ? extractedText : null,
        extractionNote:
          extractedText.length > 0
            ? structuredHtmlText
              ? "DOCX прочитан по разделам, спискам и таблицам."
              : "Текст из DOCX удалось извлечь автоматически."
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

  if (
    normalized.includes("тз") ||
    normalized.includes("техническ") ||
    normalized.includes("техзад") ||
    normalized.includes("тх")
  ) {
    return "Техническое задание";
  }
  if (normalized.includes("договор")) {
    return "Проект договора";
  }
  if (
    normalized.includes("нмц") ||
    normalized.includes("обоснован") ||
    normalized.includes("цен") ||
    normalized.includes("price")
  ) {
    return "Ценовая форма";
  }
  if (normalized.includes("извещ") || normalized.includes("документац")) {
    return "Извещение";
  }
  if (normalized.includes("анкет")) {
    return "Анкета";
  }
  if (normalized.includes("заявк") || normalized.includes("соглас")) {
    return "Форма заявки";
  }

  return "Документ закупки";
}
