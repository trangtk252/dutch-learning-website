import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-surface p-5", className)} {...props} />;
}

export function CardLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-primary/50 hover:bg-surface-2/50",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ children, className, as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h2" | "h3" }) {
  return <Tag className={cn("text-base font-semibold text-ink", className)}>{children}</Tag>;
}
