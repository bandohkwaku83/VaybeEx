"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Alert, Button, Input, Space, Tag } from "antd";
import { ExportOutlined, SearchOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/ui/data-table";
import { ApiError } from "@/lib/api/client";
import { listAdminTrips, type AdminTrip } from "@/lib/api/admin";
import { formatDateRange, formatGHS } from "@/lib/format";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

function tripStatusTag(status: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    live: { bg: "#f0fdf4", color: "#15803d" },
    scheduled: { bg: "#fffbeb", color: "#b45309" },
    completed: { bg: "#eff6ff", color: "#1d4ed8" },
    cancelled: { bg: "#fef2f2", color: "#b91c1c" },
    draft: { bg: "#f5f5f5", color: "#525252" },
  };
  const tone = styles[status] ?? { bg: "#f5f5f5", color: "#525252" };
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize"
      style={{ background: tone.bg, color: tone.color }}
    >
      {status}
    </span>
  );
}

function TripsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "";
  const qParam = searchParams.get("q") || "";
  const organizerParam = searchParams.get("organizerId") || "";

  const [q, setQ] = useState(qParam);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
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
    router.replace(`/admin-portal/trips${qs ? `?${qs}` : ""}`);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminTrips({
        page,
        limit: pageSize,
        status: statusParam || undefined,
        q: qParam || undefined,
        organizerId: organizerParam || undefined,
      });
      setTrips(res.data?.trips ?? []);
      setTotal(res.data?.pagination.total ?? 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load trips.");
    } finally {
      setLoading(false);
    }
  }, [organizerParam, page, pageSize, qParam, statusParam]);

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    setPage(1);
  }, [statusParam, qParam, organizerParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: ColumnDef<AdminTrip, unknown>[] = useMemo(
    () => [
      {
        header: "Trip",
        id: "trip",
        cell: ({ row }) => {
          const trip = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg"
                style={{ background: "var(--bg-secondary)" }}
              >
                {trip.coverImage ? (
                  <Image
                    src={trip.coverImage}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <div
                  className="truncate font-medium"
                  style={{ color: "var(--text)" }}
                >
                  {trip.title}
                </div>
                <div
                  className="truncate text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {trip.destination}
                  {trip.pricePerPerson != null
                    ? ` · ${formatGHS(trip.pricePerPerson)}/pp`
                    : ""}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Organizer",
        id: "organizer",
        size: 200,
        cell: ({ row }) => {
          const trip = row.original;
          return trip.organizer?.id ? (
            <Link
              href={`/admin-portal/users/${trip.organizer.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block hover:underline"
            >
              <div style={{ color: "var(--text)" }}>
                {trip.organizer.businessName ||
                  trip.organizer.fullName ||
                  "—"}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                {trip.organizer.email}
              </div>
            </Link>
          ) : (
            <div style={{ color: "var(--text-tertiary)" }}>
              {trip.organizer?.businessName ||
                trip.organizer?.fullName ||
                "No organizer"}
            </div>
          );
        },
      },
      {
        header: "Dates",
        id: "dates",
        size: 160,
        cell: ({ row }) => {
          const trip = row.original;
          return (
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {trip.startDate && trip.endDate
                ? formatDateRange(trip.startDate, trip.endDate)
                : "—"}
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        size: 120,
        cell: ({ getValue }) => tripStatusTag(getValue() as string),
      },
      {
        header: "Bookings",
        accessorKey: "bookingsCount",
        size: 100,
        cell: ({ getValue }) => (
          <span className="tabular-nums">{(getValue() as number) ?? 0}</span>
        ),
      },
      {
        header: "Revenue",
        accessorKey: "revenue",
        size: 120,
        cell: ({ getValue }) => (
          <span className="tabular-nums font-medium">
            {formatGHS((getValue() as number) ?? 0)}
          </span>
        ),
      },
      {
        header: "",
        id: "actions",
        size: 80,
        cell: ({ row }) => (
          <Link
            href={`/trips/${row.original.id}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-sm"
            style={{ color: "var(--primary)" }}
          >
            <ExportOutlined />
            View
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 lg:hidden">
        <h1
          className="font-display text-2xl font-bold tracking-tight"
          style={{ color: "var(--text)" }}
        >
          Trips
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          All platform listings
        </p>
      </div>

      <Space wrap className="mb-4 w-full" size="middle">
        {STATUS_FILTERS.map((item) => (
          <Button
            key={item.value || "all"}
            type={statusParam === item.value ? "primary" : "default"}
            onClick={() => setParams({ status: item.value || null })}
          >
            {item.label}
          </Button>
        ))}
        <Input.Search
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={(value) => setParams({ q: value.trim() || null })}
          placeholder="Search title, destination…"
          allowClear
          enterButton={<SearchOutlined />}
          style={{ minWidth: 240, maxWidth: 360 }}
        />
      </Space>

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

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border, rgba(0,0,0,0.08))" }}>
        <DataTable
          data={trips}
          columns={columns}
          loading={loading}
          emptyText="No trips found."
          scrollX={900}
          enableSorting={false}
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: (t) => `${t} trip${t === 1 ? "" : "s"}`,
            onChange: (next) => setPage(next),
          }}
        />
      </div>
    </div>
  );
}

export default function AdminTripsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading…
        </div>
      }
    >
      <TripsInner />
    </Suspense>
  );
}
