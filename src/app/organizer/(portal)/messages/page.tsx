"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  FileText,
  CheckCircle2,
  Calendar,
  CreditCard,
  MapPin,
  PartyPopper,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfigProvider, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OrganizerEmptyState } from "@/components/organizer/empty-state";
import { OrganizerPortalTabs } from "@/components/organizer/portal-tabs";
import { listOrganizerTrips } from "@/lib/api/organizer-trips";
import { ApiError } from "@/lib/api/client";
import {
  analyzeSms,
  createBroadcast,
  estimateBroadcast,
  getBroadcast,
  getBroadcastAudience,
  listBroadcasts,
  toAudiencePayload,
  type AudienceMode,
  type AudienceRecipient,
  type BroadcastAudience,
  type BroadcastEstimate,
  type BroadcastRecord,
  type BroadcastStatus,
  type PaymentFilter,
} from "@/lib/api/broadcasts";
import { cn, formatDate } from "@/lib/utils";
import { getOrganizerProfile } from "@/lib/organizer-profile";
import { useAuth } from "@/hooks/use-auth";

const organizerAntdTheme = {
  token: {
    colorPrimary: "#6b3f1d",
    colorInfo: "#6b3f1d",
    colorSuccess: "#2e7d52",
    colorWarning: "#d08a3c",
    colorError: "#b5523a",
    colorText: "#2a1b0f",
    colorTextSecondary: "#6b5544",
    colorTextTertiary: "#9c8773",
    colorBorder: "rgba(107, 63, 29, 0.14)",
    colorBorderSecondary: "rgba(107, 63, 29, 0.07)",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f5f5f5",
    borderRadius: 10,
    borderRadiusLG: 12,
    fontFamily:
      'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 13,
  },
  components: {
    Table: {
      headerBg: "#f2eada",
      headerColor: "#6b5544",
      headerSplitColor: "rgba(107, 63, 29, 0.14)",
      rowHoverBg: "#fbf7f1",
      borderColor: "rgba(107, 63, 29, 0.14)",
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
      headerBorderRadius: 12,
    },
    Pagination: {
      itemActiveBg: "#6b3f1d",
      borderRadius: 8,
    },
    Button: {
      borderRadius: 0,
    },
  },
} as const;

type SendStage = "idle" | "sending" | "delivered";

type TripOption = {
  id: string;
  title: string;
  booked: number;
};

interface Template {
  id: string;
  label: string;
  icon: React.ElementType;
  body: (t: string) => string;
}

const TEMPLATES: Template[] = [
  {
    id: "payment-reminder",
    label: "Payment reminder",
    icon: CreditCard,
    body: (t) =>
      `Hi {FirstName}! Reminder: your balance for ${t} is still outstanding. Please complete payment to secure your spot.`,
  },
  {
    id: "departure-info",
    label: "Departure details",
    icon: MapPin,
    body: (t) =>
      `Excited for ${t}, {FirstName}! Meeting point, time & what to bring are in your booking. See you soon!`,
  },
  {
    id: "itinerary-update",
    label: "Itinerary update",
    icon: Calendar,
    body: (t) =>
      `Hi {FirstName} — quick update on ${t}. We've made a small itinerary change. Please review before departure.`,
  },
  {
    id: "trip-confirmed",
    label: "Trip confirmed",
    icon: PartyPopper,
    body: (t) =>
      `Great news, {FirstName} — ${t} is confirmed to run! Get ready for an amazing experience.`,
  },
];

function statusMeta(status: BroadcastStatus) {
  if (status === "sent") {
    return {
      label: "Sent",
      color: "#2e7d52",
      bg: "rgba(46,125,82,0.14)",
    };
  }
  if (status === "pending") {
    return {
      label: "Pending",
      color: "#d08a3c",
      bg: "rgba(208,138,60,0.14)",
    };
  }
  return {
    label: "Failed",
    color: "#b5523a",
    bg: "rgba(181,82,58,0.12)",
  };
}

function StatusBadge({ status }: { status: BroadcastStatus }) {
  const meta = statusMeta(status);
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-semibold"
      style={{
        color: meta.color,
        background: meta.bg,
      }}
    >
      {meta.label}
    </span>
  );
}

const AVATAR_PALETTE = ["var(--primary)", "var(--gold)", "var(--coral)", "var(--amber)"];
const hash = (s: string) => s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
const avatarColorFor = (n: string) => AVATAR_PALETTE[hash(n) % AVATAR_PALETTE.length];
const initialsFor = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

function BroadcastDrawer({
  record,
  loading,
  onClose,
}: {
  record: BroadcastRecord | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {record && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(42,27,15,0.45)" }}
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col"
            style={{
              background: "var(--surface)",
              borderLeft: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-6 py-5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="min-w-0">
                <p
                  className="font-display text-base font-bold leading-snug"
                  style={{ color: "var(--text)" }}
                >
                  {record.preview}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {formatDate(record.date)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2
                    className="h-6 w-6 animate-spin"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Trip", value: record.tripTitle },
                      { label: "Audience", value: record.audience },
                      { label: "Recipients", value: String(record.recipients) },
                      { label: "Channel", value: "SMS" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {label}
                        </p>
                        <p
                          className="mt-1 text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p
                      className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Status
                    </p>
                    <StatusBadge status={record.status} />
                  </div>

                  {record.deliveryStats && (
                    <div>
                      <p
                        className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Delivery
                      </p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {record.deliveryStats.sent} sent
                        {record.deliveryStats.failed
                          ? ` · ${record.deliveryStats.failed} failed`
                          : ""}
                        {record.deliveryStats.skipped
                          ? ` · ${record.deliveryStats.skipped} skipped`
                          : ""}
                        {record.deliveryStats.queued
                          ? ` · ${record.deliveryStats.queued} queued`
                          : ""}
                      </p>
                    </div>
                  )}

                  {record.errorMessage && (
                    <div>
                      <p
                        className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Error
                      </p>
                      <p className="text-sm" style={{ color: "#b5523a" }}>
                        {record.errorMessage}
                      </p>
                    </div>
                  )}

                  <div>
                    <p
                      className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Message
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {record.messageBody}
                    </p>
                  </div>

                  {record.estimatedCostGhs > 0 && (
                    <div>
                      <p
                        className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Estimated cost
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        GH₵{record.estimatedCostGhs.toFixed(2)}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t px-6 py-4" style={{ borderColor: "var(--border)" }}>
              <Button
                className="w-full"
                style={{ background: "var(--primary)", color: "#fbf7f1" }}
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function withBrandFooter(text: string, brand: string) {
  const signOff = `from ${brand}`;
  const trimmed = text.replace(/\s+$/, "");
  if (trimmed.endsWith(signOff)) return trimmed;
  if (!trimmed) return signOff;
  return `${trimmed}\n\n${signOff}`;
}

export default function CommunicationPage() {
  const searchParams = useSearchParams();
  const tripFromUrl = searchParams.get("trip");
  const { user } = useAuth();
  const brandName = useMemo(() => {
    try {
      const profile = getOrganizerProfile();
      return profile.businessName.trim() || user?.name?.trim() || "VaybeEx";
    } catch {
      return user?.name?.trim() || "VaybeEx";
    }
  }, [user?.name]);
  const signOff = `from ${brandName}`;

  const [trips, setTrips] = useState<TripOption[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripId, setTripId] = useState("");
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("everyone");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("paid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [audience, setAudience] = useState<BroadcastAudience | null>(null);
  const [audienceLoading, setAudienceLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [activeTpl, setActiveTpl] = useState<string | null>(null);

  const [sendStage, setSendStage] = useState<SendStage>("idle");
  const [showConfirm, setShowConfirm] = useState(false);
  const [estimate, setEstimate] = useState<BroadcastEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [tripAttendeeCount, setTripAttendeeCount] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<"all" | BroadcastStatus>("all");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  const [drawerRecord, setDrawerRecord] = useState<BroadcastRecord | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");

  const selectedTrip = trips.find((t) => t.id === tripId);
  const messageWithFooter = useMemo(
    () => withBrandFooter(message, brandName),
    [brandName, message]
  );

  const smsMeta = useMemo(() => analyzeSms(messageWithFooter), [messageWithFooter]);
  const charsInSegment =
    messageWithFooter.length === 0
      ? 0
      : messageWithFooter.length % smsMeta.charsPerSms || smsMeta.charsPerSms;

  const sendableCount = useMemo(() => {
    if (!audience) return 0;
    if (audienceMode === "specific") {
      return audience.recipients.filter(
        (r) => selectedIds.has(r.id) && r.hasValidPhone
      ).length;
    }
    return audience.counts.sendable;
  }, [audience, audienceMode, selectedIds]);

  const audienceHelper = useMemo(() => {
    if (audience?.audienceLabel) return audience.audienceLabel;
    if (audienceMode === "everyone") {
      return `All participants on ${selectedTrip?.title ?? "this trip"}.`;
    }
    if (audienceMode === "filter") {
      return paymentFilter === "paid"
        ? "Participants who have paid in full."
        : "Participants with outstanding balance.";
    }
    return selectedIds.size === 0
      ? "Select people from the list below."
      : `${selectedIds.size} hand-picked participant${selectedIds.size === 1 ? "" : "s"}.`;
  }, [audience, audienceMode, paymentFilter, selectedIds, selectedTrip?.title]);

  const canSend = Boolean(message.trim()) && sendableCount > 0;

  // Load trips with bookings
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTripsLoading(true);
      try {
        const res = await listOrganizerTrips({ limit: 50 });
        if (cancelled) return;
        const options = (res.data?.trips ?? [])
          .filter((t) => (t.booked ?? 0) > 0)
          .map((t) => ({
            id: t.id,
            title: t.title,
            booked: t.booked ?? 0,
          }));
        setTrips(options);

        const preferred =
          tripFromUrl && options.some((t) => t.id === tripFromUrl)
            ? tripFromUrl
            : options[0]?.id ?? "";
        setTripId((prev) => prev || preferred);
      } catch (err) {
        if (!cancelled) {
          toast.error(errorMessage(err, "Could not load trips"));
        }
      } finally {
        if (!cancelled) setTripsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tripFromUrl]);

  // Load audience when trip/mode/filter changes
  useEffect(() => {
    if (!tripId) {
      setAudience(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setAudienceLoading(true);
      try {
        const data = await getBroadcastAudience(tripId, {
          mode: audienceMode,
          filter: audienceMode === "filter" ? paymentFilter : undefined,
        });
        if (cancelled) return;
        setAudience(data);
      } catch (err) {
        if (!cancelled) {
          setAudience(null);
          toast.error(errorMessage(err, "Could not load audience"));
        }
      } finally {
        if (!cancelled) setAudienceLoading(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [tripId, audienceMode, paymentFilter]);

  const loadHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const data = await listBroadcasts({
        status: statusFilter,
        tripId: tripId || undefined,
        page,
        limit: 8,
      });
      setHistory(data.broadcasts);
      setSentCount(data.summary.sentCount);
      setTripAttendeeCount(data.summary.tripAttendeeCount);
      setHistoryPage(data.pagination.page);
      setHistoryTotal(data.pagination.total);
    } catch (err) {
      toast.error(errorMessage(err, "Could not load broadcasts"));
    } finally {
      setHistoryLoading(false);
    }
  }, [statusFilter, tripId]);

  // Keep header sent count fresh; full table loads on history tab
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listBroadcasts({
          tripId: tripId || undefined,
          page: 1,
          limit: 1,
        });
        if (cancelled) return;
        setSentCount(data.summary.sentCount);
        setTripAttendeeCount(data.summary.tripAttendeeCount);
        setHistoryTotal(data.pagination.total);
      } catch {
        /* header is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  useEffect(() => {
    if (activeTab !== "history") return;
    void loadHistory(1);
  }, [activeTab, loadHistory]);

  const openDrawer = useCallback(async (id: string, seed?: BroadcastRecord) => {
    if (seed) setDrawerRecord(seed);
    setDrawerLoading(true);
    try {
      const detail = await getBroadcast(id);
      setDrawerRecord(detail.broadcast);
      return detail.broadcast;
    } catch (err) {
      toast.error(errorMessage(err, "Could not load broadcast"));
      return seed ?? null;
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  // Poll pending broadcast in drawer
  useEffect(() => {
    if (!drawerRecord || drawerRecord.status !== "pending") return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20;

    const tick = async () => {
      attempts += 1;
      try {
        const detail = await getBroadcast(drawerRecord.id);
        if (cancelled) return;
        setDrawerRecord(detail.broadcast);
        setHistory((prev) =>
          prev.map((b) => (b.id === detail.broadcast.id ? detail.broadcast : b))
        );
        if (detail.broadcast.status === "pending" && attempts < maxAttempts) {
          window.setTimeout(tick, 1500);
        } else if (detail.broadcast.status !== "pending") {
          void loadHistory(historyPage);
        }
      } catch {
        if (!cancelled && attempts < maxAttempts) {
          window.setTimeout(tick, 2000);
        }
      }
    };

    const timer = window.setTimeout(tick, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [drawerRecord?.id, drawerRecord?.status, historyPage, loadHistory]);

  useEffect(() => {
    if (sendStage !== "delivered") return;
    const timer = window.setTimeout(() => {
      setSendStage("idle");
      setMessage("");
      setActiveTpl(null);
      setEstimate(null);
      idempotencyKeyRef.current = null;
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [sendStage]);

  const handleTripChange = (id: string) => {
    setTripId(id);
    setSelectedIds(new Set());
  };

  const applyTemplate = (tpl: Template) => {
    setActiveTpl(tpl.id);
    setMessage(tpl.body(selectedTrip?.title ?? "your trip"));
  };

  const handleSendClick = async () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }
    if (sendableCount < 1) {
      toast.error("Select at least one recipient with a valid phone");
      return;
    }
    if (!tripId) {
      toast.error("Choose a trip");
      return;
    }

    setEstimating(true);
    try {
      const audiencePayload = toAudiencePayload({
        mode: audienceMode,
        filter: paymentFilter,
        attendeeIds: Array.from(selectedIds),
      });
      const est = await estimateBroadcast({
        tripId,
        message: messageWithFooter,
        audience: audiencePayload,
      });
      if (est.recipientCount < 1) {
        toast.error("No recipients have a valid phone number");
        return;
      }
      setEstimate(est);
      idempotencyKeyRef.current = crypto.randomUUID();
      setShowConfirm(true);
    } catch (err) {
      toast.error(errorMessage(err, "Could not estimate cost"));
    } finally {
      setEstimating(false);
    }
  };

  const runSend = async () => {
    if (!tripId || !estimate) return;
    const key = idempotencyKeyRef.current ?? crypto.randomUUID();
    idempotencyKeyRef.current = key;

    setShowConfirm(false);
    setSendStage("sending");

    requestAnimationFrame(() => {
      if (progressRef.current) {
        progressRef.current.style.width = "0%";
        requestAnimationFrame(() => {
          if (progressRef.current) progressRef.current.style.width = "100%";
        });
      }
    });

    try {
      const audiencePayload = toAudiencePayload({
        mode: audienceMode,
        filter: paymentFilter,
        attendeeIds: Array.from(selectedIds),
      });
      const { broadcast } = await createBroadcast(
        {
          tripId,
          channel: "sms",
          message: messageWithFooter,
          audience: audiencePayload,
        },
        key
      );

      setSendStage("delivered");
      toast.success(
        broadcast.status === "pending"
          ? "Broadcast queued"
          : `SMS delivered to ${broadcast.recipients} member${broadcast.recipients === 1 ? "" : "s"}`
      );
      setActiveTab("history");
      await loadHistory(1);
      await openDrawer(broadcast.id, broadcast);
    } catch (err) {
      setSendStage("idle");
      toast.error(errorMessage(err, "Could not send broadcast"));
    }
  };

  const historyColumns: ColumnsType<BroadcastRecord> = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 120,
        sorter: (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
        defaultSortOrder: "descend",
        render: (date: string) => (
          <span style={{ color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
            {formatDate(date)}
          </span>
        ),
      },
      {
        title: "Message",
        key: "message",
        ellipsis: true,
        render: (_, record) => (
          <div className="min-w-0">
            <p
              className="truncate text-[13px] font-semibold"
              style={{ color: "var(--text)" }}
            >
              {record.preview}
            </p>
            <p
              className="mt-0.5 truncate text-[12px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              {record.snippet}
            </p>
          </div>
        ),
      },
      {
        title: "Trip",
        dataIndex: "tripTitle",
        key: "tripTitle",
        ellipsis: true,
        width: 180,
        render: (title: string) => (
          <span style={{ color: "var(--text-secondary)" }}>{title}</span>
        ),
      },
      {
        title: "Audience",
        dataIndex: "audience",
        key: "audience",
        width: 140,
        render: (value: string) => (
          <span style={{ color: "var(--text-secondary)" }}>{value}</span>
        ),
      },
      {
        title: "Recipients",
        dataIndex: "recipients",
        key: "recipients",
        width: 110,
        align: "right",
        sorter: (a, b) => a.recipients - b.recipients,
        render: (n: number) => (
          <span className="font-semibold tabular-nums" style={{ color: "var(--text)" }}>
            {n}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 110,
        render: (status: BroadcastStatus) => <StatusBadge status={status} />,
      },
      {
        title: "",
        key: "actions",
        width: 88,
        align: "right",
        render: (_, record) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-none px-2 py-1 text-[12px] font-medium transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: "var(--primary)" }}
            onClick={(e) => {
              e.stopPropagation();
              void openDrawer(record.id, record);
            }}
          >
            <EyeOutlined />
            View
          </button>
        ),
      },
    ],
    [openDrawer]
  );

  const tabs = [
    {
      value: "compose" as const,
      label: "New broadcast",
      icon: Send,
    },
    {
      value: "history" as const,
      label: "Recent broadcasts",
      icon: MessageSquare,
      count: historyTotal || history.length,
    },
  ];

  const recipients = audience?.recipients ?? [];
  const counts = audience?.counts ?? {
    total: 0,
    paid: 0,
    unpaid: 0,
    withPhone: 0,
    selected: 0,
    sendable: 0,
    skipped: 0,
  };

  return (
    <div className="w-full p-6 lg:p-8" style={{ background: "#f5f5f5" }}>
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="font-display text-2xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Messages &amp; Broadcasts
          </h1>
          <p
            className="mt-1 text-[13px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Send trip updates and reminders to your participants by SMS.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <span style={{ color: "var(--text-tertiary)" }}>
            <span className="font-semibold tabular-nums" style={{ color: "var(--text)" }}>
              {sentCount}
            </span>{" "}
            sent
          </span>
          {(tripAttendeeCount != null || audience?.counts.total != null) && (
            <>
              <span style={{ color: "var(--border-strong)" }}>·</span>
              <span style={{ color: "var(--text-tertiary)" }}>
                <span className="font-semibold tabular-nums" style={{ color: "var(--text)" }}>
                  {tripAttendeeCount ?? audience?.counts.total ?? 0}
                </span>{" "}
                on trip
              </span>
            </>
          )}
        </div>
      </div>

      <OrganizerPortalTabs
        className="mb-6"
        aria-label="Messages sections"
        tabs={tabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "compose" && (
            <div className="grid gap-8 lg:grid-cols-2">
              <section>
                <h2
                  className="mb-3 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Audience
                </h2>

                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <div className="mb-5">
                    <p
                      className="mb-1.5 text-[12px] font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Trip
                    </p>
                    <Select
                      value={tripId || undefined}
                      onValueChange={handleTripChange}
                      disabled={tripsLoading || trips.length === 0}
                    >
                      <SelectTrigger
                        className="rounded-xl"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface)",
                        }}
                      >
                        <SelectValue
                          placeholder={
                            tripsLoading
                              ? "Loading trips…"
                              : trips.length === 0
                                ? "No trips with bookings"
                                : "Choose a trip"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {trips.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title} ({t.booked} booked)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      Audience
                    </p>
                    <p
                      className="text-[13px] font-semibold tabular-nums"
                      style={{ color: "#2e7d52" }}
                    >
                      {audienceLoading ? "…" : `${sendableCount} recipient${sendableCount !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <p
                    className="mb-4 text-[13px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Pick who receives this message.
                  </p>

                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Audience mode"
                  >
                    {(
                      [
                        { id: "everyone" as const, label: "Everyone" },
                        { id: "filter" as const, label: "By filter" },
                        { id: "specific" as const, label: "Specific people" },
                      ] as const
                    ).map((opt) => {
                      const active = audienceMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className="soft-chip px-4 py-2 text-[13px] font-medium transition-all duration-200"
                          onClick={() => setAudienceMode(opt.id)}
                          style={{
                            background: active
                              ? "var(--primary)"
                              : "var(--bg-secondary)",
                            color: active ? "#fbf7f1" : "var(--text-secondary)",
                            boxShadow: active
                              ? "0 6px 16px -8px rgba(86,47,24,0.45)"
                              : "none",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    {audienceMode === "filter" && (
                      <motion.div
                        key="filter"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-3 flex flex-wrap gap-2"
                          role="group"
                          aria-label="Payment filter"
                        >
                          {(
                            [
                              {
                                id: "paid" as const,
                                label: "Paid",
                                count: counts.paid,
                              },
                              {
                                id: "unpaid" as const,
                                label: "Not paid",
                                count: counts.unpaid,
                              },
                            ] as const
                          ).map((f) => {
                            const active = paymentFilter === f.id;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                className="soft-chip inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-all duration-200"
                                onClick={() => setPaymentFilter(f.id)}
                                style={{
                                  background: active
                                    ? "var(--primary-dim)"
                                    : "var(--bg-secondary)",
                                  color: active
                                    ? "var(--primary)"
                                    : "var(--text-secondary)",
                                  boxShadow: active
                                    ? "inset 0 0 0 1px rgba(107,63,29,0.22)"
                                    : "none",
                                }}
                              >
                                {f.label}
                                <span
                                  className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
                                  style={{
                                    background: active
                                      ? "rgba(107,63,29,0.12)"
                                      : "rgba(107,63,29,0.08)",
                                    color: active
                                      ? "var(--primary)"
                                      : "var(--text-tertiary)",
                                  }}
                                >
                                  {f.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {audienceMode === "specific" && (
                      <motion.div
                        key="specific"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-3 max-h-52 space-y-0.5 overflow-y-auto rounded-xl border p-2"
                          style={{ borderColor: "var(--border)" }}
                        >
                          {audienceLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2
                                className="h-4 w-4 animate-spin"
                                style={{ color: "var(--primary)" }}
                              />
                            </div>
                          ) : recipients.length === 0 ? (
                            <p
                              className="px-2 py-4 text-center text-[12px]"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              No participants on this trip yet.
                            </p>
                          ) : (
                            recipients.map((a: AudienceRecipient) => (
                              <label
                                key={a.id}
                                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--bg-secondary)]"
                                style={{
                                  opacity: a.hasValidPhone ? 1 : 0.55,
                                }}
                              >
                                <div
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                  style={{ background: avatarColorFor(a.name) }}
                                >
                                  {initialsFor(a.name)}
                                </div>
                                <span
                                  className="min-w-0 flex-1 truncate text-[13px]"
                                  style={{ color: "var(--text)" }}
                                >
                                  {a.name}
                                  {!a.hasValidPhone && (
                                    <span
                                      className="ml-1.5 text-[11px]"
                                      style={{ color: "var(--text-tertiary)" }}
                                    >
                                      no phone
                                    </span>
                                  )}
                                </span>
                                <Checkbox
                                  checked={selectedIds.has(a.id)}
                                  disabled={!a.hasValidPhone}
                                  onCheckedChange={(c) => {
                                    if (!a.hasValidPhone) return;
                                    setSelectedIds((prev) => {
                                      const next = new Set(prev);
                                      if (!!c) next.add(a.id);
                                      else next.delete(a.id);
                                      return next;
                                    });
                                  }}
                                />
                              </label>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p
                    className="mt-4 text-[12px] leading-relaxed"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {audienceHelper}
                  </p>
                </div>
              </section>

              <section>
                <h2
                  className="mb-3 text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Message
                </h2>

                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <p
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      SMS
                    </p>

                    <Select
                      value={activeTpl ?? undefined}
                      onValueChange={(id) => {
                        const tpl = TEMPLATES.find((t) => t.id === id);
                        if (tpl) applyTemplate(tpl);
                      }}
                    >
                      <SelectTrigger
                        aria-label="Use template"
                        className="h-8 w-auto gap-1.5 rounded-lg border-0 px-2 text-[12px] font-medium shadow-none"
                        style={{
                          color: activeTpl ? "var(--primary)" : "var(--text-tertiary)",
                          background: "transparent",
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span>Template</span>
                      </SelectTrigger>
                      <SelectContent align="end">
                        {TEMPLATES.map((tpl) => (
                          <SelectItem key={tpl.id} value={tpl.id}>
                            {tpl.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    className="min-h-[160px] resize-y rounded-b-none rounded-t-xl text-[14px] leading-relaxed"
                    style={{ borderColor: "var(--border)" }}
                    placeholder="Hi {FirstName}, write your update here…"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setActiveTpl(null);
                    }}
                  />
                  <p
                    className="rounded-b-xl border border-t-0 px-3 py-2 text-[12px]"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--bg, #faf7f3)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {signOff}
                  </p>

                  <div
                    className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <span className="tabular-nums">
                      {smsMeta.segments} SMS · {charsInSegment} / {smsMeta.charsPerSms} chars
                    </span>
                    <span>
                      {smsMeta.encoding} · {smsMeta.charsPerSms} chars/SMS
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    className="px-5 text-[13px] font-semibold"
                    onClick={() => void handleSendClick()}
                    disabled={!canSend || estimating}
                    style={{
                      background: !canSend || estimating ? "var(--border)" : "var(--primary)",
                      color: !canSend || estimating ? "var(--text-tertiary)" : "#fbf7f1",
                      border: "none",
                    }}
                  >
                    {estimating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Send SMS
                  </Button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "history" && (
            <section>
              <OrganizerPortalTabs
                className="mb-4"
                aria-label="Filter by status"
                fullWidth={false}
                value={statusFilter}
                onChange={setStatusFilter}
                tabs={(
                  [
                    { value: "all" as const, label: "All" },
                    { value: "sent" as const, label: "Sent" },
                    { value: "pending" as const, label: "Pending" },
                    { value: "failed" as const, label: "Failed" },
                  ]
                )}
              />

              <ConfigProvider theme={organizerAntdTheme}>
                <Table<BroadcastRecord>
                  className="organizer-antd-table"
                  rowKey="id"
                  columns={historyColumns}
                  dataSource={history}
                  loading={historyLoading}
                  scroll={{ x: 800 }}
                  pagination={{
                    current: historyPage,
                    pageSize: 8,
                    total: historyTotal,
                    showSizeChanger: false,
                    hideOnSinglePage: true,
                    onChange: (page) => void loadHistory(page),
                  }}
                  locale={{
                    emptyText: (
                      <OrganizerEmptyState
                        icon={MessageSquare}
                        title="No broadcasts yet"
                        description="Your sent messages will show up here."
                        action={{
                          label: "Create a broadcast",
                          onClick: () => setActiveTab("compose"),
                        }}
                        framed={false}
                        className="py-10"
                      />
                    ),
                  }}
                  onRow={(record) => ({
                    style: { cursor: "pointer" },
                    onClick: () => void openDrawer(record.id, record),
                  })}
                />
              </ConfigProvider>
            </section>
          )}
        </motion.div>
      </AnimatePresence>

      <BroadcastDrawer
        record={drawerRecord}
        loading={drawerLoading}
        onClose={() => setDrawerRecord(null)}
      />

      <AnimatePresence>
        {showConfirm && estimate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(42,27,15,0.5)" }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-sm rounded-2xl border p-6"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "var(--primary-dim)" }}
              >
                <Send className="h-4 w-4" style={{ color: "var(--primary)" }} />
              </div>
              <h3
                className="font-display mt-4 text-lg font-bold"
                style={{ color: "var(--text)" }}
              >
                Send to {estimate.recipientCount} recipient
                {estimate.recipientCount !== 1 ? "s" : ""}?
              </h3>
              <p
                className="mt-1.5 text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Via SMS · Est. GH₵{estimate.estimatedCostGhs.toFixed(2)}. This
                can&apos;t be undone.
                {estimate.skippedCount > 0
                  ? ` ${estimate.skippedCount} without a valid phone will be skipped.`
                  : ""}
              </p>
              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  style={{ background: "var(--primary)", color: "#fbf7f1", border: "none" }}
                  onClick={() => void runSend()}
                >
                  Confirm &amp; send
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sendStage !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(42,27,15,0.55)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xs rounded-2xl border p-8 text-center"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              {sendStage === "sending" && (
                <>
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "var(--primary)" }}
                  >
                    <Loader2
                      className="h-6 w-6 animate-spin"
                      style={{ color: "#fbf7f1" }}
                    />
                  </div>
                  <p
                    className="font-display font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Sending…
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Reaching {estimate?.recipientCount ?? sendableCount} recipient
                    {(estimate?.recipientCount ?? sendableCount) !== 1 ? "s" : ""}
                  </p>
                  <div
                    className="mt-4 h-1.5 overflow-hidden rounded-full"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      ref={progressRef}
                      className="h-full rounded-full transition-[width] duration-[1700ms] ease-in-out"
                      style={{ width: "0%", background: "var(--primary)" }}
                    />
                  </div>
                </>
              )}
              {sendStage === "delivered" && (
                <>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 14, stiffness: 220 }}
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "rgba(46,125,82,0.1)" }}
                  >
                    <CheckCircle2 className="h-7 w-7" style={{ color: "#2e7d52" }} />
                  </motion.div>
                  <p
                    className="font-display font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    Queued
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    On its way to {estimate?.recipientCount ?? sendableCount} recipient
                    {(estimate?.recipientCount ?? sendableCount) !== 1 ? "s" : ""}.
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
