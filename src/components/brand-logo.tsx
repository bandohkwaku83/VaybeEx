import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import AnimatedLogo from "@public/logo.jpeg";
import Image from "next/image";

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
  sm: { img: "h-6 w-6" },
  md: { img: "h-8 w-8" },
  lg: { img: "h-12 w-12" },
} as const;

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
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* ── Animated logo — transparent, no background, clean inline with text ── */}
      <Image
        src={AnimatedLogo}
        alt="VaybeEx logo"
        className={cn("object-contain", s.img)}
        priority
        unoptimized
        style={{ display: "block" }}
      />

      {withWordmark ? (
        <span className="min-w-0 leading-tight">
          <span
            className={cn(
              "font-display block font-bold tracking-tight",
              wordmarkClassName,
            )}
            style={wordmarkStyle}
          >
            Vaybe
            {accentEx ? <span style={{ color: "var(--gold)" }}>Ex</span> : "Ex"}
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
