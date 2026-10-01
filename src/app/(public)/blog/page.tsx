import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { LevelBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Blog — learning Dutch, grammar and NT2 tips",
  description: "Articles about learning Dutch as an English speaker: grammar explanations, vocabulary tips, study techniques and NT2 exam strategies.",
};

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const { category } = await searchParams;
  const [categories, posts] = await Promise.all([
    db.blogCategory.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } } }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, ...(typeof category === "string" ? { category: { slug: category } } : {}) },
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    }),
  ]);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted">Practical advice for English speakers learning Dutch — from A2 to C1 and the NT2 exam.</p>
      <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/blog" aria-current={!category ? "page" : undefined} className={cn("rounded-full border px-3 py-1", !category ? "border-primary bg-primary text-primary-ink" : "border-line text-muted hover:text-ink")}>All</Link>
        {categories.filter((c) => c._count.posts > 0).map((c) => (
          <Link key={c.id} href={`/blog?category=${c.slug}`} aria-current={category === c.slug ? "page" : undefined} className={cn("rounded-full border px-3 py-1", category === c.slug ? "border-primary bg-primary text-primary-ink" : "border-line text-muted hover:text-ink")}>
            {c.name}
          </Link>
        ))}
      </nav>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <li key={p.id}>
            <article className="h-full rounded-2xl border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-xs text-muted">
                <span className="font-medium text-primary">{p.category.name}</span> · {p.readingMinutes} min read {p.level && <LevelBadge level={p.level} />}
              </p>
              <h2 className="mt-2 text-lg font-semibold"><Link href={`/blog/${p.slug}`} className="hover:text-primary">{p.title}</Link></h2>
              <p className="mt-1 text-sm text-muted">{p.excerpt}</p>
              <p className="mt-3 text-xs text-muted">{p.publishedAt?.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </article>
          </li>
        ))}
      </ul>
      {posts.length === 0 && <p className="mt-8 text-muted">No articles in this category yet.</p>}
    </div>
  );
}
