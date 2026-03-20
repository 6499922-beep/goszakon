import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+()\-\s]/g, "").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const prisma = getPrisma();

    const phone = normalizePhone(normalizeString(data.phone));
    const email = normalizeString(data.email).toLowerCase();
    const procurementLink = normalizeString(data.procurementLink);
    const problem = normalizeString(data.problem);

    if (!phone && !email) {
      return NextResponse.json(
        { ok: false, error: "Укажите телефон или email для связи." },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Укажите корректный email." },
        { status: 400 }
      );
    }

    if (procurementLink && !isValidUrl(procurementLink)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Ссылка на закупку должна начинаться с http:// или https://.",
        },
        { status: 400 }
      );
    }

    if (!problem) {
      return NextResponse.json(
        { ok: false, error: "Кратко опишите проблему." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        phone: phone || null,
        email: email || null,
        procurementLink: procurementLink || null,
        problem,
        status: "new",
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    console.error("create lead error:", error);

    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку. Попробуйте еще раз." },
      { status: 500 }
    );
  }
}
