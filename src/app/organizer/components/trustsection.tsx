"use client";

import { useEffect, useRef } from "react";
import {
  Compass,
  ArrowUpRight,
  Shield,
  Star,
  Zap,
  Mountain,
  Clock,
  MapPin,
  Sun,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Reused from your page: keep these as-is if already defined ─── */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-[0.2em]"
      style={{ color: "var(--gold)" }}
    >
      {children}
    </p>
  );
}

function RevealBox({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 40, rotateX: 8 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.85,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          once: true,
        },
      }
    );
  }, [delay]);
  return (
    <div ref={ref} style={{ opacity: 0, perspective: 800 }} className={className}>
      {children}
    </div>
  );
}

/* ─── Data ─────────────────────────────────────────────────────── */
const TRUST_ITEMS = [
  {
    icon: Shield,
    title: "Identity verified",
    desc: "Every organizer is verified with Ghana Card or business registration before going live.",
  },
  {
    icon: Star,
    title: "Review system",
    desc: "Real ratings from real travelers. You can't buy or remove a review.",
  },
  {
    icon: Zap,
    title: "Response rate tracked",
    desc: "Travelers see how fast you reply — fast responders convert better.",
  },
  {
    icon: Mountain,
    title: "Trip completion record",
    desc: "Your completed trip count is public. Every trip you run builds your reputation.",
  },
];

/* ─── Trust / About section ──────────────────────────────────────── */
export function TrustSection() {
  const mapRef = useRef<HTMLDivElement>(null);

  /* Subtle parallax drift on the world-map dots, GSAP-driven */
  useEffect(() => {
    if (!mapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mapRef.current,
        { backgroundPosition: "0% 0%" },
        {
          backgroundPosition: "10% 6%",
          ease: "none",
          scrollTrigger: {
            trigger: mapRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="trust"
      className="scroll-mt-32 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* ════════════════════════════════════════════════════
          PART 1 — About VaybeEx (icon card / feature / photos / stats)
      ════════════════════════════════════════════════════ */}
      <RevealBox className="mb-6">
        <SectionEyebrow>About VaybeEx</SectionEyebrow>
      </RevealBox>

      <RevealBox delay={0.05} className="mb-12 max-w-3xl">
        <h2
          className="font-display text-3xl font-bold leading-snug sm:text-4xl"
          style={{ color: "var(--text)" }}
        >
          Since 2023, organizers on VaybeEx have guided thousands of
          travelers through{" "}
          <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
            Ghana&apos;s most unforgettable landscapes — from waterfall hikes
            to coastal sunsets.
          </span>
        </h2>
      </RevealBox>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr_1fr]">
        {/* ── Card A: route-finder description card ── */}
        <RevealBox delay={0.1}>
          <div
            className="flex h-full flex-col justify-between rounded-2xl border p-7"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div>
              <div
                className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "var(--primary-dim)" }}
              >
                <Compass className="h-5 w-5" style={{ color: "var(--primary)" }} />
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Explore Ghana&apos;s landscapes with routes designed for every
                experience level. Each trip includes local guides and scenic
                stops for photos and rest.
              </p>
            </div>

            {/* feature pills */}
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
                  Pickup included
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
                  2–3 hour trips
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
                  Sunset views
                </span>
              </div>
            </div>

            {/* CTA row */}
            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                className="rounded-full px-5 py-2.5 text-xs font-bold transition-transform duration-200 hover:scale-105"
                style={{ background: "var(--primary-dark)", color: "#fbf7f1" }}
              >
                Contact us
              </button>
              <button
                type="button"
                aria-label="Learn more"
                className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform duration-200 hover:scale-105"
                style={{ borderColor: "var(--border)" }}
              >
                <ArrowUpRight className="h-4 w-4" style={{ color: "var(--text)" }} />
              </button>
            </div>
          </div>
        </RevealBox>

        {/* ── Card B: feature image — "Desert / Trail Explore" ── */}
        <RevealBox delay={0.18}>
          <div
            className="relative h-full min-h-[320px] overflow-hidden rounded-2xl"
            style={{ background: "var(--primary-dark)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=85&auto=format&fit=crop"
              alt="Traveler hiking a scenic trail at sunrise"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(42,27,15,0.75) 0%, rgba(42,27,15,0.1) 55%, transparent 100%)",
              }}
            />
            <div className="absolute left-6 top-6">
              <p
                className="font-display text-xl font-bold"
                style={{ color: "#fbf7f1" }}
              >
                Trail Explore
              </p>
            </div>
            <div
              className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(251,247,241,0.18)", backdropFilter: "blur(8px)" }}
            >
              <ArrowUpRight className="h-4 w-4" style={{ color: "#fbf7f1" }} />
            </div>
          </div>
        </RevealBox>

        {/* ── Card C: photo fan stack + caption ── */}
        <RevealBox delay={0.26}>
          <div className="flex h-full flex-col justify-between">
            <div className="relative h-[170px] w-full">
              {[
                {
                  src: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=400&q=80&auto=format&fit=crop",
                  rot: -8,
                  left: "6%",
                  z: 1,
                },
                {
                  src: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=80&auto=format&fit=crop",
                  rot: 4,
                  left: "30%",
                  z: 2,
                },
                {
                  src: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=400&q=80&auto=format&fit=crop",
                  rot: 12,
                  left: "52%",
                  z: 3,
                },
              ].map((img, i) => (
                <div
                  key={i}
                  className="absolute top-2 h-[140px] w-[110px] overflow-hidden rounded-xl border-4 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:scale-105"
                  style={{
                    left: img.left,
                    transform: `rotate(${img.rot}deg)`,
                    zIndex: img.z,
                    borderColor: "var(--surface)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Stories and moments from travelers who explored Ghana&apos;s
              trails with VaybeEx organizers.
            </p>
          </div>
        </RevealBox>
      </div>

      {/* ── Stats row ── */}
      <RevealBox delay={0.32}>
        <div className="mt-12 grid grid-cols-2 gap-6 border-y py-10 sm:grid-cols-4" style={{ borderColor: "var(--border)" }}>
          {[
            { value: "5+", label: "years of experience" },
            { value: "760+", label: "happy travelers" },
            { value: "30+", label: "scenic routes" },
            { value: "4.9", label: "average rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="font-display text-3xl font-black sm:text-4xl"
                style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </RevealBox>

      {/* ════════════════════════════════════════════════════
          PART 2 — Why travelers choose VaybeEx
      ════════════════════════════════════════════════════ */}
      <div className="mt-24">
        <RevealBox className="mb-3">
          <SectionEyebrow>Why choose us</SectionEyebrow>
        </RevealBox>

        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <RevealBox delay={0.05}>
            <h2
              className="font-display text-4xl font-bold leading-tight sm:text-5xl"
              style={{ color: "var(--text)" }}
            >
              Why travelers
              <br />
              choose VaybeEx
            </h2>
          </RevealBox>
          <RevealBox delay={0.1} className="max-w-xs">
            <p
              className="text-sm leading-relaxed sm:text-right"
              style={{ color: "var(--text-secondary)" }}
            >
              Every journey booked through VaybeEx is built on trust, safety,
              and unforgettable views.
            </p>
          </RevealBox>
        </div>

        {/* ── Bento grid: map card / 2 stacked text cards / portrait image ── */}
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_0.9fr]">
          {/* Card 1: world map / local expertise */}
          <RevealBox delay={0.12}>
            <div
              className="relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl border p-7"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              {/* dot-map texture */}
              <div
                ref={mapRef}
                className="pointer-events-none absolute inset-0 opacity-[0.5]"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(107,63,29,0.18) 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                  maskImage:
                    "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 85%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 85%)",
                }}
              />
              <div className="relative">
                <h3
                  className="font-display text-lg font-bold"
                  style={{ color: "var(--text)" }}
                >
                  Local expertise
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Guided by organizers who grew up in Ghana and know its
                  hidden paths, stories, and traditions.
                </p>
              </div>
            </div>
          </RevealBox>

          {/* Cards 2 + 3 stacked: Certified guides / Community */}
          <div className="flex flex-col gap-5">
            {TRUST_ITEMS.slice(0, 2).map((item, i) => (
              <RevealBox key={item.title} delay={0.18 + i * 0.08}>
                <div
                  className="group flex flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <h3
                    className="font-display text-lg font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.desc}
                  </p>

                  {/* extra row for the second card to echo the "avatars" detail in the reference */}
                  {i === 1 && (
                    <div className="mt-4 flex -space-x-2">
                      {["KA", "AS", "II", "MB", "+12"].map((label, j) => (
                        <div
                          key={j}
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-bold"
                          style={{
                            borderColor: "var(--surface)",
                            background:
                              j === 4 ? "var(--gold-dim)" : "var(--gradient-brand)",
                            color: j === 4 ? "var(--gold)" : "#fbf7f1",
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </RevealBox>
            ))}
          </div>

          {/* Card 4: tall portrait image — "See real moments" */}
          <RevealBox delay={0.3}>
            <div
              className="relative h-full min-h-[280px] overflow-hidden rounded-2xl lg:min-h-full"
              style={{ background: "var(--primary-dark)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&q=85&auto=format&fit=crop"
                alt="Traveler looking out over a Ghanaian landscape"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(42,27,15,0.85) 0%, rgba(42,27,15,0.05) 60%, transparent 100%)",
                }}
              />
              <div className="absolute bottom-6 left-6 right-6">
                <p
                  className="text-sm font-medium leading-snug"
                  style={{ color: "#fbf7f1" }}
                >
                  See real moments
                  <br />
                  from our trips.
                </p>
              </div>
              <div
                className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "rgba(251,247,241,0.18)", backdropFilter: "blur(8px)" }}
              >
                <ArrowUpRight className="h-4 w-4" style={{ color: "#fbf7f1" }} />
              </div>
            </div>
          </RevealBox>
        </div>

        {/* remaining trust items, smaller row beneath for completeness */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {TRUST_ITEMS.slice(2).map((item, i) => (
            <RevealBox key={item.title} delay={0.1 + i * 0.08}>
              <div
                className="group flex items-start gap-4 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{ background: "var(--primary-dim)" }}
                >
                  <item.icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <h3
                    className="font-display text-base font-bold"
                    style={{ color: "var(--text)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            </RevealBox>
          ))}
        </div>
      </div>
    </section>
  );
}