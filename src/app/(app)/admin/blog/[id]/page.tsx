import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [post, categories] = await Promise.all([
    db.blogPost.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } }),
    db.blogCategory.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!post) notFound();
  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="text-sm text-primary hover:underline">← Articles</Link>
      <PageHeader title="Edit article" />
      <PostForm
        categories={categories}
        post={{
          id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt, body: post.body, categoryId: post.categoryId,
          level: post.level ?? "", tags: post.tags.map((t) => t.tag.name).join(", "), authorName: post.authorName, status: post.status,
          seoTitle: post.seoTitle ?? "", seoDescription: post.seoDescription ?? "",
        }}
      />
    </div>
  );
}
