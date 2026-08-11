"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRouter } from "next/navigation";

export function HistoryBackButton({
  className,
  style,
  children = "← Back",
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
