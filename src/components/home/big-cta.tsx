"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ctaImage from "@public/images/cta-image.jpg";

gsap.registerPlugin(ScrollTrigger);

const BigCta = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      const children = contentRef.current ? Array.from(contentRef.current.children) : [];
      gsap.fromTo(
        children,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden">
      <Image
        src={ctaImage}
        alt=""
        fill
        placeholder="blur"
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-primary-dark/75" />
      <div ref={contentRef} className="mx-auto max-w-4xl px-4 py-16 text-center text-white sm:px-6 sm:py-36">
        <h2
          className="font-display text-4xl font-bold leading-[0.95] sm:text-7xl"
          style={{ opacity: 0 }}
        >
          Your next story <span className="italic font-light">starts</span> at the coast.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-white/80 sm:mt-6 sm:text-base" style={{ opacity: 0 }}>
          Join 2,400+ West Africans already booked on their next adventure. First-timers welcome
          — your group&apos;s saving you a seat.
        </p>
        <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center" style={{ opacity: 0 }}>
          <Link
            href="/login/traveller"
            className="inline-flex items-center justify-center rounded-none bg-coral px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:py-4"
          >
            Find your trip
          </Link>
          <Link
            href="/login/organiser"
            className="inline-flex items-center justify-center rounded-none bg-white px-7 py-3.5 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5 sm:py-4"
          >
            Host a trip
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BigCta;
