"use server";

// Server Actions ของบทความ (admin เท่านั้น) — สร้าง/แก้ไข/ลบ + toggle publish

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/features/auth";
import { generateSlug } from "@/lib/slug";
import { articleFormDataToObject, articleSchema } from "./schemas";

export type ArticleFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  return session;
}

/** revalidate หน้า public ของบทความ */
function revalidateArticle(slug?: string) {
  revalidatePath("/articles");
  if (slug) revalidatePath(`/articles/${slug}`);
}

export async function createArticleAction(
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();

  const parsed = articleSchema.safeParse(articleFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { coverUrl, published, ...fields } = parsed.data;

  let createdSlug = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = generateSlug(fields.title.slice(0, 50));
    try {
      await prisma.article.create({
        data: {
          ...fields,
          slug,
          coverUrl: coverUrl || null,
          published,
          publishedAt: published ? new Date() : null,
        },
      });
      createdSlug = slug;
      break;
    } catch (error) {
      const collision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!collision || attempt === 2) throw error;
    }
  }

  revalidatePath("/admin/articles");
  if (published) revalidateArticle(createdSlug);
  redirect("/admin/articles?saved=1");
}

export async function updateArticleAction(
  articleId: string,
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();

  const parsed = articleSchema.safeParse(articleFormDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.article.findUnique({
    where: { id: articleId },
    select: { publishedAt: true, slug: true },
  });
  if (!existing) return { error: "ไม่พบบทความนี้" };

  const { coverUrl, published, ...fields } = parsed.data;

  await prisma.article.update({
    where: { id: articleId },
    data: {
      ...fields,
      coverUrl: coverUrl || null,
      published,
      // ตั้ง publishedAt ครั้งแรกที่เผยแพร่ ไม่รีเซ็ตถ้าเคยเผยแพร่แล้ว
      publishedAt: published ? (existing.publishedAt ?? new Date()) : null,
    },
  });

  revalidatePath("/admin/articles");
  revalidateArticle(existing.slug);
  redirect("/admin/articles?saved=1");
}

export async function togglePublishArticleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const article = await prisma.article.findUniqueOrThrow({
    where: { id },
    select: { published: true, publishedAt: true, slug: true },
  });
  const nextPublished = !article.published;
  await prisma.article.update({
    where: { id },
    data: {
      published: nextPublished,
      publishedAt: nextPublished ? (article.publishedAt ?? new Date()) : null,
    },
  });
  revalidatePath("/admin/articles");
  revalidateArticle(article.slug);
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const article = await prisma.article.delete({
    where: { id },
    select: { slug: true },
  });
  revalidatePath("/admin/articles");
  revalidateArticle(article.slug);
}
