import { FadeInUp } from "../ui/fadeInUp";
import { Star } from "lucide-react";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Review = {
  name: string;
  city: string;
  trip: string;
  rating: number;
  quote: string;
  color: string;
};

const ROW_A: Review[] = [
  {
    name: "Abena Mensah",
    city: "Accra",
    trip: "Wli Waterfalls · 3 days",
    rating: 5,
    quote:
      "I cried at the second waterfall. Not even kidding. Our organiser Kojo knew every hidden pool — we swam where no tour bus ever goes.",
    color: "#6B3F1D",
  },
  {
    name: "Kwame Boateng",
    city: "Kumasi",
    trip: "Mole Safari · 5 days",
    rating: 5,
    quote:
      "Elephants 20 meters away. The bush walks at sunrise were unreal. Came back with 14 new friends and a thousand photos.",
    color: "#C4864C",
  },
  {
    name: "Ama Owusu",
    city: "Tema",
    trip: "Cape Coast Heritage · 4 days",
    rating: 5,
    quote:
      "The castle tour broke me open. Then jollof on the beach put me back together. Honestly the most meaningful trip I've ever taken.",
    color: "#B5523A",
  },
  {
    name: "Yaw Asante",
    city: "Takoradi",
    trip: "Kakum Canopy Walk · 2 days",
    rating: 5,
    quote:
      "Was terrified of heights. Did all seven bridges. The group hyped me up like family. MoMo payment was smooth, escrow felt safe.",
    color: "#4A2A12",
  },
  {
    name: "Akosua Darko",
    city: "Ho",
    trip: "Volta Region Loop · 6 days",
    rating: 5,
    quote:
      "Markets, monkeys, monasteries — somehow all in one week. Our chef sourced fish straight from her uncle. This isn't tourism, it's belonging.",
    color: "#D08A3C",
  },
  {
    name: "Kofi Annan",
    city: "Ada Foah",
    trip: "Ada River Estuary · 3 days",
    rating: 5,
    quote:
      "Sandbar sunsets, kayaking the estuary, drumming circle on night two. VaybeEx delivered exactly what the journal promised.",
    color: "#6B3F1D",
  },
];

const ROW_B: Review[] = [
  {
    name: "Esi Bonsu",
    city: "Sekondi",
    trip: "Busua Surf Camp · 4 days",
    rating: 5,
    quote:
      "First time surfing, ever. The instructor had me standing by day two. Group dinners on the beach every night — I didn't want to leave.",
    color: "#C4864C",
  },
  {
    name: "Nana Yeboah",
    city: "Koforidua",
    trip: "Boti Falls Day Trip · 1 day",
    rating: 5,
    quote:
      "Squeezed a full adventure into one day — twin falls, the umbrella rock, palm wine tapping. Driver was punctual to the minute.",
    color: "#B5523A",
  },
  {
    name: "Adwoa Frimpong",
    city: "Cape Coast",
    trip: "Elmina Sunset Cruise · 1 day",
    rating: 5,
    quote:
      "Watching the fishing boats come in at golden hour while live highlife played on deck. Paid the balance via Vodafone Cash, zero friction.",
    color: "#4A2A12",
  },
  {
    name: "Kojo Sarpong",
    city: "Tamale",
    trip: "Mognori Eco Village · 2 days",
    rating: 5,
    quote:
      "Slept in a mud-brick guesthouse, learned to shoot a bow with the local hunters. Nothing about it felt staged for tourists.",
    color: "#D08A3C",
  },
  {
    name: "Efua Ankrah",
    city: "Accra",
    trip: "Shai Hills Safari · 1 day",
    rating: 5,
    quote:
      "Baboons crossing the road right in front of our van, then a sunset hike up the ridge. Back in Accra by dinner. Perfect weekend trip.",
    color: "#6B3F1D",
  },
  {
    name: "Yaa Asantewaa",
    city: "Kumasi",
    trip: "Lake Bosomtwe Retreat · 3 days",
    rating: 5,
    quote:
      "Kayaked across the crater lake at sunrise, ate fresh tilapia every night. Already planning my next trip with the same organiser.",
    color: "#C4864C",
  },
];

gsap.registerPlugin(ScrollTrigger);

/**
 * ════════════════════════════════════════════════════════════════
 * TWO-ROW OPPOSING MARQUEE — infinite loop, scroll-paused on idle
 * ════════════════════════════════════════════════════════════════
 * Mechanics:
 * 1. Each row's content is rendered TWICE back-to-back. A row tween
 *    moves the track by exactly -50% (half its total width, i.e.
 *    one full copy) on an infinite, linear, no-easing loop. Because
 *    the second half is an identical copy of the first, the instant
 *    the track finishes that -50% journey it can snap back to 0%
 *    with zero visible seam — that's what makes it read as a truly
 *    endless scroll rather than a carousel that resets with a jump.
 * 2. Row A moves leftward (negative x), Row B moves rightward
 *    (positive x, starting pre-offset at -50% so it has room to
 *    travel right toward 0%) — opposing directions as requested.
 * 3. Hovering a ROW pauses that row's timeline only (gsap.timeScale
 *    tween to 0), the other row keeps moving — this is what makes
 *    it feel interactive/immersive rather than a static animated
 *    background; you can stop a row to actually read a card.
 * 4. Each individual card also gets a hover lift/scale, independent
 *    of the row pause, so even mid-scroll a card responds instantly
 *    to the cursor landing on it.
 * 5. Whole section reveals on scroll-into-view via ScrollTrigger.
 * ════════════════════════════════════════════════════════════════
 */

const ROW_SPEED_PX_PER_SEC = 38; // tune for faster/slower drift

function MarqueeRow({
  reviews,
  direction,
}: {
  reviews: Review[];
  direction: "left" | "right";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure one copy's width (half the full duplicated track)
    const fullWidth = track.scrollWidth;
    const oneCopyWidth = fullWidth / 2;
    const duration = oneCopyWidth / ROW_SPEED_PX_PER_SEC;

    let tween: gsap.core.Tween;

    if (direction === "left") {
      gsap.set(track, { x: 0 });
      tween = gsap.to(track, {
        x: -oneCopyWidth,
        duration,
        ease: "none",
        repeat: -1,
      });
    } else {
      // Start pre-shifted so rightward motion has somewhere to travel
      // FROM without revealing empty space at the left edge.
      gsap.set(track, { x: -oneCopyWidth });
      tween = gsap.to(track, {
        x: 0,
        duration,
        ease: "none",
        repeat: -1,
        // onRepeat snaps back to the start offset instantly — since
        // both halves are identical, this is the invisible seam.
        onRepeat: () => gsap.set(track, { x: -oneCopyWidth }),
      });
    }

    tweenRef.current = tween;
    return () => {
      tween.kill();
    };
  }, [direction]);

  const pause = () => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 0, duration: 0.4, ease: "power2.out" });
  };
  const resume = () => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 1, duration: 0.4, ease: "power2.out" });
  };

  // Render the review list twice, back to back, for the seamless loop
  const doubled = [...reviews, ...reviews];

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div ref={trackRef} className="flex w-max gap-6 will-change-transform">
        {doubled.map((r, i) => (
          <article
            key={i}
            className="review-marquee-card group relative flex h-[240px] w-[min(300px,82vw)] shrink-0 flex-col justify-between overflow-hidden rounded-lg border border-border px-5 py-5 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-border-strong hover:shadow-[0_28px_56px_-32px_rgba(74,42,18,0.55)] sm:h-[272px] sm:w-[360px] sm:px-7 sm:py-7"
            style={{
              backgroundColor: "var(--surface)",
              boxShadow: "0 18px 40px -28px rgba(74,42,18,0.35)",
            }}
          >
            {/* top accent — trip stamp */}
            <div className="flex items-start justify-between gap-4">
              <p
                className="max-w-[70%] text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary transition-colors duration-300 group-hover:text-text"
              >
                {r.trip}
              </p>
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125"
                style={{ backgroundColor: r.color }}
                aria-hidden
              />
            </div>

            <blockquote className="relative mt-5 flex-1">
              <span
                className="pointer-events-none absolute -left-1 -top-3 select-none font-display text-5xl leading-none transition-opacity duration-300"
                style={{ color: r.color, opacity: 0.28 }}
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="font-display text-[17px] font-medium italic leading-[1.4] text-text line-clamp-5 pl-1">
                {r.quote}
              </p>
            </blockquote>

            <footer className="mt-6 flex items-end justify-between gap-3 border-t border-border-subtle pt-4">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold leading-tight text-text">
                  {r.name}
                </p>
                <p className="mt-0.5 text-[11px] text-text-tertiary">{r.city}</p>
              </div>
              <div
                className="flex shrink-0 items-center gap-0.5"
                aria-label={`${r.rating} out of 5 stars`}
              >
                {Array.from({ length: r.rating }).map((_, k) => (
                  <Star
                    key={k}
                    size={10}
                    className="fill-gold text-gold opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  />
                ))}
              </div>
            </footer>

            {/* bottom color sweep on hover */}
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
              style={{ backgroundColor: r.color }}
              aria-hidden
            />
          </article>
        ))}
      </div>
    </div>
  );
}

const Reviews = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reviews-marquee-wrap", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden border-t border-border bg-bg py-14 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_15%,rgba(196,134,76,0.16),transparent_70%)]" />

      <div className="mx-auto mb-10 max-w-3xl px-4 text-center sm:mb-14 sm:px-6">
        <FadeInUp>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            Voices from the road
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-text sm:text-6xl">
            Stories{" "}
            <span className="italic font-light text-gradient-warm">
              they brought home.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary sm:mt-4 sm:text-base">
            <span className="sm:hidden">Tap a card to bring it forward.</span>
            <span className="hidden sm:inline">
              Hover a row to pause it, or hover any card to bring it forward.
            </span>
          </p>
        </FadeInUp>
      </div>

      {/* ── Two opposing marquee rows ──────────────────────────── */}
      <div className="reviews-marquee-wrap relative space-y-6 overflow-x-clip">
        {/* edge fades, shared across both rows */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-bg to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-bg to-transparent sm:w-32" />

        <MarqueeRow reviews={ROW_A} direction="left" />
        <MarqueeRow reviews={ROW_B} direction="right" />
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl items-center justify-center gap-2 px-4 text-xs text-text-tertiary sm:px-6">
        <span className="h-px w-12 bg-border" />
        <span className="font-semibold uppercase tracking-[0.22em]">
          2,400+ travellers · 4.9 average
        </span>
        <span className="h-px w-12 bg-border" />
      </div>
    </section>
  );
};

export default Reviews;