"use client";

import {
  useEffect, useMemo, useRef, useState, useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Send, Mail, MessageSquare, Users, Sparkles, CheckCircle2,
  AlertCircle, Calendar, CreditCard, MapPin, PartyPopper,
  X, Loader2, UserCheck, UserX, ListChecks, Bookmark,
  ArrowRight, Clock3, ChevronLeft, ChevronRight, BarChart3,
  Eye, Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  flexRender, createColumnHelper, type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getOrganizerTrips, getTripAttendees } from "@/lib/mock-data";
import type { TripAttendee } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

const ORGANIZER_ID = "org-1";

type AudienceGroup  = "paid" | "partial" | "pending";
type QuickAudience  = "all" | "paid" | "not-checked-in" | "custom";
type SendStage      = "idle" | "sending" | "delivered";

const audienceMeta: Record<AudienceGroup, { label: string; color: string; bg: string }> = {
  paid:    { label: "Paid in full",    color: "var(--gold)",  bg: "var(--gold-dim)"         },
  partial: { label: "Partial payment", color: "var(--amber)", bg: "rgba(208,138,60,0.14)"   },
  pending: { label: "Pending payment", color: "var(--coral)", bg: "rgba(181,82,58,0.1)"     },
};

/* ─── Templates ─────────────────────────────────────────────────── */
interface Template {
  id: string; label: string; icon: React.ElementType;
  subject: (t: string) => string;
  body: (t: string) => string;
}
const TEMPLATES: Template[] = [
  {
    id: "payment-reminder", label: "Payment reminder", icon: CreditCard,
    subject: (t) => `Action needed: balance due for ${t}`,
    body:    (t) => `Hi {FirstName}! Just a friendly reminder that your balance for ${t} is still outstanding. Please complete your payment to secure your spot. Reach out if you have any questions!`,
  },
  {
    id: "departure-info", label: "Departure details", icon: MapPin,
    subject: (t) => `Your departure details for ${t}`,
    body:    (t) => `Excited for ${t}, {FirstName}! Here are your departure details: meeting point, time, and what to bring. See the full itinerary in your booking confirmation.`,
  },
  {
    id: "itinerary-update", label: "Itinerary update", icon: Calendar,
    subject: (t) => `Schedule update for ${t}`,
    body:    (t) => `Hi {FirstName} — quick update on ${t}. We've made a small change to the itinerary. Please review the updated schedule before departure.`,
  },
  {
    id: "trip-confirmed", label: "Trip confirmed 🎉", icon: PartyPopper,
    subject: (t) => `${t} is officially confirmed!`,
    body:    (t) => `Great news, {FirstName} — ${t} has hit minimum capacity and is officially confirmed to run! Get ready for an amazing experience.`,
  },
];

const SMS_SEGMENT = 160;
const SMS_COST    = 0.05;

/* ─── Broadcast history row type ────────────────────────────────── */
interface BroadcastRecord {
  id: string;
  date: string;
  tripTitle: string;
  subject: string;
  snippet: string;
  channels: ("email" | "sms")[];
  recipients: number;
  status: "sent" | "pending" | "failed";
  audience: string;
  messageBody: string;
}

const myTrips = getOrganizerTrips(ORGANIZER_ID).filter((t) => t.booked > 0);

const SEED_HISTORY: BroadcastRecord[] = [
  {
    id: "b1",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    tripTitle: myTrips[0]?.title ?? "Cape Coast Cultural Tour",
    subject: "Final itinerary and packing list",
    snippet: "Final itinerary and packing list for your upcoming trip...",
    messageBody: "Hi {FirstName}! Please find your final itinerary and packing list for the trip. Make sure you arrive at the meeting point 15 minutes early. See you soon!",
    channels: ["email", "sms"],
    recipients: 142,
    status: "sent",
    audience: "All participants",
  },
  {
    id: "b2",
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    tripTitle: myTrips[1]?.title ?? "Mole Safari",
    subject: "Reminder: yellow fever vaccination",
    snippet: "Reminder: yellow fever vaccination required before departure...",
    messageBody: "Hi {FirstName}! This is a reminder that a yellow fever vaccination certificate is required before departure. Please bring your card on the day.",
    channels: ["email"],
    recipients: 48,
    status: "sent",
    audience: "Paid only",
  },
  {
    id: "b3",
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    tripTitle: myTrips[2]?.title ?? "Akosombo Retreat",
    subject: "Join the pre-trip WhatsApp group",
    snippet: "Join our pre-trip WhatsApp group for last-minute updates...",
    messageBody: "Hi {FirstName}! We've set up a WhatsApp group for last-minute updates. Please join using the link below. See you on the trip!",
    channels: ["sms"],
    recipients: 65,
    status: "pending",
    audience: "All participants",
  },
  {
    id: "b4",
    date: new Date(Date.now() - 86400000 * 9).toISOString(),
    tripTitle: myTrips[0]?.title ?? "Cape Coast Cultural Tour",
    subject: "Balance payment reminder",
    snippet: "Your trip balance is due this Friday. Please complete...",
    messageBody: "Hi {FirstName}! Your trip balance is due this Friday. Please log in to VaybeEx and complete your payment. Spots are limited — don't miss out!",
    channels: ["email", "sms"],
    recipients: 23,
    status: "sent",
    audience: "Not paid",
  },
  {
    id: "b5",
    date: new Date(Date.now() - 86400000 * 14).toISOString(),
    tripTitle: myTrips[1]?.title ?? "Mole Safari",
    subject: "Trip confirmed — you're going!",
    snippet: "Great news — Mole Safari has hit minimum capacity...",
    messageBody: "Great news, {FirstName}! Your trip is confirmed and ready to run. We're so excited to have you on this adventure. Full details coming soon.",
    channels: ["email"],
    recipients: 48,
    status: "sent",
    audience: "All participants",
  },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
function statusMeta(status: BroadcastRecord["status"]) {
  if (status === "sent")    return { label: "Sent",    color: "var(--gold)",  bg: "var(--gold-dim)",         Icon: CheckCircle2 };
  if (status === "pending") return { label: "Pending", color: "var(--amber)", bg: "rgba(208,138,60,0.14)",   Icon: Clock3       };
  return                           { label: "Failed",  color: "var(--coral)", bg: "rgba(181,82,58,0.1)",     Icon: AlertCircle  };
}
const TRIP_PALETTE  = ["var(--gold)", "var(--primary)", "var(--coral)", "var(--amber)"];
const AVATAR_PALETTE = ["var(--primary)", "var(--gold)", "var(--coral)", "var(--amber)"];
const hash = (s: string) => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
const tripTagColor   = (t: string) => TRIP_PALETTE[hash(t) % TRIP_PALETTE.length];
const avatarColorFor = (n: string) => AVATAR_PALETTE[hash(n) % AVATAR_PALETTE.length];
const initialsFor    = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

/* ─── Broadcast detail drawer ────────────────────────────────────── */
function BroadcastDrawer({
  record,
  onClose,
}: {
  record: BroadcastRecord | null;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!record) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(
        drawerRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.38, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [record]);

  const handleClose = useCallback(() => {
    gsap.to(drawerRef.current, {
      x: "100%", duration: 0.28, ease: "power3.in",
      onComplete: onClose,
    });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
  }, [onClose]);

  if (!record) return null;

  const meta = statusMeta(record.status);

  return (
    <>
      {/* backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(42,27,15,0.45)", opacity: 0 }}
        onClick={handleClose}
      />

      {/* drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col shadow-2xl"
        style={{
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          transform: "translateX(100%)",
        }}
      >
        {/* header */}
        <div
          className="flex items-start justify-between gap-3 border-b px-6 py-5"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0">
            <p className="font-display text-base font-bold leading-snug" style={{ color: "var(--text)" }}>
              {record.subject}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
              {formatDate(record.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: "var(--text-tertiary)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* meta row */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Trip", value: record.tripTitle },
              { label: "Audience", value: record.audience },
              { label: "Recipients", value: String(record.recipients) },
              {
                label: "Channels",
                value: record.channels.map((c) => c === "email" ? "Email" : "SMS").join(" + "),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium" style={{ color: "var(--text)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* status */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Status
            </p>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"
              style={{ background: meta.bg, color: meta.color }}
            >
              <meta.Icon className="h-4 w-4" />
              {meta.label}
            </span>
          </div>

          {/* message preview */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Message body
            </p>
            <div
              className="rounded-xl border p-4 text-sm leading-relaxed"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
            >
              {record.messageBody}
            </div>
          </div>

          {/* channel icons */}
          <div className="flex items-center gap-3">
            {record.channels.includes("email") && (
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </div>
            )}
            {record.channels.includes("sms") && (
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div
          className="border-t px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <Button
            className="w-full rounded-xl"
            style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      </div>
    </>
  );
}

/* ─── TanStack column helper — module-level ─────────────────────── */
const colHelper = createColumnHelper<BroadcastRecord>();

const HISTORY_COLUMNS = [
  colHelper.accessor("date", {
    header: "Date",
    cell: (info) => (
      <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}>
        {formatDate(info.getValue())}
      </span>
    ),
    sortingFn: (a, b) =>
      new Date(a.original.date).getTime() - new Date(b.original.date).getTime(),
  }),
  colHelper.accessor("tripTitle", {
    header: "Trip",
    cell: (info) => {
      const title = info.getValue();
      return (
        <span
          className="inline-block rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
          style={{
            background: `${tripTagColor(title)}20`,
            color: tripTagColor(title),
          }}
        >
          {title}
        </span>
      );
    },
    filterFn: "includesString",
  }),
  colHelper.accessor("subject", {
    header: "Subject",
    cell: (info) => (
      <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
        {info.getValue()}
      </span>
    ),
  }),
  colHelper.accessor("channels", {
    header: "Via",
    enableSorting: false,
    cell: (info) => (
      <div className="flex items-center gap-1.5">
        {info.getValue().includes("email") && (
          <Mail className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
        )}
        {info.getValue().includes("sms") && (
          <MessageSquare className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
        )}
      </div>
    ),
  }),
  colHelper.accessor("recipients", {
    header: "Recipients",
    cell: (info) => (
      <span className="font-mono text-sm font-semibold" style={{ color: "var(--text)" }}>
        {info.getValue()}
      </span>
    ),
  }),
  colHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const meta = statusMeta(info.getValue());
      return (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: meta.bg, color: meta.color }}
        >
          <meta.Icon className="h-3 w-3" />
          {meta.label}
        </span>
      );
    },
    filterFn: (row, _id, value: string) =>
      value === "all" ? true : row.original.status === value,
  }),
  colHelper.display({
    id: "actions",
    header: "",
    cell: () => (
      <button
        type="button"
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-secondary)]"
        style={{ color: "var(--primary)" }}
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>
    ),
  }),
];

/* ─── Audience pill ──────────────────────────────────────────────── */
function AudiencePill({
  active, icon: Icon, label, count, onClick,
}: {
  active: boolean; icon: React.ElementType; label: string;
  count: number; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all"
      style={{
        borderColor: active ? "var(--gold)" : "var(--border)",
        background:  active ? "var(--gold-dim)" : "transparent",
        color:       active ? "var(--gold)" : "var(--text-secondary)",
      }}
    >
      <Icon className="h-3 w-3" />
      {label}
      <span style={{ opacity: 0.7 }}>({count})</span>
      {active && <Check className="h-3 w-3" />}
    </button>
  );
}

/* ─── Channel checkbox ───────────────────────────────────────────── */
function ChannelCheck({
  checked, onChange, label, note,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string; note: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(!!c)} className="mt-0.5" />
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</p>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{note}</p>
      </div>
    </label>
  );
}

/* ─── Sort icon helper ───────────────────────────────────────────── */
function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  if (dir === "asc")  return <ArrowUp   className="h-3 w-3" />;
  if (dir === "desc") return <ArrowDown className="h-3 w-3" />;
  return <ArrowUpDown className="h-3 w-3 opacity-35" />;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function CommunicationPage() {
  const searchParams = useSearchParams();
  const tripFromUrl  = searchParams.get("trip");
  const defaultTrip  =
    tripFromUrl && myTrips.some((t) => t.id === tripFromUrl)
      ? tripFromUrl
      : myTrips[0]?.id ?? "";

  /* ── Compose state ── */
  const [message,       setMessage]       = useState("");
  const [subject,       setSubject]       = useState("");
  const [tripIdOvr,     setTripIdOvr]     = useState<string | null>(null);
  const tripId = tripIdOvr ?? defaultTrip;
  const [emailOn,       setEmailOn]       = useState(true);
  const [smsOn,         setSmsOn]         = useState(false);
  const [quickAud,      setQuickAud]      = useState<QuickAudience>("all");
  const [showPicker,    setShowPicker]    = useState(false);
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
  const [activeTpl,     setActiveTpl]     = useState<string | null>(null);
  const [sendStage,     setSendStage]     = useState<SendStage>("idle");
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [draftSaved,    setDraftSaved]    = useState(false);

  /* ── History / table state ── */
  const [history,       setHistory]       = useState<BroadcastRecord[]>(SEED_HISTORY);
  const [globalSearch,  setGlobalSearch]  = useState("");
  const [sorting,       setSorting]       = useState<SortingState>([{ id: "date", desc: true }]);
  const [colFilters,    setColFilters]    = useState<ColumnFiltersState>([]);
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [drawerRecord,  setDrawerRecord]  = useState<BroadcastRecord | null>(null);

  /* ── Derived ── */
  const selectedTrip = myTrips.find((t) => t.id === tripId);
  const attendees    = tripId ? getTripAttendees(tripId) : [];

  const counts = useMemo(() => ({
    paid:    attendees.filter((a) => a.paymentStatus === "paid").length,
    partial: attendees.filter((a) => a.paymentStatus === "partial").length,
    pending: attendees.filter((a) => a.paymentStatus === "pending").length,
  }), [attendees]);

  const recipients = useMemo(() => {
    if (showPicker) return attendees.filter((a) => selectedIds.has(a.id));
    switch (quickAud) {
      case "paid":           return attendees.filter((a) => a.paymentStatus === "paid");
      case "not-checked-in": return attendees.filter((a) => a.paymentStatus !== "paid");
      default:               return attendees;
    }
  }, [attendees, quickAud, showPicker, selectedIds]);

  const smsSegments = Math.max(1, Math.ceil(message.length / SMS_SEGMENT));
  const smsCost     = smsOn ? recipients.length * SMS_COST * smsSegments : 0;

  /* ── TanStack table ── */
  const tableData = useMemo(() => {
    /* apply status filter (outside tanstack filterFn for simpler UX) */
    return statusFilter === "all"
      ? history
      : history.filter((h) => h.status === statusFilter);
  }, [history, statusFilter]);

  const table = useReactTable({
    data: tableData,
    columns: HISTORY_COLUMNS,
    state: { sorting, globalFilter: globalSearch, columnFilters: colFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalSearch,
    onColumnFiltersChange: setColFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _colId, value) => {
      const q = (value as string).toLowerCase();
      return (
        row.original.subject.toLowerCase().includes(q) ||
        row.original.tripTitle.toLowerCase().includes(q) ||
        row.original.snippet.toLowerCase().includes(q) ||
        row.original.audience.toLowerCase().includes(q)
      );
    },
    initialState: { pagination: { pageSize: 5 } },
  });

  const rows = table.getRowModel().rows;

  /* ── Refs ── */
  const pageRef        = useRef<HTMLDivElement>(null);
  const memberListRef  = useRef<HTMLDivElement>(null);
  const overlayRef     = useRef<HTMLDivElement>(null);
  const sendingIconRef = useRef<HTMLDivElement>(null);
  const deliveredRef   = useRef<HTMLDivElement>(null);
  const progressRef    = useRef<HTMLDivElement>(null);
  const draftBadgeRef  = useRef<HTMLSpanElement>(null);
  const tableBodyRef   = useRef<HTMLTableSectionElement>(null);

  /* ── Entrance animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".comm-entrance",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power2.out" }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  /* ── Member picker rows entrance ── */
  useEffect(() => {
    if (!showPicker || !memberListRef.current) return;
    gsap.fromTo(
      memberListRef.current.querySelectorAll(".member-row"),
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, duration: 0.22, stagger: 0.018, ease: "power2.out" }
    );
  }, [showPicker, tripId]);

  /* ── Table rows entrance on data change ── */
  useEffect(() => {
    if (!tableBodyRef.current) return;
    gsap.fromTo(
      tableBodyRef.current.querySelectorAll("tr"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" }
    );
  }, [rows.length, table.getState().pagination.pageIndex]);

  /* ── Draft auto-save ── */
  useEffect(() => {
    if (!subject && !message) return;
    const t = setTimeout(() => {
      setDraftSaved(true);
      if (draftBadgeRef.current) {
        gsap.fromTo(
          draftBadgeRef.current,
          { scale: 0.85, opacity: 0.6 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }
        );
      }
    }, 600);
    return () => clearTimeout(t);
  }, [subject, message, quickAud]);

  /* ── Send sequence ── */
  const runSend = useCallback(() => {
    setShowConfirm(false);
    setSendStage("sending");

    requestAnimationFrame(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(
        sendingIconRef.current,
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }
      );
      gsap.to(sendingIconRef.current, { rotate: 360, duration: 1.1, repeat: -1, ease: "none" });
      gsap.fromTo(
        progressRef.current,
        { width: "0%" },
        {
          width: "100%",
          duration: 1.7,
          ease: "power2.inOut",
          onComplete: () => {
            setSendStage("delivered");
            const ch = [emailOn && "email", smsOn && "SMS"].filter(Boolean).join(" & ");
            toast.success(`Delivered to ${recipients.length} member${recipients.length === 1 ? "" : "s"} via ${ch}`);
            const newRecord: BroadcastRecord = {
              id: `b${Date.now()}`,
              date: new Date().toISOString(),
              tripTitle: selectedTrip?.title ?? "Trip",
              subject: subject || "(No subject)",
              snippet: message.slice(0, 60) + (message.length > 60 ? "..." : ""),
              messageBody: message,
              channels: [emailOn && "email", smsOn && "sms"].filter(Boolean) as ("email" | "sms")[],
              recipients: recipients.length,
              status: "sent",
              audience:
                showPicker ? "Custom selection"
                : quickAud === "paid" ? "Paid only"
                : quickAud === "not-checked-in" ? "Not paid"
                : "All participants",
            };
            setHistory((prev) => [newRecord, ...prev]);
          },
        }
      );
    });
  }, [emailOn, smsOn, recipients, selectedTrip, subject, message, showPicker, quickAud]);

  /* ── Delivered → dismiss ── */
  useEffect(() => {
    if (sendStage !== "delivered") return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        deliveredRef.current,
        { scale: 0, opacity: 0, rotate: -45 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: "back.out(2.5)" }
      );
    });
    const timer = setTimeout(() => {
      gsap.to(overlayRef.current, {
        opacity: 0, duration: 0.3,
        onComplete: () => {
          setSendStage("idle");
          setMessage(""); setSubject("");
          setActiveTpl(null); setDraftSaved(false);
        },
      });
    }, 1900);
    return () => { clearTimeout(timer); ctx.revert(); };
  }, [sendStage]);

  const validate = (): string | null => {
    if (!message.trim()) return "Please write a message";
    if (recipients.length === 0) return "Select at least one recipient";
    if (!emailOn && !smsOn) return "Select at least one delivery channel";
    if (emailOn && !subject.trim()) return "Add an email subject";
    return null;
  };

  const handleSendClick = () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setShowConfirm(true);
  };

  const applyTemplate = (tpl: Template) => {
    setActiveTpl(tpl.id);
    setSubject(tpl.subject(selectedTrip?.title ?? "your trip"));
    setMessage(tpl.body(selectedTrip?.title ?? "your trip"));
  };

  return (
    <div ref={pageRef} className="w-full p-6 lg:p-8" style={{ background: "var(--bg)" }}>

      {/* ── Page heading ─────────────────────────────────────────── */}
      <div className="comm-entrance mb-6">
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>
          Messages &amp; Broadcasts
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Send trip updates and reminders to your participants.
        </p>
      </div>

      {/* ── Composer card ────────────────────────────────────────── */}
      <Card
        className="comm-entrance border shadow-none"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="h-1 rounded-t-2xl" style={{ background: "var(--gradient-brand)" }} />
        <CardContent className="space-y-5 p-6">

          {/* header row */}
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-display text-sm font-bold" style={{ color: "var(--text)" }}>
              <Send className="h-4 w-4" style={{ color: "var(--primary)" }} />
              New Broadcast
            </p>
            {draftSaved && (
              <span
                ref={draftBadgeRef}
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
              >
                Draft auto-saved
              </span>
            )}
          </div>

          {/* two-column grid */}
          <div className="grid gap-5 sm:grid-cols-2">

            {/* LEFT — trip select + templates */}
            <div>
              <Label style={{ color: "var(--text)" }} className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <Calendar className="h-3.5 w-3.5" /> Select trip
              </Label>
              <Select
                value={tripId}
                onValueChange={(v) => {
                  setTripIdOvr(v);
                  setSelectedIds(new Set());
                  setShowPicker(false);
                }}
              >
                <SelectTrigger className="rounded-xl" style={{ borderColor: "var(--border-strong)" }}>
                  <SelectValue placeholder="Choose a trip" />
                </SelectTrigger>
                <SelectContent>
                  {myTrips.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title} ({t.booked} booked)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-4">
                <Label style={{ color: "var(--text)" }} className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} /> Quick templates
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((tpl) => {
                    const active = activeTpl === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-medium transition-all"
                        style={{
                          borderColor: active ? "var(--primary)" : "var(--border)",
                          background:  active ? "var(--primary-dim)" : "transparent",
                          color:       active ? "var(--primary)" : "var(--text-secondary)",
                        }}
                      >
                        <tpl.icon className="h-3.5 w-3.5 shrink-0" />
                        {tpl.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT — recipients */}
            <div>
              <Label style={{ color: "var(--text)" }} className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <Users className="h-3.5 w-3.5" /> Recipients
              </Label>
              <div className="flex flex-wrap gap-2">
                <AudiencePill active={!showPicker && quickAud === "all"}           icon={Users}    label="All"       count={attendees.length}               onClick={() => { setQuickAud("all");           setShowPicker(false); }} />
                <AudiencePill active={!showPicker && quickAud === "paid"}          icon={UserCheck} label="Paid"     count={counts.paid}                    onClick={() => { setQuickAud("paid");          setShowPicker(false); }} />
                <AudiencePill active={!showPicker && quickAud === "not-checked-in"} icon={UserX}   label="Not paid" count={counts.partial + counts.pending} onClick={() => { setQuickAud("not-checked-in"); setShowPicker(false); }} />
              </div>

              <button
                type="button"
                onClick={() => setShowPicker((v) => !v)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
                style={{
                  borderColor: showPicker ? "var(--primary)" : "var(--border)",
                  background:  showPicker ? "var(--primary-dim)" : "transparent",
                  color:       showPicker ? "var(--primary)" : "var(--text-secondary)",
                }}
              >
                <ListChecks className="h-3.5 w-3.5" />
                Select Individual Members
              </button>

              {showPicker && (
                <div
                  ref={memberListRef}
                  className="mt-3 max-h-44 space-y-1 overflow-y-auto rounded-xl p-2"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Select members
                  </p>
                  {attendees.map((a: TripAttendee) => (
                    <label
                      key={a.id}
                      className="member-row flex cursor-pointer items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-[var(--surface)]"
                    >
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: avatarColorFor(a.name) }}
                      >
                        {initialsFor(a.name)}
                      </div>
                      <span className="flex-1 truncate text-sm" style={{ color: "var(--text)" }}>{a.name}</span>
                      <Checkbox
                        checked={selectedIds.has(a.id)}
                        onCheckedChange={(c) => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (!!c) next.add(a.id); else next.delete(a.id);
                            return next;
                          });
                        }}
                      />
                    </label>
                  ))}
                </div>
              )}

              <div
                className="mt-3 flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: "var(--gold-dim)" }}
              >
                <span className="text-xs font-medium" style={{ color: "var(--gold)" }}>
                  {recipients.length} recipient{recipients.length !== 1 ? "s" : ""} selected
                </span>
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
              </div>
            </div>
          </div>

          {/* email subject */}
          {emailOn && (
            <div>
              <Label style={{ color: "var(--text)" }} className="text-xs uppercase tracking-wide">
                Email subject
              </Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Important update: your trip begins soon!"
                className="mt-1.5 rounded-xl"
                style={{ borderColor: "var(--border-strong)" }}
              />
            </div>
          )}

          {/* message body */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label style={{ color: "var(--text)" }} className="text-xs uppercase tracking-wide">
                Message body
              </Label>
              {smsOn && message.length > 0 && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: smsSegments > 1 ? "var(--amber)" : "var(--text-tertiary)" }}
                >
                  {smsSegments > 1 && <AlertCircle className="h-3 w-3" />}
                  {message.length} chars · {smsSegments} SMS segment{smsSegments !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Textarea
              className="min-h-[120px] rounded-xl"
              style={{ borderColor: "var(--border-strong)" }}
              placeholder="Write your message… use {FirstName} to personalise."
              value={message}
              onChange={(e) => { setMessage(e.target.value); setActiveTpl(null); }}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              Tip: <code style={{ color: "var(--primary)" }}>{"{FirstName}"}</code> is replaced with each recipient&apos;s name.
            </p>
          </div>

          {/* channels + actions */}
          <div
            className="flex flex-wrap items-center justify-between gap-4 border-t pt-4"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex flex-wrap gap-5">
              <ChannelCheck checked={emailOn} onChange={setEmailOn} label="Send as Email" note="No extra cost · High reach" />
              <ChannelCheck checked={smsOn}   onChange={setSmsOn}   label="Send as SMS"   note={`GHS ${SMS_COST.toFixed(2)} per recipient`} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
                onClick={() => {
                  if (!message.trim()) { toast.error("Write a message first"); return; }
                  toast.success("Saved as template");
                }}
              >
                <Bookmark className="h-3.5 w-3.5" />
                Save Template
              </Button>
              <Button
                className="rounded-xl text-sm font-semibold"
                onClick={handleSendClick}
                disabled={recipients.length === 0}
                style={{
                  background: recipients.length === 0 ? "var(--border)" : "var(--gradient-brand)",
                  color:      recipients.length === 0 ? "var(--text-tertiary)" : "#fbf7f1",
                  boxShadow:  recipients.length === 0 ? "none" : "var(--glow-gold)",
                  border: "none",
                }}
              >
                <Send className="h-3.5 w-3.5" />
                Send Broadcast
              </Button>
            </div>
          </div>

          {smsOn && smsCost > 0 && (
            <p className="text-right text-xs" style={{ color: "var(--text-tertiary)" }}>
              Estimated SMS cost: <span style={{ color: "var(--amber)" }}>GHS {smsCost.toFixed(2)}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Broadcast history ────────────────────────────────────── */}
      <div className="comm-entrance mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>
            Recent Broadcasts
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--primary)" }}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Table controls: search + status filter ── */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <Input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search broadcasts…"
              className="h-9 w-52 rounded-xl pl-9 text-sm"
              style={{ borderColor: "var(--border-strong)" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} />
            {(["all", "sent", "pending", "failed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: statusFilter === s ? "var(--gradient-brand)" : "var(--bg-secondary)",
                  color:      statusFilter === s ? "#fbf7f1" : "var(--text-secondary)",
                  border:     statusFilter === s ? "1px solid transparent" : "1px solid var(--border)",
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Card
          className="border shadow-none"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="mb-3 h-8 w-8" style={{ color: "var(--text-tertiary)" }} />
                <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
                  {globalSearch ? `No results for "${globalSearch}"` : "No broadcasts yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto px-4 pt-4 pb-2">
                  <table className="w-full text-sm">
                    <thead>
                      {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                          {hg.headers.map((header) => (
                            <th
                              key={header.id}
                              className={cn(
                                "py-3 pl-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider select-none",
                                header.column.getCanSort() && "cursor-pointer"
                              )}
                              style={{ color: "var(--text-tertiary)" }}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <span className="inline-flex items-center gap-1">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() && (
                                  <SortIcon dir={header.column.getIsSorted()} />
                                )}
                              </span>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>

                    <tbody ref={tableBodyRef}>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className="group border-b transition-colors last:border-0 hover:bg-[var(--bg-secondary)] cursor-pointer"
                          style={{ borderColor: "var(--border-subtle)" }}
                          onClick={() => setDrawerRecord(row.original)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="py-3.5 pl-3 pr-4 align-top"
                              onClick={
                                cell.column.id === "actions"
                                  ? (e) => { e.stopPropagation(); setDrawerRecord(row.original); }
                                  : undefined
                              }
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* pagination */}
                {table.getPageCount() > 1 && (
                  <div
                    className="flex items-center justify-between border-t px-6 py-3"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ·{" "}
                      {table.getFilteredRowModel().rows.length} results
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-40"
                        style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-40"
                        style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)" }}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Broadcast detail drawer ───────────────────────────────── */}
      <BroadcastDrawer
        record={drawerRecord}
        onClose={() => setDrawerRecord(null)}
      />

      {/* ── Confirmation dialog ───────────────────────────────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(42,27,15,0.5)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-6"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--gold-dim)" }}>
                <Send className="h-4 w-4" style={{ color: "var(--gold)" }} />
              </div>
              <button type="button" onClick={() => setShowConfirm(false)} style={{ color: "var(--text-tertiary)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="font-display mt-3 text-lg font-bold" style={{ color: "var(--text)" }}>
              Send to {recipients.length} member{recipients.length !== 1 ? "s" : ""}?
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              Delivered via{" "}
              {[emailOn && "email", smsOn && "SMS"].filter(Boolean).join(" & ")}.
              {smsOn && ` Estimated SMS cost: GHS ${smsCost.toFixed(2)}.`}{" "}
              This can&apos;t be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl"
                style={{ background: "var(--gradient-brand)", color: "#fbf7f1", border: "none" }}
                onClick={runSend}
              >
                Confirm &amp; Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send → delivered overlay ──────────────────────────────── */}
      {sendStage !== "idle" && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(42,27,15,0.55)", opacity: 0 }}
        >
          <div
            className="w-full max-w-xs rounded-2xl border p-8 text-center"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            {sendStage === "sending" && (
              <>
                <div
                  ref={sendingIconRef}
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Loader2 className="h-6 w-6" style={{ color: "#fbf7f1" }} />
                </div>
                <p className="font-display font-bold" style={{ color: "var(--text)" }}>
                  Sending message…
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Reaching {recipients.length} member{recipients.length !== 1 ? "s" : ""}
                </p>
                <div
                  className="mt-4 h-1.5 overflow-hidden rounded-full"
                  style={{ background: "var(--border)" }}
                >
                  <div
                    ref={progressRef}
                    className="h-full rounded-full"
                    style={{ width: "0%", background: "var(--gradient-brand)" }}
                  />
                </div>
              </>
            )}
            {sendStage === "delivered" && (
              <>
                <div
                  ref={deliveredRef}
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "var(--gold-dim)" }}
                >
                  <CheckCircle2 className="h-7 w-7" style={{ color: "var(--gold)" }} />
                </div>
                <p className="font-display font-bold" style={{ color: "var(--text)" }}>
                  Delivered!
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Your message is on its way to {recipients.length} member{recipients.length !== 1 ? "s" : ""}.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}