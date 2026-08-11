import type { CSSProperties } from "react";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  wordmarkClassName?: string;
  wordmarkStyle?: CSSProperties;
  accentEx?: boolean;
  subline?: string;
  sublineStyle?: CSSProperties;
};

const sizeMap = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4", radius: "10px" },
  md: { box: "h-9 w-9", icon: "h-5 w-5", radius: "10px" },
  lg: { box: "h-10 w-10", icon: "h-5 w-5", radius: "12px" },
} as const;

/** Temporary brand mark (Compass). Swap in the real logo asset when ready. */
export function BrandLogo({
  className,
  size = "md",
  withWordmark = false,
  wordmarkClassName,
  wordmarkStyle,
  accentEx = true,
  subline,
  sublineStyle,
}: BrandLogoProps) {
  const s = sizeMap[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center text-[#fbf7f1]",
          s.box
        )}
        style={{
          background: "var(--gradient-brand)",
          borderRadius: s.radius,
        }}
      >
        <Compass className={s.icon} />
      </span>
      {withWordmark ? (
        <span className="min-w-0 leading-tight">
          <span
            className={cn(
              "font-display block font-bold tracking-tight",
              wordmarkClassName
            )}
            style={wordmarkStyle}
          >
            Vaybe
            {accentEx ? (
              <span style={{ color: "var(--gold)" }}>Ex</span>
            ) : (
              "Ex"
            )}
          </span>
          {subline ? (
            <span
              className="block text-[10px] font-medium uppercase tracking-[0.14em]"
              style={sublineStyle ?? { color: "var(--text-tertiary)" }}
            >
              {subline}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
