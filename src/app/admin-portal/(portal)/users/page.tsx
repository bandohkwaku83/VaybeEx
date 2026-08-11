"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Avatar, Input, Select, Table, Tag, Button, Space } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { ApiError } from "@/lib/api/client";
import {
  getAdminUserReview,
  listAdminUsers,
  parseAdminReviewQueue,
  type AdminReviewQueue,
  type AdminUser,
} from "@/lib/api/admin";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import { formatDateShort, formatRelativeTime } from "@/lib/format";

type RoleTab = "all" | "traveler" | "organizer";

function SoftTag({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <Tag
      variant="filled"
      style={{
        background: bg,
        color,
        marginInlineEnd: 0,
        fontWeight: 500,
      }}
    >
      {label}
    </Tag>
  );
}

function statusTag(user: AdminUser) {
  if (user.role === "organizer") {
    const review = getAdminUserReview(user);
    if (review.isResubmission) {
      return <SoftTag label="Resubmitted" bg="#fff7ed" color="#c2410c" />;
    }
    const status = review.status || user.status || "unset";
    if (status === "pending" && user.onboardingCompleted) {
      return (
        <SoftTag label="Pending approval" bg="#fffbeb" color="#b45309" />
      );
    }
    if (status === "approved") {
      return <SoftTag label="Approved" bg="#f0fdf4" color="#15803d" />;
    }
    if (status === "rejected") {
      return <SoftTag label="Rejected" bg="#fef2f2" color="#b91c1c" />;
    }
    if (!user.onboardingCompleted) {
      return (
        <SoftTag label="Setup incomplete" bg="#f5f5f5" color="#525252" />
      );
    }
  }
  if (user.isVerified) {
    return <SoftTag label="Verified" bg="#eff6ff" color="#1d4ed8" />;
  }
  return <SoftTag label="Unverified" bg="#f5f5f5" color="#737373" />;
}

const QUEUE_TABS: { key: AdminReviewQueue; label: string }[] = [
  { key: "pending_approval", label: "Needs review" },
  { key: "resubmitted", label: "Resubmitted" },
  { key: "rejected", label: "Rejected" },
];

function queueDetailQuery(queue: AdminReviewQueue) {
  return `?from=${queue}`;
}

function UsersPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queue = parseAdminReviewQueue(searchParams.get("queue"));
  const isQueue = Boolean(queue);
  const roleParam = (searchParams.get("role") as RoleTab | null) || "all";
  const statusParam = searchParams.get("status") || "";
  const setupParam = searchParams.get("setup") || "";
  const qParam = searchParams.get("q") || "";

  const [q, setQ] = useState(qParam);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [resubmittedCount, setResubmittedCount] = useState(0);
  const [roleCounts, setRoleCounts] = useState({ traveler: 0, organizer: 0 });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roleTab: RoleTab =
    roleParam === "traveler" || roleParam === "organizer" ? roleParam : "all";

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "" || value === "all") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(`/admin-portal/users${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminUsers({
        page,
        limit: pageSize,
        q: qParam || undefined,
        role: isQueue ? undefined : roleTab === "all" ? undefined : roleTab,
        status: isQueue ? undefined : statusParam || undefined,
        queue: queue ?? undefined,
        onboardingCompleted:
          !isQueue && setupParam === "incomplete" ? false : undefined,
      });
      const data = res.data;
      setUsers(data?.users ?? []);
      setPendingApprovalCount(data?.pendingApprovalCount ?? 0);
      setResubmittedCount(data?.resubmittedCount ?? 0);
      setRoleCounts(data?.roleCounts ?? { traveler: 0, organizer: 0 });
      setTotal(data?.pagination.total ?? 0);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load users."
      );
    } finally {
      setLoading(false);
    }
  }, [isQueue, page, pageSize, qParam, queue, roleTab, setupParam, statusParam]);

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    setPage(1);
  }, [isQueue, queue, roleTab, setupParam, statusParam, qParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: ColumnsType<AdminUser> = useMemo(
    () => [
      {
        title: "Person",
        key: "person",
        render: (_, user) => {
          const review = getAdminUserReview(user);
          return (
          <Link
            href={`/admin-portal/users/${user.id}${queue ? queueDetailQuery(queue) : ""}`}
            className="flex items-center gap-3"
          >
            <Avatar
              shape="square"
              size={36}
              src={
                user.profilePhoto ||
                user.brandLogo ||
                DEFAULT_PROFILE_IMAGE
              }
              style={{
                background: "#f5f5f5",
                borderRadius: 10,
              }}
            />
            <span className="min-w-0">
              <span className="block truncate font-medium" style={{ color: "var(--text)" }}>
                {user.fullName || user.businessName || "—"}
              </span>
              <span className="block truncate text-xs" style={{ color: "var(--text-tertiary)" }}>
                {user.email}
                {user.phone ? ` · ${user.phone}` : ""}
              </span>
              {user.businessName && user.fullName ? (
                <span className="block truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                  {user.businessName}
                </span>
              ) : null}
              {review.isResubmission && review.previousRejectionReason ? (
                <span className="mt-1 block text-xs leading-snug" style={{ color: "#c2410c" }}>
                  Last ask: {review.previousRejectionReason}
                </span>
              ) : null}
            </span>
          </Link>
          );
        },
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        width: 120,
        render: (role: string) => (
          <span className="capitalize" style={{ color: "var(--text-secondary)" }}>
            {role}
          </span>
        ),
      },
      {
        title: "Status",
        key: "status",
        width: 160,
        render: (_, user) => statusTag(user),
      },
      {
        title: "Joined",
        key: "joined",
        width: 140,
        render: (_, user) =>
          user.createdAt ? (
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              <div>{formatRelativeTime(user.createdAt)}</div>
              <div>{formatDateShort(user.createdAt)}</div>
            </div>
          ) : (
            "—"
          ),
      },
      {
        title: "Last seen",
        key: "lastSeen",
        width: 180,
        render: (_, user) =>
          user.lastLoginAt ? (
            <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              <div>{formatRelativeTime(user.lastLoginAt)}</div>
              {user.lastLoginDevice?.label ? (
                <div className="truncate" title={user.lastLoginDevice.label}>
                  {user.lastLoginDevice.label}
                </div>
              ) : null}
            </div>
          ) : (
            "—"
          ),
      },
    ],
    [queue]
  );

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: false,
    showTotal: (t) => `${t} result${t === 1 ? "" : "s"}`,
    onChange: (next) => setPage(next),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:hidden">
        <div>
          <h1
            className="font-display text-2xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {isQueue ? "Approvals" : "People"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {queue === "resubmitted"
              ? "Rejected, then came back — check what you asked them to fix"
              : queue === "rejected"
                ? "Waiting on the organizer to update and resubmit"
                : isQueue
                  ? "First reviews and resubmits waiting on a decision"
                  : "Travelers and organizers on VaybeEx"}
          </p>
        </div>
        {!isQueue && (resubmittedCount > 0 || pendingApprovalCount > 0) && (
          <Link
            href={
              resubmittedCount > 0
                ? "/admin-portal/users?queue=resubmitted"
                : "/admin-portal/users?queue=pending_approval"
            }
            className="text-sm font-medium"
            style={{ color: "var(--coral)" }}
          >
            {resubmittedCount > 0
              ? `${resubmittedCount} resubmitted →`
              : `${pendingApprovalCount} in KYC queue →`}
          </Link>
        )}
      </div>

      {!isQueue && (resubmittedCount > 0 || pendingApprovalCount > 0) && (
        <div className="mb-5 hidden lg:block">
          <Link
            href={
              resubmittedCount > 0
                ? "/admin-portal/users?queue=resubmitted"
                : "/admin-portal/users?queue=pending_approval"
            }
            className="text-sm font-medium"
            style={{ color: "var(--coral)" }}
          >
            {resubmittedCount > 0
              ? `${resubmittedCount} resubmitted →`
              : `${pendingApprovalCount} in KYC queue →`}
          </Link>
        </div>
      )}

      {isQueue && (
        <div className="mb-4 flex flex-wrap gap-2">
          {QUEUE_TABS.map((tab) => {
            const active = queue === tab.key;
            const count =
              tab.key === "pending_approval"
                ? pendingApprovalCount
                : tab.key === "resubmitted"
                  ? resubmittedCount
                  : undefined;
            return (
              <Link
                key={tab.key}
                href={`/admin-portal/users?queue=${tab.key}`}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium"
                style={{
                  background: active ? "#171717" : "#fff",
                  color: active ? "#fff" : "#404040",
                  boxShadow: active ? "none" : "inset 0 0 0 1px #e5e5e5",
                }}
              >
                {tab.label}
                {count != null ? (
                  <span className="tabular-nums opacity-80">{count}</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}

      <Space wrap className="mb-4 w-full" size="middle">
        {!isQueue && (
          <Select
            value={roleTab}
            onChange={(value) =>
              setParams({ role: value === "all" ? null : value })
            }
            style={{ minWidth: 160 }}
            options={[
              {
                value: "all",
                label: `All (${roleCounts.traveler + roleCounts.organizer})`,
              },
              {
                value: "traveler",
                label: `Travelers (${roleCounts.traveler})`,
              },
              {
                value: "organizer",
                label: `Organizers (${roleCounts.organizer})`,
              },
            ]}
          />
        )}
        {!isQueue && roleTab === "organizer" && (
          <Select
            value={statusParam || undefined}
            allowClear
            placeholder="All statuses"
            onChange={(value) => setParams({ status: value || null })}
            style={{ minWidth: 160 }}
            options={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        )}
        <Input.Search
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={(value) => setParams({ q: value.trim() || null })}
          placeholder="Search name, email, phone, business…"
          allowClear
          enterButton={<SearchOutlined />}
          style={{ minWidth: 240, flex: 1, maxWidth: 420 }}
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

      <Table<AdminUser>
        className="admin-antd-table"
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={pagination}
        scroll={{ x: 900 }}
        locale={{
          emptyText:
            queue === "resubmitted"
              ? "No resubmitted applications."
              : queue === "rejected"
                ? "No rejected organizers."
                : isQueue
                  ? "No organizers waiting for approval."
                  : "No users match your filters.",
        }}
        onRow={(user) => ({
          style: { cursor: "pointer" },
          onClick: () => {
            router.push(
              `/admin-portal/users/${user.id}${queue ? queueDetailQuery(queue) : ""}`
            );
          },
        })}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading…
        </div>
      }
    >
      <UsersPageInner />
    </Suspense>
  );
}
