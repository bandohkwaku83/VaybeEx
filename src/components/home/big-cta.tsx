import Link from "next/link"
import {motion} from "framer-motion"
import { ArrowRight } from "lucide-react";

import coastAerial from "@public/images/coast-aerial.jpg";

const BigCta = () => {
  return (
    <section className="relative isolate overflow-hidden">
          <img
            src={coastAerial.src}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-primary-dark/75" />
          <div className="mx-auto max-w-4xl px-4 py-28 text-center text-white sm:px-6 sm:py-36">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl font-bold leading-[0.95] sm:text-7xl"
            >
              Your next story <span className="italic font-light">starts</span> at the coast.
            </motion.h2>
            <p className="mx-auto mt-6 max-w-xl text-white/80">
              Join 2,400+ West Africans already booked on their next adventure. First-timers welcome
              — your group&apos;s saving you a seat.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login/traveller"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
              >
                Find your trip <ArrowRight size={16} />
              </Link>
              <Link
                href="/login/organiser"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                Host a trip
              </Link>
            </div>
          </div>
        </section>
  )
}

export default BigCta