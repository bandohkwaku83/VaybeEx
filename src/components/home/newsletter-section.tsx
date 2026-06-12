"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list! We'll send trip updates soon.");
    setEmail("");
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-[#1e3636] px-6 py-12 sm:px-12 sm:py-16"
        >
          <div className="hero-botanical pointer-events-none absolute inset-0 opacity-[0.04]" />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d8b8b]">
              Welcome to VaybeEx
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
              Create better travel stories, one trip at a time.
            </h2>
            <p className="mt-3 text-white/60">
              Get early access to new trips, exclusive deals, and organizer spotlights delivered
              to your inbox.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
            >
              <div className="relative flex-1 sm:max-w-sm">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-0 bg-white pl-10 shadow-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-gradient h-12 rounded-full px-8 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
