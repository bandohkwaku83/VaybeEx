"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ama Osei",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    trip: "Volta Region Waterfall Trek",
    rating: 5,
    quote:
      "The organizer was incredible — every detail was handled. I made friends I'll keep for life on this trek.",
  },
  {
    name: "Kwame Asante",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    trip: "Cape Coast Heritage & Beach",
    rating: 5,
    quote:
      "Booking through VaybeEx was seamless. The deposit option made it easy to commit, and the trip exceeded expectations.",
  },
  {
    name: "Efua Mensah",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    trip: "Mole Safari Experience",
    rating: 5,
    quote:
      "Finally a platform I trust for group travel in Ghana. Verified organizers, clear pricing, no surprises.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
            What our guests are saying
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-stone-900 sm:text-4xl">
            Client experiences
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-teal-100" />
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-stone-100 pt-5">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.trip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
