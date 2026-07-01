"use client"
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Star, Calendar, CheckCircle2, Clock,
  Globe, X, LinkIcon, MessageCircle, Heart,
  MoreHorizontal, CalendarPlus, Route, Users,
  MessageSquare, ChevronRight, Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TripCard } from "@/components/trips/trip-card";
import { getOrganizerById, getOrganizerTrips } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

/* ─── Static sample reviews (replace with real data fetch later) ─── */
const SAMPLE_REVIEWS = [
  {
    name: "Abena Serwaa", initials: "AS",
    date: "May 2026", trip: "Cape Coast Cultural Tour", rating: 5,
    text: "Kwame is incredible — the Cape Coast trip was perfectly organised and the history he shared made it truly memorable. Every detail was thought through.",
  },
  {
    name: "Fiifi Owusu", initials: "FO",
    date: "Apr 2026", trip: "Mole Safari", rating: 5,
    text: "Mole Safari was the best weekend I've had in years. We saw elephants on day one. The logistics were seamless and the guide was brilliant.",
  },
  {
    name: "Akosua Mensah", initials: "AM",
    date: "Mar 2026", trip: "Volta River Weekend", rating: 5,
    text: "From booking to return, everything was handled professionally. I've already recommended this organizer to three friends.",
  },
  {
    name: "Kweku Acheampong", initials: "KA",
    date: "Feb 2026", trip: "Kakum Canopy Walk", rating: 4,
    text: "Really well-paced trip. The sunrise walk was worth the early start. Would have loved a bit more free time at the end.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   SERVER COMPONENT — fetches data, passes to client shell
═══════════════════════════════════════════════════════════════════ */
export default async function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organizer = getOrganizerById(id);
  if (!organizer) notFound();

  const organizerTrips = getOrganizerTrips(id);
  const upcoming = organizerTrips.filter((t) => new Date(t.endDate) >= new Date());
  const past     = organizerTrips.filter((t) => new Date(t.endDate) < new Date());

  return (
    <OrganizerProfileClient
      organizer={organizer}
      organizerTrips={organizerTrips}
      upcoming={upcoming}
      past={past}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CLIENT COMPONENT — tabs + interactive state
═══════════════════════════════════════════════════════════════════ */


import { useState } from "react";

type Organizer     = NonNullable<ReturnType<typeof getOrganizerById>>;
type Trip          = ReturnType<typeof getOrganizerTrips>[number];
type TabId         = "overview" | "reviews" | "trips";

function OrganizerProfileClient({
  organizer,
  organizerTrips,
  upcoming,
  past,
}: {
  organizer: Organizer;
  organizerTrips: Trip[];
  upcoming: Trip[];
  past: Trip[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [saved, setSaved] = useState(false);

  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "reviews",  label: "Reviews",  count: organizer.reviewCount },
    { id: "trips",    label: "Trips",    count: organizerTrips.length },
  ];

  const STATS = [
    { icon: Route,         label: "Trips hosted",      value: organizer.tripCount,            iconBg: "var(--gold-dim)",              iconColor: "var(--gold)"           },
    { icon: Users,         label: "Travellers hosted",  value: organizer.reviewCount * 12,     iconBg: "rgba(46,125,82,0.1)",          iconColor: "#2e7d52"               },
    { icon: Star,          label: "Avg. rating",        value: organizer.rating,               iconBg: "var(--primary-dim)",           iconColor: "var(--primary)"        },
    { icon: MessageSquare, label: "Response rate",      value: "98%",                          iconBg: "var(--bg-secondary)",          iconColor: "var(--text-secondary)" },
  ];

  return (
    <div
      className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8"
      style={{ background: "var(--bg)" }}
    >

      {/* ══════════════════════════════════════════════════════════
          HERO CARD
      ══════════════════════════════════════════════════════════ */}
      <div
        className="mb-6 overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {/* gradient band */}
        <div
          className="h-28"
          style={{ background: "var(--gradient-brand)" }}
        />

        <div className="relative px-6 pb-0">
          {/* avatar */}
          <Avatar
            className="absolute -top-12 left-6 h-24 w-24 border-4 shadow-lg"
            style={{ borderColor: "var(--surface)" }}
          >
            <AvatarImage src={organizer.avatar} />
            <AvatarFallback
              className="text-2xl font-bold"
              style={{
                background: "var(--gradient-brand)",
                color: "#fbf7f1",
              }}
            >
              {organizer.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* name + actions */}
          <div className="flex flex-wrap items-start justify-between gap-4 pt-16">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="font-display text-xl font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {organizer.name}
                </h1>
                {organizer.verified ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: "rgba(46,125,82,0.09)",
                      color: "#2e7d52",
                      borderColor: "rgba(46,125,82,0.22)",
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <Badge variant="warning">
                    {organizer.verificationStatus === "in_review"
                      ? "In review"
                      : "Unverified"}
                  </Badge>
                )}
              </div>

              <p
                className="mt-1 flex items-center gap-1 text-[13px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                <MapPin className="h-3.5 w-3.5" />
                {organizer.location}
              </p>

              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px]"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-tertiary)",
                  borderColor: "var(--border)",
                }}
              >
                <Calendar className="h-3 w-3" />
                Organizer since {formatDate(organizer.joinedAt)}
              </span>
            </div>

            {/* action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90 active:scale-95"
                style={{
                  background: "var(--gradient-brand)",
                  color: "#fbf7f1",
                }}
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Book a trip
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-[var(--bg-secondary)] active:scale-95"
                style={{
                  borderColor: "var(--border-strong)",
                  color: "var(--text-secondary)",
                }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Message
              </button>

              <button
                onClick={() => setSaved((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95"
                style={{
                  borderColor: saved ? "var(--coral)" : "var(--border-strong)",
                  background: saved ? "rgba(181,82,58,0.08)" : "transparent",
                  color: saved ? "var(--coral)" : "var(--text-tertiary)",
                }}
                aria-label={saved ? "Unsave" : "Save organizer"}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
              </button>

              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--bg-secondary)] active:scale-95"
                style={{
                  borderColor: "var(--border-strong)",
                  color: "var(--text-tertiary)",
                }}
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* bio */}
          <p
            className="mt-4 max-w-2xl text-[13px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {organizer.bio}
          </p>

          {/* social row */}
          <div className="mt-3 flex items-center gap-2">
            {[LinkIcon, X, Globe].map((Icon, i) => (
              <button
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--bg-secondary)]"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-tertiary)",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* tabs */}
          <nav
            className="mt-5 flex gap-0.5 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-[13px] font-semibold transition-colors"
                  style={{
                    color: active ? "var(--primary)" : "var(--text-tertiary)",
                    borderBottomColor: active
                      ? "var(--primary)"
                      : "transparent",
                  }}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className="rounded-full px-1.5 py-px text-[10px] font-bold"
                      style={{
                        background: active
                          ? "var(--gold)"
                          : "var(--bg-secondary)",
                        color: active ? "#fff" : "var(--text-tertiary)",
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* ── left column ── */}
          <div className="space-y-6 min-w-0">

            {/* insights */}
            <Section title="Profile insights">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: "🏅", title: "Perfect Presence", desc: "Prompt and highly responsive to traveler enquiries." },
                  { emoji: "⭐", title: "Top Organizer · Adventure", desc: "Top 10% of organizers in adventure and cultural trips." },
                ].map((ins) => (
                  <div
                    key={ins.title}
                    className="rounded-xl border p-4 transition-shadow hover:shadow-sm"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <div className="mb-2 text-xl">{ins.emoji}</div>
                    <p className="text-[12px] font-bold" style={{ color: "var(--text)" }}>
                      {ins.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      {ins.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            {/* experience */}
            <Section title="Experience">
              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                {[
                  { label: "Specialties",  tags: [{ text: "Adventure", bg: "rgba(196,134,76,0.1)", color: "var(--primary)",  border: "rgba(196,134,76,0.3)" }, { text: "Cultural", bg: "rgba(196,134,76,0.1)", color: "var(--primary)", border: "rgba(196,134,76,0.3)" }] },
                  { label: "Destinations", tags: [{ text: "Ghana",     bg: "rgba(74,100,180,0.1)", color: "#3a4fa0",         border: "rgba(74,100,180,0.2)" }, { text: "Togo",     bg: "rgba(74,100,180,0.1)", color: "#3a4fa0",        border: "rgba(74,100,180,0.2)" }] },
                  { label: "Group size",   tags: [{ text: "6–24 travellers", bg: "rgba(46,125,82,0.09)", color: "#2e7d52",   border: "rgba(46,125,82,0.2)" }] },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                      {row.label}
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {row.tags.map((t) => (
                        <span
                          key={t.text}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{ background: t.bg, color: t.color, borderColor: t.border }}
                        >
                          {t.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* upcoming trips */}
            <Section title={`Upcoming trips`} count={upcoming.length}>
              {upcoming.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  No upcoming trips listed.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {upcoming.map((trip, i) => (
                    <TripCard key={trip.id} trip={trip} index={i} />
                  ))}
                </div>
              )}
            </Section>

            {/* past trips */}
            {past.length > 0 && (
              <Section title="Past trips" count={past.length} muted>
                <div className="grid grid-cols-2 gap-4">
                  {past.map((trip, i) => (
                    <TripCard key={trip.id} trip={trip} index={i} />
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* ── right sidebar ── */}
          <aside className="space-y-4">
            <SidebarStats STATS={STATS} />
            <SidebarReviews organizer={organizer} />
            <SidebarVerification />
          </aside>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: REVIEWS
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "reviews" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {/* summary bar */}
            <div
              className="flex flex-col gap-5 rounded-2xl border p-5 sm:flex-row sm:items-center"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div className="text-center sm:pr-6 sm:border-r" style={{ borderColor: "var(--border)" }}>
                <p
                  className="font-display text-5xl font-black"
                  style={{ color: "var(--text)" }}
                >
                  {organizer.rating}
                </p>
                <div className="mt-1 flex justify-center gap-px">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                  ))}
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {organizer.reviewCount} reviews
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  { label: "Organisation", pct: 98 },
                  { label: "Value",        pct: 94 },
                  { label: "Safety",       pct: 100 },
                  { label: "Experience",   pct: 96 },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <span
                      className="w-24 text-[11px]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {cat.label}
                    </span>
                    <div
                      className="flex-1 overflow-hidden rounded-full"
                      style={{ height: 5, background: "var(--bg-secondary)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.pct}%`,
                          background: "var(--gradient-brand)",
                        }}
                      />
                    </div>
                    <span
                      className="w-7 text-right text-[11px] font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {cat.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* review cards */}
            {SAMPLE_REVIEWS.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl border p-5 transition-shadow hover:shadow-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}
                    >
                      {r.initials}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>
                        {r.name}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {r.date} · {r.trip}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-px">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
                    ))}
                  </div>
                </div>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <aside className="space-y-4">
            <SidebarStats STATS={STATS} />
          </aside>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: TRIPS
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "trips" && (
        <div className="space-y-8">
          <Section title="Upcoming trips" count={upcoming.length}>
            {upcoming.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                No upcoming trips listed.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {upcoming.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={i} />
                ))}
              </div>
            )}
          </Section>

          {past.length > 0 && (
            <Section title="Past trips" count={past.length} muted>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {past.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={i} />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Small helpers ──────────────────────────────────────────────── */

function Section({
  title,
  count,
  muted,
  children,
}: {
  title: string;
  count?: number;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-display text-[15px] font-bold" style={{ color: "var(--text)" }}>
          {title}
        </h2>
        {count !== undefined && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: muted ? "var(--bg-secondary)" : "var(--gold-dim)",
              color: muted ? "var(--text-tertiary)" : "var(--gold)",
            }}
          >
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SidebarStats({
  STATS,
}: {
  STATS: { icon: React.ElementType; label: string; value: string | number; iconBg: string; iconColor: string }[];
}) {
  return (
    <div
      className="rounded-[14px] border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>
          Community stats
        </p>
        <button
          className="flex items-center gap-0.5 text-[11px] font-semibold"
          style={{ color: "var(--gold)" }}
        >
          See more <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: s.iconBg }}
            >
              <s.icon className="h-4 w-4" style={{ color: s.iconColor }} />
            </div>
            <div>
              <p className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
                {s.value}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div
          className="h-1.5 overflow-hidden rounded-full"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: "98%", background: "var(--gradient-brand)" }}
          />
        </div>
        <div
          className="mt-1 flex justify-between text-[10px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <span>Response rate 98%</span>
          <span>Replies within 2 hrs</span>
        </div>
      </div>
    </div>
  );
}

function SidebarReviews({ organizer }: { organizer: Organizer }) {
  return (
    <div
      className="rounded-[14px] border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>
          Traveler reviews
        </p>
        <Link
          href="#"
          className="flex items-center gap-0.5 text-[11px] font-semibold hover:underline"
          style={{ color: "var(--gold)" }}
        >
          All {organizer.reviewCount} <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <span className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>
          {organizer.rating}
        </span>
        <div className="flex gap-px">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
          ))}
        </div>
        <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
          ({organizer.reviewCount})
        </span>
      </div>
      {SAMPLE_REVIEWS.slice(0, 2).map((r) => (
        <div
          key={r.name}
          className="mb-2 rounded-xl border p-3 last:mb-0"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>
              {r.name}
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {r.date}
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            &ldquo;{r.text.slice(0, 90)}…&rdquo;
          </p>
        </div>
      ))}
    </div>
  );
}

function SidebarVerification() {
  return (
    <div
      className="rounded-[14px] border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Shield className="h-4 w-4" style={{ color: "var(--primary)" }} />
        <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>
          Verification
        </p>
      </div>
      <div className="space-y-2.5">
        {[
          { label: "Identity verified",       done: true  },
          { label: "Phone number confirmed",   done: true  },
          { label: "Email address confirmed",  done: true  },
          { label: "Business registration",    done: false },
        ].map((v) => (
          <div
            key={v.label}
            className="flex items-center gap-2 text-[12px]"
            style={{ color: v.done ? "#2e7d52" : "var(--text-tertiary)" }}
          >
            {v.done
              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
              : <Clock className="h-4 w-4 shrink-0" />}
            {v.label}
            {!v.done && (
              <span
                className="ml-auto text-[10px] font-semibold"
                style={{ color: "var(--amber)" }}
              >
                In review
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}