import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import heroExplorer from "@public/images/hero-explorer.jpg";
import groupSafari from "@public/images/group-safari.jpg";
import coastAerial from "@public/images/coast-aerial.jpg";
import canopyWalk from "@public/images/canopy-walk.jpg";
import portraitMarket from "@public/images/portrait-market.jpg";

import { MapPin, X, ArrowUpRight, Compass } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Postcard {
  src: { src: string };
  place: string;
  region: string;
  blurb: string;
  tag: string;
}

const POSTCARDS: Postcard[] = [
  {
    src: heroExplorer,
    place: "Wli Waterfalls",
    region: "Volta Region",
    tag: "Postcard 01",
    blurb:
      "Ghana's tallest waterfall, tucked into the Agumatsa range. A 45-minute forest trail opens onto a curtain of falling water, with fruit bats circling the cliffs above.",
  },
  {
    src: groupSafari,
    place: "Mole National Park",
    region: "Northern Ghana",
    tag: "Postcard 02",
    blurb:
      "Elephants at dawn, antelope grazing the savanna, and a watering hole that draws the whole park together at golden hour. Ghana's largest wildlife refuge.",
  },
  {
    src: coastAerial,
    place: "Cape Coast",
    region: "Central Region",
    tag: "Postcard 03",
    blurb:
      "Whitewashed castle walls against the Atlantic, fishing canoes pulled up on black sand, and a history that every traveller should sit with at least once.",
  },
  {
    src: canopyWalk,
    place: "Kakum Canopy Walk",
    region: "Central Region",
    tag: "Postcard 04",
    blurb:
      "Seven rope bridges strung 30 metres above the rainforest floor. Come for sunrise when mist still clings to the canopy and the forest is just waking up.",
  },
  {
    src: portraitMarket,
    place: "Makola Market",
    region: "Accra",
    tag: "Postcard 05",
    blurb:
      "West Africa's beating commercial heart — kente cloth stalls, fresh produce towers, and a current of people that never quite slows down, day or night.",
  },
];

/* card heights vary slightly so the fan reads like a hand-dealt deck,
   matching the reference image's uneven card silhouette */
const CARD_HEIGHTS = [340, 380, 410, 380, 340];
const CARD_ROTATIONS = [-9, -4, 0, 5, 10];

const Journal = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalImgRef = useRef<HTMLDivElement>(null);
  const modalTextRefs = useRef<Array<HTMLElement | null>>([]);

  /* duplicate the deck so the marquee loop is seamless */
  const loopCards = [...POSTCARDS, ...POSTCARDS];

  /* ── Continuous right-to-left auto-scroll ───────────────────── */
  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;

    const ctx = gsap.context(() => {
      // measure one full set's width after layout
      requestAnimationFrame(() => {
        const singleSetWidth = track.scrollWidth / 2;
        gsap.set(track, { x: 0 });
        tweenRef.current = gsap.to(track, {
          x: -singleSetWidth,
          duration: 38,
          ease: "none",
          repeat: -1,
        });
      });

      // entrance: cards fan in from below with stagger
      gsap.fromTo(
        ".journal-card",
        { y: 100, opacity: 0, rotateZ: 0, scale: 0.85 },
        {
          y: 0,
          opacity: 1,
          rotateZ: (i: number) => CARD_ROTATIONS[i % CARD_ROTATIONS.length],
          scale: 1,
          duration: 1,
          stagger: 0.07,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );

      gsap.fromTo(
        ".journal-heading",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* pause the marquee on hover/interaction for control */
  const pauseMarquee = useCallback(() => {
    tweenRef.current?.pause();
  }, []);
  const resumeMarquee = useCallback(() => {
    if (activeIndex === null) tweenRef.current?.resume();
  }, [activeIndex]);

  /* ── Open modal: pop the clicked card out with animated text ─── */
  const openCard = (loopIdx: number) => {
    const realIdx = loopIdx % POSTCARDS.length;
    setActiveIndex(realIdx);
    tweenRef.current?.pause();
  };

  const closeCard = () => {
    if (!overlayRef.current) {
      setActiveIndex(null);
      return;
    }
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setActiveIndex(null);
        tweenRef.current?.resume();
      },
    });
  };

  /* animate modal in whenever activeIndex changes */
  useEffect(() => {
    if (activeIndex === null) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" }
      );
      gsap.fromTo(
        modalImgRef.current,
        { scale: 0.85, opacity: 0, rotateZ: -4 },
        { scale: 1, opacity: 1, rotateZ: 0, duration: 0.6, ease: "expo.out", delay: 0.05 }
      );
      gsap.fromTo(
        modalTextRefs.current.filter(Boolean),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "expo.out", delay: 0.2 }
      );
    });
    return () => ctx.revert();
  }, [activeIndex]);

  /* esc to close */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCard();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const active = activeIndex !== null ? POSTCARDS[activeIndex] : null;

  return (
    <section
      id="journal"
      ref={sectionRef}
      className="relative w-screen overflow-hidden bg-bg-secondary py-20 sm:py-28"
      style={{
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
      }}
    >
      {/* ── Heading ── */}
      <div className="journal-heading relative z-10 mx-auto mb-14 max-w-3xl px-4 text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
          <Compass size={12} /> Field journal
        </span>
        <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-text sm:text-6xl">
          Postcards from the road
        </h2>
        <p className="mt-4 text-base text-text-secondary sm:text-lg">
          Tap any card to read its story. The deck keeps drifting while you browse.
        </p>
      </div>

      {/* ── Auto-scrolling fan-of-cards marquee ── */}
      <div
        className="relative w-full"
        onMouseEnter={pauseMarquee}
        onMouseLeave={resumeMarquee}
      >
        {/* edge fades so cards entering/exiting feel seamless */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 sm:w-40"
          style={{
            background:
              "linear-gradient(90deg, var(--bg-secondary) 0%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 sm:w-40"
          style={{
            background:
              "linear-gradient(270deg, var(--bg-secondary) 0%, transparent 100%)",
          }}
        />

        <div
          ref={trackRef}
          className="flex w-max items-end gap-6 px-10 sm:gap-10 sm:px-20"
          style={{ willChange: "transform" }}
        >
          {loopCards.map((p, i) => {
            const heightIdx = i % CARD_HEIGHTS.length;
            const height = CARD_HEIGHTS[heightIdx];
            const rot = CARD_ROTATIONS[heightIdx];

            return (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => openCard(i)}
                className="journal-card group relative shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-border-strong bg-surface shadow-2xl transition-transform duration-300 hover:-translate-y-3 hover:z-30"
                style={{
                  width: 230,
                  height,
                  transform: `rotateZ(${rot}deg)`,
                  transformOrigin: "bottom center",
                }}
              >
                <img
                  src={p.src.src}
                  alt={p.place}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    {p.tag}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold leading-tight text-white">
                    {p.place}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
                    <MapPin size={11} />
                    {p.region}
                  </p>
                </div>

                {/* hover hint */}
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Click-to-expand modal ── */}
      {active && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{
            background: "rgba(20,12,5,0.72)",
            backdropFilter: "blur(8px)",
          }}
          onClick={closeCard}
        >
          <div
            className="relative grid w-full max-w-4xl gap-0 overflow-hidden rounded-[2rem] border border-border-strong bg-surface shadow-2xl sm:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* close button */}
            <button
              type="button"
              onClick={closeCard}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* image side */}
            <div
              ref={modalImgRef}
              className="relative h-72 overflow-hidden sm:h-full"
            >
              <img
                src={active.src.src}
                alt={active.place}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-transparent to-transparent sm:bg-gradient-to-r" />
            </div>

            {/* text side */}
            <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
              <span
                ref={(el) => {
                  modalTextRefs.current[0] = el;
                }}
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold"
              >
                {active.tag} · {active.region}
              </span>

              <h3
                ref={(el) => {
                  modalTextRefs.current[1] = el;
                }}
                className="font-display text-3xl font-bold leading-[1.05] text-text sm:text-4xl"
              >
                {active.place}
              </h3>

              <p
                ref={(el) => {
                  modalTextRefs.current[2] = el;
                }}
                className="text-base leading-relaxed text-text-secondary"
              >
                {active.blurb}
              </p>

              <div
                ref={(el) => {
                  modalTextRefs.current[3] = el;
                }}
                className="mt-2"
              >
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-teal px-6 py-3 text-sm font-semibold text-primary-foreground glow-teal transition-transform hover:-translate-y-0.5"
                >
                  See trips here
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Journal;