import { useRef, useEffect } from "react"
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInUp } from "@/components/ui/fadeInUp";
import { Compass, Building2, ShieldCheck } from "lucide-react";


const ROLES = [
  {
    title: "Find a Trip",
    body: "Discover curated group adventures by verified locals across Ghana and West Africa.",
    href: "/login/traveller",
    badge: "For travellers",
    Icon: Compass,
  },
  {
    title: "Post a Trip",
    body: "List your itineraries, manage applications, and get paid securely after each departure.",
    href: "/login/organiser",
    badge: "For organisers",
    Icon: Building2,
  },
  {
    title: "Admin Portal",
    body: "Approve organisers, moderate listings, oversee bookings and platform revenue.",
    href: "/login/admin",
    badge: "Internal",
    Icon: ShieldCheck,
  },
] as const;

const RoleCards = () => {
      const galleryRef = useRef<HTMLDivElement>(null);

  
  return (
     <section
          ref={galleryRef}
          className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32"
          style={{ perspective: 1400 }}
        >
          <FadeInUp>
            <div className="mb-12 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                Choose your path
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold text-text sm:text-5xl">
                Three ways into VaybeEx
              </h2>
            </div>
          </FadeInUp>
          <div className="grid gap-5 md:grid-cols-3">
            {ROLES.map((r) => (
              <Link
                key={r.title}
                href={r.href}
                className="tilt-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface p-7 transition-all hover:-translate-y-1 hover:border-border-strong hover:shadow-2xl"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-teal text-primary-foreground">
                  <r.Icon size={24} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-tertiary">
                  {r.badge}
                </span>
                <h3 className="mt-1.5 font-display text-2xl font-bold text-text">{r.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{r.body}</p>
                <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Continue
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
  )
}

export default RoleCards