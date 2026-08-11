import { Laptop, Smartphone, Tablet } from "lucide-react";
import type { AdminLoginDevice } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

export function activityEventAt(row: {
  action?: string;
  loginAt?: string;
  createdAt?: string;
}) {
  if (row.action === "logged_in") return row.loginAt || row.createdAt;
  return row.createdAt;
}

export function DeviceTypeIcon({
  type,
  className,
}: {
  type?: string | null;
  className?: string;
}) {
  const Icon =
    type === "mobile" ? Smartphone : type === "tablet" ? Tablet : Laptop;
  const label =
    type === "mobile" ? "Phone" : type === "tablet" ? "Tablet" : "Laptop";
  return (
    <span className="inline-flex items-center gap-1.5 capitalize">
      <Icon
        className={cn("h-3.5 w-3.5 shrink-0", className)}
        aria-hidden
        strokeWidth={1.75}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function DeviceTypeCell({ device }: { device?: AdminLoginDevice | null }) {
  if (!device?.type) return <span>—</span>;
  const label =
    device.type === "mobile"
      ? "Phone"
      : device.type === "tablet"
        ? "Tablet"
        : device.type === "desktop"
          ? "Laptop"
          : device.type;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs"
      style={{ color: "var(--text-secondary)" }}
      title={device.label || label}
    >
      <DeviceTypeIcon type={device.type} />
      {label}
    </span>
  );
}
