"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrganizerPortalTabItem<T extends string = string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
};

type OrganizerPortalTabsProps<T extends string> = {
  tabs: OrganizerPortalTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Stretch tabs across the row on small screens. Default true. */
  fullWidth?: boolean;
  "aria-label"?: string;
};

/**
 * Soft underline tabs for the organizer portal — light, not boxed.
 */
export function OrganizerPortalTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  fullWidth = true,
  "aria-label": ariaLabel = "Sections",
}: OrganizerPortalTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex max-w-full gap-1 overflow-x-auto border-b",
        fullWidth ? "w-full" : "w-auto",
        className
      )}
      style={{ borderColor: "var(--border)" }}
    >
      {tabs.map((tab) => {
        const active = value === tab.value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative inline-flex shrink-0 items-center justify-center gap-2 px-3 pb-3 pt-1 text-[13px] transition-colors sm:px-4",
              fullWidth && "flex-1 sm:flex-none",
              active ? "font-semibold" : "font-medium"
            )}
            style={{
              color: active ? "var(--text)" : "var(--text-tertiary)",
            }}
          >
            {Icon ? (
              <Icon
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={active ? 2 : 1.75}
                style={{ color: active ? "var(--primary)" : "currentColor" }}
              />
            ) : null}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.count != null ? (
              <span
                className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
                style={{
                  background: active
                    ? "var(--primary-dim)"
                    : "var(--bg-secondary)",
                  color: active ? "var(--primary)" : "var(--text-tertiary)",
                }}
              >
                {tab.count}
              </span>
            ) : null}
            {active ? (
              <span
                className="absolute inset-x-2 bottom-[-1px] h-[2px] rounded-full sm:inset-x-3"
                style={{ background: "var(--primary)" }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
