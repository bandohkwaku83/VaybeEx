"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { TripFilters } from "@/lib/types";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=1400&fit=crop",
    title: "Reach your travel potential.",
    subtitle:
      "Discover verified organizers, book with flexible payments, and join unforgettable group experiences across Ghana.",
  },
  {
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=1400&fit=crop",
    title: "You will feel well nurtured here.",
    subtitle:
      "From coastal retreats to mountain treks — every trip is handpicked, every organizer verified.",
  },
  {
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=1400&fit=crop",
    title: "Travel should not be a matter of luck.",
    subtitle:
      "Benefit from transparent pricing, seat tracking, and trusted group travel — all in one place.",
  },
];

interface HeroCarouselProps {
  onSearch: (filters: Partial<TripFilters>) => void;
}

export function HeroCarousel({ onSearch }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const goToTrips = () => {
    onSearch({});
    document.getElementById("trips")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#1e3636] lg:min-h-[92vh]">
      <div className="relative flex min-h-[100svh] flex-col lg:min-h-[92vh] lg:flex-row">
        {/* Left panel — Quadra split layout */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-28 sm:px-10 lg:w-[48%] lg:max-w-none lg:px-14 lg:py-20 xl:px-20">
          <div className="hero-botanical pointer-events-none absolute inset-0 opacity-[0.07]" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="relative max-w-lg"
            >
              <h1 className="font-serif text-4xl font-bold leading-[1.15] text-white sm:text-5xl lg:text-[3.25rem]">
                {slides[current].title}
              </h1>
              <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
                {slides[current].subtitle}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={goToTrips}
                  className="btn-gradient inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  href="/organizer"
                  className="text-sm font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  Become an organizer
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative mt-12 flex items-center gap-4">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
              className="rounded-full border border-white/20 p-2 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? "w-8 bg-[#e07850]" : "w-4 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
              className="rounded-full border border-white/20 p-2 text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right panel — lifestyle image with wave edge */}
        <div className="relative hidden min-h-[50vh] flex-1 lg:block">
          <div className="hero-wave absolute -left-px top-0 z-20 h-full w-24" />
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <Image
                src={slides[current].image}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="55vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile image strip */}
        <div className="relative h-56 lg:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Image
                src={slides[current].image}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e3636] via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
