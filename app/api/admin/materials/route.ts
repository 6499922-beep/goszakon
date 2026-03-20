import { NextResponse } from "next/server";
import { MaterialType, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function isValidMaterialType(value: unknown): value is MaterialType {
  return (
    typeof value === "string" &&
    Object.values(MaterialType).includes(value as MaterialType)
  );
}

function parseOptionalDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function parseOptionalUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    return new URL(value.trim()).toString();
  } catch {
    return null;
  }
}

function parseSortOrder(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const prisma = getPrisma();

    const title = normalizeString(data.title);
    const slug = normalizeString(data.slug);
    const body = normalizeString(data.body);
    const decisionDate =
      data.decisionDate && typeof data.decisionDate === "string"
        ? parseOptionalDate(data.decisionDate)
        : null;
    const pdfUrl =
      data.pdfUrl && typeof data.pdfUrl === "string"
        ? parseOptionalUrl(data.pdfUrl)
        : null;

    if (!title) {
      return NextResponse.json(
        { ok: false, error: "Укажите заголовок" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Укажите slug" },
        { status: 400 }
      );
    }

    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Текст материала не может быть пустым" },
        { status: 400 }
      );
    }

    if (!isValidMaterialType(data.type)) {
      return NextResponse.json(
        { ok: false, error: "Некорректный тип материала" },
        { status: 400 }
      );
    }

    if (data.decisionDate && !decisionDate) {
      return NextResponse.json(
        { ok: false, error: "Некорректная дата решения" },
        { status: 400 }
      );
    }

    if (data.pdfUrl && !pdfUrl) {
      return NextResponse.json(
        { ok: false, error: "Некорректный URL PDF" },
        { status: 400 }
      );
    }

    const slugExists = await prisma.material.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (slugExists) {
      return NextResponse.json(
        { ok: false, error: "Такой slug уже занят" },
        { status: 409 }
      );
    }

    const isPublished = Boolean(data.isPublished);

    const material = await prisma.material.create({
      data: {
        title,
        slug,
        type: data.type,
        topic: normalizeString(data.topic) || null,
        authority: normalizeString(data.authority) || null,
        outcome: normalizeString(data.outcome) || null,
        caseNumber: normalizeString(data.caseNumber) || null,
        decisionDate,
        excerpt: normalizeString(data.excerpt) || null,
        body,
        seoTitle: normalizeString(data.seoTitle) || null,
        seoDescription: normalizeString(data.seoDescription) || null,
        pdfUrl,
        sourceName: normalizeString(data.sourceName) || null,
        isPublished,
        isFeatured: Boolean(data.isFeatured),
        sortOrder: parseSortOrder(data.sortOrder),
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true, material });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { ok: false, error: "Материал с таким slug уже существует" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Не удалось создать материал" },
      { status: 500 }
    );
  }
}