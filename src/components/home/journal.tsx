import { useRef, useEffect, useState, useCallback } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import voltaPostcard from "@public/images/postcards/volta.jpg";
import northernPostcard from "@public/images/postcards/northen.jpg";
import capeCoastPostcard from "@public/images/postcards/cape_coast.jpg";
import lakePostcard from "@public/images/postcards/Lake.png";
import accraPostcard from "@public/images/postcards/accra.jpg";

import { MapPin, X, ArrowUpRight, Compass } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Postcard {
  src: StaticImageData;
  region: string;
  tag: string;
  sites: string[];
}

const POSTCARDS: Postcard[] = [
  {
    src: voltaPostcard,
    region: "Volta Region",
    tag: "Postcard 01",
    sites: [
      "Wli Waterfalls",
      "Mount Afadja",
      "Tafi Atome Monkey Sanctuary",
      "Tagbo Falls",
      "Amedzofe canopy village",
      "Keta & Ada Foah coast",
    ],
  },
  {
    src: northernPostcard,
    region: "Northern Ghana",
    tag: "Postcard 02",
    sites: [
      "Mole National Park",
      "Larabanga Mosque",
      "Paga Crocodile Pond",
      "Gambaga Escarpment",
      "Tamale Cultural Centre",
      "Salaga slave market",
    ],
  },
  {
    src: capeCoastPostcard,
    region: "Central Region",
    tag: "Postcard 03",
    sites: [
      "Cape Coast Castle",
      "Elmina Castle",
      "Kakum National Park",
      "Kakum Canopy Walk",
      "Assin Manso Slave River",
      "Hans Cottage Botel",
    ],
  },
  {
    src: lakePostcard,
    region: "Ashanti Region",
    tag: "Postcard 04",
    sites: [
      "Lake Bosomtwe",
      "Manhyia Palace",
      "Kejetia Market",
      "Kumasi Fort & Military Museum",
      "Bonwire kente village",
      "Ntonso Adinkra village",
    ],
  },
  {
    src: accraPostcard,
    region: "Accra",
    tag: "Postcard 05",
    sites: [
      "Kwame Nkrumah Memorial Park",
      "Makola Market",
      "Jamestown",
      "Labadi Beach",
      "Black Star Square",
      "National Museum of Ghana",
    ],
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
      className="relative w-full overflow-x-clip bg-bg py-14 sm:py-28"
    >
      {/* ── Heading ── */}
      <div className="journal-heading relative z-10 mx-auto mb-10 max-w-3xl px-4 text-center sm:mb-14">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
          <Compass size={12} /> Field journal
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] text-text sm:text-6xl">
          Postcards from the road
        </h2>
        <p className="mt-3 text-sm text-text-secondary sm:mt-4 sm:text-lg">
          Tap any card to see some of the tourist sites in each region.
        </p>
      </div>

      {/* ── Auto-scrolling fan-of-cards marquee ── */}
      <div
        className="relative w-full overflow-x-clip"
        onMouseEnter={pauseMarquee}
        onMouseLeave={resumeMarquee}
      >
        {/* edge fades so cards entering/exiting feel seamless */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 sm:w-40"
          style={{
            background:
              "linear-gradient(90deg, var(--bg) 0%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 sm:w-40"
          style={{
            background:
              "linear-gradient(270deg, var(--bg) 0%, transparent 100%)",
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
                <Image
                  src={p.src}
                  alt={p.region}
                  fill
                  placeholder="blur"
                  sizes="230px"
                  draggable={false}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 via-primary-dark/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    {p.tag}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold leading-tight text-white">
                    {p.region}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
                    <MapPin size={11} />
                    Ghana
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
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-none bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* image side */}
            <div
              ref={modalImgRef}
              className="relative h-72 overflow-hidden sm:h-full"
            >
              <Image
                src={active.src}
                alt={active.region}
                fill
                placeholder="blur"
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
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
                {active.tag}
              </span>

              <h3
                ref={(el) => {
                  modalTextRefs.current[1] = el;
                }}
                className="font-display text-3xl font-bold leading-[1.05] text-text sm:text-4xl"
              >
                {active.region}
              </h3>

              <div
                ref={(el) => {
                  modalTextRefs.current[2] = el;
                }}
              >
                <p className="mb-3 text-sm font-medium text-text-secondary">
                  Some tourist sites in the region
                </p>
                <ul className="space-y-2">
                  {active.sites.map((site) => (
                    <li
                      key={site}
                      className="flex items-start gap-2 text-base leading-snug text-text"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {site}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                ref={(el) => {
                  modalTextRefs.current[3] = el;
                }}
                className="mt-2"
              >
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-none bg-gradient-teal px-6 py-3 text-sm font-semibold text-primary-foreground glow-teal transition-transform hover:-translate-y-0.5"
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