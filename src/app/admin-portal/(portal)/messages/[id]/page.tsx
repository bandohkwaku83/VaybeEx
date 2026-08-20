"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Alert, Button, Tag } from "antd";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ApiError } from "@/lib/api/client";
import {
  deliveryStatusLabel,
  getAdminMessage,
  messageStatusLabel,
  type AdminMessageCampaign,
  type AdminMessageDelivery,
} from "@/lib/api/admin";
import { formatDateShort, formatRelativeTime } from "@/lib/format";

function campaignTone(status: string) {
  switch (status) {
    case "pending":
      return { bg: "#eff6ff", color: "#1d4ed8" };
    case "sent":
      return { bg: "#f0fdf4", color: "#15803d" };
    case "failed":
      return { bg: "#fef2f2", color: "#b91c1c" };
    default:
      return { bg: "#f5f5f5", color: "#525252" };
  }
}

function deliveryTag(status: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    queued: { bg: "#eff6ff", color: "#1d4ed8" },
    sent: { bg: "#f0fdf4", color: "#15803d" },
    failed: { bg: "#fef2f2", color: "#b91c1c" },
    skipped: { bg: "#fff7ed", color: "#c2410c" },
  };
  const tone = styles[status] ?? { bg: "#f5f5f5", color: "#525252" };
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ background: tone.bg, color: tone.color }}
    >
      {deliveryStatusLabel(status)}
    </span>
  );
}

function isInFlight(campaign: AdminMessageCampaign | null) {
  if (!campaign) return false;
  if (campaign.status === "pending") return true;
  return (campaign.deliveryStats?.queued ?? 0) > 0;
}

function MessageDetailInner() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [campaign, setCampaign] = useState<AdminMessageCampaign | null>(null);
  const [deliveries, setDeliveries] = useState<AdminMessageDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await getAdminMessage(id);
      setCampaign(res.data?.message ?? null);
      setDeliveries(res.data?.deliveries ?? []);
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof ApiError ? err.message : "Could not load message."
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isInFlight(campaign)) return;
    const timer = window.setInterval(() => {
      void load(true);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [campaign, load]);

  const columns: ColumnDef<AdminMessageDelivery, unknown>[] = useMemo(
    () => [
      {
        header: "Recipient",
        id: "recipient",
        cell: ({ row }) => {
          const delivery = row.original;
          return delivery.userId ? (
            <Link
              href={`/admin-portal/users/${delivery.userId}`}
              className="hover:underline"
              style={{ color: "var(--text)" }}
            >
              <span className="block font-medium">
                {delivery.recipientName || "User"}
              </span>
              <span
                className="block text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                {delivery.phone || delivery.email || delivery.role}
              </span>
            </Link>
          ) : (
            delivery.recipientName || "—"
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        size: 130,
        cell: ({ getValue }) => deliveryTag(getValue() as string),
      },
      {
        header: "Note",
        id: "note",
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {row.original.errorMessage || row.original.skipReason || "—"}
          </span>
        ),
      },
      {
        header: "Sent",
        id: "sent",
        size: 140,
        cell: ({ row }) =>
          row.original.sentAt ? (
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              <div>{formatRelativeTime(row.original.sentAt)}</div>
              <div>{formatDateShort(row.original.sentAt)}</div>
            </div>
          ) : (
            "—"
          ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm" style={{ color: "#737373" }}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading message…
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/admin-portal/messages"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#737373" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Messages
        </Link>
        <Alert
          type="error"
          showIcon
          message={error || "Message not found"}
          action={
            <Button size="small" onClick={() => void load()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const stats = campaign.deliveryStats;
  const tone = campaignTone(campaign.status);
  const sending = isInFlight(campaign);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/admin-portal/messages"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#737373" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Messages
        </Link>
        <span style={{ color: "#d4d4d4" }}>/</span>
        <span className="truncate text-sm font-medium" style={{ color: "#171717" }}>
          {campaign.subject || campaign.preview || campaign.id}
        </span>
      </div>

      <header
        className="rounded-2xl bg-white p-5 sm:p-6"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="font-display text-xl font-bold tracking-tight sm:text-2xl"
                style={{ color: "#171717" }}
              >
                {campaign.subject || campaign.preview || "Campaign"}
              </h1>
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                style={{ background: tone.bg, color: tone.color }}
              >
                {sending ? "Sending…" : messageStatusLabel(campaign.status)}
              </span>
              <span className="text-xs font-medium" style={{ color: "#a3a3a3" }}>
                {campaign.channel === "email" ? "Email" : "Text"}
              </span>
            </div>
            <p className="mt-2 text-sm" style={{ color: "#737373" }}>
              {campaign.audience}
              {campaign.createdAt
                ? ` · ${formatRelativeTime(campaign.createdAt)}`
                : ""}
            </p>
          </div>
          {sending ? (
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#1d4ed8" }}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Still sending…
            </span>
          ) : null}
        </div>

        {campaign.errorMessage ? (
          <p className="mt-3 text-sm" style={{ color: "#b91c1c" }}>
            {campaign.errorMessage}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              ["Still going out", stats?.queued ?? 0],
              ["Got it", stats?.sent ?? 0],
              ["Didn't send", stats?.failed ?? 0],
              ["Left out", stats?.skipped ?? 0],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <p
                className="text-[11px] font-medium uppercase tracking-[0.14em]"
                style={{ color: "#a3a3a3" }}
              >
                {label}
              </p>
              <p
                className="mt-1 font-display text-2xl font-bold tabular-nums"
                style={{ color: "#171717" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {campaign.messageBody ? (
          <pre
            className="mt-5 whitespace-pre-wrap rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: "#fafafa", color: "#404040" }}
          >
            {campaign.messageBody}
          </pre>
        ) : null}
      </header>

      <section className="mt-6">
        <h2
          className="mb-3 font-display text-base font-semibold"
          style={{ color: "#171717" }}
        >
          Who got it
        </h2>
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border, rgba(0,0,0,0.08))" }}>
          <DataTable
            data={deliveries}
            columns={columns}
            emptyText="No deliveries recorded."
            scrollX={720}
            enableSorting={false}
            pagination={{
              current: 1,
              pageSize: 30,
              total: deliveries.length,
              onChange: () => {},
            }}
          />
        </div>
      </section>
    </div>
  );
}

export default function AdminMessageDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 p-8 text-sm" style={{ color: "#737373" }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      }
    >
      <MessageDetailInner />
    </Suspense>
  );
}
