"use client";

import { useEffect, useRef } from "react";
import { Check, CreditCard, Smartphone, Building2, Banknote, Clock } from "lucide-react";
import { RevealBox, SectionEyebrow } from "../page";
import CardSwap, { Card } from "./cardswap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PAYMENT_POINTS = [
  "Accept card, MTN MoMo, Vodafone Cash, AirtelTigo Money, and direct bank transfer",
  "Collect deposits to secure spots while travelers pay the balance later",
  "Offer instalment plans — reduce friction, increase conversion",
  "Automatic payouts when trips hit minimum capacity or departure date",
  "No hidden charges — one transparent commission per confirmed booking",
];

const SWAP_CARDS = [
  {
    icon: Smartphone,
    title: "Mobile Money",
    subtitle: "Instant collection",
    color: "var(--gold)",
    dimColor: "rgba(196,134,76,0.12)",
    items: [
      { label: "MTN MoMo",        status: "✓ Active",    dot: "#f5c069" },
      { label: "Vodafone Cash",   status: "✓ Active",    dot: "#e53935" },
      { label: "AirtelTigo Money",status: "✓ Active",    dot: "#1565c0" },
    ],
    footer: "Funds collected instantly on booking confirmation.",
  },
  {
    icon: CreditCard,
    title: "Card Payments",
    subtitle: "Visa & Mastercard",
    color: "#7c6af7",
    dimColor: "rgba(124,106,247,0.12)",
    items: [
      { label: "Visa",       status: "✓ Enabled",  dot: "#1a73e8" },
      { label: "Mastercard", status: "✓ Enabled",  dot: "#eb8c00" },
      { label: "3-D Secure", status: "✓ Protected",dot: "#2e7d32" },
    ],
    footer: "Secure card processing with built-in fraud protection.",
  },
  {
    icon: Building2,
    title: "Bank Transfer",
    subtitle: "GHS & foreign currency",
    color: "var(--primary)",
    dimColor: "rgba(107,63,29,0.12)",
    items: [
      { label: "GHS transfers",   status: "✓ Same day",  dot: "#6b3f1d" },
      { label: "USD / GBP",       status: "✓ Supported", dot: "#0f6e56" },
      { label: "Deposit holds",   status: "✓ Available", dot: "#c4864c" },
    ],
    footer: "International travelers can pay in their home currency.",
  },
  {
    icon: Banknote,
    title: "Payout Schedule",
    subtitle: "Automatic & reliable",
    color: "#2e7d32",
    dimColor: "rgba(46,125,50,0.12)",
    items: [
      { label: "Trip confirmed", status: "→ Auto trigger", dot: "#c4864c" },
      { label: "Processing time", status: "1–3 days",      dot: "#6b3f1d" },
      { label: "To MoMo / Bank",  status: "✓ Delivered",  dot: "#2e7d32" },
    ],
    footer: "Payouts trigger automatically once your trip hits minimum capacity.",
  },
];

export function PaymentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !counterRef.current) return;
    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      gsap.fromTo(obj, { val: 0 }, {
        val: 2.4,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        onUpdate() {
          if (counterRef.current) counterRef.current.textContent = `GHS ${obj.val.toFixed(1)}M+`;
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="payments"
      ref={sectionRef}
      className="scroll-mt-32 relative overflow-hidden"
      style={{ background: "var(--primary-dark)", color: "#fbf7f1" }}
    >
      {/* decorative dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(196,134,76,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.5,
        }}
      />
      {/* top fade */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to bottom, var(--primary-dark), transparent)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* ── LEFT: headline + counter + checklist ── */}
          <div>
            <RevealBox>
              <SectionEyebrow>Payments & payouts</SectionEyebrow>
              <h2
                className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl"
                style={{ color: "#fbf7f1" }}
              >
                Collect in cedis.<br />Withdraw the same day.
              </h2>
              <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgba(251,247,241,0.65)" }}>
                Travelers pay through VaybeEx using the methods they trust. You
                focus on the experience — we handle collection, receipts, and your payout.
              </p>

              {/* animated counter */}
             
            </RevealBox>

            {/* checklist */}
            <RevealBox delay={0.15} className="mt-10">
              <ul className="space-y-3">
                {PAYMENT_POINTS.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "rgba(251,247,241,0.78)" }}>
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "var(--gold)", color: "#2a1b0f" }}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </RevealBox>
          </div>

          {/* ── RIGHT: CardSwap stack ── */}
       
          <div className="" style={{ height: "600px", position: "relative" }}>
                  <CardSwap
                    cardDistance={20}
                    verticalDistance={70}
                    delay={5000}
                    pauseOnHover={false}
                    height={550}
                    width={500}
                  >
                    <Card>
                      <h3>Card 1</h3>
                      <p>Your content here</p>
                    </Card>
                    <Card>
                      <h3>Card 2</h3>
                      <p>Your content here</p>
                    </Card>
                    <Card>
                      <h3>Card 3</h3>
                      <p>Your content here</p>
                    </Card>
                  </CardSwap>
                </div>
          {/* <RevealBox
            delay={0.2}
            className="relative hidden lg:block h-[460px]"
          >
            
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ borderRadius: "1.5rem" }}
            >
              <CardSwap
                width={360}
                height={240}
                cardDistance={40}
                verticalDistance={28}
                delay={3200}
                pauseOnHover
                skewAmount={3}
                easing="elastic"
              >
                {SWAP_CARDS.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <Card
                      key={i}
                      customClass="overflow-hidden !border-0"
                      style={{
                        background: "var(--primary-dark)",
                        border: `1px solid rgba(251,247,241,0.1)`,
                      }}
                    >
                      
                      <div
                        className="flex items-center justify-between px-5 py-4"
                        style={{
                          background: card.dimColor,
                          borderBottom: "1px solid rgba(251,247,241,0.08)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: card.dimColor, border: `1px solid ${card.color}30` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: card.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-none" style={{ color: "#fbf7f1" }}>
                              {card.title}
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: "rgba(251,247,241,0.45)" }}>
                              {card.subtitle}
                            </p>
                          </div>
                        </div>
                        
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: `${card.color}20`, color: card.color }}
                        >
                          Live
                        </span>
                      </div>

                
                      <div className="divide-y" style={{ borderColor: "rgba(251,247,241,0.06)" }}>
                        {card.items.map(({ label, status, dot }) => (
                          <div key={label} className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{ background: dot }}
                              />
                              <span className="text-xs" style={{ color: "rgba(251,247,241,0.6)" }}>
                                {label}
                              </span>
                            </div>
                            <span
                              className="text-xs font-semibold"
                              style={{ color: "#fbf7f1" }}
                            >
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>

                      
                      <div
                        className="px-5 py-3"
                        style={{ borderTop: "1px solid rgba(251,247,241,0.06)" }}
                      >
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-3 w-3 shrink-0" style={{ color: "rgba(251,247,241,0.3)" }} />
                          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(251,247,241,0.4)" }}>
                            {card.footer}
                          </p>
                        </div>
                      </div>

                      
                      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
                    </Card>
                  );
                })}
              </CardSwap>
            </div>
          </RevealBox> */}
        </div>
      </div>
    </section>
  );
}