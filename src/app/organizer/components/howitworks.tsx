"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  UserPlus,
  ShieldCheck,
  MapPin,
  Banknote,
  Compass,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your account",
    desc: "Sign up as an organizer, describe your business, and choose the destinations you run. No upfront fee — your profile is free to create.",
    detail: "Takes about 5 minutes",
    tag: "Free to start",
    visual: {
      label: "Organizer profile",
      fields: [
        { l: "Full name", v: "Kwame Asante" },
        { l: "Business type", v: "Tour operator" },
        { l: "Base city", v: "Accra, Ghana" },
        { l: "Destinations", v: "Volta, Ashanti, Northern" },
      ],
    },
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Get verified",
    desc: "Upload your Ghana Card or business registration documents. Our team reviews your submission — most approvals complete within 1–2 business days.",
    detail: "One-time process",
    tag: "1–2 business days",
    visual: {
      label: "Verification status",
      fields: [
        { l: "Ghana Card", v: "✓ Submitted" },
        { l: "Business reg.", v: "✓ Submitted" },
        { l: "Review status", v: "In progress…" },
        { l: "Badge", v: "Pending approval" },
      ],
    },
  },
  {
    number: "03",
    icon: MapPin,
    title: "Publish your trips",
    desc: "Use the trip builder to add itineraries, pricing tiers, group capacity, departure dates, photos, and optional add-ons like transport or accommodation.",
    detail: "No listing fee",
    tag: "Unlimited listings",
    visual: {
      label: "Trip builder",
      fields: [
        { l: "Destination", v: "Wli Waterfalls, Volta" },
        { l: "Dates", v: "Aug 2 – Aug 4" },
        { l: "Seats available", v: "18 of 20" },
        { l: "Price per person", v: "GHS 850" },
      ],
    },
  },
  {
    number: "04",
    icon: Banknote,
    title: "Accept bookings & withdraw",
    desc: "Track attendees, send group updates, and receive automatic payouts to your MoMo wallet or bank account when your trip confirms.",
    detail: "Payouts in 1–3 days",
    tag: "Auto payouts",
    visual: {
      label: "Payout dashboard",
      fields: [
        { l: "Trip revenue", v: "GHS 15,300" },
        { l: "Platform fee", v: "GHS 765 (5%)" },
        { l: "Your payout", v: "GHS 14,535" },
        { l: "Status", v: "✓ Sent to MoMo" },
      ],
    },
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {

      /* ── progress line draws down as you scroll ── */
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 80%",
            scrub: 0.5,
          },
        }
      );

      /* ── each step: left text block slides in from left ── */
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              once: true,
              onEnter: () => setActiveStep(i),
            },
          }
        );
      });

      /* ── each card: slides in from right with 3-D flip ── */
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, x: 60, rotateY: -12, transformPerspective: 900 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: 0.1,
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              once: true,
            },
          }
        );
      });

      /* ── dots pulse when active ── */
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        ScrollTrigger.create({
          trigger: stepRefs.current[i],
          start: "top 65%",
          end: "bottom 35%",
          onEnter: () => {
            setActiveStep(i);
            gsap.to(dot, { scale: 1.3, duration: 0.25, ease: "back.out(3)", yoyo: true, repeat: 1 });
          },
          onEnterBack: () => setActiveStep(i),
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="scroll-mt-32 relative overflow-hidden py-24"
      style={{ background: "var(--bg)" }}
    >
      {/* ── section header ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
            The journey to your first payout
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
            Four steps from sign-up<br />to fully booked.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
            From creating your profile to withdrawing your first payout — here&apos;s exactly what to expect.
          </p>
        </div>

        {/* ── stepper body ── */}
        <div className="relative grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-20">

          {/* ── LEFT: step list ── */}
          <div className="relative">
            {/* vertical timeline spine */}
            <div
              className="absolute left-[19px] top-3 bottom-3 w-[2px] lg:left-[19px]"
              style={{ background: "var(--border)" }}
            >
              <div
                ref={lineRef}
                className="absolute inset-0 origin-top"
                style={{ background: "var(--gradient-brand)", transform: "scaleY(0)" }}
              />
            </div>

            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = activeStep === i;
                const isPast = i < activeStep;

                return (
                  <div
                    key={step.number}
                    ref={(el) => { stepRefs.current[i] = el; }}
                    className="relative flex gap-8 pb-16 last:pb-0"
                    style={{ opacity: 0 }}
                  >
                    {/* dot + icon */}
                    <div className="relative z-10 flex shrink-0 flex-col items-center">
                      <div
                        ref={(el) => { dotRefs.current[i] = el; }}
                        className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500"
                        style={{
                          background: isActive
                            ? "var(--gradient-brand)"
                            : isPast
                            ? "var(--primary)"
                            : "var(--surface)",
                          border: isActive || isPast
                            ? "none"
                            : "2px solid var(--border-strong)",
                          boxShadow: isActive
                            ? "0 0 0 4px var(--primary-dim)"
                            : "none",
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{
                            color: isActive || isPast ? "#fbf7f1" : "var(--text-tertiary)",
                          }}
                        />
                      </div>
                    </div>

                    {/* text content */}
                    <div className="min-w-0 pt-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="font-display text-xs font-black tracking-widest"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {step.number}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: "var(--gold-dim)",
                            color: "var(--gold)",
                          }}
                        >
                          {step.tag}
                        </span>
                      </div>

                      <h3
                        className="font-display mt-2 text-2xl font-bold transition-colors duration-300"
                        style={{ color: isActive ? "var(--primary)" : "var(--text)" }}
                      >
                        {step.title}
                      </h3>

                      <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
                        {step.desc}
                      </p>

                      <p
                        className="mt-4 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {step.detail}
                      </p>

                      {/* progress bar for active step */}
                      {isActive && (
                        <div
                          className="mt-4 h-0.5 rounded-full overflow-hidden"
                          style={{ background: "var(--border)", maxWidth: 200 }}
                        >
                          <div
                            className="h-full rounded-full animate-[shimmer_2s_linear_infinite]"
                            style={{
                              background: "var(--gradient-brand)",
                              width: "60%",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* final CTA below steps */}
            <div className="mt-12 pl-[72px]">
              <Link
                href="/organizer/login?mode=signup&redirect=/organizer/onboarding"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-[#fbf7f1] shadow-[var(--shadow-glow-gold)] transition-all duration-300 hover:scale-[1.03]"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Compass className="h-4 w-4" />
                Start your organizer journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ── RIGHT: sticky mock UI cards ── */}
          <div className="hidden lg:block">
            <div className="sticky top-32 space-y-4">
              {STEPS.map((step, i) => {
                const isActive = activeStep === i;
                return (
                  <div
                    key={step.number}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className="overflow-hidden rounded-2xl border transition-all duration-500"
                    style={{
                      opacity: isActive ? 1 : 0.28,
                      transform: isActive ? "scale(1)" : "scale(0.97)",
                      borderColor: isActive ? "var(--gold)" : "var(--border)",
                      background: "var(--surface)",
                      boxShadow: isActive ? "var(--shadow-glow-gold)" : "none",
                    }}
                  >
                    {/* card header */}
                    <div
                      className="flex items-center justify-between px-5 py-3"
                      style={{
                        background: isActive ? "var(--gradient-brand)" : "var(--surface-raised)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: isActive ? "rgba(251,247,241,0.7)" : "var(--text-tertiary)" }}
                      >
                        {step.visual.label}
                      </span>
                      <div className="flex gap-1.5">
                        {["#b5523a", "#d08a3c", "#6b3f1d"].map((c) => (
                          <span
                            key={c}
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: c, opacity: 0.6 }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* card body: field rows */}
                    <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                      {step.visual.fields.map(({ l, v }) => (
                        <div
                          key={l}
                          className="flex items-center justify-between px-5 py-3"
                        >
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {l}
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* active step: animated bottom bar */}
                    {isActive && (
                      <div
                        className="h-1"
                        style={{ background: "var(--gradient-brand)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}