import { format, formatDistanceToNow, parseISO, differenceInDays } from "date-fns";

export const formatGHS = (n: number) =>
  `GHS ${n.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;

export const formatDateShort = (iso: string) => format(parseISO(iso), "d MMM yyyy");

export const formatDateRange = (startISO: string, endISO: string) => {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  if (s.toDateString() === e.toDateString()) return format(s, "d MMM yyyy");
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${format(s, "d")}–${format(e, "d MMM yyyy")}`;
  }
  return `${format(s, "d MMM")} – ${format(e, "d MMM yyyy")}`;
};

export const formatRelativeTime = (iso: string) => {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
};

export const daysUntil = (iso: string) => Math.max(0, differenceInDays(parseISO(iso), new Date()));

export const generateBookingRef = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "VX-";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

export const truncate = (s: string, n = 120) =>
  s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";

export const tripTypeLabel: Record<string, string> = {
  beach: "Beach",
  adventure: "Adventure",
  cultural: "Cultural",
  hiking: "Hiking",
  road_trip: "Road Trip",
  camping: "Camping",
  weekend_getaway: "Weekend",
  international: "International",
};
