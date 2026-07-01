import { forwardRef, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import heroExplorer from "@public/images/hero-explorer.jpg";
import groupSafari from "@public/images/group-safari.jpg";
import portraitMarket from "@public/images/portrait-market.jpg";
import canopyWalk from "@public/images/canopy-walk.jpg";

import { platformHighlights } from "@/lib/mock-data";

gsap.registerPlugin(ScrollTrigger);

/* ── Polaroid rotation data ──────────────────────────────────────── */
interface PolaroidData {
  src: string;
  caption: string;
}

const POLAROIDS: PolaroidData[] = [
  { src: canopyWalk.src, caption: "Kakum · Day 2" },
  { src: portraitMarket.src, caption: "Makola, Accra" },
  { src: groupSafari.src, caption: "Mole NP · Sunset" },
];

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
  { xPct: 8,  yPct: 4,  rot: -3, scale: 1.08, z: 30 }, // active / front, centered + lowered slightly
  { xPct: 70, yPct: 2,  rot: 7,  scale: 0.84, z: 20 }, // queued, upper right
  { xPct: 22, yPct: 46, rot: -9, scale: 0.78, z: 10 }, // back, lower-middle — stays inside the stack box
];

/* ── Polaroid card ───────────────────────────────────────────────── */
interface PolaroidProps {
  src: string;
  caption: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Polaroid = forwardRef<HTMLDivElement, PolaroidProps>(
  ({ src, caption, className, active, onClick, style }, ref) => {
    return (
      <figure
        ref={ref}
        onClick={onClick}
        className={`${className ?? ""} rounded-md bg-white p-3 pb-10 shadow-2xl ring-1 ring-black/5 cursor-pointer transition-shadow duration-300 ${
          active ? "ring-2 ring-[var(--gold)]" : ""
        }`}
        style={{ transformStyle: "preserve-3d", ...style }}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-raised">
          <img
            src={src}
            alt={caption}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {active && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[var(--gold)] shadow-[0_0_0_3px_rgba(196,134,76,0.3)]" />
          )}
        </div>
        <figcaption className="mt-2 px-1 text-center font-display text-[13px] font-semibold text-text">
          {caption}
        </figcaption>
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

  const [activeIndex, setActiveIndex] = useState(0);
  const [bgToggle, setBgToggle] = useState(false); // alternates which bg layer is "on top"

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const bgToggleRef = useRef(bgToggle);
  useEffect(() => {
    bgToggleRef.current = bgToggle;
  }, [bgToggle]);

  /* ── Entrance + parallax animations ─────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Place every polaroid in its correct stack slot FIRST
      //    (instant, no animation) so the entrance tween below can
      //    animate relative to that — not from (0,0).
      POLAROIDS.forEach((_, i) => {
        const el = polaroidRefs.current[i];
        if (!el) return;
        const offset = (i - activeIndexRef.current + POLAROIDS.length) % POLAROIDS.length;
        const pos = STACK_POSITIONS[offset];
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

      // 2. Entrance fade/scale for the polaroid stack — animates
      //    relative to the slot position already set above.
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

  /* ── Initial background state (layer A = static hero image) ──── */
  useEffect(() => {
    if (bgLayerARef.current) {
      gsap.set(bgLayerARef.current, { autoAlpha: 1 });
      const img = bgLayerARef.current.querySelector("img");
      if (img) gsap.set(img, { scale: 1.06 });
    }
  }, []);

  /* ── Core swap logic: reorder polaroid stack + crossfade bg ──── */
  const swapTo = (nextIndex: number) => {
    if (nextIndex === activeIndexRef.current) return;
    setActiveIndex(nextIndex);

    const showingLayerIsA = !bgToggleRef.current;
    const showLayer = showingLayerIsA ? bgLayerBRef.current : bgLayerARef.current;
    const hideLayer = showingLayerIsA ? bgLayerARef.current : bgLayerBRef.current;
    setBgToggle((t) => !t);

    if (showLayer && hideLayer) {
      const showImg = showLayer.querySelector("img");
      const nextSrc = POLAROIDS[nextIndex].src;

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

    POLAROIDS.forEach((_, i) => {
      const el = polaroidRefs.current[i];
      if (!el) return;

      const isActive = i === nextIndex;
      const offset = (i - nextIndex + POLAROIDS.length) % POLAROIDS.length;
      const pos = STACK_POSITIONS[offset];

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

  /* ── Auto-swap interval ───────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      const next = (activeIndexRef.current + 1) % POLAROIDS.length;
      swapTo(next);
    }, SWAP_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const handlePolaroidClick = (i: number) => {
    swapTo(i);
  };

  const setPolaroidRef = (i: number) => (el: HTMLDivElement | null) => {
    polaroidRefs.current[i] = el;
  };

  return (
    <div>
      <section
        ref={heroRef}
        className="relative isolate overflow-hidden pt-28 sm:pt-32"
        style={{ perspective: 1400 }}
      >
        {/* ── Background photographic layers (crossfading pair) ──
            A warm-white scrim now sits over the photo (instead of a
            dark one) so the page's normal dark-on-light text tokens
            (text-text, text-text-secondary, text-primary) stay fully
            legible. The photo is still visible underneath — just
            veiled, like looking through frosted glass — so the hero
            keeps its photographic depth without fighting the copy. ── */}
        <div className="layer-bg absolute inset-0 -z-30">
          <div ref={bgLayerARef} className="absolute inset-0" style={{ opacity: 0 }}>
            <img
              src={heroExplorer.src}
              alt=""
              className="h-full w-full object-cover"
              style={{ willChange: "transform" }}
            />
          </div>
          <div ref={bgLayerBRef} className="absolute inset-0" style={{ opacity: 0 }}>
            <img
              src={POLAROIDS[0].src}
              alt=""
              className="h-full w-full object-cover"
              style={{ willChange: "transform" }}
            />
          </div>

          {/* Primary white veil — strongest over the left/top copy
              area, easing off toward the polaroid stack on the right
              so the photos there stay vivid and readable. */}
          <div
            className="absolute inset-0"
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
          {/* faint warm tint to keep the veil from reading as pure
              grey/white and to stay cohesive with the brand palette */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(196,134,76,0.06)", mixBlendMode: "multiply" }}
          />
        </div>

        <div
          className="layer-mid absolute inset-0 -z-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 30%, rgba(196,134,76,0.16), transparent 70%)",
          }}
        />

        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 sm:px-6 sm:pb-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          {/* Left: copy — back to the page's normal dark-on-light
              tokens (text-text / text-text-secondary / text-primary)
              now that the background behind this column is a pale
              warm-white veil rather than a dark or photo-only layer. */}
          <div className="layer-fg relative">
            <span className="hero-meta inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
              <Sparkles size={12} /> West Africa · Est. 2025
            </span>

            <h1 className="mt-6 font-display text-[14vw] font-bold leading-[0.92] tracking-tight text-text sm:text-7xl lg:text-[7.2rem]">
              <span className="block overflow-hidden">
                <span className="hero-word inline-block">Wander</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-word inline-block italic font-light text-gradient-warm">
                  far,
                </span>{" "}
                <span className="hero-word inline-block">together.</span>
              </span>
            </h1>

            <p className="hero-sub mt-7 max-w-md text-base leading-relaxed text-text-secondary sm:text-lg">
              Group expeditions across Ghana &amp; West Africa — waterfalls,
              safaris, kente markets, coastline. Hosted by locals who know every
              backroad and where the best banku is served.
            </p>

            <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/login/traveller"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-teal px-7 py-4 text-sm font-semibold text-primary-foreground glow-teal-strong transition-transform hover:-translate-y-0.5"
              >
                Start exploring
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <a
                href="#journal"
                className="rounded-full border border-border-strong bg-surface/70 px-7 py-4 text-sm font-semibold text-text backdrop-blur transition-colors hover:bg-surface"
              >
                See the journal
              </a>
            </div>

            <div className="hero-meta mt-10 flex items-center gap-6">
              <div className="flex -space-x-2.5">
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
              <div className="text-xs text-text-secondary">
                <div className="font-display text-sm font-bold text-text">
                  <span data-count="2400" data-suffix="+">
                    0
                  </span>{" "}
                  travellers
                </div>
                on board this season
              </div>
            </div>
          </div>

          {/* Right: 3D polaroid stack — interactive + auto-swapping */}
          <div
            className="relative mx-auto h-[460px] w-full max-w-md sm:h-[560px]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* All three cards share the SAME base box (inset-0, same width)
                so GSAP's xPercent/yPercent/scale are the only thing moving
                them — this is what keeps the stack spacing regular. */}
            {POLAROIDS.map((p, i) => (
              <Polaroid
                key={p.caption}
                ref={setPolaroidRef(i)}
                src={p.src}
                caption={p.caption}
                active={i === activeIndex}
                onClick={() => handlePolaroidClick(i)}
                className="polaroid absolute top-0 left-0 w-[60%]"
                style={{ zIndex: 30 - i * 10, transformOrigin: "top left" }}
              />
            ))}

            <span className="polaroid absolute -right-2 bottom-20 z-40 rounded-full bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-primary-foreground glow-teal">
              ✦ 47 trips live now
            </span>
          </div>
        </div>

        {/* Stat ticker */}
        <div className="relative border-y border-border bg-surface-raised/70 py-5 backdrop-blur">
          <div className="hide-scrollbar overflow-hidden">
            <div className="flex w-max animate-marquee gap-14 px-6 font-display text-lg font-semibold text-text/85">
              {[...platformHighlights, ...platformHighlights, ...platformHighlights].map(
                (h, i) => (
                  <span key={i} className="inline-flex items-center gap-2.5">
                    <span className="text-gradient-brand text-2xl">
                      {h.value.toLocaleString()}
                      {h.suffix}
                    </span>
                    <span className="text-sm font-medium text-text-secondary">
                      {h.label}
                    </span>
                    <span className="text-text-tertiary">✦</span>
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;