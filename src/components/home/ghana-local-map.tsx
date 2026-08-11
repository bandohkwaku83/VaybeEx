import { useRef, useEffect } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ghanaMap from "@public/images/ghana-map.png";
import voltaPostcard from "@public/images/postcards/volta.jpg";
import northernPostcard from "@public/images/postcards/northen.jpg";
import capeCoastPostcard from "@public/images/postcards/cape_coast.jpg";
import lakePostcard from "@public/images/postcards/Lake.png";
import accraPostcard from "@public/images/postcards/accra.jpg";
import heroPostcard from "@public/images/hero2.png";

gsap.registerPlugin(ScrollTrigger);

type SpotSize = "sm" | "md" | "lg";

type TouristSpot = {
  id: string;
  image: StaticImageData;
  region: string;
  site: string;
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  size: SpotSize;
  rotate: number;
  float: number;
};

const TOURIST_SPOTS: TouristSpot[] = [
  {
    id: "northern",
    image: northernPostcard,
    region: "Northern",
    site: "Mole National Park",
    x: 88,
    y: 52,
    mapX: 166,
    mapY: 108,
    size: "lg",
    rotate: -6,
    float: 6,
  },
  {
    id: "volta",
    image: voltaPostcard,
    region: "Volta",
    site: "Wli Waterfalls",
    x: 302,
    y: 78,
    mapX: 232,
    mapY: 152,
    size: "md",
    rotate: 8,
    float: -5,
  },
  {
    id: "ashanti",
    image: lakePostcard,
    region: "Ashanti",
    site: "Lake Bosomtwe",
    x: 58,
    y: 158,
    mapX: 162,
    mapY: 192,
    size: "md",
    rotate: -4,
    float: 5,
  },
  {
    id: "accra",
    image: accraPostcard,
    region: "Accra",
    site: "Kwame Nkrumah Park",
    x: 308,
    y: 262,
    mapX: 212,
    mapY: 258,
    size: "lg",
    rotate: 5,
    float: -6,
  },
  {
    id: "cape-coast",
    image: capeCoastPostcard,
    region: "Cape Coast",
    site: "Cape Coast Castle",
    x: 72,
    y: 298,
    mapX: 128,
    mapY: 248,
    size: "sm",
    rotate: 7,
    float: 4,
  },
  {
    id: "western",
    image: heroPostcard,
    region: "Western",
    site: "Busua Beach",
    x: 252,
    y: 318,
    mapX: 142,
    mapY: 232,
    size: "md",
    rotate: -7,
    float: -4,
  },
];

const SIZE_STYLES: Record<
  SpotSize,
  { width: string; minWidth: number; maxWidth: number }
> = {
  sm: { width: "13%", minWidth: 44, maxWidth: 62 },
  md: { width: "15.5%", minWidth: 54, maxWidth: 76 },
  lg: { width: "18%", minWidth: 64, maxWidth: 90 },
};

const VIEWBOX = { w: 360, h: 380 };

function connectorPath(x: number, y: number, mapX: number, mapY: number) {
  const mx = (x + mapX) / 2;
  const my = (y + mapY) / 2;
  const dx = x - mapX;
  const dy = y - mapY;
  const cx = mx - dy * 0.18;
  const cy = my + dx * 0.18;
  return `M ${x} ${y} Q ${cx} ${cy} ${mapX} ${mapY}`;
}

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

export function GhanaLocalMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLImageElement>(null);
  const lineRefs = useRef<Array<SVGPathElement | null>>([]);
  const spotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeRingRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const playIntro = () => {
      if (playedRef.current) return;
      playedRef.current = true;

      if (mapRef.current) {
        gsap.fromTo(
          mapRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" },
        );
      }

      lineRefs.current.forEach((line, i) => {
        if (!line) return;
        const length = line.getTotalLength();
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(line, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: "power2.inOut",
          delay: 0.35 + i * 0.09,
        });
      });

      gsap.fromTo(
        spotRefs.current.filter(Boolean),
        { scale: 0, opacity: 0, rotation: (i) => TOURIST_SPOTS[i]?.rotate ?? 0 },
        {
          scale: 1,
          opacity: 1,
          rotation: (i) => TOURIST_SPOTS[i]?.rotate ?? 0,
          duration: 0.65,
          stagger: 0.11,
          ease: "back.out(1.7)",
          delay: 0.5,
        },
      );

      spotRefs.current.forEach((el, i) => {
        if (!el) return;
        const spot = TOURIST_SPOTS[i];
        gsap.to(el, {
          y: spot.float,
          duration: 2.8 + i * 0.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.6 + i * 0.15,
        });
      });

      const ring = activeRingRef.current;
      if (ring) {
        const tl = gsap.timeline({ repeat: -1, delay: 2 });
        TOURIST_SPOTS.forEach((spot, i) => {
          tl.call(() => {
            const el = spotRefs.current[i];
            if (!el || !ring) return;
            const rect = el.getBoundingClientRect();
            const parent = container.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) + 10;
            gsap.set(ring, {
              left: rect.left - parent.left + rect.width / 2 - size / 2,
              top: rect.top - parent.top + rect.height / 2 - size / 2,
              width: size,
              height: size,
              opacity: 1,
              scale: 1,
              rotation: spot.rotate,
            });
          });
          tl.to(ring, { scale: 1.05, duration: 0.35, ease: "power2.out" });
          tl.to({}, { duration: 2 });
          tl.to(ring, { opacity: 0, duration: 0.25, ease: "power2.in" });
        });
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top 88%",
        once: true,
        onEnter: playIntro,
      });

      gsap.to(container, {
        yPercent: -4,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, container);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (isInViewport(container)) playIntro();
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      aria-label="Animated map of Ghana with tourist destinations plotted by locals"
    >
      <div className="absolute inset-0">
        <svg
          viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <ellipse
            cx={180}
            cy={188}
            rx={118}
            ry={132}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1"
            strokeDasharray="3 9"
            opacity="0.2"
          />

          {TOURIST_SPOTS.map((spot, i) => (
            <path
              key={`line-${spot.id}`}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              d={connectorPath(spot.x, spot.y, spot.mapX, spot.mapY)}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="5 7"
              opacity="0.5"
            />
          ))}

          {TOURIST_SPOTS.map((spot) => (
            <circle
              key={`pin-${spot.id}`}
              cx={spot.mapX}
              cy={spot.mapY}
              r="3.5"
              fill="var(--gold)"
              opacity="0.85"
            />
          ))}
        </svg>

        <div className="absolute left-1/2 top-[49%] w-[44%] -translate-x-1/2 -translate-y-1/2">
          <img
            ref={mapRef}
            src={ghanaMap.src}
            alt=""
            className="h-auto w-full opacity-0"
            style={{ mixBlendMode: "multiply" }}
            aria-hidden="true"
          />
        </div>

        {TOURIST_SPOTS.map((spot, i) => {
          const size = SIZE_STYLES[spot.size];
          return (
            <div
              key={spot.id}
              ref={(el) => {
                spotRefs.current[i] = el;
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 opacity-0"
              style={{
                left: `${(spot.x / VIEWBOX.w) * 100}%`,
                top: `${(spot.y / VIEWBOX.h) * 100}%`,
                width: size.width,
                minWidth: size.minWidth,
                maxWidth: size.maxWidth,
                rotate: `${spot.rotate}deg`,
              }}
            >
              <div className="relative aspect-square w-full">
                <div className="absolute inset-0 overflow-hidden rounded-full border-[3px] border-white shadow-[0_10px_28px_-8px_rgba(74,42,18,0.4)]">
                  <Image
                    src={spot.image}
                    alt={`${spot.region} — ${spot.site}`}
                    fill
                    placeholder="blur"
                    sizes="140px"
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        ref={activeRingRef}
        className="pointer-events-none absolute rounded-full border-2 border-gold opacity-0"
        aria-hidden="true"
      />
    </div>
  );
}
