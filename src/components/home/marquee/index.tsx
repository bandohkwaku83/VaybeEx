"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import styles from "./marquee.module.css";

import Img1 from "@public/images/beautiful-nature.jpg";
import Img2 from "@public/images/city-from-high.jpg";
import Img3 from "@public/images/cta-image.jpg";

gsap.registerPlugin(ScrollTrigger);

/* Render each word as one <span> per character so GSAP can run the
   font-weight "shrink/grow" stagger on them (SplitType equivalent). */
function Word({ text }: { text: string }) {
  return (
    <h1 className={styles.word} aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span key={index} className={styles.char} aria-hidden>
          {char}
        </span>
      ))}
    </h1>
  );
}

const Marquee = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      /* Font-weight stagger — characters grow from 100 to 900 as you
         scroll past each row ("shrink/grow" type animation). */
      const animateChars = (chars: Element[], reverse = false) => {
        const staggerOptions = {
          each: 0.35,
          from: reverse ? "start" : "end",
          ease: "linear",
        } as const;

        gsap.fromTo(
          chars,
          { fontWeight: 100 },
          {
            fontWeight: 900,
            duration: 1,
            ease: "none",
            stagger: staggerOptions,
            scrollTrigger: {
              trigger: chars[0]?.closest(`.${styles.marqueeContainer}`),
              start: "50% bottom",
              end: "top top",
              scrub: true,
            },
          },
        );
      };

      /* Horizontal drift — even rows move right, odd rows move left,
         scrubbed by scroll. */
      const marqueeContainers = root.querySelectorAll(
        `.${styles.marqueeContainer}`,
      );

      marqueeContainers.forEach((container, index) => {
        let start = "0%";
        let end = "-15%";

        if (index % 2 === 0) {
          start = "0%";
          end = "10%";
        }

        const marquee = container.querySelector(`.${styles.marquee}`);
        if (!marquee) return;

        gsap.fromTo(
          marquee,
          { x: start },
          {
            x: end,
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "150% top",
              scrub: true,
            },
          },
        );

        const words = marquee.querySelectorAll(`.${styles.word}`);
        words.forEach((word) => {
          const chars = Array.from(word.querySelectorAll(`.${styles.char}`));
          if (chars.length) {
            const reverse = index % 2 !== 0;
            animateChars(chars, reverse);
          }
        });
      });
    }, rootRef);

    /* Smooth scroll so the scrubbed drift reads fluidly. */
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <section className={styles.marquees}>
        <div className={styles.marqueeContainer}>
          <div className={`${styles.marquee} ${styles.marqueeOffset}`}>
            <div className={styles.item}>
              <Image src={Img1} alt="" />
            </div>
            <div className={`${styles.item} ${styles.withText}`}>
              <Word text="Unique" />
            </div>
            <div className={styles.item}>
              <Image src={Img2} alt="" />
            </div>
            <div className={styles.item}>
              <Image src={Img3} alt="" />
            </div>
            <div className={styles.item}>
              <Image src={Img3} alt="" />
            </div>
          </div>
        </div>

        <div className={styles.marqueeContainer}>
          <div className={`${styles.marquee} ${styles.marqueeOffset}`}>
            <div className={styles.item}>
              <Image src={Img1} alt="" />
            </div>
            <div className={`${styles.item} ${styles.withText}`}>
              <Word text="2500" />
            </div>
            <div className={styles.item}>
              <Image src={Img2} alt="" />
            </div>
            <div className={styles.item}>
              <Image src={Img3} alt="" />
            </div>
            <div className={styles.item}>
              <Image src={Img3} alt="" />
            </div>
          </div>
        </div>

        <div className={styles.marqueeContainer}>
          <div className={`${styles.marquee} ${styles.marqueeOffsetMobile}`}>
            <div className={styles.item}>
              <Image src={Img1} alt="" />
            </div>
            <div className={styles.item}>
              <Image src={Img2} alt="" />
            </div>
            <div className={`${styles.item} ${styles.withText}`}>
              <Word text="Rarity" />
            </div>
            <div className={styles.item}>
              <Image src={Img3} alt="" />
            </div>
            <div className={styles.item}>
              <Image src={Img3} alt="" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Marquee;
