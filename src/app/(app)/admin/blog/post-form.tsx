"use client";

import { useActionState, useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { Markdown } from "@/components/markdown";
import { CEFR_LEVELS } from "@/lib/constants";
import { deletePostAction, savePostAction } from "./actions";

interface PostValues {
  id?: string; title: string; slug: string; excerpt: string; body: string; categoryId: string; level: string; tags: string;
  authorName: string; status: string; seoTitle: string; seoDescription: string;
}

export function PostForm({ post, categories }: { post: PostValues; categories: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(savePostAction.bind(null, post.id ?? null), null);
  const [body, setBody] = useState(post.body);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [deleting, startDelete] = useTransition();
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <FormError message={state?.error} />
        <Field id="title" label="Title"><Input id="title" name="title" defaultValue={post.title} required maxLength={200} /></Field>
        <Field id="excerpt" label="Excerpt" hint="Shown in lists and as fallback meta description."><Textarea id="excerpt" name="excerpt" defaultValue={post.excerpt} required maxLength={400} rows={2} /></Field>
        <div>
          <div className="mb-2 flex gap-1" role="tablist" aria-label="Editor mode">
            {(["write", "preview"] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? "rounded-lg bg-primary-soft px-3 py-1 text-sm font-medium text-primary" : "rounded-lg px-3 py-1 text-sm text-muted"}>
                {t === "write" ? "Write" : "Preview"}
              </button>
            ))}
          </div>
          <label htmlFor="body" className="sr-only">Body (Markdown)</label>
          <Textarea id="body" name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={24} className={tab === "write" ? "font-mono text-sm" : "hidden"} required />
          {tab === "preview" && <Card><Markdown>{body}</Markdown></Card>}
        </div>
      </div>
      <aside className="space-y-4">
        <Card className="space-y-4">
          <Field id="status" label="Status">
            <Select id="status" name="status" defaultValue={post.status}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></Select>
          </Field>
          <Field id="categoryId" label="Category">
            <Select id="categoryId" name="categoryId" defaultValue={post.categoryId} required>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field id="level" label="CEFR level (optional)">
            <Select id="level" name="level" defaultValue={post.level}><option value="">All levels</option>{CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}</Select>
          </Field>
          <Field id="tags" label="Tags" hint="Comma-separated"><Input id="tags" name="tags" defaultValue={post.tags} /></Field>
          <Field id="authorName" label="Author"><Input id="authorName" name="authorName" defaultValue={post.authorName} required /></Field>
          <Field id="slug" label="Slug" hint="Leave empty to generate from the title."><Input id="slug" name="slug" defaultValue={post.slug} /></Field>
        </Card>
        <Card className="space-y-4">
          <p className="font-medium">SEO</p>
          <Field id="seoTitle" label="SEO title" hint="≤ 70 characters"><Input id="seoTitle" name="seoTitle" defaultValue={post.seoTitle} maxLength={70} /></Field>
          <Field id="seoDescription" label="Meta description" hint="≤ 160 characters"><Textarea id="seoDescription" name="seoDescription" defaultValue={post.seoDescription} maxLength={160} rows={3} /></Field>
        </Card>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          {post.slug && <ButtonLink href={`/blog/${post.slug}`} variant="secondary" target="_blank">View</ButtonLink>}
          {post.id && (
            <Button type="button" variant="ghost" className="text-danger!" disabled={deleting} onClick={() => confirm("Delete this article?") && startDelete(() => deletePostAction(post.id!))}>Delete</Button>
          )}
        </div>
      </aside>
    </form>
  );
}
