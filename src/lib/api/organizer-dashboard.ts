import { apiRequest } from "./client";
import { getOrganizerToken } from "./auth-token";
import { resolveMediaUrl } from "./media";
import {
  extractOrganizerKyc,
  type OrganizerKyc,
} from "@/lib/organizer-kyc";

function bearerHeaders(): HeadersInit {
  const token = getOrganizerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return value == null ? fallback : String(value);
}

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export type DashboardStatMetric = {
  value: number;
  growthPercent: number | null;
  totalListings?: number;
};

export type DashboardStats = {
  revenue: DashboardStatMetric;
  activeTrips: DashboardStatMetric & { totalListings: number };
  travelers: DashboardStatMetric;
  views: DashboardStatMetric;
  avgRating: { value: number | null };
};

export type DashboardTripItem = {
  id: string;
  title: string;
  destination?: string;
  coverImage: string | null;
  status: string;
  booked: number;
  capacity: number | null;
  fillRate: number;
  startDate?: string;
  endDate?: string;
  revenue?: number;
};

export type RevenuePulseMonth = {
  month: string;
  label: string;
  revenue: number;
};

export type DashboardWithdrawal = {
  id: string;
  tripTitle: string;
  amount: number;
  status: string;
  label: string;
  momoProviderLabel: string;
  momoNumberMasked: string;
  createdAt: string;
};

export type OrganizerDashboardData = {
  organizer: {
    id?: string;
    fullName: string;
    email?: string;
  };
  kyc?: OrganizerKyc | null;
  stats: DashboardStats;
  quickActions: {
    pendingRefunds: number;
    unreadNotifications: number;
  };
  trips: {
    items: DashboardTripItem[];
    total?: number;
  };
  revenuePulse: {
    months: RevenuePulseMonth[];
    thisMonth: { month?: string; label?: string; revenue: number };
  };
  recentWithdrawals: DashboardWithdrawal[];
};

function mapStatMetric(
  raw: Record<string, unknown> | undefined,
  extras?: { totalListings?: boolean }
): DashboardStatMetric & { totalListings?: number } {
  const metric = {
    value: asNumber(raw?.value),
    growthPercent: asNullableNumber(raw?.growthPercent),
  };
  if (extras?.totalListings) {
    return {
      ...metric,
      totalListings: asNumber(
        raw?.totalListings ?? raw?.total ?? raw?.value
      ),
    };
  }
  return metric;
}

function mapTrip(raw: Record<string, unknown>): DashboardTripItem {
  const capacityRaw = raw.capacity ?? raw.maxCapacity;
  const capacity =
    capacityRaw == null || capacityRaw === ""
      ? null
      : asNumber(capacityRaw);

  const booked = asNumber(raw.booked ?? raw.seatsBooked ?? raw.bookingsCount);
  const fillRateRaw = asNullableNumber(raw.fillRate);
  const fillRate =
    fillRateRaw != null
      ? Math.round(fillRateRaw > 1 ? fillRateRaw : fillRateRaw * 100)
      : capacity && capacity > 0
        ? Math.round((booked / capacity) * 100)
        : 0;

  return {
    id: asString(raw.id),
    title: asString(raw.title, "Untitled trip"),
    destination: raw.destination != null ? asString(raw.destination) : undefined,
    coverImage:
      resolveMediaUrl(
        asString(raw.coverImage ?? raw.image ?? raw.cover, "") || null
      ) ?? null,
    status: asString(raw.status, "draft").toLowerCase(),
    booked,
    capacity,
    fillRate: Math.min(100, Math.max(0, fillRate)),
    startDate: raw.startDate != null ? asString(raw.startDate) : undefined,
    endDate: raw.endDate != null ? asString(raw.endDate) : undefined,
    revenue:
      raw.revenue != null
        ? asNumber(raw.revenue)
        : raw.price != null
          ? asNumber(raw.price) * booked
          : undefined,
  };
}

function mapWithdrawal(raw: Record<string, unknown>): DashboardWithdrawal {
  const status = asString(raw.status, "pending").toLowerCase();
  const label =
    asString(raw.label) ||
    (status === "success" || status === "completed"
      ? "Completed"
      : status === "processing"
        ? "Processing"
        : status === "failed"
          ? "Failed"
          : "Pending");

  return {
    id: asString(raw.id),
    tripTitle: asString(raw.tripTitle, "Withdrawal"),
    amount: asNumber(raw.amount),
    status,
    label,
    momoProviderLabel: asString(
      raw.momoProviderLabel ?? raw.providerLabel ?? raw.momoProvider,
      "MoMo"
    ),
    momoNumberMasked: asString(
      raw.momoNumberMasked ?? raw.accountMasked ?? raw.momoNumber,
      "••••"
    ),
    createdAt: asString(raw.createdAt ?? raw.date, new Date().toISOString()),
  };
}

function mapDashboard(raw: Record<string, unknown>): OrganizerDashboardData {
  const organizer = (raw.organizer ?? {}) as Record<string, unknown>;
  const stats = (raw.stats ?? {}) as Record<string, unknown>;
  const quickActions = (raw.quickActions ?? {}) as Record<string, unknown>;
  const tripsRaw = (raw.trips ?? {}) as Record<string, unknown>;
  const tripsItems = Array.isArray(tripsRaw.items)
    ? tripsRaw.items
    : Array.isArray(raw.trips)
      ? (raw.trips as unknown[])
      : [];
  const pulse = (raw.revenuePulse ?? {}) as Record<string, unknown>;
  const monthsRaw = Array.isArray(pulse.months) ? pulse.months : [];
  const thisMonthRaw = (pulse.thisMonth ?? {}) as Record<string, unknown>;
  const withdrawalsRaw = Array.isArray(raw.recentWithdrawals)
    ? raw.recentWithdrawals
    : [];

  const months: RevenuePulseMonth[] = monthsRaw.map((m) => {
    const row = (m ?? {}) as Record<string, unknown>;
    const label = asString(row.label ?? row.month, "—");
    return {
      month: asString(row.month, label),
      label: label.toUpperCase().slice(0, 3),
      revenue: asNumber(row.revenue ?? row.value),
    };
  });

  const thisMonthRevenue =
    asNullableNumber(thisMonthRaw.revenue) ??
    months[months.length - 1]?.revenue ??
    0;

  return {
    organizer: {
      id: organizer.id != null ? asString(organizer.id) : undefined,
      fullName: asString(
        organizer.fullName ?? organizer.name,
        "there"
      ),
      email: organizer.email != null ? asString(organizer.email) : undefined,
    },
    kyc: extractOrganizerKyc(raw),
    stats: {
      revenue: mapStatMetric(stats.revenue as Record<string, unknown>),
      activeTrips: mapStatMetric(stats.activeTrips as Record<string, unknown>, {
        totalListings: true,
      }) as DashboardStats["activeTrips"],
      travelers: mapStatMetric(stats.travelers as Record<string, unknown>),
      views: mapStatMetric(stats.views as Record<string, unknown>),
      avgRating: {
        value: asNullableNumber(
          (stats.avgRating as Record<string, unknown> | undefined)?.value
        ),
      },
    },
    quickActions: {
      pendingRefunds: asNumber(
        quickActions.pendingRefunds ?? quickActions.pendingCancellations
      ),
      unreadNotifications: asNumber(quickActions.unreadNotifications),
    },
    trips: {
      items: tripsItems.map((t) =>
        mapTrip((t ?? {}) as Record<string, unknown>)
      ),
      total:
        tripsRaw.total != null ? asNumber(tripsRaw.total) : tripsItems.length,
    },
    revenuePulse: {
      months,
      thisMonth: {
        month:
          thisMonthRaw.month != null
            ? asString(thisMonthRaw.month)
            : months[months.length - 1]?.month,
        label:
          thisMonthRaw.label != null
            ? asString(thisMonthRaw.label)
            : months[months.length - 1]?.label,
        revenue: thisMonthRevenue,
      },
    },
    recentWithdrawals: withdrawalsRaw.map((w) =>
      mapWithdrawal((w ?? {}) as Record<string, unknown>)
    ),
  };
}

/** GET /api/organizer/dashboard */
export async function getOrganizerDashboard(params?: {
  tripsLimit?: number;
  withdrawalsLimit?: number;
}): Promise<OrganizerDashboardData> {
  const query = new URLSearchParams();
  if (params?.tripsLimit != null) {
    query.set("tripsLimit", String(params.tripsLimit));
  }
  if (params?.withdrawalsLimit != null) {
    query.set("withdrawalsLimit", String(params.withdrawalsLimit));
  }
  const qs = query.toString();

  const response = await apiRequest<Record<string, unknown>>(
    `/api/organizer/dashboard${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: bearerHeaders() }
  );

  return mapDashboard((response.data ?? {}) as Record<string, unknown>);
}

export function formatDashboardGhs(n: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatGrowth(pct: number | null | undefined): string | null {
  if (pct == null) return null;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}
