"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import organizerHero from "@public/images/organizer-hero.png";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { icon: MapPin, value: "120+", label: "Destinations" },
  { icon: Users, value: "4,800+", label: "Travelers booked" },
  { icon: TrendingUp, value: "GHS 2M+", label: "Paid to organizers" },
];

/* Decorative SVG compass-rose path used as an ambient background mark */
const CompassRose = () => (
  <svg
    viewBox="0 0 320 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="pointer-events-none select-none"
  >
    <circle cx="160" cy="160" r="158" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" />
    <circle cx="160" cy="160" r="110" stroke="currentColor" strokeWidth="0.75" />
    <circle cx="160" cy="160" r="60" stroke="currentColor" strokeWidth="0.5" />
    {/* Cardinal spokes */}
    {[0, 45, 90, 135].map((deg) => (
      <line
        key={deg}
        x1="160" y1="2" x2="160" y2="318"
        stroke="currentColor" strokeWidth="0.6"
        transform={`rotate(${deg} 160 160)`}
      />
    ))}
    {/* North arrow */}
    <polygon points="160,40 154,160 160,148 166,160" fill="currentColor" opacity="0.9" />
    <polygon points="160,280 154,160 160,172 166,160" fill="currentColor" opacity="0.3" />
    <text x="155" y="28" fontSize="11" fontWeight="700" fill="currentColor" opacity="0.7">N</text>
  </svg>
);

export default function OrganizerHero() {
  const sectionRef    = useRef<HTMLElement>(null);
  const bgImageRef    = useRef<HTMLDivElement>(null);
  const bgOverlayRef  = useRef<HTMLDivElement>(null);
  const headlineRef   = useRef<HTMLHeadingElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);
  const statsRef      = useRef<HTMLDivElement>(null);
  const compassRef    = useRef<HTMLDivElement>(null);
  const mapLineRef    = useRef<SVGPathElement>(null);
  const contentRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── background image: slow Ken-Burns zoom-in on load ── */
      if (bgImageRef.current) {
        gsap.fromTo(
          bgImageRef.current,
          { scale: 1.18, opacity: 0 },
          { scale: 1.06, opacity: 1, duration: 2.2, ease: "power2.out" }
        );

        /* continued slow drift while idle */
        gsap.to(bgImageRef.current, {
          scale: 1.12,
          duration: 18,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        /* parallax: image moves slower than scroll for depth */
        gsap.to(bgImageRef.current, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (bgOverlayRef.current) {
        gsap.fromTo(
          bgOverlayRef.current,
          { opacity: 0.92 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      /* ── content: subtle parallax lift + fade as it scrolls away ── */
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          yPercent: -22,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      /* ── entrance sequence ── */
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.3 });

      tl.fromTo(headlineRef.current,
          { opacity: 0, y: 40, clipPath: "inset(0 0 100% 0)" },
          { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 1.1 }
        )
        .fromTo(ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(statsRef.current?.children ? Array.from(statsRef.current.children) : [],
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
          "-=0.3"
        );

      /* ── compass slow spin ── */
      gsap.to(compassRef.current, {
        rotation: 360,
        duration: 120,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });

      /* ── map SVG path draw on scroll ── */
      if (mapLineRef.current) {
        const length = mapLineRef.current.getTotalLength();
        gsap.set(mapLineRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(mapLineRef.current, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom center",
            scrub: 1.2,
          },
        });
      }

      /* ── compass parallax on scroll ── */
      gsap.to(compassRef.current, {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* ══════════════════════════════════════════════════
          BACKGROUND IMAGE LAYER
      ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={bgImageRef}
          className="absolute inset-0 h-full w-full"
          style={{ willChange: "transform" }}
        >
          <Image
            src={organizerHero}
            alt="Resort cottages by a calm pond with lush tropical greenery"
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Overlay — darkens photo for text contrast while keeping the scene visible */}
        <div ref={bgOverlayRef} className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(42,27,15,0.72) 0%, rgba(42,27,15,0.48) 38%, rgba(42,27,15,0.28) 62%, rgba(42,27,15,0.18) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(42,27,15,0.35) 0%, transparent 32%, transparent 58%, rgba(42,27,15,0.55) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(107,63,29,0.12)",
              mixBlendMode: "multiply",
            }}
          />
        </div>
      </div>

      {/* ── decorative route map SVG ── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.22]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 700"
        aria-hidden="true"
      >
        {/* Dotted longitude / latitude grid */}
        {[100, 200, 300, 400, 500, 600].map((y) => (
          <line key={y} x1="0" y1={y} x2="1200" y2={y}
            stroke="var(--primary)" strokeWidth="0.5" strokeDasharray="3 12" opacity="0.2" />
        ))}
        {[150, 350, 550, 750, 950, 1150].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="700"
            stroke="var(--primary)" strokeWidth="0.5" strokeDasharray="3 12" opacity="0.2" />
        ))}
        {/* Animated journey path: Accra → Kumasi → Tamale → Bolgatanga */}
        <path
          ref={mapLineRef}
          d="M 200 580 C 280 480, 360 440, 440 360 C 520 280, 580 260, 680 200 C 760 150, 820 120, 940 100"
          stroke="var(--gold)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Destination dots */}
        {[[200, 580], [440, 360], [680, 200], [940, 100]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5" fill="var(--gold)" opacity="0.9" />
            <circle cx={cx} cy={cy} r="10" fill="var(--gold)" opacity="0.2" />
          </g>
        ))}
      </svg>

      {/* ── ambient compass rose (top-right) ── */}
      <div
        ref={compassRef}
        className="pointer-events-none absolute -right-16 -top-16 h-[420px] w-[420px] text-primary opacity-[0.1]"
      >
        <CompassRose />
      </div>

      {/* ── main content ── */}
      <div
        ref={contentRef}
        className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
        style={{ willChange: "transform" }}
      >
        <div className="max-w-3xl">

          {/* headline */}
          <h1
            ref={headlineRef}
            className="font-display text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ opacity: 0, color: "#fbf7f1" }}
          >
            Lead the journey.{" "}
            <span className="block italic font-light text-gradient-warm">
              Fill every seat.
            </span>
          </h1>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="mt-10 flex flex-wrap items-center gap-3"
            style={{ opacity: 0 }}
          >
            <Button
              size="lg"
              asChild
              className="border-0 px-7 text-primary-foreground shadow-[var(--glow-gold)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[var(--glow-teal-strong)]"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Link href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
                Create organizer account
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              asChild
              className="border backdrop-blur"
              style={{
                borderColor: "rgba(251,247,241,0.35)",
                background: "rgba(251,247,241,0.1)",
                color: "#fbf7f1",
              }}
            >
              <Link href="/organizer/login?redirect=/organizer/dashboard">
                Sign in to portal
              </Link>
            </Button>
          </div>

          {/* stats strip */}
          <div
            ref={statsRef}
            className="mt-16 flex flex-wrap gap-x-10 gap-y-6 border-t pt-8"
            style={{ borderColor: "rgba(251,247,241,0.2)" }}
          >
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(196,134,76,0.22)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--gold)" }} />
                </div>
                <div>
                  <p className="font-display text-xl font-bold" style={{ color: "#fbf7f1" }}>
                    {value}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(251,247,241,0.65)" }}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── scroll cue ── */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.25em]"
          style={{ color: "rgba(251,247,241,0.55)" }}
        >
          Scroll
        </span>
        <div
          className="h-9 w-[1px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(251,247,241,0.55), transparent)",
          }}
        />
      </div>

      {/* ── bottom fade into next section ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
      />
    </section>
  );
}