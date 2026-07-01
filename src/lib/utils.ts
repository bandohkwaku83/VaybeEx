import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string) {
  if (!date) return "Date TBD";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date TBD";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatDateRange(start: string, end: string) {
  if (!start && !end) return "Dates TBD";
  if (!start) return formatDate(end);
  if (!end) return formatDate(start);

  return `${formatDate(start)} – ${formatDate(end)}`;
}
