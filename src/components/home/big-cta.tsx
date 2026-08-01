import Link from "next/link"
import {motion} from "framer-motion"

import ctaImage from "@public/images/cta-image.jpg";

const BigCta = () => {
  return (
    <section className="relative isolate overflow-hidden">
          <img
            src={ctaImage.src}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-primary-dark/75" />
          <div className="mx-auto max-w-4xl px-4 py-16 text-center text-white sm:px-6 sm:py-36">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl font-bold leading-[0.95] sm:text-7xl"
            >
              Your next story <span className="italic font-light">starts</span> at the coast.
            </motion.h2>
            <p className="mx-auto mt-5 max-w-xl text-sm text-white/80 sm:mt-6 sm:text-base">
              Join 2,400+ West Africans already booked on their next adventure. First-timers welcome
              — your group&apos;s saving you a seat.
            </p>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center">
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
  )
}

export default BigCta
