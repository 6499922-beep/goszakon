import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";
import { SITE_URL } from "@/lib/site-config";
import {
  isValidCustomerInn,
  isValidCustomerKpp,
  normalizeCustomerName,
  normalizeDigits,
  normalizeOptionalString,
  parseCaseDecisionDate,
  parseOptionalCategoryId,
  slugifyCase,
} from "@/lib/case-admin";

function buildRedirect(request: Request, path: string, error?: string) {
  const url = new URL(path, SITE_URL);
  if (error) {
    url.searchParams.set("error", error);
  }
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return buildRedirect(request, "/admin/signin");
  }

  try {
    const formData = await request.formData();
    const prisma = getPrisma();

    const title = String(formData.get("title") || "").trim();
    const slugInput = String(formData.get("slug") || "").trim();
    const slug = slugInput || slugifyCase(title);
    const decisionDateRaw = String(formData.get("decisionDate") || "").trim();
    const customerName = normalizeCustomerName(formData.get("customerName"));
    const customerInn = normalizeDigits(formData.get("customerInn"));
    const customerKpp = normalizeDigits(formData.get("customerKpp"));
    const decisionDate = decisionDateRaw
      ? parseCaseDecisionDate(decisionDateRaw)
      : null;

    if (!title) {
      return buildRedirect(request, "/admin/cases/new", "title");
    }

    if (!slug) {
      return buildRedirect(request, "/admin/cases/new", "slug");
    }

    if (decisionDateRaw && !decisionDate) {
      return buildRedirect(request, "/admin/cases/new", "decision_date");
    }

    if (!isValidCustomerInn(customerInn)) {
      return buildRedirect(request, "/admin/cases/new", "customer_inn");
    }

    if (!isValidCustomerKpp(customerKpp)) {
      return buildRedirect(request, "/admin/cases/new", "customer_kpp");
    }

    const slugExists = await prisma.case.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (slugExists) {
      return buildRedirect(request, "/admin/cases/new", "slug_exists");
    }

    const created = await prisma.case.create({
      data: {
        title,
        slug,
        summary: normalizeOptionalString(formData.get("summary")),
        procurementNumber: normalizeOptionalString(formData.get("procurementNumber")),
        region: normalizeOptionalString(formData.get("region")),
        subject: normalizeOptionalString(formData.get("subject")),
        violation: normalizeOptionalString(formData.get("violation")),
        applicantPosition: normalizeOptionalString(formData.get("applicantPosition")),
        decision: normalizeOptionalString(formData.get("decision")),
        result: normalizeOptionalString(formData.get("result")),
        pdfUrl: normalizeOptionalString(formData.get("pdfUrl")),
        customerName,
        customerInn,
        customerKpp,
        decisionDate,
        isFeatured: formData.get("isFeatured") === "on",
        published: formData.get("published") === "on",
        categoryId: parseOptionalCategoryId(formData.get("categoryId")),
      },
      select: {
        id: true,
        slug: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath("/cases");
    revalidatePath(`/cases/${created.id}-${created.slug}`);
    revalidatePath("/zakazchikam");
    if (customerInn) {
      revalidatePath(`/zakazchik/${customerInn}`);
    }

    return NextResponse.redirect(new URL("/admin/cases?created=1", SITE_URL), 303);
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return buildRedirect(request, "/admin/cases/new", "slug_exists");
    }

    return buildRedirect(request, "/admin/cases/new", "server");
  }
}
