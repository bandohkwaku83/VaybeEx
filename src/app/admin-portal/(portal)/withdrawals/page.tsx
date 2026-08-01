"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  listAdminWithdrawals,
  retryAdminWithdrawal,
  syncAdminWithdrawal,
  type AdminWithdrawal,
} from "@/lib/api/admin";
import { formatDateShort, formatGHS, formatRelativeTime } from "@/lib/format";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
] as const;

function withdrawalStatusTag(status: string, label?: string) {
  switch (status) {
    case "success":
      return <Tag color="success">{label || status}</Tag>;
    case "processing":
    case "pending":
      return <Tag color="default">{label || status}</Tag>;
    case "failed":
      return <Tag color="error">{label || status}</Tag>;
    default:
      return <Tag>{label || status}</Tag>;
  }
}

function WithdrawalsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "";
  const organizerParam = searchParams.get("organizerId") || "";

  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    processing: 0,
    success: 0,
    failed: 0,
  });
  const [statusAmounts, setStatusAmounts] = useState({
    pending: 0,
    processing: 0,
    success: 0,
    failed: 0,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.replace(`/admin-portal/withdrawals${qs ? `?${qs}` : ""}`);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminWithdrawals({
        page,
        limit: pageSize,
        status: statusParam || undefined,
        organizerId: organizerParam || undefined,
      });
      setWithdrawals(res.data?.withdrawals ?? []);
      setStatusCounts(
        res.data?.statusCounts ?? {
          pending: 0,
          processing: 0,
          success: 0,
          failed: 0,
        }
      );
      setStatusAmounts(
        res.data?.statusAmounts ?? {
          pending: 0,
          processing: 0,
          success: 0,
          failed: 0,
        }
      );
      setTotal(res.data?.pagination.total ?? 0);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load withdrawals."
      );
    } finally {
      setLoading(false);
    }
  }, [organizerParam, page, pageSize, statusParam]);

  useEffect(() => {
    setPage(1);
  }, [statusParam, organizerParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRetry = async (id: string) => {
    setBusyId(id);
    try {
      const res = await retryAdminWithdrawal(id);
      toast.success(res.message || "Retry initiated");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Retry failed.");
    } finally {
      setBusyId(null);
    }
  };

  const onSync = async (id: string) => {
    setBusyId(id);
    try {
      const res = await syncAdminWithdrawal(id);
      toast.success(res.message || "Synced from Paystack");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sync failed.");
    } finally {
      setBusyId(null);
    }
  };

  const columns: ColumnsType<AdminWithdrawal> = [
      {
        title: "Organizer / Trip",
        key: "party",
        render: (_, w) => {
          const organizerHref = w.organizer?.id
            ? `/admin-portal/users/${w.organizer.id}`
            : w.organizerId
              ? `/admin-portal/users/${w.organizerId}`
              : null;
          const name =
            w.organizer?.businessName || w.organizer?.fullName || "—";
          return (
            <div>
              {organizerHref ? (
                <Link
                  href={organizerHref}
                  className="font-medium hover:underline"
                  style={{ color: "var(--text)" }}
                >
                  {name}
                </Link>
              ) : (
                <div className="font-medium" style={{ color: "var(--text)" }}>
                  {name}
                </div>
              )}
              <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {w.trip?.title || "Trip"}
                {w.trip?.destination ? ` · ${w.trip.destination}` : ""}
              </div>
              {w.note ? (
                <div className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {w.note}
                </div>
              ) : null}
              {w.failureReason ? (
                <div className="mt-1 text-xs" style={{ color: "var(--coral)" }}>
                  {w.failureReason}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: 120,
        render: (amount: number, w) => (
          <span className="font-medium tabular-nums">
            {formatGHS(amount)}
            {w.currency && w.currency !== "GHS" ? (
              <span className="ml-1 text-xs font-normal" style={{ color: "var(--text-tertiary)" }}>
                {w.currency}
              </span>
            ) : null}
          </span>
        ),
      },
      {
        title: "Destination",
        key: "destination",
        width: 160,
        render: (_, w) => {
          const method = w.momoProvider || w.payoutMethod;
          return (
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {method ? (
                <div className="capitalize">{method.replace(/_/g, " ")}</div>
              ) : null}
              {w.momoNumber || w.destinationLabel ? (
                <div>{w.momoNumber || w.destinationLabel}</div>
              ) : null}
              {w.accountName ? <div>{w.accountName}</div> : null}
              {!method && !w.momoNumber && !w.destinationLabel ? "—" : null}
            </div>
          );
        },
      },
      {
        title: "Status",
        key: "status",
        width: 120,
        render: (_, w) => withdrawalStatusTag(w.status, w.label),
      },
      {
        title: "When",
        key: "when",
        width: 140,
        render: (_, w) => (
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {w.createdAt ? (
              <>
                <div>{formatRelativeTime(w.createdAt)}</div>
                <div>{formatDateShort(w.createdAt)}</div>
              </>
            ) : (
              "—"
            )}
            {w.processedAt ? (
              <div className="mt-0.5">
                Processed {formatRelativeTime(w.processedAt)}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 180,
        render: (_, w) => {
          const busy = busyId === w.id;
          return (
            <Space size="small" wrap>
              <Button
                size="small"
                icon={<SyncOutlined spin={busy} />}
                disabled={busy}
                onClick={() => void onSync(w.id)}
              >
                Sync
              </Button>
              {w.status === "failed" && (
                <Button
                  size="small"
                  type="primary"
                  icon={<ReloadOutlined />}
                  disabled={busy}
                  onClick={() => void onRetry(w.id)}
                >
                  Retry
                </Button>
              )}
            </Space>
          );
        },
      },
    ];

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: false,
    showTotal: (t) => `${t} withdrawal${t === 1 ? "" : "s"}`,
    onChange: (next) => setPage(next),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 lg:hidden">
        <h1
          className="font-display text-2xl font-bold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Payouts
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Retry failed transfers or sync status from Paystack
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["Paid out", statusAmounts.success, statusCounts.success],
            ["Pending", statusAmounts.pending, statusCounts.pending],
            ["Processing", statusAmounts.processing, statusCounts.processing],
            ["Failed", statusAmounts.failed, statusCounts.failed],
          ] as const
        ).map(([label, amount, count]) => (
          <div
            key={label}
            className="rounded-xl bg-white px-3.5 py-3"
            style={{
              boxShadow: "inset 0 0 0 1px #e5e5e5",
            }}
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
                color: label === "Failed" && count > 0 ? "#dc2626" : "#171717",
              }}
            >
              {formatGHS(amount)}
            </p>
            <p className="text-xs tabular-nums" style={{ color: "#a3a3a3" }}>
              ×{count}
            </p>
          </div>
        ))}
      </div>

      {organizerParam && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>
            Filtered by organizer
          </span>
          <Button
            type="link"
            size="small"
            onClick={() => setParams({ organizerId: null })}
          >
            Clear
          </Button>
        </div>
      )}

      <Space wrap className="mb-4">
        {STATUS_FILTERS.map((item) => {
          const count =
            item.value && item.value in statusCounts
              ? statusCounts[item.value as keyof typeof statusCounts]
              : null;
          return (
            <Button
              key={item.value || "all"}
              type={statusParam === item.value ? "primary" : "default"}
              onClick={() => setParams({ status: item.value || null })}
            >
              {item.label}
              {count != null ? ` (${count})` : ""}
            </Button>
          );
        })}
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

      <Table<AdminWithdrawal>
        className="admin-antd-table"
        rowKey="id"
        columns={columns}
        dataSource={withdrawals}
        loading={loading}
        pagination={pagination}
        scroll={{ x: 960 }}
        locale={{ emptyText: "No withdrawals found." }}
      />
    </div>
  );
}

export default function AdminWithdrawalsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading…
        </div>
      }
    >
      <WithdrawalsInner />
    </Suspense>
  );
}
