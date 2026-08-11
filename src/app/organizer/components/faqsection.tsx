"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Compass } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Reuse if already defined elsewhere — delete this block then ─── */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-[0.2em]"
      style={{ color: "var(--gold)" }}
    >
      {children}
    </p>
  );
}

function RevealBox({
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
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      }
    );
  }, [delay]);
  return (
    <div ref={ref} style={{ opacity: 0 }} className={className}>
      {children}
    </div>
  );
}

/* ─── Data ─────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Who can become an organizer?",
    a: "Tour operators, travel clubs, independent guides, and experience creators who run group trips in Ghana and West Africa.",
  },
  {
    q: "What does it cost?",
    a: "Creating an account is free. VaybeEx takes a small commission only when you receive a confirmed booking — no listing fee, no monthly charge.",
  },
  {
    q: "Do I handle payments myself?",
    a: "No. VaybeEx processes traveler payments and sends your earnings to your bank account or mobile money wallet automatically.",
  },
  {
    q: "Can I set a minimum group size?",
    a: "Yes. Set a minimum capacity — VaybeEx tracks progress and only triggers payouts once your trip is confirmed to run.",
  },
  {
    q: "Can I list international trips?",
    a: "Absolutely. Many organizers run trips from Ghana to Togo, Côte d'Ivoire, Senegal, and beyond. International trips are fully supported.",
  },
  {
    q: "What happens if a trip is cancelled?",
    a: "You control your cancellation policy. VaybeEx enforces it automatically and handles refunds according to the terms you set.",
  },
];

/* ─── Single ledger row ──────────────────────────────────────────── */
function FAQRow({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: { q: string; a: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answerWrapRef = useRef<HTMLDivElement>(null);
  const answerInnerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  /* Expand / collapse height animation */
  useEffect(() => {
    const wrap = answerWrapRef.current;
    const inner = answerInnerRef.current;
    if (!wrap || !inner) return;

    if (isOpen) {
      const h = inner.getBoundingClientRect().height;
      gsap.to(wrap, {
        height: h,
        duration: 0.55,
        ease: "power3.out",
      });
      gsap.to(inner, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: 0.08,
        ease: "power2.out",
      });
    } else {
      gsap.to(wrap, {
        height: 0,
        duration: 0.4,
        ease: "power3.inOut",
      });
      gsap.to(inner, {
        opacity: 0,
        y: -6,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  /* Icon: compass-needle rotation */
  useEffect(() => {
    if (!iconRef.current) return;
    gsap.to(iconRef.current, {
      rotate: isOpen ? 135 : 0,
      duration: 0.45,
      ease: "back.out(1.8)",
    });
  }, [isOpen]);

  /* Entrance reveal per row, staggered by index via ScrollTrigger */
  useEffect(() => {
    if (!rowRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rowRef.current,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          delay: index * 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rowRef.current,
            start: "top 90%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [index]);

  /* Hover wash slide-in */
  const onEnter = () => {
    if (isOpen || !washRef.current) return;
    gsap.to(washRef.current, { scaleX: 1, duration: 0.45, ease: "power2.out" });
  };
  const onLeave = () => {
    if (!washRef.current) return;
    gsap.to(washRef.current, { scaleX: 0, duration: 0.3, ease: "power2.in" });
  };

  return (
    <div
      ref={rowRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group relative cursor-pointer overflow-hidden border-b"
      style={{ borderColor: "var(--border)" }}
      onClick={onToggle}
    >
      {/* hover wash */}
      <div
        ref={washRef}
        className="pointer-events-none absolute inset-0 origin-left"
        style={{
          background:
            "linear-gradient(90deg, var(--gold-dim) 0%, transparent 70%)",
          transform: "scaleX(0)",
        }}
      />

      <div className="relative flex items-start gap-5 px-1 py-7 sm:gap-8 sm:px-2">
        {/* page-stamp index */}
        <span
          className="font-mono shrink-0 pt-0.5 text-xs font-bold tabular-nums"
          style={{
            color: isOpen ? "var(--gold)" : "var(--text-tertiary)",
            transition: "color 0.3s ease",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* question + answer column */}
        <div className="min-w-0 flex-1">
          <h4
            className="font-display pr-4 text-lg font-bold leading-snug transition-colors duration-300 sm:text-xl"
            style={{ color: isOpen ? "var(--primary-dark)" : "var(--text)" }}
          >
            {faq.q}
          </h4>

          {/* expandable answer */}
          <div
            ref={answerWrapRef}
            style={{ height: 0, overflow: "hidden" }}
          >
            <div
              ref={answerInnerRef}
              style={{ opacity: 0, transform: "translateY(-6px)" }}
              className="pb-1 pt-4"
            >
              <p
                className="max-w-xl text-sm leading-relaxed sm:text-[15px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {faq.a}
              </p>
            </div>
          </div>
        </div>

        {/* toggle icon */}
        <div
          ref={iconRef}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300"
          style={{
            borderColor: isOpen ? "var(--gold)" : "var(--border)",
            background: isOpen ? "var(--gold-dim)" : "transparent",
          }}
        >
          <Plus
            className="h-4 w-4 transition-colors duration-300"
            style={{ color: isOpen ? "var(--gold)" : "var(--text-secondary)" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────── */
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);

  /* Scroll-driven progress rail running alongside the list */
  useEffect(() => {
    if (!sectionRef.current || !railFillRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        railFillRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        }
      );

      if (compassRef.current) {
        gsap.to(compassRef.current, {
          rotate: 360,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="scroll-mt-32 relative mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* ── Header ── */}
      <RevealBox className="mb-16 max-w-xl">
        <div className="mb-4 flex items-center gap-3">
          <div
            ref={compassRef}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "var(--primary-dim)" }}
          >
            <Compass className="h-4 w-4" style={{ color: "var(--primary)" }} />
          </div>
          <SectionEyebrow>Common questions</SectionEyebrow>
        </div>
        <h2
          className="font-display text-4xl font-bold leading-tight sm:text-5xl"
          style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
        >
          Before you
          <br />
          sign up.
        </h2>
        <p
          className="mt-5 text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Everything organizers ask before publishing their first trip.
          Tap a question to expand it.
        </p>
      </RevealBox>

      {/* ── Ledger list with scroll progress rail ── */}
      <div className="relative flex gap-6">
        {/* progress rail (desktop only) */}
        <div
          ref={railRef}
          className="relative hidden w-px shrink-0 sm:block"
          style={{ background: "var(--border)" }}
        >
          <div
            ref={railFillRef}
            className="absolute left-0 top-0 w-px origin-top"
            style={{
              height: "100%",
              background: "var(--gradient-brand)",
              transform: "scaleY(0)",
            }}
          />
        </div>

        <div className="flex-1">
          {FAQS.map((faq, i) => (
            <FAQRow
              key={faq.q}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* ── Footer note ── */}
      <RevealBox delay={0.1} className="mt-12 flex items-center gap-3">
        <span
          className="h-px w-8 shrink-0"
          style={{ background: "var(--gold)" }}
        />
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Still have questions? Reach out to our organizer support team anytime.
        </p>
      </RevealBox>
    </section>
  );
}