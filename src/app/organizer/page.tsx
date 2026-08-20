
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrganizerHero from "./components/organizerhero";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HowItWorks } from "./components/howitworks";
import Tools from "./components/tools";
import { PaymentsSection } from "./components/payment";
import { FAQSection } from "./components/faqsection";
import HorizontalSlider from "@/components/organizer/horizontal-slider";

gsap.registerPlugin(ScrollTrigger);

/* ─── HELPERS ────────────────────────────────────────────────────── */

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
      {children}
    </p>
  );
}

export function RevealBox({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 40, rotateX: 8 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.85,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      },
    );
  }, [delay]);
  return (
    <div
      ref={ref}
      style={{ opacity: 0, perspective: 800 }}
      className={className}
    >
      {children}
    </div>
  );
}

/* ─── PAGE ────────────────────────────────────────────────────────── */

export default function OrganizerLandingPage() {
  /* ── CTA: starburst reveal on scroll ── */
  const ctaBgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ctaBgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ctaBgRef.current,
        { clipPath: "circle(0% at 50% 50%)" },
        {
          clipPath: "circle(100% at 50% 50%)",
          duration: 1.4,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: ctaBgRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <OrganizerHero />

      {/* ══════════════════════════════════════════════════════
          WHY VAYBEEX
      ══════════════════════════════════════════════════════ */}

      {/* <WhySection /> */}

      {/* ══════════════════════════════════════════════════════
          How it Works  Vertical steper
      ══════════════════════════════════════════════════════ */}

      <HorizontalSlider />

      <HowItWorks />

      {/* ══════════════════════════════════════════════════════
          TOOLS — 3D tilt cards
      ══════════════════════════════════════════════════════ */}
      <Tools />

      <PaymentsSection />

      <FAQSection />

      {/* ══════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section
        id="get-started"
        className="scroll-mt-32 relative overflow-hidden border-t"
        style={{ borderColor: "var(--border)" }}
      >
        {/* background reveal */}
        <div
          ref={ctaBgRef}
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--gold) 100%)",
            clipPath: "circle(0% at 50% 50%)",
          }}
        />
        {/* decorative dots */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(251,247,241,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <RevealBox>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--gold)" }}
            >
              Ready?
            </p>
            <h2
              className="font-display mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
              style={{ color: "#fbf7f1" }}
            >
              Start your journey<br />as an organizer.
            </h2>
            <p
              className="mt-6 text-lg leading-relaxed"
              style={{ color: "rgba(251,247,241,0.7)" }}
            >
              Create your organizer account, complete verification, and publish
              your first experience. The portal opens after you sign in.
            </p>
          </RevealBox>

          <RevealBox delay={0.2} className="mt-10">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                asChild
                className="border-0 px-8 text-base font-bold text-[var(--primary-dark)] shadow-[var(--glow-gold)] transition-all duration-300 hover:scale-[1.04]"
                style={{ background: "#fbf7f1" }}
              >
                <Link href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
                  Create account
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="border px-8 text-base font-bold backdrop-blur"
                style={{
                  borderColor: "rgba(251,247,241,0.3)",
                  background: "rgba(251,247,241,0.08)",
                  color: "#fbf7f1",
                }}
              >
                <Link href="/organizer/login?redirect=/organizer/dashboard">
                  Sign in to portal
                </Link>
              </Button>
            </div>
          </RevealBox>

          <RevealBox delay={0.35} className="mt-10">
            <p
              className="text-sm"
              style={{ color: "rgba(251,247,241,0.45)" }}
            >
              Already exploring as a traveler?{" "}
              <Link
                href="/"
                className="underline underline-offset-2 transition-colors hover:text-[#fbf7f1]"
                style={{ color: "var(--gold)" }}
              >
                Return to trip listings
              </Link>
            </p>
          </RevealBox>
        </div>
      </section>
    </div>
  );
}
