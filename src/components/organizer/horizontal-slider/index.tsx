"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Globe, Users, Shield, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroBg from "@public/images/city-from-high.jpg";
import BuiltBg from "@public/images/postcards/accra.jpg";
import FillBg from "@public/images/safarivalley.jpg";
import TrustBg from "@public/images/postcards/cape_coast.jpg";
import GrowBg from "@public/images/postcards/volta.jpg";
import OutroBg from "@public/images/high-shot.jpg";
import styles from "./slider.module.css";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────
   HorizontalSlider — scroll-scrubbed horizontal track section,
   pinned by GSAP ScrollTrigger just below the fixed navbar.

   Content: "Why Choose VaybeEx" — 4 benefit slides pulled from
   the WhySection bento grid, presented as full-viewport horizontal
   slides that the user scrolls through.
   ──────────────────────────────────────────────────────────────── */

const NAVBAR_HEIGHT = 64;

const SLIDES = [
  {
    type: "intro" as const,
    title: "WHY CHOOSE\nVAYBEEX?",
    subtitle: "Stop chasing payments on WhatsApp. VaybeEx handles the admin so you lead the experience.",
    bg: "#2a1b0f",
    color: "#fbf7f1",
    accentColor: "#c4864c",
    image: IntroBg,
  },
  {
    type: "benefit" as const,
    icon: Globe,
    tag: "Local-first",
    title: "Built for West Africa",
    desc: "Mobile money, local payment methods, and travelers who actively book group trips across Ghana and the region.",
    bg: "#6b3f1d",
    color: "#fbf7f1",
    accentColor: "#c4864c",
    image: BuiltBg,
  },
  {
    type: "benefit" as const,
    icon: Users,
    tag: "Discovery",
    title: "Fill your trips faster",
    desc: "List on a marketplace where travelers search by destination, dates, and budget — and find you.",
    bg: "#4a2a12",
    color: "#fbf7f1",
    accentColor: "#8b5a2b",
    image: FillBg,
  },
  {
    type: "benefit" as const,
    icon: Shield,
    tag: "Verified",
    title: "Trust that converts",
    desc: "Verified organizer badges, authentic reviews, and transparent seat counts help travelers book with confidence.",
    bg: "#1f5c3a",
    color: "#fbf7f1",
    accentColor: "#3d9a6a",
    image: TrustBg,
  },
  {
    type: "benefit" as const,
    icon: TrendingUp,
    tag: "Retention",
    title: "Grow repeat business",
    desc: "Build a profile travelers return to. Past guests can review, rebook, and recommend your trips.",
    bg: "#8b5a2b",
    color: "#fbf7f1",
    accentColor: "#f0b872",
    image: GrowBg,
  },
  {
    type: "outro" as const,
    title: "Start Your Journey",
    subtitle: "Lead the experience. Fill every seat. VaybeEx handles the rest.",
    cta: "Become an Organizer",
    bg: "#c4864c",
    color: "#fbf7f1",
    image: OutroBg,
  },
];

const HorizontalSlider = () => {
  const rootRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef.current;
    const progressBar = progressBarRef.current;
    if (!root || !scroller || !progressBar) return;

    const slides = Array.from(
      scroller.querySelectorAll<HTMLElement>(`.${styles.slide}`),
    );

    const trackWidth = () =>
      slides.reduce(
        (total, slide) => total + slide.getBoundingClientRect().width,
        0,
      );

    const setTrackWidth = () => {
      // One extra viewport of trailing space so the track never runs
      // short. The trailing space matches the outro background color,
      // making it seamless.
      scroller.style.width = `${trackWidth() + window.innerWidth}px`;
    };
    setTrackWidth();

    const ctx = gsap.context(() => {
      gsap.to(scroller, {
        // Scroll the slides portion only. At pin release the last
        // slide fills the viewport — its text stays visible as the
        // section scrolls away and the next section enters from below.
        x: () => -(trackWidth() - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: `top ${NAVBAR_HEIGHT}px`,
          end: () => `+=${trackWidth() - window.innerWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressBar.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
    });

    const onResize = () => {
      setTrackWidth();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section className={styles.root} ref={rootRef}>
      <div className={styles.progressBar} ref={progressBarRef} />

      <div className={styles.scroller} ref={scrollerRef}>
        {SLIDES.map((slide, i) => {
          if (slide.type === "intro") {
            return (
              <div
                key={i}
                className={`${styles.slide} ${styles.whyIntro}`}
                style={{ backgroundColor: slide.bg, color: slide.color }}
              >
                {/* background image */}
                {slide.image && (
                  <div className={styles.slideBg}>
                    <Image src={slide.image} alt="" fill sizes="100vw" priority />
                    <div className={styles.slideOverlay} style={{ background: `linear-gradient(135deg, ${slide.bg}ee 0%, ${slide.bg}aa 50%, ${slide.bg}66 100%)` }} />
                  </div>
                )}
                <div className={styles.whyIntroInner}>
                  <span
                    className={styles.whyTag}
                    style={{ color: slide.accentColor }}
                  >
                    Why VaybeEx
                  </span>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <p className={styles.whyIntroSub}>{slide.subtitle}</p>
                  <div
                    className={styles.whyDivider}
                    style={{ backgroundColor: slide.accentColor }}
                  />
                </div>
              </div>
            );
          }

          if (slide.type === "benefit") {
            const Icon = slide.icon;
            return (
              <div
                key={i}
                className={`${styles.slide} ${styles.whyBenefit}`}
                style={{ backgroundColor: slide.bg, color: slide.color }}
              >
                {/* background image */}
                {slide.image && (
                  <div className={styles.slideBg}>
                    <Image src={slide.image} alt="" fill sizes="100vw" />
                    <div className={styles.slideOverlay} style={{ background: `linear-gradient(135deg, ${slide.bg}dd 0%, ${slide.bg}99 50%, ${slide.bg}77 100%)` }} />
                  </div>
                )}
                {/* watermark icon */}
                <Icon
                  className={styles.whyWatermark}
                  style={{ color: slide.accentColor }}
                  strokeWidth={1}
                />
                <div className={styles.whyBenefitInner}>
                  <div className={styles.whyBenefitTop}>
                    <span className={styles.whyBenefitIndex}>
                      0{i}
                    </span>
                    <div
                      className={styles.whyBenefitIcon}
                      style={{
                        background: `linear-gradient(145deg, ${slide.accentColor}, ${slide.bg})`,
                      }}
                    >
                      <Icon className={styles.whyBenefitIconSvg} strokeWidth={2} />
                    </div>
                  </div>
                  <span
                    className={styles.whyBenefitTag}
                    style={{
                      backgroundColor: `${slide.accentColor}22`,
                      color: slide.accentColor,
                    }}
                  >
                    {slide.tag}
                  </span>
                  <h2 className={styles.whyBenefitTitle}>{slide.title}</h2>
                  <p className={styles.whyBenefitDesc}>{slide.desc}</p>
                </div>
              </div>
            );
          }

          /* outro */
          return (
            <div
              key={i}
              className={`${styles.slide} ${styles.whyOutro}`}
              style={{ backgroundColor: slide.bg, color: slide.color }}
            >
              {/* background image */}
              {slide.image && (
                <div className={styles.slideBg}>
                  <Image src={slide.image} alt="" fill sizes="100vw" />
                  <div className={styles.slideOverlay} style={{ background: `linear-gradient(135deg, ${slide.bg}cc 0%, ${slide.bg}88 50%, ${slide.bg}55 100%)` }} />
                </div>
              )}
              <div className={styles.whyOutroInner}>
                <h1 className={styles.whyOutroTitle}>{slide.title}</h1>
                <p className={styles.whyOutroSub}>{slide.subtitle}</p>
                <span className={styles.whyOutroCta}>{slide.cta}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HorizontalSlider;
