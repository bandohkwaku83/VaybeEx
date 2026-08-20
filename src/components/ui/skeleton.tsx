import { cn } from "@/lib/utils";

/**
 * Reusable skeleton shimmer bar.
 * Uses the project's warm beige palette so loaders feel native.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-[var(--bg-secondary)]",
        "after:absolute after:inset-0",
        "after:-translate-x-full",
        "after:animate-[shimmer_1.8s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent",
        className,
      )}
      {...props}
    />
  );
}
