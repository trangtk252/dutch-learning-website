"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { CEFR_LEVELS } from "@/lib/constants";
import { countWords, slugify } from "@/lib/dutch/text";

const PostSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().max(100).optional().default(""),
  excerpt: z.string().trim().min(10).max(400),
  body: z.string().trim().min(20).max(100_000),
  categoryId: z.string().min(1, "Choose a category"),
  level: z.enum([...CEFR_LEVELS, ""]).transform((v) => v || null),
  tags: z.string().max(300).default(""),
  authorName: z.string().trim().min(1).max(80),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle: z.string().trim().max(70).optional().transform((v) => v || null),
  seoDescription: z.string().trim().max(160).optional().transform((v) => v || null),
});

type State = { error?: string } | null;

export async function savePostAction(postId: string | null, _prev: State, fd: FormData): Promise<State> {
  const admin = await requireAdmin();
  const parsed = PostSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: `${parsed.error.issues[0].path.join(".")}: ${parsed.error.issues[0].message}` };
  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  if (!slug) return { error: "Invalid slug" };
  const clash = await db.blogPost.findFirst({ where: { slug, ...(postId ? { id: { not: postId } } : {}) }, select: { id: true } });
  if (clash) return { error: "Another article already uses this slug." };
  const existing = postId ? await db.blogPost.findUnique({ where: { id: postId } }) : null;
  const tagSlugs = [...new Set(d.tags.split(",").map((t) => slugify(t)).filter(Boolean))].slice(0, 10);
  const tags = await Promise.all(
    tagSlugs.map((s) => db.blogTag.upsert({ where: { slug: s }, create: { slug: s, name: s.replace(/-/g, " ") }, update: {} })),
  );
  const data = {
    title: d.title, slug, excerpt: d.excerpt, body: d.body, categoryId: d.categoryId, level: d.level, authorName: d.authorName,
    status: d.status, seoTitle: d.seoTitle, seoDescription: d.seoDescription,
    readingMinutes: Math.max(1, Math.round(countWords(d.body) / 200)),
    publishedAt: d.status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
  };
  const post = postId
    ? await db.blogPost.update({ where: { id: postId }, data })
    : await db.blogPost.create({ data: { ...data, authorId: admin.id } });
  await db.blogPostTag.deleteMany({ where: { postId: post.id } });
  if (tags.length) await db.blogPostTag.createMany({ data: tags.map((t) => ({ postId: post.id, tagId: t.id })) });
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  redirect(`/admin/blog?saved=${post.id}`);
}

export async function deletePostAction(postId: string) {
  await requireAdmin();
  await db.blogPost.delete({ where: { id: postId } });
  revalidatePath("/blog");
  redirect("/admin/blog");
}
