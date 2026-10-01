import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-ink">
        <span aria-hidden className="grid size-9 place-items-center rounded-lg bg-primary font-bold text-primary-ink">nl</span>
        Leer Nederlands
      </Link>
      <main id="main" className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
