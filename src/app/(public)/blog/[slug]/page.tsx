import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { Markdown } from "@/components/markdown";
import { LevelBadge } from "@/components/ui/badge";

async function getPost(slug: string, preview: boolean) {
  const post = await db.blogPost.findUnique({ where: { slug }, include: { category: true, tags: { include: { tag: true } } } });
  if (!post) return null;
  if (post.status !== "PUBLISHED" && !preview) return null;
  return post;
}

async function canPreview() {
  const s = await getSession();
  if (!s) return false;
  const u = await db.user.findUnique({ where: { id: s.user.id }, select: { role: true } });
  return u?.role === "ADMIN";
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug, false);
  if (!post) return { title: "Article" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: { type: "article", title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, publishedTime: post.publishedAt?.toISOString(), authors: [post.authorName] },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug, await canPreview());
  if (!post) notFound();
  const related = await db.blogPost.findMany({
    where: { status: "PUBLISHED", categoryId: post.categoryId, id: { not: post.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.authorName },
  };
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>
      {post.status !== "PUBLISHED" && <p className="mt-4 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">Draft preview — not visible to visitors.</p>}
      <p className="mt-6 flex items-center gap-2 text-sm text-muted">
        <Link href={`/blog?category=${post.category.slug}`} className="font-medium text-primary">{post.category.name}</Link> · {post.readingMinutes} min read {post.level && <LevelBadge level={post.level} />}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-lg text-muted">{post.excerpt}</p>
      <p className="mt-4 text-sm text-muted">
        By {post.authorName}{post.publishedAt && ` · ${post.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
      </p>
      <Markdown className="mt-8 text-[1.05rem]">{post.body}</Markdown>
      {post.tags.length > 0 && (
        <p className="mt-8 flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => <span key={tag.id} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">#{tag.name}</span>)}
        </p>
      )}
      {related.length > 0 && (
        <aside className="mt-12 border-t border-line pt-6">
          <h2 className="font-semibold">Related articles</h2>
          <ul className="mt-3 space-y-2">
            {related.map((r) => <li key={r.id}><Link href={`/blog/${r.slug}`} className="text-primary hover:underline">{r.title}</Link></li>)}
          </ul>
        </aside>
      )}
    </article>
  );
}
