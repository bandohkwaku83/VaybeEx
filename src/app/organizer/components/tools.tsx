import { RevealBox, SectionEyebrow } from "../page";
import {
  BarChart3,
  Bell,
  Map,
  MessageSquare,
  Users,
  Wallet,
} from "lucide-react";
import { useRef, useEffect } from "react";

const TOOLS = [
  {
    icon: Map,
    title: "Trip builder",
    desc: "Draft, schedule, and publish trips with itineraries, inclusions, photos, and custom pricing tiers.",
  },
  {
    icon: Users,
    title: "Attendee manager",
    desc: "See who paid, who is pending, and manage your full guest list from a single dashboard.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Track views, conversion rates, revenue per trip, and which destinations drive the most bookings.",
  },
  {
    icon: MessageSquare,
    title: "Group messaging",
    desc: "Send updates to paid, partial, or pending travelers — or broadcast to your entire waitlist.",
  },
  {
    icon: Bell,
    title: "Waitlist automation",
    desc: "Automatically notify waitlisted travelers the moment a spot opens on a fully booked trip.",
  },
  {
    icon: Wallet,
    title: "Payout dashboard",
    desc: "Monitor pending, processing, and completed payouts. Withdraw to MoMo or bank on demand.",
  },
];

const Tools = () => {
  const toolsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toolsGridRef.current) return;
    const cards = Array.from(
      toolsGridRef.current.querySelectorAll<HTMLDivElement>(".tool-card"),
    );
    const cleanup: (() => void)[] = [];
    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 18;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -18;
        gsap.to(card, {
          rotateY: x,
          rotateX: y,
          scale: 1.03,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 900,
        });
      };
      const onLeave = () =>
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1,0.7)",
        });
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanup.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanup.forEach((fn) => fn());
  }, []);
  return (
    <section
      id="tools"
      className="scroll-mt-32 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      <RevealBox className="max-w-2xl mb-16">
        <SectionEyebrow>Tools built for your workflow</SectionEyebrow>
        <h2 className="font-display mt-4 text-4xl font-bold text-[var(--text)] sm:text-5xl">
          Everything in
          <br />
          one organizer portal.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
          No more juggling apps. Every tool you need to run, fill, and manage
          group trips lives in one place.
        </p>
      </RevealBox>

      <div
        ref={toolsGridRef}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        style={{ perspective: 1000 }}
      >
        {TOOLS.map((t, i) => (
          <RevealBox key={t.title} delay={i * 0.08}>
            <div
              className="tool-card group relative h-full cursor-default overflow-hidden rounded-2xl border p-7 transition-shadow duration-300 hover:shadow-[var(--shadow-glow-gold)]"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                willChange: "transform",
              }}
            >
              {/* shimmer on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 60% 30%, rgba(196,134,76,0.07) 0%, transparent 70%)",
                }}
              />
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: "var(--primary-dim)" }}
              >
                <t.icon
                  className="h-5 w-5"
                  style={{ color: "var(--primary)" }}
                />
              </div>
              <h3 className="font-display text-lg font-bold text-[var(--text)]">
                {t.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {t.desc}
              </p>
            </div>
          </RevealBox>
        ))}
      </div>
    </section>
  );
};

export default Tools;
