"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { differenceInDays, parseISO } from "date-fns";

import hero1 from "@public/images/hero1.png";
import hero2 from "@public/images/hero2.png";
import hero3 from "@public/images/hero3.png";

import { listPublicTrips } from "@/lib/api/public-trips";
import { getTripDetailHref } from "@/lib/tenant";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/* Hero photographic backdrop — independent of the trip polaroid stack. */
const HERO_BACKDROPS = [hero1.src, hero2.src, hero3.src];

/* ── Polaroid rotation data ──────────────────────────────────────── */
interface PolaroidData {
  src: string;
  caption: string;
  href?: string;
}

function tripHref(trip: Trip) {
  return getTripDetailHref(trip);
}

function tripToPolaroid(trip: Trip): PolaroidData | null {
  if (!trip.image?.trim()) return null;

  const start = parseISO(trip.startDate);
  const end = parseISO(trip.endDate);
  const days = Math.max(1, differenceInDays(end, start) + 1);
  const dest = trip.destination.split(",")[0]?.trim() || trip.title;
  const caption = days === 1 ? dest : `${dest} · ${days} days`;

  return {
    src: trip.image,
    caption,
    href: tripHref(trip),
  };
}

/** Latest 3 live trips (by start date) — never padded with placeholder images. */
function buildPolaroids(trips: Trip[]): PolaroidData[] {
  const latest = [...trips].sort(
    (a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  return latest
    .slice(0, 3)
    .map(tripToPolaroid)
    .filter((p): p is PolaroidData => p !== null);
}

function heroBackdropAt(index: number) {
  return HERO_BACKDROPS[index % HERO_BACKDROPS.length];
}

const SWAP_INTERVAL = 3800; // ms between auto-swaps

interface StackPosition {
  xPct: number;
  yPct: number;
  rot: number;
  scale: number;
  z: number;
}

/* All three polaroids share the SAME base position (inset-0, anchored
   top-left of the stack container) and GSAP moves them from there using
   xPercent/yPercent of their OWN width/height — this keeps spacing
   consistent regardless of each card's intrinsic size. */
const STACK_POSITIONS: StackPosition[] = [
  { xPct: 8, yPct: 4, rot: -3, scale: 1.08, z: 30 }, // active / front
  { xPct: 70, yPct: 2, rot: 7, scale: 0.84, z: 20 }, // queued, upper right
  { xPct: 22, yPct: 46, rot: -9, scale: 0.78, z: 10 }, // back, lower-middle
];

/** Tighter fan so cards stay inside a narrow phone column. */
const MOBILE_STACK_POSITIONS: StackPosition[] = [
  { xPct: 10, yPct: 2, rot: -3, scale: 1.02, z: 30 },
  { xPct: 42, yPct: 6, rot: 5, scale: 0.86, z: 20 },
  { xPct: 16, yPct: 34, rot: -7, scale: 0.8, z: 10 },
];

function getStackPositions(): StackPosition[] {
  if (typeof window === "undefined") return STACK_POSITIONS;
  return window.matchMedia("(min-width: 1024px)").matches
    ? STACK_POSITIONS
    : MOBILE_STACK_POSITIONS;
}

function LiveIndicator({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
  return (
    <span className={cn("relative flex shrink-0", dim)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      <span className={cn("relative inline-flex rounded-full bg-green-500", dim)} />
    </span>
  );
}

/* ── Polaroid card ───────────────────────────────────────────────── */
interface PolaroidProps {
  src: string;
  caption: string;
  href?: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Polaroid = forwardRef<HTMLDivElement, PolaroidProps>(
  ({ src, caption, href, className, active, onClick, style }, ref) => {
    const inner = (
      <>
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-raised">
          <img
            src={src}
            alt={caption}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {active && (
            <span className="absolute top-2 right-2">
              <LiveIndicator size="md" />
            </span>
          )}
        </div>
        <figcaption className="mt-1.5 px-0.5 text-center font-display text-[11px] font-semibold text-text sm:mt-2 sm:px-1 sm:text-[13px]">
          {caption}
        </figcaption>
      </>
    );

    return (
      <figure
        ref={ref}
        onClick={onClick}
        className={`${className ?? ""} rounded-md bg-white p-2 pb-7 shadow-xl ring-1 ring-black/5 cursor-pointer transition-shadow duration-300 sm:p-3 sm:pb-10 sm:shadow-2xl ${
          active ? "ring-2 ring-[var(--gold)]" : ""
        }`}
        style={{ transformStyle: "preserve-3d", ...style }}
      >
        {href ? (
          <a
            href={href}
            className="block"
            onClick={(e) => {
              // Inactive cards only cycle the stack; active opens the trip.
              if (!active) e.preventDefault();
            }}
          >
            {inner}
          </a>
        ) : (
          inner
        )}
      </figure>
    );
  }
);
Polaroid.displayName = "Polaroid";

/* ── Hero ────────────────────────────────────────────────────────── */
const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const journalRef = useRef<HTMLDivElement>(null);

  const bgLayerARef = useRef<HTMLDivElement>(null);
  const bgLayerBRef = useRef<HTMLDivElement>(null);
  const polaroidRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [polaroids, setPolaroids] = useState<PolaroidData[]>([]);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bgToggle, setBgToggle] = useState(false);

  const polaroidsRef = useRef(polaroids);
  useEffect(() => {
    polaroidsRef.current = polaroids;
  }, [polaroids]);

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const bgToggleRef = useRef(bgToggle);
  useEffect(() => {
    bgToggleRef.current = bgToggle;
  }, [bgToggle]);

  /* ── Load latest live trips for the polaroid stack (cards only) ─ */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listPublicTrips({ limit: 12 });
        if (cancelled) return;
        const trips = res.data?.trips ?? [];
        const total = res.data?.pagination?.total ?? trips.length;
        setLiveCount(total);
        setPolaroids(buildPolaroids(trips));
      } catch {
        if (!cancelled) {
          setLiveCount(null);
          setPolaroids([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Keep polaroid stack layout in sync when trips load.
     Backdrop always stays on folder hero art — never trip photos. */
  useEffect(() => {
    const len = polaroids.length;
    if (bgLayerARef.current) {
      const img = bgLayerARef.current.querySelector("img");
      if (img) img.setAttribute("src", HERO_BACKDROPS[0]);
      gsap.set(bgLayerARef.current, { autoAlpha: 1 });
    }
    if (bgLayerBRef.current) {
      const img = bgLayerBRef.current.querySelector("img");
      if (img) img.setAttribute("src", HERO_BACKDROPS[1]);
      gsap.set(bgLayerBRef.current, { autoAlpha: 0 });
    }
    if (len === 0) return;

    if (activeIndexRef.current >= len) {
      setActiveIndex(0);
      activeIndexRef.current = 0;
    }
    const active = activeIndexRef.current;

    polaroids.forEach((_, i) => {
      const el = polaroidRefs.current[i];
      if (!el) return;
      const offset = (i - active + len) % len;
      const positions = getStackPositions();
      const pos = positions[Math.min(offset, positions.length - 1)];
      gsap.set(el, {
        xPercent: pos.xPct,
        yPercent: pos.yPct,
        rotateZ: pos.rot,
        scale: pos.scale,
        zIndex: pos.z,
        opacity: 1,
      });
    });
  }, [polaroids]);

  /* ── Entrance + parallax animations ─────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      polaroidsRef.current.forEach((_, i) => {
        const el = polaroidRefs.current[i];
        if (!el) return;
        const offset =
          (i - activeIndexRef.current + polaroidsRef.current.length) %
          polaroidsRef.current.length;
        const positions = getStackPositions();
        const pos = positions[Math.min(offset, positions.length - 1)];
        gsap.set(el, {
          xPercent: pos.xPct,
          yPercent: pos.yPct,
          rotateZ: pos.rot,
          scale: pos.scale,
          zIndex: pos.z,
        });
      });

      gsap.from(".hero-word", {
        yPercent: 110,
        opacity: 0,
        rotate: 4,
        stagger: 0.08,
        duration: 1,
        ease: "expo.out",
        delay: 0.1,
      });

      gsap.from(".hero-sub, .hero-cta, .hero-meta", {
        y: 24,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: "expo.out",
        delay: 0.55,
      });

      gsap.from(".polaroid", {
        y: "+=80",
        opacity: 0,
        scale: "*=0.85",
        stagger: 0.12,
        duration: 1.2,
        ease: "expo.out",
        delay: 0.4,
      });

      gsap.to(".layer-mid", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".layer-fg", {
        yPercent: -8,
        scale: 1.04,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      const photos = gsap.utils.toArray<HTMLElement>(".journal-photo");
      if (photos.length && journalRef.current) {
        gsap.to(photos, {
          xPercent: -100 * (photos.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: journalRef.current,
            pin: true,
            scrub: 1,
            snap: 1 / (photos.length - 1),
            end: () => "+=" + journalRef.current!.offsetWidth * 1.2,
          },
        });
      }

      gsap.utils.toArray<HTMLElement>(".tilt-card").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 80, opacity: 0, rotateX: 18, rotateY: -6 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            rotateY: 0,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });

      gsap.to(".parallax-img", {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = parseFloat(el.dataset.count || "0");
        const suffix = el.dataset.suffix || "";
        gsap.fromTo(
          { v: 0 },
          { v: 0 },
          {
            v: target,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate(this: gsap.core.Tween) {
              const v = (this.targets()[0] as { v: number }).v;
              el.textContent = Math.round(v).toLocaleString() + suffix;
            },
          }
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /* ── Initial background state (layer A = hero artwork) ────────── */
  useEffect(() => {
    if (bgLayerARef.current) {
      gsap.set(bgLayerARef.current, { autoAlpha: 1 });
      const img = bgLayerARef.current.querySelector("img");
      if (img) gsap.set(img, { scale: 1.06 });
    }
  }, []);

  /* ── Core swap logic: reorder polaroid stack + crossfade bg ──── */
  const swapTo = (nextIndex: number) => {
    const cards = polaroidsRef.current;
    if (cards.length === 0) return;
    if (nextIndex === activeIndexRef.current) return;
    if (nextIndex < 0 || nextIndex >= cards.length) return;
    setActiveIndex(nextIndex);

    const showingLayerIsA = !bgToggleRef.current;
    const showLayer = showingLayerIsA ? bgLayerBRef.current : bgLayerARef.current;
    const hideLayer = showingLayerIsA ? bgLayerARef.current : bgLayerBRef.current;
    setBgToggle((t) => !t);

    if (showLayer && hideLayer) {
      const showImg = showLayer.querySelector("img");
      // Crossfade folder hero art only — trip photos stay on polaroid cards.
      const nextSrc = heroBackdropAt(nextIndex);

      if (showImg && showImg.getAttribute("src") !== nextSrc) {
        showImg.setAttribute("src", nextSrc);
      }
      if (showImg) {
        gsap.set(showImg, { scale: 1.14 });
        gsap.to(showImg, { scale: 1.06, duration: 2.6, ease: "power2.out" });
      }

      gsap.set(showLayer, { autoAlpha: 0 });
      gsap.to(showLayer, { autoAlpha: 1, duration: 1.4, ease: "power2.out" });
      gsap.to(hideLayer, { autoAlpha: 0, duration: 1.4, ease: "power2.out" });
    }

    cards.forEach((_, i) => {
      const el = polaroidRefs.current[i];
      if (!el) return;

      const isActive = i === nextIndex;
      const offset = (i - nextIndex + cards.length) % cards.length;
      const positions = getStackPositions();
      const pos = positions[Math.min(offset, positions.length - 1)];

      gsap.to(el, {
        xPercent: pos.xPct,
        yPercent: pos.yPct,
        rotateZ: pos.rot,
        scale: pos.scale,
        zIndex: pos.z,
        duration: 1,
        ease: "power3.inOut",
      });

      if (isActive) {
        gsap.fromTo(
          el,
          { boxShadow: "0 0 0 0 rgba(196,134,76,0)" },
          {
            boxShadow: "0 0 0 6px rgba(196,134,76,0.35)",
            duration: 0.4,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
          }
        );
      }
    });
  };

  /* ── Auto-swap interval (only when 2+ trip cards) ─────────────── */
  useEffect(() => {
    if (polaroids.length < 2) return;
    const id = setInterval(() => {
      const len = polaroidsRef.current.length;
      if (len < 2) return;
      const next = (activeIndexRef.current + 1) % len;
      swapTo(next);
    }, SWAP_INTERVAL);
    return () => clearInterval(id);
  }, [polaroids.length]);

  const handlePolaroidClick = (i: number) => {
    swapTo(i);
  };

  const setPolaroidRef = (i: number) => (el: HTMLDivElement | null) => {
    polaroidRefs.current[i] = el;
  };

  const liveLabel =
    liveCount === null
      ? "Trips live now"
      : liveCount === 1
        ? "1 trip live now"
        : `${liveCount} trips live now`;

  return (
    <div>
      <section
        ref={heroRef}
        className="relative isolate flex min-h-svh flex-col overflow-x-clip"
        style={{ perspective: 1400 }}
      >
        <div className="layer-bg absolute inset-0 -z-30">
          <div ref={bgLayerARef} className="absolute inset-0" style={{ opacity: 0 }}>
            <img
              src={HERO_BACKDROPS[0]}
              alt=""
              className="h-full w-full object-cover object-[center_28%] lg:object-center"
              style={{ willChange: "transform" }}
            />
          </div>
          <div ref={bgLayerBRef} className="absolute inset-0" style={{ opacity: 0 }}>
            <img
              src={HERO_BACKDROPS[1]}
              alt=""
              className="h-full w-full object-cover object-[center_28%] lg:object-center"
              style={{ willChange: "transform" }}
            />
          </div>

          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(251,247,241,0.88) 0%, rgba(251,247,241,0.35) 18%, rgba(20,12,6,0.12) 42%, rgba(20,12,6,0.5) 68%, rgba(20,12,6,0.82) 100%)",
            }}
          />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(251,247,241,0.25) 0%, rgba(251,247,241,0.2) 30%, rgba(251,247,241,0.2) 65%, rgba(251,247,241,0.2) 100%)",
            }}
          />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(251,247,241,0.55) 0%, rgba(251,247,241,0.22) 55%, rgba(251,247,241,0.05) 100%)",
            }}
          />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{ background: "rgba(196,134,76,0.06)", mixBlendMode: "multiply" }}
          />
        </div>

        <div
          className="layer-mid absolute inset-0 -z-20 pointer-events-none hidden lg:block"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 30%, rgba(196,134,76,0.16), transparent 70%)",
          }}
        />

        <div className="relative flex min-h-0 flex-1 flex-col justify-end px-5 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:justify-center lg:px-6">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <div className="layer-fg relative">
              <p className="hero-sub mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 lg:hidden">
                Group trips across Ghana
              </p>
              <h1 className="font-display text-[3.15rem] font-bold leading-[0.92] tracking-tight text-white sm:text-7xl lg:text-[7.2rem] lg:text-text">
                <span className="block overflow-hidden">
                  <span className="hero-word inline-block">Wander</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="hero-word inline-block italic font-light text-[var(--gold)] lg:text-gradient-warm">
                    far,
                  </span>{" "}
                  <span className="hero-word inline-block">together.</span>
                </span>
              </h1>

              <div className="hero-cta relative z-10 mt-7 flex flex-col gap-4 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                <Link
                  href="/login/traveller"
                  className="inline-flex w-full items-center justify-center rounded-none bg-white px-7 py-3.5 text-sm font-bold text-primary transition-all hover:-translate-y-0.5 sm:w-auto sm:px-8 sm:py-4 lg:bg-primary lg:text-primary-foreground lg:hover:brightness-110"
                >
                  Start exploring
                </Link>
                <a
                  href="#journal"
                  className="group inline-flex items-center justify-center gap-3 sm:justify-start"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-sm backdrop-blur-sm sm:h-11 sm:w-11 lg:bg-[var(--primary-dark)] lg:backdrop-blur-none">
                    <ArrowUpRight
                      className="h-5 w-5 text-[var(--gold)]"
                      strokeWidth={2.25}
                    />
                  </span>
                  <span className="text-sm font-semibold text-white transition-colors group-hover:text-white/80 lg:text-text lg:group-hover:text-primary">
                    See the journal
                  </span>
                </a>
              </div>

              <div className="hero-meta mt-8 flex items-center gap-3 lg:mt-10 lg:gap-6">
                <div className="hidden -space-x-2.5 lg:flex">
                  {["A", "K", "E", "Y"].map((c, i) => (
                    <span
                      key={c}
                      className="grid h-9 w-9 place-items-center rounded-full border-2 border-bg bg-gradient-warm text-xs font-bold text-white"
                      style={{ zIndex: 4 - i }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-white/70 lg:text-text-secondary">
                  <div className="font-display text-sm font-bold text-white lg:text-text">
                    <span data-count="2400" data-suffix="+">
                      0
                    </span>{" "}
                    travellers
                  </div>
                  on board this season
                </div>
              </div>
            </div>

            {/* Polaroid stack — desktop / large tablet only */}
            <div
              className="relative mx-auto hidden h-[460px] w-full max-w-md lg:block lg:h-[560px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {polaroids.map((p, i) => (
                <Polaroid
                  key={i}
                  ref={setPolaroidRef(i)}
                  src={p.src}
                  caption={p.caption}
                  href={p.href}
                  active={i === activeIndex}
                  onClick={() => handlePolaroidClick(i)}
                  className="polaroid absolute top-0 left-0 w-[60%]"
                  style={{ zIndex: 30 - i * 10, transformOrigin: "top left" }}
                />
              ))}

              <span className="polaroid absolute bottom-20 right-0 z-40 inline-flex items-center gap-2 rounded-full bg-[#f5f5f5] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-black">
                <LiveIndicator />
                {liveLabel}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
