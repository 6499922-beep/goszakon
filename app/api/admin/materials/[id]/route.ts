import { NextResponse } from "next/server";
import { MaterialType, Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

type Params = {
  params: Promise<{ id: string }>;
};

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function parseMaterialId(id: string) {
  const materialId = Number(id);
  if (!Number.isInteger(materialId) || materialId <= 0) {
    return null;
  }
  return materialId;
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

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const materialId = parseMaterialId(id);

    if (!materialId) {
      return NextResponse.json(
        { ok: false, error: "Некорректный ID материала" },
        { status: 400 }
      );
    }

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

    const existingMaterial = await prisma.material.findUnique({
      where: { id: materialId },
      select: { id: true, isPublished: true, publishedAt: true },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { ok: false, error: "Материал не найден" },
        { status: 404 }
      );
    }

    const slugOwner = await prisma.material.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (slugOwner && slugOwner.id !== materialId) {
      return NextResponse.json(
        { ok: false, error: "Такой slug уже занят" },
        { status: 409 }
      );
    }

    const nextIsPublished = Boolean(data.isPublished);

    const material = await prisma.material.update({
      where: { id: materialId },
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
        isPublished: nextIsPublished,
        isFeatured: Boolean(data.isFeatured),
        sortOrder: parseSortOrder(data.sortOrder),
        publishedAt:
          !existingMaterial.isPublished && nextIsPublished
            ? new Date()
            : existingMaterial.publishedAt,
      },
    });

    return NextResponse.json({ ok: true, material });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Материал не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Не удалось обновить материал" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const materialId = parseMaterialId(id);

    if (!materialId) {
      return NextResponse.json(
        { ok: false, error: "Некорректный ID материала" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    await prisma.material.delete({
      where: { id: materialId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Материал не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Не удалось удалить материал" },
      { status: 500 }
    );
  }
}