"use client";

import { useEffect, useRef } from "react";
import { Globe, Users, Shield, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WHY_BENEFITS = [
  {
    icon: Globe,
    title: "Built for West Africa",
    desc: "Mobile money, local payment methods, and travelers who actively book group trips across Ghana and the region.",
  },
  {
    icon: Users,
    title: "Fill your trips faster",
    desc: "List on a marketplace where travelers search by destination, dates, and budget — and find you.",
  },
  {
    icon: Shield,
    title: "Trust that converts",
    desc: "Verified organizer badges, authentic reviews, and transparent seat counts help travelers book with confidence.",
  },
  {
    icon: TrendingUp,
    title: "Grow repeat business",
    desc: "Build a profile travelers return to. Past guests can review, rebook, and recommend your trips.",
  },
];

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

      /* ── benefit cells stagger up with 3-D flip ── */
      gsap.fromTo(
        cellRefs.current.filter(Boolean),
        { y: 48, opacity: 0, rotateX: 12, transformPerspective: 900 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
        }
      );

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

  /* ── card magnetic hover ── */
  useEffect(() => {
    const cards = cellRefs.current.filter(Boolean) as HTMLDivElement[];
    const cleanup: (() => void)[] = [];

    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -14;
        gsap.to(card, {
          rotateY: x,
          rotateX: y,
          scale: 1.02,
          duration: 0.35,
          ease: "power2.out",
          transformPerspective: 800,
        });
      };
      const onLeave = () =>
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.7)",
        });
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanup.push(() => {
        card.removeEventListener("mousemove", onMove);
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
        className="grid gap-3"
        style={{
          gridTemplateColumns: "1fr 1.35fr 1fr",
          gridTemplateRows: "auto auto auto",
        }}
      >
        {/* ── A: BIG HEADLINE PANEL (top-left, spans 1 col × 1 row) ── */}
        <div
          ref={headlineRef}
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 lg:p-10"
          style={{
            background: "var(--primary-dark)",
            gridColumn: "1",
            gridRow: "1 / 3",
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
          className="relative overflow-hidden rounded-3xl"
          style={{ gridColumn: "2", gridRow: "1 / 3", minHeight: 480 }}
        >
          <div
            ref={imageRef}
            className="absolute inset-0"
            style={{ opacity: 0 }}
          >
            {/* Ghana/adventure landscape illustration using CSS + SVG */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(160deg, #2a1b0f 0%, #4a2a12 40%, #6b3f1d 70%, #c4864c 100%)",
              }}
            />
            {/* Decorative SVG landscape silhouette */}
            <svg
              className="absolute bottom-0 left-0 right-0 w-full"
              viewBox="0 0 600 300"
              preserveAspectRatio="xMidYMax slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* distant mountains */}
              <path
                d="M0 220 L60 160 L120 200 L180 140 L240 180 L300 120 L360 170 L420 130 L480 165 L540 145 L600 160 L600 300 L0 300Z"
                fill="rgba(74,42,18,0.6)"
              />
              {/* mid mountains */}
              <path
                d="M0 260 L80 200 L160 240 L240 190 L320 230 L400 185 L480 215 L560 200 L600 210 L600 300 L0 300Z"
                fill="rgba(42,27,15,0.8)"
              />
              {/* baobab silhouette */}
              <rect x="88" y="195" width="8" height="65" fill="rgba(21,13,7,0.9)" rx="2" />
              <ellipse cx="92" cy="190" rx="24" ry="16" fill="rgba(21,13,7,0.9)" />
              <rect x="268" y="185" width="6" height="75" fill="rgba(21,13,7,0.85)" rx="2" />
              <ellipse cx="271" cy="180" rx="18" ry="13" fill="rgba(21,13,7,0.85)" />
              {/* foreground ground */}
              <path
                d="M0 280 Q150 270 300 278 Q450 286 600 274 L600 300 L0 300Z"
                fill="rgba(21,13,7,0.95)"
              />
            </svg>

            {/* golden sun */}
            <div
              className="absolute"
              style={{
                top: "18%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "radial-gradient(circle, #f5c069 0%, #c4864c 60%, transparent 100%)",
                boxShadow: "0 0 80px 30px rgba(196,134,76,0.3)",
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
          gridStyle={{ gridColumn: "3", gridRow: "1" }}
          dark={false}
        />

        {/* Benefit 1 — middle left (below headline) */}
        <BentoCell
          benefit={WHY_BENEFITS[1]}
          index={1}
          cellRef={(el) => { cellRefs.current[1] = el; }}
          gridStyle={{ gridColumn: "1", gridRow: "3" }}
          dark={true}
        />

        {/* Benefit 2 — middle right */}
        <BentoCell
          benefit={WHY_BENEFITS[2]}
          index={2}
          cellRef={(el) => { cellRefs.current[2] = el; }}
          gridStyle={{ gridColumn: "3", gridRow: "2" }}
          dark={false}
        />

        {/* ── D: BOTTOM BAND — image col + right col ── */}
        {/* Bottom center: stat band */}
        <div
          className="flex items-center justify-around rounded-3xl px-8 py-6"
          style={{
            gridColumn: "2",
            gridRow: "3",
            background: "var(--gold)",
          }}
        >
          {[
            { v: "120+", l: "Destinations" },
            { v: "4.8k+", l: "Travelers" },
            { v: "GHS 2M+", l: "Paid out" },
          ].map(({ v, l }) => (
            <div key={l} className="text-center">
              <p className="font-display text-2xl font-black" style={{ color: "var(--primary-dark)" }}>{v}</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(42,27,15,0.65)" }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Benefit 3 — bottom right */}
        <BentoCell
          benefit={WHY_BENEFITS[3]}
          index={3}
          cellRef={(el) => { cellRefs.current[3] = el; }}
          gridStyle={{ gridColumn: "3", gridRow: "3" }}
          dark={false}
        />
      </div>

      {/* ── Mobile fallback: simple 2-col grid ── */}
      <style>{`
        @media (max-width: 768px) {
          #why-bento {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto !important;
          }
          #why-bento > * {
            grid-column: auto !important;
            grid-row: auto !important;
          }
          #why-bento .bento-image-panel {
            grid-column: 1 / -1 !important;
            min-height: 240px !important;
          }
          #why-bento .bento-headline-panel {
            grid-column: 1 / -1 !important;
          }
          #why-bento .bento-stat-band {
            grid-column: 1 / -1 !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ─── BENTO CELL COMPONENT ──────────────────────────────────── */
function BentoCell({
  benefit,
  index,
  cellRef,
  gridStyle,
  dark,
}: {
  benefit: (typeof WHY_BENEFITS)[0];
  index: number;
  cellRef: (el: HTMLDivElement | null) => void;
  gridStyle: React.CSSProperties;
  dark: boolean;
}) {
  const Icon = benefit.icon;

  return (
    <div
      ref={cellRef}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-7"
      style={{
        ...gridStyle,
        background: dark ? "var(--text)" : "var(--surface)",
        border: dark ? "none" : "1px solid var(--border)",
        minHeight: 200,
        opacity: 0,
        willChange: "transform",
      }}
    >
      {/* hover shimmer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: dark
            ? "radial-gradient(circle at 30% 30%, rgba(196,134,76,0.08) 0%, transparent 60%)"
            : "radial-gradient(circle at 30% 30%, rgba(107,63,29,0.04) 0%, transparent 60%)",
        }}
      />

      {/* top: index label + icon */}
      <div className="relative flex items-start justify-between">
        <span
          className="font-display text-xs font-bold"
          style={{ color: dark ? "rgba(251,247,241,0.25)" : "var(--text-tertiary)" }}
        >
          0{index + 1}
        </span>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: dark ? "rgba(196,134,76,0.15)" : "var(--gold-dim)",
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color: dark ? "var(--gold)" : "var(--gold)" }}
          />
        </div>
      </div>

      {/* bottom: text */}
      <div className="relative mt-6">
        <h3
          className="font-display text-base font-bold leading-snug"
          style={{ color: dark ? "#fbf7f1" : "var(--text)" }}
        >
          {benefit.title}
        </h3>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: dark ? "rgba(251,247,241,0.55)" : "var(--text-secondary)" }}
        >
          {benefit.desc}
        </p>
      </div>

      {/* bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
        style={{ background: "var(--gradient-brand)" }}
      />
    </div>
  );
}