"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { ApiError } from "@/lib/api/client";
import {
  activityLabel,
  getAdminActivity,
  type AdminActivityItem,
} from "@/lib/api/admin";
import {
  activityEventAt,
  DeviceTypeCell,
} from "@/components/admin/login-device";
import { formatDateShort, formatRelativeTime } from "@/lib/format";

type RoleTab = "" | "organizer" | "traveler";

function categoryTone(category: string) {
  switch (category) {
    case "kyc":
      return { bg: "#fffbeb", color: "#b45309" };
    case "refund":
      return { bg: "#fef2f2", color: "#b91c1c" };
    case "booking":
      return { bg: "#eff6ff", color: "#1d4ed8" };
    case "payout":
      return { bg: "#f5f3ff", color: "#6d28d9" };
    case "trip":
      return { bg: "#f0fdf4", color: "#15803d" };
    case "auth":
      return { bg: "#f5f5f5", color: "#525252" };
    case "message":
      return { bg: "#ecfeff", color: "#0e7490" };
    default:
      return { bg: "#f5f5f5", color: "#404040" };
  }
}

function ActivityInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = (searchParams.get("role") || "") as RoleTab;
  const categoryParam = searchParams.get("category") || "";
  const actionParam = searchParams.get("action") || "";
  const userIdParam = searchParams.get("userId") || "";
  const tripIdParam = searchParams.get("tripId") || "";
  const fromParam = searchParams.get("from") || "";
  const toParam = searchParams.get("to") || "";
  const qParam = searchParams.get("q") || "";

  const [q, setQ] = useState(qParam);
  const [items, setItems] = useState<AdminActivityItem[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(`/admin-portal/activity${qs ? `?${qs}` : ""}`);
    },
    [router, searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminActivity({
        page,
        limit: pageSize,
        role: roleParam || undefined,
        category: categoryParam || undefined,
        action: actionParam || undefined,
        userId: userIdParam || undefined,
        tripId: tripIdParam || undefined,
        from: fromParam || undefined,
        to: toParam || undefined,
        q: qParam || undefined,
      });
      const data = res.data;
      setItems(data?.activity ?? []);
      setActions(data?.filters.actions ?? []);
      setCategories(data?.filters.categories ?? []);
      setCategoryCounts(data?.categoryCounts ?? {});
      setTotal(data?.pagination.total ?? 0);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load activity."
      );
    } finally {
      setLoading(false);
    }
  }, [
    actionParam,
    categoryParam,
    fromParam,
    page,
    pageSize,
    qParam,
    roleParam,
    toParam,
    tripIdParam,
    userIdParam,
  ]);

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    setPage(1);
  }, [
    roleParam,
    categoryParam,
    actionParam,
    userIdParam,
    tripIdParam,
    fromParam,
    toParam,
    qParam,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const roleTabs: { value: RoleTab; label: string }[] = [
    { value: "", label: "All" },
    { value: "organizer", label: "Organizers" },
    { value: "traveler", label: "Travelers" },
  ];

  const chipCategories = useMemo(() => {
    const keys = Object.keys(categoryCounts);
    const fromFilters = categories.filter((c) => !keys.includes(c));
    return [...keys, ...fromFilters];
  }, [categories, categoryCounts]);

  const columns: ColumnsType<AdminActivityItem> = [
    {
      title: "Event",
      key: "event",
      render: (_, row) => {
        const tone = categoryTone(row.category);
        return (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium" style={{ color: "var(--text)" }}>
                {row.summary || activityLabel(row.action)}
              </span>
              <Tag
                variant="filled"
                style={{
                  background: tone.bg,
                  color: tone.color,
                  marginInlineEnd: 0,
                  fontWeight: 500,
                }}
              >
                {activityLabel(row.action)}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Time",
      key: "time",
      width: 150,
      render: (_, row) => {
        const at = activityEventAt(row);
        if (!at) return "—";
        return (
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            <div>{formatRelativeTime(at)}</div>
            <div>{formatDateShort(at)}</div>
          </div>
        );
      },
    },
    {
      title: "Device",
      key: "device",
      width: 180,
      render: (_, row) =>
        row.device?.label ? (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {row.device.label}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Type",
      key: "type",
      width: 110,
      render: (_, row) => <DeviceTypeCell device={row.device} />,
    },
    {
      title: "IP",
      key: "ip",
      width: 130,
      render: (_, row) =>
        row.ip ? (
          <span className="font-mono text-xs" style={{ color: "var(--text-tertiary)" }}>
            {row.ip}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Actor",
      key: "actor",
      width: 180,
      render: (_, row) => {
        const actor = row.actor;
        if (!actor?.id && !actor?.email) return "—";
        const name = actor.fullName || actor.email || "User";
        return actor.id ? (
          <Link
            href={`/admin-portal/users/${actor.id}`}
            className="hover:underline"
            style={{ color: "var(--text)" }}
          >
            <span className="block font-medium">{name}</span>
            <span className="block text-xs capitalize" style={{ color: "var(--text-tertiary)" }}>
              {actor.role || "user"}
            </span>
          </Link>
        ) : (
          <span>{name}</span>
        );
      },
    },
    {
      title: "Related",
      key: "related",
      width: 240,
      render: (_, row) => (
        <div className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          {row.trip?.title ? (
            <div>
              <Link
                href={`/admin-portal/trips?q=${encodeURIComponent(row.trip.title)}`}
                className="hover:underline"
                style={{ color: "var(--text)" }}
              >
                {row.trip.title}
              </Link>
              {row.trip.destination ? ` · ${row.trip.destination}` : ""}
            </div>
          ) : null}
          {row.relatedUser?.id ? (
            <Link
              href={`/admin-portal/users/${row.relatedUser.id}`}
              className="block hover:underline"
            >
              {row.relatedUser.businessName ||
                row.relatedUser.fullName ||
                row.relatedUser.email}
            </Link>
          ) : null}
          {row.cancellationId ? (
            <Link
              href={`/admin-portal/refunds/${row.cancellationId}`}
              className="block font-medium hover:underline"
              style={{ color: "var(--coral)" }}
            >
              View refund
            </Link>
          ) : null}
          {row.withdrawalId ? (
            <Link
              href={`/admin-portal/withdrawals`}
              className="block hover:underline"
            >
              Withdrawal
            </Link>
          ) : null}
          {!row.trip && !row.relatedUser && !row.cancellationId && !row.withdrawalId
            ? "—"
            : null}
        </div>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: false,
    showTotal: (t) => `${t} event${t === 1 ? "" : "s"}`,
    onChange: (next) => setPage(next),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 lg:hidden">
        <h1
          className="font-display text-2xl font-bold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Activity
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Sign-ins, KYC, trips, bookings, refunds, and payouts
        </p>
      </div>

      {(userIdParam || tripIdParam) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          {userIdParam ? (
            <span style={{ color: "var(--text-secondary)" }}>
              Filtered by user
            </span>
          ) : null}
          {tripIdParam ? (
            <span style={{ color: "var(--text-secondary)" }}>
              Filtered by trip
            </span>
          ) : null}
          <Button
            type="link"
            size="small"
            onClick={() => setParams({ userId: null, tripId: null })}
          >
            Clear
          </Button>
        </div>
      )}

      <Space wrap className="mb-4" size="small">
        {roleTabs.map((tab) => (
          <Button
            key={tab.value || "all"}
            type={roleParam === tab.value ? "primary" : "default"}
            onClick={() => setParams({ role: tab.value || null })}
          >
            {tab.label}
          </Button>
        ))}
      </Space>

      {chipCategories.length > 0 && (
        <Space wrap className="mb-4" size="small">
          <Button
            type={!categoryParam ? "primary" : "default"}
            onClick={() => setParams({ category: null })}
          >
            All categories
          </Button>
          {chipCategories.map((cat) => (
            <Button
              key={cat}
              type={categoryParam === cat ? "primary" : "default"}
              onClick={() =>
                setParams({ category: categoryParam === cat ? null : cat })
              }
            >
              <span className="capitalize">{cat}</span>
              {categoryCounts[cat] != null ? (
                <span className="ml-1 tabular-nums opacity-70">
                  {categoryCounts[cat]}
                </span>
              ) : null}
            </Button>
          ))}
        </Space>
      )}

      <Space wrap className="mb-4 w-full" size="middle">
        <Select
          allowClear
          placeholder="All actions"
          value={actionParam || undefined}
          onChange={(value) => setParams({ action: value || null })}
          style={{ minWidth: 200 }}
          options={actions.map((action) => ({
            value: action,
            label: activityLabel(action),
          }))}
        />
        <Input
          type="date"
          value={fromParam}
          onChange={(e) => setParams({ from: e.target.value || null })}
          style={{ width: 160 }}
          aria-label="From date"
        />
        <Input
          type="date"
          value={toParam}
          onChange={(e) => setParams({ to: e.target.value || null })}
          style={{ width: 160 }}
          aria-label="To date"
        />
        <Input.Search
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={(value) => setParams({ q: value.trim() || null })}
          placeholder="Search activity…"
          allowClear
          enterButton={<SearchOutlined />}
          style={{ minWidth: 220, flex: 1, maxWidth: 360 }}
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

      <Table<AdminActivityItem>
        className="admin-antd-table"
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={pagination}
        scroll={{ x: 1180 }}
        locale={{ emptyText: "No activity matches these filters." }}
      />
    </div>
  );
}

export default function AdminActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading…
        </div>
      }
    >
      <ActivityInner />
    </Suspense>
  );
}
