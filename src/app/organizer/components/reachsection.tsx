  //  <section
  //       id="reach"
  //       className="scroll-mt-32 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
  //     >
  //       <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
  //         <RevealBox>
  //           <SectionEyebrow>Reach ready travelers</SectionEyebrow>
  //           <h2 className="font-display mt-4 text-4xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
  //             Your trips, in front of people
  //             <br />
  //             already looking.
  //           </h2>
  //           <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
  //             A strong organizer profile turns first-time viewers into repeat
  //             bookers. VaybeEx surfaces your trips in search, on destination
  //             pages, and in curated picks.
  //           </p>

            
  //           <div
  //             className="mt-10 rounded-2xl border p-6"
  //             style={{
  //               borderColor: "var(--border)",
  //               background: "var(--surface)",
  //             }}
  //           >
  //             <div className="flex items-center gap-4">
  //               <div
  //                 className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-[#fbf7f1]"
  //                 style={{ background: "var(--gradient-brand)" }}
  //               >
  //                 KA
  //               </div>
  //               <div>
  //                 <p className="font-display font-bold text-[var(--text)]">
  //                   Kwame Asante Expeditions
  //                 </p>
  //                 <p className="text-sm text-[var(--text-secondary)]">
  //                   Verified organizer · Accra, Ghana
  //                 </p>
  //               </div>
  //               <div
  //                 className="ml-auto flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
  //                 style={{
  //                   background: "var(--gold-dim)",
  //                   color: "var(--gold)",
  //                 }}
  //               >
  //                 <Shield className="h-3 w-3" /> Verified
  //               </div>
  //             </div>
  //             <div
  //               className="mt-5 grid grid-cols-3 gap-4 border-t pt-5"
  //               style={{ borderColor: "var(--border)" }}
  //             >
  //               {[
  //                 ["14", "Trips run"],
  //                 ["4.9", "Rating"],
  //                 ["98%", "Response"],
  //               ].map(([v, l]) => (
  //                 <div key={l} className="text-center">
  //                   <p className="font-display text-2xl font-bold text-[var(--text)]">
  //                     {v}
  //                   </p>
  //                   <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
  //                     {l}
  //                   </p>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         </RevealBox>

  //         <RevealBox delay={0.15} className="space-y-4">
  //           {REACH_POINTS.map((pt, i) => (
  //             <div
  //               key={i}
  //               className="group flex items-start gap-5 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-gold)]"
  //               style={{
  //                 borderColor: "var(--border)",
  //                 background: "var(--surface)",
  //               }}
  //             >
  //               <div
  //                 className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
  //                 style={{ background: "var(--gold-dim)" }}
  //               >
  //                 <Sparkles
  //                   className="h-4 w-4"
  //                   style={{ color: "var(--gold)" }}
  //                 />
  //               </div>
  //               <div>
  //                 <p className="font-semibold text-[var(--text)]">{pt.label}</p>
  //                 <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
  //                   {pt.desc}
  //                 </p>
  //               </div>
  //             </div>
  //           ))}
  //         </RevealBox>
  //       </div>
  //     </section>




"use client";

import { useEffect, useRef, useState } from "react";
import {
  Shield,
  MapPin,
  Users,
  Heart,
  Bell,
  Star,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── card definitions ───────────────────────────────────── */
const CARDS = [
  {
    id: "homepage",
    icon: MapPin,
    accentColor: "#c4864c",
    tag: "Discovery",
    title: "Homepage placement",
    desc: "Your trips featured on the traveler homepage and curated destination pages — right where intent is highest.",
    stat: { value: "2.4×", label: "more views vs. unlisted" },
    size: "tall",   // spans 2 rows
  },
  {
    id: "profile",
    icon: Users,
    accentColor: "#6b3f1d",
    tag: "Trust",
    title: "Organizer profile",
    desc: "A public page with your bio, trip history, response rate, and verified reviews.",
    stat: { value: "89%", label: "profile-to-click rate" },
    size: "normal",
  },
  {
    id: "wishlist",
    icon: Heart,
    accentColor: "#b5523a",
    tag: "Retention",
    title: "Wishlist saves",
    desc: "Travelers save your trips and get nudged back when departure nears. Warm leads, automated.",
    stat: { value: "3.1×", label: "return booking rate" },
    size: "wide",   // spans 2 cols
  },
  {
    id: "alerts",
    icon: Bell,
    accentColor: "#c4864c",
    tag: "Engagement",
    title: "Alerts & nudges",
    desc: "SMS and email notifications sent at the exact moments travelers decide.",
    stat: { value: "41%", label: "average open rate" },
    size: "normal",
  },
  {
    id: "reviews",
    icon: Star,
    accentColor: "#d08a3c",
    tag: "Social proof",
    title: "Review signals",
    desc: "Authentic ratings appear everywhere your trip is shown.",
    stat: { value: "4.8", label: "average organizer rating" },
    size: "normal",
  },
  {
    id: "ranking",
    icon: TrendingUp,
    accentColor: "#6b3f1d",
    tag: "Algorithm",
    title: "Search ranking",
    desc: "High-responding, well-reviewed organizers rank first. The better you perform, the more you're promoted.",
    stat: { value: "60%", label: "of clicks go to top 10%" },
    size: "wide",
  },
] as const;

type CardId = (typeof CARDS)[number]["id"];

/* ─── tilt hook ─────────────────────────────────────────── */
function useTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -16;
      gsap.to(el, { rotateY: x, rotateX: y, scale: 1.025, duration: 0.25, ease: "power2.out", transformPerspective: 900 });
    };
    const onLeave = () => gsap.to(el, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.5, ease: "elastic.out(1,0.7)" });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);
}

/* ─── single masonry card ───────────────────────────────── */
function ReachCard({
  card,
  active,
  onEnter,
  onLeave,
  index,
}: {
  card: (typeof CARDS)[number];
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref);
  const Icon = card.icon;

  /* ripple on click */
  const handleClick = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const max = Math.max(Math.hypot(x, y), Math.hypot(x - r.width, y), Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height));
    const ripple = document.createElement("div");
    ripple.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;z-index:20;
      width:${max * 2}px;height:${max * 2}px;left:${x - max}px;top:${y - max}px;
      background:radial-gradient(circle, ${card.accentColor}28 0%, transparent 70%);`;
    el.appendChild(ripple);
    gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.7, ease: "power2.out", onComplete: () => ripple.remove() });
  };

  const isWide = card.size === "wide";
  const isTall = card.size === "tall";

  return (
    <div
      className={`reach-card relative cursor-pointer overflow-hidden rounded-3xl border transition-all duration-300
        ${isWide ? "col-span-2" : "col-span-1"}
        ${isTall ? "row-span-2" : "row-span-1"}
      `}
      style={{
        background: active ? `linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)` : "var(--surface)",
        borderColor: active ? card.accentColor : "var(--border)",
        boxShadow: active
          ? `0 20px 60px -20px ${card.accentColor}40, 0 0 0 1px ${card.accentColor}30`
          : "0 2px 12px rgba(42,27,15,0.06)",
        opacity: 0,
        willChange: "transform",
        minHeight: isTall ? 360 : isWide ? 200 : 220,
      }}
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={handleClick}
    >
      {/* top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, ${card.accentColor} 0%, transparent 100%)`,
          opacity: active ? 1 : 0.4,
        }}
      />

      {/* spotlight radial on hover */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${card.accentColor}0e 0%, transparent 65%)`,
          opacity: active ? 1 : 0,
        }}
      />

      <div className={`relative z-10 flex h-full flex-col justify-between p-6 ${isTall ? "p-8" : ""}`}>

        {/* top: icon + tag */}
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300"
            style={{
              background: `${card.accentColor}18`,
              border: `1px solid ${card.accentColor}30`,
              transform: active ? "scale(1.1) rotate(-3deg)" : "scale(1)",
            }}
          >
            <Icon className="h-5 w-5" style={{ color: card.accentColor }} />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: `${card.accentColor}14`,
                color: card.accentColor,
                border: `1px solid ${card.accentColor}28`,
              }}
            >
              {card.tag}
            </span>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300"
              style={{
                background: active ? `${card.accentColor}18` : "transparent",
                border: `1px solid ${active ? card.accentColor + "40" : "var(--border)"}`,
              }}
            >
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-all duration-300"
                style={{
                  color: active ? card.accentColor : "var(--text-tertiary)",
                  transform: active ? "translate(1px,-1px)" : "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* middle: text */}
        <div className={isTall ? "mt-6" : "mt-4"}>
          <h3
            className="font-display font-bold leading-snug transition-colors duration-300"
            style={{
              fontSize: isTall ? "1.35rem" : "1.05rem",
              color: active ? "var(--text)" : "var(--text)",
            }}
          >
            {card.title}
          </h3>
          <p
            className="mt-2 leading-relaxed"
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              display: "-webkit-box",
              WebkitLineClamp: isTall ? 4 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {card.desc}
          </p>
        </div>

        {/* bottom: stat pill */}
        <div
          className="mt-5 flex items-center gap-2.5 rounded-2xl px-4 py-3 transition-all duration-300"
          style={{
            background: active ? `${card.accentColor}12` : "var(--primary-dim)",
            border: `1px solid ${active ? card.accentColor + "22" : "transparent"}`,
          }}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: card.accentColor }} />
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-black" style={{ color: card.accentColor }}>
              {card.stat.value}
            </span>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {card.stat.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main section ──────────────────────────────────────── */
export function ReachSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<CardId | null>(null);

  /* scroll-triggered entrance */
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {

      /* headline */
      gsap.fromTo(
        headRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true } }
      );

      /* cards stagger in with 3D flip */
      const cards = gridRef.current?.querySelectorAll(".reach-card");
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, rotateX: 14, transformPerspective: 1000 },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 0.8, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: gridRef.current, start: "top 80%", once: true },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="reach"
      ref={sectionRef}
      className="scroll-mt-32 relative overflow-hidden py-24"
      style={{ background: "var(--bg)" }}
    >
      {/* ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div style={{ position: "absolute", right: "5%", top: "8%", width: 560, height: 560, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,134,76,0.08) 0%, transparent 70%)", filter: "blur(64px)" }} />
        <div style={{ position: "absolute", left: "2%", bottom: "10%", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,63,29,0.06) 0%, transparent 70%)", filter: "blur(48px)" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── section header ── */}
        <div
          ref={headRef}
          className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          style={{ opacity: 0 }}
        >
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--gold)" }}>
              Reach ready travelers
            </p>
            <h2
              className="font-display font-black leading-[0.92] tracking-tight"
              style={{ fontSize: "clamp(2.8rem, 5vw, 4.8rem)", color: "var(--text)" }}
            >
              Your trips, in front
              <br />of people{" "}
              <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                already looking.
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-5 lg:max-w-sm">
            <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              A strong organizer profile turns first-time viewers into repeat
              bookers. VaybeEx surfaces your trips in search, destination pages,
              and curated picks.
            </p>

            {/* organizer badge */}
            <div
              className="flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: "var(--gradient-brand)", color: "#fbf7f1" }}
              >
                KA
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>
                  Kwame Asante Expeditions
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Verified organizer · Accra, Ghana
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ background: "var(--gold-dim)", color: "var(--gold)" }}>
                <Shield className="h-3 w-3" /> Verified
              </div>
            </div>

            {/* stats row */}
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              {[["14", "Trips run"], ["4.9★", "Rating"], ["98%", "Response"]].map(([v, l], i) => (
                <div key={l} className={`py-4 text-center ${i > 0 ? "border-l" : ""}`}
                  style={{ borderColor: "var(--border)" }}>
                  <p className="font-display text-xl font-black" style={{ color: "var(--text)" }}>{v}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── masonry card grid ──
            4-column grid. Cards with size="wide" span 2 cols,
            size="tall" spans 2 rows. Creates the asymmetric masonry look.
        ── */}
        <div
          ref={gridRef}
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridAutoRows: "minmax(220px, auto)",
          }}
        >
          {/* Row 1: tall(col1, rows1-2) | normal(col2) | normal(col3) | normal(col4) */}
          {/* Row 2:                     | wide(col2-3)                 | normal(col4) */}
          {/* Row 3: wide(col1-2)        |              normal(col3)    | normal(col4) */}

          {/* Card 0 — Homepage (tall, col 1, rows 1-2) */}
          <div style={{ gridColumn: "1", gridRow: "1 / 3" }}>
            <ReachCard
              card={CARDS[0]}
              active={activeCard === CARDS[0].id}
              onEnter={() => setActiveCard(CARDS[0].id)}
              onLeave={() => setActiveCard(null)}
              index={0}
            />
          </div>

          {/* Card 1 — Organizer profile (normal, col 2, row 1) */}
          <div style={{ gridColumn: "2", gridRow: "1" }}>
            <ReachCard
              card={CARDS[1]}
              active={activeCard === CARDS[1].id}
              onEnter={() => setActiveCard(CARDS[1].id)}
              onLeave={() => setActiveCard(null)}
              index={1}
            />
          </div>

          {/* Card 2 — Wishlist (wide, cols 3-4, row 1) */}
          <div style={{ gridColumn: "3 / 5", gridRow: "1" }}>
            <ReachCard
              card={CARDS[2]}
              active={activeCard === CARDS[2].id}
              onEnter={() => setActiveCard(CARDS[2].id)}
              onLeave={() => setActiveCard(null)}
              index={2}
            />
          </div>

          {/* Card 3 — Alerts (wide, cols 2-3, row 2) */}
          <div style={{ gridColumn: "2 / 4", gridRow: "2" }}>
            <ReachCard
              card={CARDS[3]}
              active={activeCard === CARDS[3].id}
              onEnter={() => setActiveCard(CARDS[3].id)}
              onLeave={() => setActiveCard(null)}
              index={3}
            />
          </div>

          {/* Card 4 — Reviews (normal, col 4, row 2) */}
          <div style={{ gridColumn: "4", gridRow: "2" }}>
            <ReachCard
              card={CARDS[4]}
              active={activeCard === CARDS[4].id}
              onEnter={() => setActiveCard(CARDS[4].id)}
              onLeave={() => setActiveCard(null)}
              index={4}
            />
          </div>

          {/* Card 5 — Search ranking (wide, cols 1-2, row 3) */}
          <div style={{ gridColumn: "1 / 3", gridRow: "3" }}>
            <ReachCard
              card={CARDS[5]}
              active={activeCard === CARDS[5].id}
              onEnter={() => setActiveCard(CARDS[5].id)}
              onLeave={() => setActiveCard(null)}
              index={5}
            />
          </div>

          {/* CTA card (cols 3-4, row 3) */}
          <div style={{ gridColumn: "3 / 5", gridRow: "3" }}>
            <div
              className="relative h-full overflow-hidden rounded-3xl p-8 text-[#fbf7f1]"
              style={{ background: "var(--gradient-brand)", minHeight: 220 }}
            >
              {/* dot grid */}
              <div className="pointer-events-none absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle, #fbf7f1 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Zap className="h-5 w-5 text-[#fbf7f1]" />
                  </div>
                  <h3 className="font-display text-xl font-black leading-tight">
                    Ready to get discovered?
                  </h3>
                  <p className="mt-2 text-sm opacity-75">
                    Create your organizer profile and start appearing where travelers are looking.
                  </p>
                </div>
                <a
                  href="/organizer/login?mode=signup&redirect=/organizer/onboarding"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[#fbf7f1] px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:scale-[1.04]"
                  style={{ color: "var(--primary-dark)" }}
                >
                  Create account
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}