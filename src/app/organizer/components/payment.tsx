"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { RevealBox, SectionEyebrow } from "../page";
// import CardSwap, { Card } from "./cardswap";
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

/** Verified Unsplash images — thematic per payment method */
const img = (id: string, w = 900, h = 1100) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&q=85&auto=format&fit=crop`;

const PAYMENT_IMAGES = [
  {
    label: "Mobile Money",
    tag: "MoMo · Vodafone · AirtelTigo",
    src: img("photo-1556742049-0cfed4f6a45d"),
    alt: "Person making a mobile payment on a smartphone",
    className: "col-start-1 row-start-1 row-span-2",
  },
  {
    label: "Card payments",
    tag: "Visa · Mastercard",
    src: img("photo-1563013544-824ae1b704d3", 600, 500),
    alt: "Hands holding a credit card for online payment",
    className: "col-start-2 row-start-1",
  },
  {
    label: "Instant payout",
    tag: "1–3 day transfer",
    src: img("photo-1579621970563-ebec7560ff3e", 600, 500),
    alt: "Mobile banking and digital wallet on a phone",
    className: "col-start-2 row-start-2",
  },
] as const;

// const SWAP_CARDS = [
//   {
//     icon: Smartphone,
//     title: "Mobile Money",
//     subtitle: "Instant collection",
//     color: "var(--gold)",
//     dimColor: "rgba(196,134,76,0.12)",
//     items: [
//       { label: "MTN MoMo",        status: "✓ Active",    dot: "#f5c069" },
//       { label: "Vodafone Cash",   status: "✓ Active",    dot: "#e53935" },
//       { label: "AirtelTigo Money",status: "✓ Active",    dot: "#1565c0" },
//     ],
//     footer: "Funds collected instantly on booking confirmation.",
//   },
//   {
//     icon: CreditCard,
//     title: "Card Payments",
//     subtitle: "Visa & Mastercard",
//     color: "#7c6af7",
//     dimColor: "rgba(124,106,247,0.12)",
//     items: [
//       { label: "Visa",       status: "✓ Enabled",  dot: "#1a73e8" },
//       { label: "Mastercard", status: "✓ Enabled",  dot: "#eb8c00" },
//       { label: "3-D Secure", status: "✓ Protected",dot: "#2e7d32" },
//     ],
//     footer: "Secure card processing with built-in fraud protection.",
//   },
//   {
//     icon: Building2,
//     title: "Bank Transfer",
//     subtitle: "GHS & foreign currency",
//     color: "var(--primary)",
//     dimColor: "rgba(107,63,29,0.12)",
//     items: [
//       { label: "GHS transfers",   status: "✓ Same day",  dot: "#6b3f1d" },
//       { label: "USD / GBP",       status: "✓ Supported", dot: "#0f6e56" },
//       { label: "Deposit holds",   status: "✓ Available", dot: "#c4864c" },
//     ],
//     footer: "International travelers can pay in their home currency.",
//   },
//   {
//     icon: Banknote,
//     title: "Payout Schedule",
//     subtitle: "Automatic & reliable",
//     color: "#2e7d32",
//     dimColor: "rgba(46,125,50,0.12)",
//     items: [
//       { label: "Trip confirmed", status: "→ Auto trigger", dot: "#c4864c" },
//       { label: "Processing time", status: "1–3 days",      dot: "#6b3f1d" },
//       { label: "To MoMo / Bank",  status: "✓ Delivered",  dot: "#2e7d32" },
//     ],
//     footer: "Payouts trigger automatically once your trip hits minimum capacity.",
//   },
// ];

function PaymentImagePanel() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const cells = Array.from(gridRef.current.children) as HTMLElement[];
    gsap.fromTo(
      cells,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 82%",
          once: true,
        },
      }
    );
  }, []);

  return (
    <div ref={gridRef} className="grid h-[480px] grid-cols-2 grid-rows-2 gap-3 sm:h-[520px]">
      {PAYMENT_IMAGES.map((image) => (
        <div
          key={image.label}
          className={`group relative h-full min-h-0 overflow-hidden rounded-2xl ${image.className}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(42,27,15,0.05) 0%, rgba(42,27,15,0.45) 55%, rgba(42,27,15,0.82) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-display text-sm font-bold text-[#fbf7f1]">{image.label}</p>
            <p
              className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--gold)" }}
            >
              {image.tag}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaymentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);

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

      /* ── checklist items: stagger from left ── */
      if (listRef.current) {
        const items = Array.from(listRef.current.children);
        gsap.fromTo(
          items,
          { opacity: 0, x: -28 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: listRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      /* ── image collage: scale up from 0.9 ── */
      if (imagePanelRef.current) {
        gsap.fromTo(
          imagePanelRef.current,
          { opacity: 0, scale: 0.92, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: imagePanelRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="payments"
      ref={sectionRef}
      className="scroll-mt-32 relative overflow-x-clip"
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

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
            <div className="mt-10">
              <ul ref={listRef} className="space-y-3">
                {PAYMENT_POINTS.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "rgba(251,247,241,0.78)", opacity: 0 }}>
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
            </div>
          </div>

          {/* ── RIGHT: payment image collage ── */}
          <div ref={imagePanelRef} className="relative" style={{ opacity: 0 }}>
            <PaymentImagePanel />
          </div>

          {/* ── RIGHT: CardSwap stack (commented out) ── */}
          {/* <RevealBox
            delay={0.2}
            className="relative hidden h-[500px] lg:flex lg:items-center lg:justify-end"
          >
            <div className="relative h-[400px] w-full max-w-[420px]">
              <CardSwap
                width={380}
                height={320}
                cardDistance={44}
                verticalDistance={32}
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
                      customClass="overflow-hidden !border-0 !bg-[#fbf7f1] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.45)]"
                      style={{
                        border: "1px solid rgba(251,247,241,0.25)",
                      }}
                    >
                      ...
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
