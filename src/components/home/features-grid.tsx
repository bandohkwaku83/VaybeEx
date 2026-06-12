"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  CreditCard,
  Globe,
  Heart,
  Shield,
  Smartphone,
  Star,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Don't skip verification",
    description:
      "Every organizer is vetted before they can list a trip on the platform.",
  },
  {
    icon: Heart,
    title: "Travel is the first step",
    description:
      "Curated group experiences that build lasting friendships and memories.",
  },
  {
    icon: Shield,
    title: "Safety is wealth",
    description:
      "Transparent pricing, seat tracking, and secure payments on every booking.",
  },
  {
    icon: Globe,
    title: "Don't be the next statistic",
    description:
      "Join verified trips instead of risking unvetted travel arrangements.",
  },
  {
    icon: Zap,
    title: "Boost your experiences",
    description:
      "From adventure to wellness — find trips that match your interests.",
  },
  {
    icon: Star,
    title: "Explore well. Travel longer.",
    description:
      "Quality over quantity — every trip is reviewed and rated by real travelers.",
  },
  {
    icon: Smartphone,
    title: "Say yes to easy booking",
    description:
      "Book from your phone with deposits, installments, or full payment.",
  },
  {
    icon: Users,
    title: "Innovate your group travel",
    description:
      "Waitlists, seat counters, and dashboards keep everyone in sync.",
  },
  {
    icon: CreditCard,
    title: "Invest in experiences",
    description:
      "Flexible payment options via card, mobile money, or bank transfer.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d8b8b]">
            Curated for all travelers
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-stone-900 sm:text-4xl">
            Why travelers choose VaybeEx
          </h2>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e3636]/5 text-[#3d8b8b]">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-stone-900">{feature.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
