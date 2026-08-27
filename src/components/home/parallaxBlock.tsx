import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { GhanaLocalMap } from "@/components/home/ghana-local-map";

gsap.registerPlugin(ScrollTrigger)

const ParallaxBlock = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Left content entrance: eyebrow → heading → description → stat cards ──
      gsap.utils.toArray<HTMLElement>(".parallax-entrance").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      // Stat cards: stagger from below
      gsap.utils.toArray<HTMLElement>(".stat-card").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });

      // Parallax/3D rotate cards on scroll for gallery
      gsap.utils.toArray<HTMLElement>(".tilt-card").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 80, opacity: 0, rotateX: 18, rotateY: -6 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            rotateY: 0,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });

      // Numbers count up
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = parseFloat(el.dataset.count || "0");
        const suffix = el.dataset.suffix || "";
        gsap.fromTo(
          { v: 0 },
          { v: 0 },
          {
            v: target,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate() {
              const v = (this.targets()[0] as { v: number }).v;
              el.textContent = Math.round(v).toLocaleString() + suffix;
            },
          },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={parallaxRef}
      className="relative overflow-hidden border-y border-border bg-surface-raised"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:gap-12 sm:px-6 sm:py-32 lg:grid-cols-2">
        <div>
          <span className="parallax-entrance text-[11px] font-semibold uppercase tracking-[0.22em] text-gold" style={{ opacity: 0 }}>
            Plotted by locals
          </span>
          <h2 className="parallax-entrance mt-3 font-display text-3xl font-bold text-text sm:text-5xl" style={{ opacity: 0 }}>
            Every trip{" "}
            <span className="italic font-light text-gradient-warm">
              handcrafted
            </span>
            , never templated.
          </h2>
          <p className="parallax-entrance mt-4 max-w-lg text-sm leading-relaxed text-text-secondary sm:mt-5 sm:text-base" style={{ opacity: 0 }}>
            Our organisers are Ghana-grown — drivers who know which road floods
            in August, chefs who source from their cousin&apos;s farm, guides
            who can read the bush. You get the real story, not a glossy
            brochure.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5">
            {[
              { k: "Verified organisers", v: 38, s: "+" },
              { k: "Departures this month", v: 24, s: "" },
              { k: "Repeat travellers", v: 72, s: "%" },
              { k: "Avg trip rating", v: 49, s: "/50" },
            ].map((s) => (
              <div
                key={s.k}
                className="stat-card rounded-2xl border border-border bg-surface p-3.5 sm:p-5"
                style={{ opacity: 0 }}
              >
                <div
                  className="font-display text-3xl font-bold text-primary"
                  data-count={String(s.v)}
                  data-suffix={s.s}
                >
                  0
                </div>
                <div className="mt-1 text-xs text-text-secondary">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mx-auto h-[300px] w-full max-w-md sm:mx-0 sm:h-[520px] sm:max-w-none lg:order-first">
          <GhanaLocalMap />
        </div>
      </div>
    </section>
  );
};

export default ParallaxBlock;
