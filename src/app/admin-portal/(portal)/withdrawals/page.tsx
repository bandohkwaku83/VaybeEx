"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  Drawer,
  Input,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  canConfirmAdminWithdrawal,
  canProcessAdminWithdrawal,
  canRejectAdminWithdrawal,
  confirmAdminWithdrawal,
  getAdminWithdrawal,
  listAdminWithdrawals,
  processAdminWithdrawal,
  rejectAdminWithdrawal,
  type AdminWithdrawal,
} from "@/lib/api/admin";
import { formatDateShort, formatGHS, formatRelativeTime } from "@/lib/format";

const STATUS_COPY: Record<string, string> = {
  pending: "Pending review",
  processing: "Processing",
  success: "Paid",
  failed: "Rejected",
};

function withdrawalStatusTag(status: string) {
  const label = STATUS_COPY[status] || status;
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#fffbeb", color: "#b45309" },
    processing: { bg: "#eff6ff", color: "#1d4ed8" },
    success: { bg: "#f0fdf4", color: "#15803d" },
    failed: { bg: "#fef2f2", color: "#b91c1c" },
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
      {label}
    </Tag>
  );
}

function organizerName(w: AdminWithdrawal) {
  return (
    w.organizer?.businessName ||
    w.organizer?.fullName ||
    "—"
  );
}

function WithdrawalsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queueParam = searchParams.get("queue") || "";
  const statusParam = searchParams.get("status") || "";
  const organizerParam = searchParams.get("organizerId") || "";

  const defaultAwaiting = !queueParam && !statusParam && !organizerParam;
  const effectiveQueue =
    queueParam === "all"
      ? ""
      : queueParam || (defaultAwaiting ? "awaiting" : "");

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
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<AdminWithdrawal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

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
        queue: effectiveQueue || undefined,
        status: effectiveQueue ? undefined : statusParam || undefined,
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
  }, [effectiveQueue, organizerParam, page, pageSize, statusParam]);

  useEffect(() => {
    setPage(1);
  }, [effectiveQueue, organizerParam, statusParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDrawer = async (row: AdminWithdrawal) => {
    setSelected(row);
    setAdminNote(row.adminNote || "");
    setRejectReason("");
    setRejecting(false);
    setDrawerOpen(true);
    try {
      const res = await getAdminWithdrawal(row.id);
      if (res.data?.withdrawal) {
        setSelected(res.data.withdrawal);
        setAdminNote(res.data.withdrawal.adminNote || "");
      }
    } catch {
      // List row already has destination + organizer.
    }
  };

  const refreshSelected = (next: AdminWithdrawal) => {
    setSelected(next);
    setAdminNote(next.adminNote || "");
    setWithdrawals((rows) =>
      rows.map((row) => (row.id === next.id ? next : row))
    );
  };

  const onProcess = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await processAdminWithdrawal(selected.id, {
        adminNote: adminNote.trim() || undefined,
      });
      const next = res.data?.withdrawal;
      toast.success(res.message || "Marked as processing");
      if (next) refreshSelected(next);
      await load();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not start processing."
      );
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await confirmAdminWithdrawal(selected.id, {
        adminNote: adminNote.trim() || undefined,
      });
      const next = res.data?.withdrawal;
      toast.success(res.message || "Marked as paid");
      if (next) refreshSelected(next);
      setRejecting(false);
      await load();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not confirm payout."
      );
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    if (!selected) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("A reason is required to reject.");
      setRejecting(true);
      return;
    }
    setBusy(true);
    try {
      const res = await rejectAdminWithdrawal(selected.id, {
        reason,
        adminNote: adminNote.trim() || undefined,
      });
      const next = res.data?.withdrawal;
      toast.success(res.message || "Withdrawal rejected");
      if (next) refreshSelected(next);
      setRejecting(false);
      setRejectReason("");
      await load();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not reject withdrawal."
      );
    } finally {
      setBusy(false);
    }
  };

  const copyMomo = async (value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("MoMo number copied");
    } catch {
      toast.error("Could not copy number");
    }
  };

  const awaitingCount = statusCounts.pending + statusCounts.processing;
  const activeTab =
    queueParam === "all"
      ? "all"
      : effectiveQueue || statusParam || "all";
  const canProcess = selected
    ? canProcessAdminWithdrawal(selected.status)
    : false;
  const canConfirm = selected
    ? canConfirmAdminWithdrawal(selected.status)
    : false;
  const canReject = selected
    ? canRejectAdminWithdrawal(selected.status)
    : false;

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
        const name = organizerName(w);
        return (
          <div>
            {organizerHref ? (
              <Link
                href={organizerHref}
                className="font-medium hover:underline"
                style={{ color: "var(--text)" }}
                onClick={(e) => e.stopPropagation()}
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
              <div
                className="mt-1 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {w.note}
              </div>
            ) : null}
            {w.status === "failed" && w.failureReason ? (
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
            <span
              className="ml-1 text-xs font-normal"
              style={{ color: "var(--text-tertiary)" }}
            >
              {w.currency}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      title: "Destination",
      key: "destination",
      width: 200,
      render: (_, w) => (
        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {w.destinationLabel ? <div>{w.destinationLabel}</div> : null}
          {w.momoNumber ? (
            <div className="font-medium tabular-nums" style={{ color: "var(--text)" }}>
              {w.momoNumber}
            </div>
          ) : null}
          {w.accountName ? <div>{w.accountName}</div> : null}
          {!w.destinationLabel && !w.momoNumber ? "—" : null}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, w) => withdrawalStatusTag(w.status),
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
              {w.status === "success" ? "Paid" : "Updated"}{" "}
              {formatRelativeTime(w.processedAt)}
            </div>
          ) : null}
        </div>
      ),
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
          Review organizer requests, send MoMo outside the app, then mark paid
          or reject
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            [
              "Needs action",
              statusAmounts.pending,
              statusCounts.pending,
              "pending",
            ],
            [
              "Processing",
              statusAmounts.processing,
              statusCounts.processing,
              "processing",
            ],
            ["Paid", statusAmounts.success, statusCounts.success, "success"],
            ["Rejected", statusAmounts.failed, statusCounts.failed, "failed"],
          ] as const
        ).map(([label, amount, count, status]) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              setParams({
                queue: null,
                status,
              })
            }
            className="rounded-xl bg-white px-3.5 py-3 text-left"
            style={{
              boxShadow:
                statusParam === status
                  ? "inset 0 0 0 1.5px #171717"
                  : "inset 0 0 0 1px #e5e5e5",
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
                color: label === "Rejected" && count > 0 ? "#dc2626" : "#171717",
              }}
            >
              {formatGHS(amount)}
            </p>
            <p className="text-xs tabular-nums" style={{ color: "#a3a3a3" }}>
              ×{count}
            </p>
          </button>
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
        <Button
          type={activeTab === "awaiting" ? "primary" : "default"}
          onClick={() => setParams({ queue: "awaiting", status: null })}
        >
          Awaiting ({awaitingCount})
        </Button>
        <Button
          type={activeTab === "paid" || activeTab === "success" ? "primary" : "default"}
          onClick={() => setParams({ queue: "paid", status: null })}
        >
          Paid ({statusCounts.success})
        </Button>
        <Button
          type={activeTab === "rejected" || activeTab === "failed" ? "primary" : "default"}
          onClick={() => setParams({ queue: "rejected", status: null })}
        >
          Rejected ({statusCounts.failed})
        </Button>
        <Button
          type={activeTab === "all" ? "primary" : "default"}
          onClick={() => setParams({ queue: "all", status: null })}
        >
          All
        </Button>
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
        onRow={(row) => ({
          style: { cursor: "pointer" },
          onClick: () => void openDrawer(row),
        })}
      />

      <Drawer
        title="Withdrawal"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="large"
        destroyOnHidden
      >
        {selected ? (
          <div className="space-y-5">
            <div>
              <p
                className="text-[11px] font-medium uppercase tracking-[0.12em]"
                style={{ color: "#a3a3a3" }}
              >
                Amount
              </p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums">
                {formatGHS(selected.amount)}
              </p>
              <div className="mt-2">{withdrawalStatusTag(selected.status)}</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: "#a3a3a3" }}
                >
                  Organizer
                </p>
                <p className="mt-1 font-medium">{organizerName(selected)}</p>
                {selected.organizer?.fullName &&
                selected.organizer.businessName ? (
                  <p className="text-sm" style={{ color: "#737373" }}>
                    {selected.organizer.fullName}
                  </p>
                ) : null}
                {selected.organizer?.email ? (
                  <p className="text-sm" style={{ color: "#737373" }}>
                    {selected.organizer.email}
                  </p>
                ) : null}
                {selected.organizer?.phone ? (
                  <p className="text-sm" style={{ color: "#737373" }}>
                    {selected.organizer.phone}
                  </p>
                ) : null}
                {(selected.organizer?.id || selected.organizerId) && (
                  <Link
                    href={`/admin-portal/users/${selected.organizer?.id || selected.organizerId}`}
                    className="mt-1 inline-block text-sm hover:underline"
                  >
                    Open profile
                  </Link>
                )}
              </div>
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: "#a3a3a3" }}
                >
                  Trip
                </p>
                <p className="mt-1 font-medium">
                  {selected.trip?.title || "Trip"}
                </p>
                {selected.trip?.destination ? (
                  <p className="text-sm" style={{ color: "#737373" }}>
                    {selected.trip.destination}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
            >
              <p
                className="text-[11px] font-medium uppercase tracking-[0.12em]"
                style={{ color: "#a3a3a3" }}
              >
                Send MoMo here
              </p>
              <p className="mt-2 text-sm font-medium">
                {selected.destinationLabel ||
                  `${selected.momoProvider || "MoMo"} ${selected.momoNumber || ""}`.trim()}
              </p>
              {selected.momoNumber ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-lg tabular-nums">
                    {selected.momoNumber}
                  </span>
                  <Button
                    size="small"
                    onClick={() => void copyMomo(selected.momoNumber)}
                  >
                    Copy number
                  </Button>
                </div>
              ) : null}
              {selected.accountName ? (
                <p className="mt-1 text-sm" style={{ color: "#737373" }}>
                  {selected.accountName}
                </p>
              ) : null}
              <p className="mt-3 text-xs" style={{ color: "#737373" }}>
                Pay this wallet outside the app, then mark as paid here.
              </p>
            </div>

            {selected.note ? (
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: "#a3a3a3" }}
                >
                  Organizer note
                </p>
                <p className="mt-1 text-sm">{selected.note}</p>
              </div>
            ) : null}

            {selected.failureReason ? (
              <Alert type="error" showIcon message={selected.failureReason} />
            ) : null}

            {selected.processedBy?.fullName || selected.processedBy?.email ? (
              <p className="text-xs" style={{ color: "#737373" }}>
                Last handled by{" "}
                {selected.processedBy.fullName || selected.processedBy.email}
              </p>
            ) : null}

            {(canProcess || canConfirm || canReject) && (
              <>
                <div>
                  <p
                    className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em]"
                    style={{ color: "#a3a3a3" }}
                  >
                    Admin note
                  </p>
                  <Input.TextArea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Optional — e.g. Sending MTN MoMo now"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {rejecting ? (
                  <div>
                    <p
                      className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em]"
                      style={{ color: "#a3a3a3" }}
                    >
                      Rejection reason
                    </p>
                    <Input.TextArea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Required — shown to the organizer"
                      rows={3}
                      maxLength={500}
                      status={rejectReason.trim() ? undefined : "error"}
                    />
                  </div>
                ) : null}

                <Space wrap>
                  {canProcess ? (
                    <Button
                      loading={busy}
                      disabled={busy}
                      onClick={() => void onProcess()}
                    >
                      Start processing
                    </Button>
                  ) : null}
                  {canConfirm ? (
                    <Button
                      type="primary"
                      loading={busy}
                      disabled={busy}
                      onClick={() => void onConfirm()}
                    >
                      Mark as paid
                    </Button>
                  ) : null}
                  {canReject ? (
                    rejecting ? (
                      <>
                        <Button
                          danger
                          type="primary"
                          loading={busy}
                          disabled={busy || !rejectReason.trim()}
                          onClick={() => void onReject()}
                        >
                          Confirm reject
                        </Button>
                        <Button
                          disabled={busy}
                          onClick={() => {
                            setRejecting(false);
                            setRejectReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        danger
                        disabled={busy}
                        onClick={() => setRejecting(true)}
                      >
                        Reject
                      </Button>
                    )
                  ) : null}
                </Space>
              </>
            )}
          </div>
        ) : null}
      </Drawer>
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
