"use client";

import Hero from "@/components/home/hero";
import Journal from "@/components/home/journal";
import ParallaxBlock from "@/components/home/parallaxBlock";
import FeaturedTrips from "@/components/home/featuredTrips";
import HowItWorks from "@/components/home/how-it-works";
import BigCta from "@/components/home/big-cta";
import Reviews from "@/components/home/reviews";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Journal />
      <ParallaxBlock />
      <FeaturedTrips />
      <HowItWorks />
      <BigCta />
      <Reviews />
    </div>
  );
}
