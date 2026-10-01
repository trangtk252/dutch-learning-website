import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "New article" };

export default async function NewPostPage() {
  const admin = await requireAdmin();
  const categories = await db.blogCategory.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });
  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="text-sm text-primary hover:underline">← Articles</Link>
      <PageHeader title="New article" />
      <PostForm categories={categories} post={{ title: "", slug: "", excerpt: "", body: "", categoryId: "", level: "", tags: "", authorName: admin.name, status: "DRAFT", seoTitle: "", seoDescription: "" }} />
    </div>
  );
}
