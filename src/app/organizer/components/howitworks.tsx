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
    screen: "Organizer profile",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Get verified",
    desc: "Upload your Ghana Card or business registration documents. Our team reviews your submission — most approvals complete within 1–2 business days.",
    detail: "One-time process",
    tag: "1–2 business days",
    screen: "Verification",
  },
  {
    number: "03",
    icon: MapPin,
    title: "Publish your trips",
    desc: "Use the trip builder to add itineraries, pricing tiers, group capacity, departure dates, photos, and optional add-ons like transport or accommodation.",
    detail: "No listing fee",
    tag: "Unlimited listings",
    screen: "Trip builder",
  },
  {
    number: "04",
    icon: Banknote,
    title: "Accept bookings & withdraw",
    desc: "Track attendees, send group updates, and receive automatic payouts to your MoMo wallet or bank account when your trip confirms.",
    detail: "Payouts in 1–3 days",
    tag: "Auto payouts",
    screen: "Payouts",
  },
] as const;

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

      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.from(el, {
          opacity: 0,
          x: -40,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            once: true,
          },
        });

        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
        });
      });

      cardRefs.current.forEach((el) => {
        if (!el) return;
        gsap.from(el, {
          opacity: 0,
          x: 48,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            once: true,
          },
        });
      });

      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        ScrollTrigger.create({
          trigger: stepRefs.current[i],
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () =>
            gsap.to(dot, { scale: 1.3, duration: 0.25, ease: "back.out(3)", yoyo: true, repeat: 1 }),
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="scroll-mt-32 relative overflow-hidden bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
            The journey to your first payout
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
            Four steps from sign-up
            <br />
            to fully booked.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
            From creating your profile to withdrawing your first payout — here&apos;s exactly what to expect.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-20">
          {/* LEFT: timeline */}
          <div className="relative">
            <div
              className="absolute left-[19px] top-3 bottom-3 w-[2px]"
              style={{ background: "var(--border)" }}
            >
              <div
                ref={lineRef}
                className="absolute inset-0 origin-top"
                style={{ background: "var(--gradient-brand)", transform: "scaleY(0)" }}
              />
            </div>

            <div className="space-y-0">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = activeStep === i;
                const isPast = i < activeStep;

                return (
                  <div
                    key={s.number}
                    ref={(el) => { stepRefs.current[i] = el; }}
                    className="relative flex gap-8 pb-16 last:pb-0"
                  >
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
                          border: isActive || isPast ? "none" : "2px solid var(--border-strong)",
                          boxShadow: isActive ? "0 0 0 4px var(--primary-dim)" : "none",
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: isActive || isPast ? "#fbf7f1" : "var(--text-tertiary)" }}
                        />
                      </div>
                    </div>

                    <div className="min-w-0 pt-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="font-display text-xs font-black tracking-widest"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {s.number}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
                        >
                          {s.tag}
                        </span>
                      </div>

                      <h3
                        className="font-display mt-2 text-2xl font-bold transition-colors duration-300"
                        style={{ color: isActive ? "var(--primary)" : "var(--text)" }}
                      >
                        {s.title}
                      </h3>

                      <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>

                      <p
                        className="mt-4 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {s.detail}
                      </p>

                      {/* mobile: screen attached to step */}
                      <div className="mt-6 lg:hidden">
                        <StepScreenCard index={i} isActive />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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

          {/* RIGHT: one screen card per step */}
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              {STEPS.map((s, i) => {
                const isActive = activeStep === i;
                return (
                  <div
                    key={s.number}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className="transition-all duration-500"
                    style={{
                      opacity: isActive ? 1 : 0.3,
                      transform: isActive ? "scale(1)" : "scale(0.98)",
                      filter: isActive ? "none" : "grayscale(20%)",
                    }}
                  >
                    <StepScreenCard index={i} isActive={isActive} />
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

function StepScreenCard({ index, isActive }: { index: number; isActive: boolean }) {
  const step = STEPS[index];
  const Icon = step.icon;

  return (
    <div
      className="overflow-hidden rounded-2xl border transition-colors duration-500"
      style={{
        borderColor: isActive ? "var(--gold)" : "var(--border)",
        background: "var(--surface)",
        boxShadow: isActive ? "var(--shadow-glow-gold)" : "none",
      }}
    >
      <div
        className="flex items-center gap-3 border-b px-5 py-3.5"
        style={{
          borderColor: "var(--border)",
          background: isActive ? "var(--gradient-brand)" : "var(--surface-raised)",
        }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: isActive ? "rgba(251,247,241,0.2)" : "var(--primary-dim)",
          }}
        >
          <Icon
            className="h-4 w-4"
            style={{ color: isActive ? "#fbf7f1" : "var(--primary)" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: isActive ? "rgba(251,247,241,0.65)" : "var(--text-tertiary)" }}
          >
            Step {step.number}
          </p>
          <p
            className="truncate font-display text-sm font-bold"
            style={{ color: isActive ? "#fbf7f1" : "var(--text)" }}
          >
            {step.screen}
          </p>
        </div>
      </div>

      <div className="p-4">
        <StepScreenContent index={index} />
      </div>

      {isActive && (
        <div className="h-1" style={{ background: "var(--gradient-brand)" }} />
      )}
    </div>
  );
}

function StepScreenContent({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <div className="space-y-3">
          <div
            className="flex items-center gap-3 rounded-xl border p-3"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-[#fbf7f1]"
              style={{ background: "var(--gradient-brand)" }}
            >
              KA
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Kwame Asante</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Tour operator · Accra</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: "Business type", v: "Tour operator" },
              { l: "Base city", v: "Accra" },
              { l: "Destinations", v: "3 regions" },
              { l: "Profile", v: "85% done" },
            ].map((row) => (
              <div
                key={row.l}
                className="rounded-lg border px-2.5 py-2"
                style={{ borderColor: "var(--border-subtle)", background: "var(--surface)" }}
              >
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                  {row.l}
                </p>
                <p className="mt-0.5 text-xs font-semibold" style={{ color: "var(--text)" }}>{row.v}</p>
              </div>
            ))}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
            <div className="h-full w-[85%] rounded-full" style={{ background: "var(--gradient-brand)" }} />
          </div>
        </div>
      );

    case 1:
      return (
        <div className="space-y-2">
          {[
            { label: "Ghana Card uploaded", status: "Approved", ok: true },
            { label: "Business registration", status: "Approved", ok: true },
            { label: "Identity review", status: "In review", ok: false, active: true },
            { label: "Verified badge", status: "Pending", ok: false },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border px-3 py-2.5"
              style={{
                borderColor: item.active ? "var(--gold)" : "var(--border-subtle)",
                background: item.active ? "var(--gold-dim)" : "var(--bg-secondary)",
              }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{item.label}</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  background: item.ok ? "var(--primary-dim)" : item.active ? "var(--gold-dim)" : "var(--surface-raised)",
                  color: item.ok ? "var(--primary)" : item.active ? "var(--gold)" : "var(--text-tertiary)",
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      );

    case 2:
      return (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
          <div
            className="h-24 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/postcards/volta.jpg)" }}
          />
          <div className="space-y-2.5 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>
                  Wli Waterfalls Weekend
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Aug 2 – 4 · Volta Region</p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-[#fbf7f1]"
                style={{ background: "var(--gradient-brand)" }}
              >
                Live
              </span>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                <span>Seats booked</span>
                <span>18 / 20</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                <div className="h-full w-[90%] rounded-full" style={{ background: "var(--gradient-brand)" }} />
              </div>
            </div>
            <p className="font-display text-lg font-black" style={{ color: "var(--text)" }}>
              GHS 850 <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>/ person</span>
            </p>
          </div>
        </div>
      );

    case 3:
      return (
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--primary-dark)", color: "#fbf7f1" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(251,247,241,0.55)" }}>
            Available payout
          </p>
          <p className="font-display mt-1 text-2xl font-black">GHS 14,535</p>
          <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: "rgba(251,247,241,0.12)" }}>
            {[
              { l: "Trip revenue", v: "GHS 15,300" },
              { l: "Platform fee", v: "− GHS 765" },
            ].map((row) => (
              <div key={row.l} className="flex justify-between text-[11px]">
                <span style={{ color: "rgba(251,247,241,0.5)" }}>{row.l}</span>
                <span className="font-semibold">{row.v}</span>
              </div>
            ))}
          </div>
          <div
            className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
          >
            ✓ Sent to MTN MoMo
          </div>
        </div>
      );

    default:
      return null;
  }
}
