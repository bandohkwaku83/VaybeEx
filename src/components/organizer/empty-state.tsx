import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyAction =
  | { href: string; label: string; onClick?: never }
  | { href?: never; label: string; onClick: () => void };

export function OrganizerEmptyState({
  icon: Icon,
  title,
  description,
  action,
  framed = true,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyAction;
  /** Standalone dashed card vs inset inside an existing panel */
  framed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center sm:py-14",
        framed && "rounded-2xl border border-dashed",
        className
      )}
      style={
        framed
          ? {
              borderColor: "var(--border)",
              background: "var(--surface)",
            }
          : undefined
      }
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--primary-dim)" }}
      >
        <Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
      </div>
      <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>
        {title}
      </p>
      {description ? (
        <p
          className="mt-1 max-w-xs text-[12px] leading-relaxed"
          style={{ color: "var(--text-tertiary)" }}
        >
          {description}
        </p>
      ) : null}
      {action ? (
        action.href ? (
          <Link
            href={action.href}
            className="mt-4 text-[13px] font-semibold transition-colors"
            style={{ color: "var(--primary)" }}
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-4 text-[13px] font-semibold transition-colors"
            style={{ color: "var(--primary)" }}
          >
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
}
