"use client";

import { useState } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  ClipboardList,
  Eye,
  FileText,
  LineChart,
  Map,
  MessageSquare,
  PieChart,
  Send,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { RevealBox, SectionEyebrow } from "../page";

const TOOL_CATEGORIES = [
  {
    icon: Map,
    title: "Trip builder",
    features: [
      {
        icon: ClipboardList,
        title: "Itinerary editor",
        desc: "Build day-by-day schedules with activities, meals, transport, and optional add-ons in one flow.",
      },
      {
        icon: Calendar,
        title: "Flexible scheduling",
        desc: "Set departure dates, seat caps, and pricing tiers — then publish or save drafts anytime.",
      },
      {
        icon: FileText,
        title: "Rich trip pages",
        desc: "Add photos, inclusions, exclusions, and policies so travelers know exactly what they are booking.",
      },
      {
        icon: Shield,
        title: "Publish with confidence",
        desc: "Preview your listing before it goes live and update details without losing existing bookings.",
      },
    ],
  },
  {
    icon: Users,
    title: "Attendee manager",
    features: [
      {
        icon: UserCheck,
        title: "Payment status at a glance",
        desc: "See who paid in full, who made a deposit, and who is still pending — all in one guest list.",
      },
      {
        icon: ClipboardList,
        title: "Organized rosters",
        desc: "Filter by trip, date, or payment stage and export your attendee list when you need it.",
      },
      {
        icon: Bell,
        title: "Targeted reminders",
        desc: "Nudge travelers with outstanding balances before departure without leaving the dashboard.",
      },
      {
        icon: Shield,
        title: "Booking integrity",
        desc: "Seat counts stay accurate as payments confirm, so you never overbook a trip.",
      },
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    features: [
      {
        icon: Eye,
        title: "Trip performance",
        desc: "Track views, saves, and conversion rates for every listing you publish on the marketplace.",
      },
      {
        icon: TrendingUp,
        title: "Revenue insights",
        desc: "See revenue per trip, average booking value, and which pricing tiers convert best.",
      },
      {
        icon: PieChart,
        title: "Destination trends",
        desc: "Learn which regions and trip types attract the most interest from travelers.",
      },
      {
        icon: LineChart,
        title: "Growth over time",
        desc: "Monitor month-over-month bookings and repeat guests to plan your next season.",
      },
    ],
  },
  {
    icon: MessageSquare,
    title: "Group messaging",
    features: [
      {
        icon: Send,
        title: "Segmented broadcasts",
        desc: "Message paid guests, deposit holders, or pending travelers without spamming everyone.",
      },
      {
        icon: Bell,
        title: "Trip updates",
        desc: "Share itinerary changes, meeting points, or packing lists with one click to the whole group.",
      },
      {
        icon: Users,
        title: "Waitlist outreach",
        desc: "Reach travelers on your waitlist the moment a seat opens on a sold-out departure.",
      },
      {
        icon: Zap,
        title: "Faster coordination",
        desc: "Keep every traveler informed in one thread instead of juggling WhatsApp groups.",
      },
    ],
  },
  {
    icon: Wallet,
    title: "Payout dashboard",
    features: [
      {
        icon: Wallet,
        title: "Real-time balances",
        desc: "Monitor pending, processing, and completed payouts from a single financial overview.",
      },
      {
        icon: Zap,
        title: "On-demand withdrawals",
        desc: "Withdraw to MoMo or your bank account when funds are available — no manual follow-up.",
      },
      {
        icon: Shield,
        title: "Transparent fees",
        desc: "See exactly what you earned and what was deducted before each payout lands.",
      },
      {
        icon: Calendar,
        title: "Payout history",
        desc: "Review past transfers by trip and date for clean bookkeeping and tax prep.",
      },
    ],
  },
] as const;

function ToolsWavePattern() {
  const offsets = [0, 14, 28, 42, 56];

  return (
    <svg
      className="pointer-events-none absolute right-0 top-0 z-0 h-36 w-64 sm:h-44 sm:w-80 lg:h-52 lg:w-96"
      viewBox="0 0 420 180"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="toolsWaveFade" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#b8c4e8" stopOpacity="0" />
          <stop offset="35%" stopColor="#b8c4e8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#b8c4e8" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {offsets.map((offset) => (
        <path
          key={offset}
          d={`M -30 ${52 + offset} C 70 ${18 + offset}, 150 ${88 + offset}, 250 ${48 + offset} S 430 ${62 + offset}, 450 ${58 + offset}`}
          stroke="url(#toolsWaveFade)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

const Tools = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = TOOL_CATEGORIES[activeIndex];

  return (
    <section
      id="tools"
      className="relative scroll-mt-32 overflow-hidden bg-white py-24"
    >
      <ToolsWavePattern />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealBox>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-stretch lg:gap-12">
            {/* Left — navigation card with offset backing slab */}
            <div className="relative lg:pb-5 lg:pr-5">
              <div
                className="absolute inset-0 hidden translate-x-4 translate-y-4 rounded-3xl bg-[#f5f5f5] lg:block"
                aria-hidden
              />
              <div
                className="relative flex h-full min-h-full flex-col rounded-3xl p-8 shadow-[0_4px_32px_rgba(42,27,15,0.08)] lg:min-h-[560px]"
                style={{ background: "var(--surface)" }}
              >
              <SectionEyebrow>Tools built for your workflow</SectionEyebrow>
              <h2 className="font-display mt-4 text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
                Everything in one organizer portal.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                No more juggling apps. Every tool you need to run, fill, and
                manage group trips lives in one place.
              </p>

              <div className="mt-8 flex flex-1 flex-col gap-3">
                {TOOL_CATEGORIES.map((category, index) => {
                  const isActive = index === activeIndex;
                  const Icon = category.icon;

                  return (
                    <button
                      key={category.title}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`group relative flex flex-1 w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                        isActive
                          ? "border-transparent text-white shadow-[0_8px_24px_rgba(42,27,15,0.18)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--gold)]/40 hover:bg-[var(--primary-dim)]"
                      }`}
                      style={
                        isActive
                          ? { background: "var(--text)" }
                          : undefined
                      }
                      aria-pressed={isActive}
                    >
                      {isActive && (
                        <span
                          className="pointer-events-none absolute bottom-0 left-0 h-8 w-8"
                          aria-hidden
                        >
                          <span
                            className="absolute bottom-0 left-0 h-0 w-0 border-b-[28px] border-r-[28px] border-b-[var(--gold)] border-r-transparent"
                          />
                          <span
                            className="absolute bottom-0 left-0 h-0 w-0 border-b-[18px] border-r-[18px] border-b-[#f5c069] border-r-transparent"
                          />
                        </span>
                      )}

                      <span
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                          isActive
                            ? "bg-white/10"
                            : "bg-[var(--primary-dim)] group-hover:bg-[var(--primary-dim)]"
                        }`}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{
                            color: isActive ? "#fff" : "var(--primary)",
                          }}
                        />
                      </span>
                      <span
                        className={`relative z-10 font-display text-sm font-semibold sm:text-base ${
                          isActive ? "text-white" : "text-[var(--text)]"
                        }`}
                      >
                        {category.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            </div>

            {/* Right — feature grid */}
            <div className="flex min-h-[560px] flex-col justify-start px-1 pt-2 sm:px-2 lg:px-4 lg:pt-4">
              <p
                className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]"
                key={`label-${activeCategory.title}`}
              >
                {activeCategory.title}
              </p>

              <div
                key={activeCategory.title}
                className="grid animate-[fade-in_0.35s_ease-out] rounded-2xl sm:grid-cols-2"
                style={{ background: "transparent" }}
              >
                {activeCategory.features.map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  const isLeftCol = index % 2 === 0;
                  const isTopRow = index < 2;

                  return (
                    <div
                      key={feature.title}
                      className={`flex flex-col px-0 py-7 sm:px-8 sm:py-9 ${
                        isLeftCol ? "sm:border-r" : ""
                      } ${isTopRow ? "sm:border-b" : ""}`}
                      style={{ borderColor: "rgba(107, 63, 29, 0.12)" }}
                    >
                      <FeatureIcon
                        className="mb-5 h-11 w-11"
                        strokeWidth={1.5}
                        style={{ color: "var(--gold)" }}
                      />
                      <h3 className="font-display text-lg font-bold leading-snug text-[var(--text)] sm:text-xl">
                        {feature.title}
                      </h3>
                      <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
                        {feature.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </RevealBox>
      </div>
    </section>
  );
};

export default Tools;
