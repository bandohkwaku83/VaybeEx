"use client"

import { FadeInUp } from "../ui/fadeInUp"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { trips } from "@/lib/mockTrips";
import TripCard from "@/components/ui/trip-card";


const featured = trips.filter((t) => t.isFeatured).slice(0, 6);

const FeaturedTrips = () => {
  return (
       <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <FadeInUp>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Featured expeditions
                </span>
                <h2 className="mt-3 font-display text-4xl font-bold text-text sm:text-5xl">
                  Where travellers are heading
                </h2>
              </div>
              <Link
                href="/login/traveller"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
              >
                See all <ArrowRight size={14} />
              </Link>
            </div>
          </FadeInUp>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t, i) => (
              <div key={t.id} className="tilt-card">
                <TripCard trip={t} priority={i < 3} />
              </div>
            ))}
          </div>
        </section>
  )
}

export default FeaturedTrips