import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Admin · Blog" };

export default async function AdminBlogPage({ searchParams }: PageProps<"/admin/blog">) {
  await requireAdmin();
  const { saved } = await searchParams;
  const posts = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true } });
  return (
    <div className="space-y-6">
      <PageHeader title="Blog articles" description="Create and edit articles. Markdown is supported." actions={<ButtonLink href="/admin/blog/new">New article</ButtonLink>} />
      {saved && <p role="status" className="rounded-xl bg-success-soft px-4 py-2 text-sm text-success">Article saved.</p>}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <caption className="sr-only">Articles</caption>
          <thead className="bg-surface-2 text-left text-xs text-muted">
            <tr><th scope="col" className="px-4 py-2">Title</th><th scope="col" className="px-4 py-2">Category</th><th scope="col" className="px-4 py-2">Status</th><th scope="col" className="px-4 py-2">Updated</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2"><Link href={`/admin/blog/${p.id}`} className="font-medium hover:text-primary">{p.title}</Link><span className="block text-xs text-muted">/blog/{p.slug}</span></td>
                <td className="px-4 py-2">{p.category.name}</td>
                <td className="px-4 py-2"><Badge tone={p.status === "PUBLISHED" ? "success" : "neutral"}>{p.status.toLowerCase()}</Badge></td>
                <td className="px-4 py-2 whitespace-nowrap text-muted">{p.updatedAt.toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
