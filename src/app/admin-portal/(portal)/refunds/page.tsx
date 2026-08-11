"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Input, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { ApiError } from "@/lib/api/client";
import {
  getAdminRefunds,
  refundLabel,
  type AdminRefund,
} from "@/lib/api/admin";
import { formatDateShort, formatGHSMoney, formatRelativeTime } from "@/lib/format";

function refundStatusTag(status: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#fffbeb", color: "#b45309" },
    processing: { bg: "#eff6ff", color: "#1d4ed8" },
    refunded: { bg: "#f0fdf4", color: "#15803d" },
    denied: { bg: "#fef2f2", color: "#b91c1c" },
  };
  const tone = styles[status] ?? { bg: "#f5f5f5", color: "#525252" };
  return (
    <Tag
      variant="filled"
      style={{
        background: tone.bg,
        color: tone.color,
        marginInlineEnd: 0,
        fontWeight: 500,
      }}
    >
      {refundLabel(status)}
    </Tag>
  );
}

function RefundsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queueParam = searchParams.get("queue") || "";
  const statusParam = searchParams.get("status") || "";
  const travelerParam = searchParams.get("travelerId") || "";
  const organizerParam = searchParams.get("organizerId") || "";
  const tripParam = searchParams.get("tripId") || "";
  const qParam = searchParams.get("q") || "";

  const [q, setQ] = useState(qParam);
  const [refunds, setRefunds] = useState<AdminRefund[]>([]);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    processing: 0,
    refunded: 0,
    denied: 0,
  });
  const [statusAmounts, setStatusAmounts] = useState({
    pending: 0,
    processing: 0,
    refunded: 0,
    denied: 0,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.replace(`/admin-portal/refunds${qs ? `?${qs}` : ""}`);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminRefunds({
        page,
        limit: pageSize,
        queue: queueParam || undefined,
        status: queueParam ? undefined : statusParam || undefined,
        travelerId: travelerParam || undefined,
        organizerId: organizerParam || undefined,
        tripId: tripParam || undefined,
        q: qParam || undefined,
      });
      setRefunds(res.data?.refunds ?? []);
      setStatusCounts(
        res.data?.statusCounts ?? {
          pending: 0,
          processing: 0,
          refunded: 0,
          denied: 0,
        }
      );
      setStatusAmounts(
        res.data?.statusAmounts ?? {
          pending: 0,
          processing: 0,
          refunded: 0,
          denied: 0,
        }
      );
      setTotal(res.data?.pagination.total ?? 0);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load refunds."
      );
    } finally {
      setLoading(false);
    }
  }, [
    organizerParam,
    page,
    pageSize,
    qParam,
    queueParam,
    statusParam,
    travelerParam,
    tripParam,
  ]);

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    setPage(1);
  }, [queueParam, statusParam, travelerParam, organizerParam, tripParam, qParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const awaitingCount = statusCounts.pending + statusCounts.processing;
  const activeTab = queueParam === "awaiting" ? "awaiting" : statusParam || "all";

  const columns: ColumnsType<AdminRefund> = [
    {
      title: "Trip",
      key: "trip",
      render: (_, row) => (
        <Link
          href={`/admin-portal/refunds/${row.id}`}
          className="block min-w-0"
        >
          <span className="block font-medium" style={{ color: "var(--text)" }}>
            {row.trip?.title || "Trip"}
          </span>
          <span className="block text-xs" style={{ color: "var(--text-tertiary)" }}>
            {row.trip?.destination || "—"}
          </span>
        </Link>
      ),
    },
    {
      title: "Traveler",
      key: "traveler",
      width: 180,
      render: (_, row) =>
        row.traveler?.id ? (
          <Link
            href={`/admin-portal/users/${row.traveler.id}`}
            className="hover:underline"
            style={{ color: "var(--text)" }}
          >
            {row.traveler.fullName || row.traveler.email || "—"}
          </Link>
        ) : (
          row.traveler?.fullName || row.traveler?.email || "—"
        ),
    },
    {
      title: "Organizer",
      key: "organizer",
      width: 180,
      render: (_, row) =>
        row.organizer?.id ? (
          <Link
            href={`/admin-portal/users/${row.organizer.id}`}
            className="hover:underline"
            style={{ color: "var(--text)" }}
          >
            {row.organizer.businessName ||
              row.organizer.fullName ||
              row.organizer.email ||
              "—"}
          </Link>
        ) : (
          row.organizer?.businessName || row.organizer?.fullName || "—"
        ),
    },
    {
      title: "Paid",
      key: "paid",
      width: 120,
      render: (_, row) => (
        <span className="tabular-nums">{formatGHSMoney(row.amountPaid)}</span>
      ),
    },
    {
      title: "Refund",
      key: "refund",
      width: 120,
      render: (_, row) => (
        <span className="font-medium tabular-nums">
          {formatGHSMoney(row.refundAmount)}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_, row) => refundStatusTag(row.status),
    },
    {
      title: "Requested",
      key: "requested",
      width: 140,
      render: (_, row) =>
        row.requestedAt ? (
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            <div>{formatRelativeTime(row.requestedAt)}</div>
            <div>{formatDateShort(row.requestedAt)}</div>
          </div>
        ) : (
          "—"
        ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: false,
    showTotal: (t) => `${t} refund${t === 1 ? "" : "s"}`,
    onChange: (next) => setPage(next),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 lg:hidden">
        <h1
          className="font-display text-2xl font-bold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Refunds
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Cancellation refunds across travelers and organizers
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["Awaiting", statusAmounts.pending + statusAmounts.processing, awaitingCount],
            ["Refunded", statusAmounts.refunded, statusCounts.refunded],
            ["Processing", statusAmounts.processing, statusCounts.processing],
            ["Denied", statusAmounts.denied, statusCounts.denied],
          ] as const
        ).map(([label, amount, count]) => (
          <div
            key={label}
            className="rounded-xl bg-white px-3.5 py-3"
            style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-[0.12em]"
              style={{ color: "#a3a3a3" }}
            >
              {label}
            </p>
            <p
              className="mt-1 font-display text-lg font-bold tabular-nums"
              style={{
                color: label === "Denied" && count > 0 ? "#dc2626" : "#171717",
              }}
            >
              {formatGHSMoney(amount)}
            </p>
            <p className="text-xs tabular-nums" style={{ color: "#a3a3a3" }}>
              ×{count}
            </p>
          </div>
        ))}
      </div>

      {(travelerParam || organizerParam || tripParam) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>
            {travelerParam
              ? "Filtered by traveler"
              : organizerParam
                ? "Filtered by organizer"
                : "Filtered by trip"}
          </span>
          <Button
            type="link"
            size="small"
            onClick={() =>
              setParams({ travelerId: null, organizerId: null, tripId: null })
            }
          >
            Clear
          </Button>
        </div>
      )}

      <Space wrap className="mb-4">
        <Button
          type={activeTab === "awaiting" ? "primary" : "default"}
          onClick={() => setParams({ queue: "awaiting", status: null })}
        >
          Awaiting ({awaitingCount})
        </Button>
        <Button
          type={activeTab === "refunded" ? "primary" : "default"}
          onClick={() => setParams({ queue: null, status: "refunded" })}
        >
          Refunded ({statusCounts.refunded})
        </Button>
        <Button
          type={activeTab === "denied" ? "primary" : "default"}
          onClick={() => setParams({ queue: null, status: "denied" })}
        >
          Denied ({statusCounts.denied})
        </Button>
        <Button
          type={activeTab === "all" ? "primary" : "default"}
          onClick={() => setParams({ queue: null, status: null })}
        >
          All
        </Button>
        <Input.Search
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={(value) => setParams({ q: value.trim() || null })}
          placeholder="Search trip, traveler, organizer…"
          allowClear
          enterButton={<SearchOutlined />}
          style={{ minWidth: 240, maxWidth: 360 }}
        />
      </Space>

      {error && !loading && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={error}
          action={
            <Button size="small" onClick={() => void load()}>
              Retry
            </Button>
          }
        />
      )}

      <Table<AdminRefund>
        className="admin-antd-table"
        rowKey="id"
        columns={columns}
        dataSource={refunds}
        loading={loading}
        pagination={pagination}
        scroll={{ x: 980 }}
        locale={{ emptyText: "No refunds found." }}
        onRow={(row) => ({
          style: { cursor: "pointer" },
          onClick: () => router.push(`/admin-portal/refunds/${row.id}`),
        })}
      />
    </div>
  );
}

export default function AdminRefundsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading…
        </div>
      }
    >
      <RefundsInner />
    </Suspense>
  );
}
