"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Globe, Users, Shield, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import cityFromHigh from "@public/images/city-from-high.jpg";
import highShot from "@public/images/high-shot.jpg";

gsap.registerPlugin(ScrollTrigger);

const WHY_BENEFITS = [
  {
    icon: Globe,
    title: "Built for West Africa",
    desc: "Mobile money, local payment methods, and travelers who actively book group trips across Ghana and the region.",
    tag: "Local-first",
    theme: {
      mesh: "radial-gradient(ellipse 90% 70% at 100% 0%, rgba(196,134,76,0.28), transparent 65%)",
      iconGradient: "linear-gradient(145deg, #e0a86a 0%, #a0622e 100%)",
      glow: "rgba(196, 134, 76, 0.22)",
      tagBg: "rgba(196, 134, 76, 0.16)",
      tagColor: "#8b5a2b",
      accent: "#c4864c",
    },
  },
  {
    icon: Users,
    title: "Fill your trips faster",
    desc: "List on a marketplace where travelers search by destination, dates, and budget — and find you.",
    tag: "Discovery",
    theme: {
      mesh: "radial-gradient(ellipse 90% 70% at 0% 0%, rgba(107,63,29,0.2), transparent 65%)",
      iconGradient: "linear-gradient(145deg, #8b5a2b 0%, #4a2a12 100%)",
      glow: "rgba(86, 47, 24, 0.18)",
      tagBg: "rgba(86, 47, 24, 0.1)",
      tagColor: "#6b3f1d",
      accent: "#6b3f1d",
    },
  },
  {
    icon: Shield,
    title: "Trust that converts",
    desc: "Verified organizer badges, authentic reviews, and transparent seat counts help travelers book with confidence.",
    tag: "Verified",
    theme: {
      mesh: "radial-gradient(ellipse 90% 70% at 100% 100%, rgba(46,125,82,0.16), transparent 65%)",
      iconGradient: "linear-gradient(145deg, #3d9a6a 0%, #1f5c3a 100%)",
      glow: "rgba(46, 125, 82, 0.16)",
      tagBg: "rgba(46, 125, 82, 0.12)",
      tagColor: "#2e7d52",
      accent: "#2e7d52",
    },
  },
  {
    icon: TrendingUp,
    title: "Grow repeat business",
    desc: "Build a profile travelers return to. Past guests can review, rebook, and recommend your trips.",
    tag: "Retention",
    theme: {
      mesh: "radial-gradient(ellipse 90% 70% at 0% 100%, rgba(196,134,76,0.22), transparent 65%)",
      iconGradient: "linear-gradient(145deg, #f0b872 0%, #c4864c 100%)",
      glow: "rgba(196, 134, 76, 0.2)",
      tagBg: "rgba(196, 134, 76, 0.14)",
      tagColor: "#8b5a2b",
      accent: "#c4864c",
    },
  },
] as const;

export function WhySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      /* ── headline panel wipe in from left ── */
      gsap.fromTo(
        headlineRef.current,
        { clipPath: "inset(0 100% 0 0)", opacity: 0 },
        {
          clipPath: "inset(0 0% 0 0)",
          opacity: 1,
          duration: 1.1,
          ease: "power3.inOut",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        }
      );

      /* ── image panel scale up ── */
      gsap.fromTo(
        imageRef.current,
        { scale: 1.08, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.3,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        }
      );

      /* ── benefit cells stagger in ── */
      const cells = cellRefs.current.filter(Boolean);
      gsap.from(cells, {
        y: 56,
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        },
      });

      /* ── image parallax on scroll ── */
      gsap.to(imageRef.current, {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  /* ── card hover: lift + glow ── */
  useEffect(() => {
    const cards = cellRefs.current.filter(Boolean) as HTMLDivElement[];
    const cleanup: (() => void)[] = [];

    cards.forEach((card) => {
      const onEnter = () =>
        gsap.to(card, { y: -6, scale: 1.015, duration: 0.4, ease: "power2.out" });
      const onLeave = () =>
        gsap.to(card, { y: 0, scale: 1, duration: 0.5, ease: "power2.out" });
      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      cleanup.push(() => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanup.forEach((fn) => fn());
  }, []);

  return (
    <section
      id="why"
      ref={sectionRef}
      className="scroll-mt-32 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      {/*
        ── BENTO GRID ──────────────────────────────────────────
        Desktop layout (CSS grid areas):
        [ headline ][ image  ][ benefit-0 ]
        [ benefit-1 ][ image  ][ benefit-2 ]
        [ benefit-3 ][ cta-band ──────────]
      */}
      <div
        id="why-bento"
        className="grid gap-3 max-md:grid-cols-1 md:max-lg:grid-cols-2 lg:grid-cols-[1fr_1.35fr_1fr]"
      >
        {/* ── A: BIG HEADLINE PANEL (top-left, spans 1 col × 1 row) ── */}
        <div
          ref={headlineRef}
          className="bento-headline-panel relative flex flex-col justify-between overflow-hidden rounded-[20px] p-8 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:p-10 max-lg:col-span-full"
          style={{
            background: "var(--primary-dark)",
            minHeight: 340,
            opacity: 0,
          }}
        >
          {/* paper-grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
            }}
          />
          {/* subtle corner dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #c4864c 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
              Why VaybeEx
            </p>
            <h2
              className="font-display mt-5 text-4xl font-black leading-[1.05] tracking-tight lg:text-5xl"
              style={{ color: "#fbf7f1" }}
            >
              WHY
              <br />
              <span style={{ color: "var(--gold)" }}>CHOOSE</span>
              <br />
              US?
            </h2>
          </div>

          <div className="relative mt-8">
            <p className="text-sm leading-relaxed" style={{ color: "rgba(251,247,241,0.6)" }}>
              Stop chasing payments on WhatsApp. VaybeEx handles the admin so you lead the experience.
            </p>
            <div
              className="mt-6 h-px w-12"
              style={{ background: "var(--gold)" }}
            />
          </div>
        </div>

        {/* ── B: IMAGE PANEL (center, spans 1 col × 2 rows) ── */}
        <div
          className="bento-image-panel relative overflow-hidden rounded-[20px] lg:col-start-2 lg:row-start-1 lg:row-span-2 max-lg:col-span-full"
          style={{ minHeight: 480 }}
        >
          <div
            ref={imageRef}
            className="absolute inset-0"
            style={{ opacity: 0 }}
          >
            <Image
              src={cityFromHigh}
              alt="Aerial view of a Ghanaian city nestled in a valley with mountains beyond"
              fill
              placeholder="blur"
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(42,27,15,0.15) 0%, rgba(42,27,15,0.35) 55%, rgba(42,27,15,0.72) 100%)",
              }}
            />

            {/* overlay text badge */}
            <div className="absolute bottom-6 left-6 right-6">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold backdrop-blur-sm"
                style={{
                  background: "rgba(251,247,241,0.12)",
                  border: "1px solid rgba(251,247,241,0.2)",
                  color: "#fbf7f1",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--gold)" }}
                />
                Ghana · West Africa · Beyond
              </div>
            </div>
          </div>
        </div>

        {/* ── C: BENEFIT CELLS (top-right + bottom-left + bottom-right) ── */}
        {/* Benefit 0 — top right */}
        <BentoCell
          benefit={WHY_BENEFITS[0]}
          index={0}
          cellRef={(el) => { cellRefs.current[0] = el; }}
          className="lg:col-start-3 lg:row-start-1"
        />

        <BentoCell
          benefit={WHY_BENEFITS[1]}
          index={1}
          cellRef={(el) => { cellRefs.current[1] = el; }}
          className="lg:col-start-1 lg:row-start-3"
        />

        <BentoCell
          benefit={WHY_BENEFITS[2]}
          index={2}
          cellRef={(el) => { cellRefs.current[2] = el; }}
          className="lg:col-start-3 lg:row-start-2"
        />

        {/* ── D: BOTTOM BAND — image col + right col ── */}
        {/* Bottom center: stat band */}
        <div
          className="bento-stat-band relative flex items-center justify-around overflow-hidden rounded-[20px] px-8 py-7 lg:col-start-2 lg:row-start-3 max-lg:col-span-full"
        >
          <Image
            src={highShot}
            alt=""
            fill
            placeholder="blur"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-black/60"
            aria-hidden
          />
          {[
            { v: "120+", l: "Destinations" },
            { v: "4.8k+", l: "Travelers" },
            { v: "GHS 2M+", l: "Paid out" },
          ].map(({ v, l }) => (
            <div key={l} className="relative z-10 text-center">
              <p className="font-display text-2xl font-black text-[#fbf7f1] sm:text-3xl">{v}</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-[rgba(251,247,241,0.75)]">
                {l}
              </p>
            </div>
          ))}
        </div>

        {/* Benefit 3 — bottom right */}
        <BentoCell
          benefit={WHY_BENEFITS[3]}
          index={3}
          cellRef={(el) => { cellRefs.current[3] = el; }}
          className="lg:col-start-3 lg:row-start-3"
        />
      </div>

      {/* ── Mobile: single-column stack ── */}
      <style>{`
        @media (max-width: 1023px) {
          #why-bento > * {
            grid-column: 1 / -1 !important;
            grid-row: auto !important;
          }
          #why-bento .bento-image-panel {
            min-height: 280px !important;
          }
        }
        @keyframes why-card-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .why-bento-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(196, 134, 76, 0.55) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .why-bento-card:hover::before {
          opacity: 1;
          animation: why-card-shimmer 2.2s linear infinite;
        }
      `}</style>
    </section>
  );
}

/* ─── BENTO CELL ─────────────────────────────────────────────── */
function BentoCell({
  benefit,
  index,
  cellRef,
  className,
}: {
  benefit: (typeof WHY_BENEFITS)[number];
  index: number;
  cellRef: (el: HTMLDivElement | null) => void;
  className?: string;
}) {
  const Icon = benefit.icon;
  const { theme } = benefit;
  const spotRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    spotRef.current.style.background = `radial-gradient(320px circle at ${x}px ${y}px, ${theme.glow}, transparent 72%)`;
    spotRef.current.style.opacity = "1";
  };

  const handleLeave = () => {
    if (!spotRef.current) return;
    spotRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={cellRef}
      className={`why-bento-card group relative flex flex-col overflow-hidden rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 sm:p-6 ${className ?? ""}`}
      style={{
        boxShadow:
          "0 2px 8px rgba(86, 47, 24, 0.05), 0 12px 32px rgba(86, 47, 24, 0.07)",
        willChange: "transform",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* cursor spotlight */}
      <div
        ref={spotRef}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        aria-hidden
      />

      {/* gradient mesh */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: theme.mesh }}
        aria-hidden
      />

      {/* watermark icon */}
      <Icon
        className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 opacity-[0.06]"
        style={{ color: theme.accent }}
        strokeWidth={1}
        aria-hidden
      />

      {/* top row: index + icon */}
      <div className="relative flex items-start justify-between gap-3">
        <span
          className="font-display text-[11px] font-bold tabular-nums tracking-[0.16em]"
          style={{ color: "var(--text-tertiary)" }}
        >
          0{index + 1}
        </span>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          style={{
            background: theme.iconGradient,
            boxShadow: `0 8px 24px -6px ${theme.glow}`,
          }}
        >
          <Icon className="h-5 w-5 text-[#fbf7f1]" strokeWidth={2} />
        </div>
      </div>

      <span
        className="relative mt-2.5 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ background: theme.tagBg, color: theme.tagColor }}
      >
        {benefit.tag}
      </span>

      {/* copy */}
      <div className="relative mt-3 flex flex-col">
        <h3
          className="font-display text-lg font-bold leading-tight tracking-tight"
          style={{ color: "var(--text)" }}
        >
          {benefit.title}
        </h3>
        <p
          className="mt-2 text-sm leading-[1.65]"
          style={{ color: "var(--text-secondary)" }}
        >
          {benefit.desc}
        </p>
      </div>
    </div>
  );
}