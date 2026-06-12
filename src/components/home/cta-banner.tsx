"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="overflow-hidden bg-[#1e3636]">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:py-24"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e07850]">
            Safe and strong for all
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            Benefiting from great travel should not be a matter of luck.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65">
            Join curated group trips with verified hosts, flexible payment options, and a
            community that has your back from booking to return.
          </p>
          <div className="mt-8">
            <Link
              href="#trips"
              className="btn-gradient inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <div className="relative min-h-[300px] lg:min-h-[480px]">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&h=700&fit=crop"
            alt="Mountain adventure"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e3636] via-transparent to-transparent lg:via-[#1e3636]/30" />
        </div>
      </div>
    </section>
  );
}
