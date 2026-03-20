import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import slugify from "slugify";
import { s3, s3Enabled } from "@/lib/s3";
import { requireAdmin } from "@/lib/require-admin";

const bucket = process.env.S3_BUCKET;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    if (!s3Enabled || !s3 || !bucket) {
      return Response.json(
        {
          ok: false,
          message: "S3 не настроен. Загрузка PDF сейчас недоступна.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { ok: false, message: "Файл не передан." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { ok: false, message: "Можно загружать только PDF." },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return Response.json(
        { ok: false, message: "Файл пустой." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          ok: false,
          message: "PDF слишком большой. Максимальный размер — 10 MB.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name.replace(/\.pdf$/i, "");
    const safeName = slugify(originalName, {
      lower: true,
      strict: true,
      locale: "ru",
      trim: true,
    });

    const fileName = `${safeName || "document"}-${randomUUID()}.pdf`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );

    return Response.json({
      ok: true,
      fileName,
    });
  } catch (error) {
    console.error("upload-pdf error:", error);

    return Response.json(
      { ok: false, message: "Не удалось загрузить PDF." },
      { status: 500 }
    );
  }
}