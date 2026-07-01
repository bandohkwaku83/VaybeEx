// "use client";

// import Link from "next/link";
// import {
//   ArrowRight,
//   BarChart3,
//   Bell,
//   Check,
//   CreditCard,
//   Globe,
//   Map,
//   MessageSquare,
//   Shield,
//   Sparkles,
//   TrendingUp,
//   Users,
//   Wallet,
// } from "lucide-react";
// import { OrganizerLandingHeader } from "@/components/organizer/landing-header";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { cn } from "@/lib/utils";
// import OrganizerHero from "./components/organizerhero";

// const sections = [
//   { id: "why", label: "Why VaybeEx" },
//   { id: "how-it-works", label: "How it works" },
//   { id: "tools", label: "Tools & features" },
//   { id: "payments", label: "Payments" },
//   { id: "reach", label: "Reach travelers" },
//   { id: "get-started", label: "Get started" },
// ];

// const whyBenefits = [
//   {
//     icon: Globe,
//     title: "Built for West Africa",
//     desc: "Mobile money, local payment methods, and travelers who book group trips across Ghana and the region.",
//   },
//   {
//     icon: Users,
//     title: "Fill your trips faster",
//     desc: "List on a marketplace where travelers already search by destination, dates, and budget.",
//   },
//   {
//     icon: Shield,
//     title: "Trust that converts",
//     desc: "Verified organizer badges, reviews, and transparent seat counts help travelers book with confidence.",
//   },
//   {
//     icon: TrendingUp,
//     title: "Grow repeat business",
//     desc: "Build a profile travelers return to. Past guests can review, rebook, and recommend your trips.",
//   },
// ];

// const steps = [
//   { step: 1, title: "Create your account", desc: "Sign up as an organizer and tell us about your business." },
//   { step: 2, title: "Get verified", desc: "Upload ID and business documents. Most reviews complete in 1–2 days." },
//   { step: 3, title: "Publish your trips", desc: "Add itineraries, pricing, capacity, and optional add-ons." },
//   { step: 4, title: "Accept bookings & withdraw", desc: "Track attendees, send updates, and receive payouts automatically." },
// ];

// const tools = [
//   { icon: Map, title: "Trip builder", desc: "Draft, schedule, and publish trips with itineraries, inclusions, and photos." },
//   { icon: Users, title: "Attendee management", desc: "See who paid, who is pending, and manage your full guest list in one place." },
//   { icon: BarChart3, title: "Analytics", desc: "Track views, conversion rates, and revenue per trip." },
//   { icon: MessageSquare, title: "Communication", desc: "Send updates to paid, partial, or pending members on any trip." },
//   { icon: Bell, title: "Waitlist alerts", desc: "Automatically notify travelers when a spot opens on a full trip." },
//   { icon: Wallet, title: "Payout dashboard", desc: "Monitor pending, processing, and completed payouts." },
// ];

// const paymentPoints = [
//   "Accept card, MTN MoMo, Vodafone Cash, AirtelTigo, and bank transfer on your behalf",
//   "Collect deposits to secure spots while travelers pay the balance later",
//   "Offer instalment plans to reduce booking friction",
//   "Automatic payouts when trips hit minimum capacity or departure date",
//   "Clear fee breakdown — no hidden charges",
// ];

// const reachPoints = [
//   "Featured on the traveler homepage and search filters",
//   "Organizer profile page with bio, reviews, and trip history",
//   "Wishlist saves that bring travelers back to your trips",
//   "SMS and email notifications that keep your trips top of mind",
// ];

// const faqs = [
//   {
//     q: "Who can become an organizer?",
//     a: "Tour operators, travel clubs, independent guides, and experience creators who run group trips in Ghana and West Africa.",
//   },
//   {
//     q: "What does it cost?",
//     a: "Creating an account is free. VaybeEx takes a small commission only when you receive a confirmed booking.",
//   },
//   {
//     q: "Do I need to handle payments myself?",
//     a: "No. VaybeEx processes traveler payments and sends your earnings to your bank or mobile money account.",
//   },
//   {
//     q: "Can I run trips with a minimum group size?",
//     a: "Yes. Set a minimum capacity and VaybeEx tracks progress so you know when your trip is confirmed to run.",
//   },
// ];

// export default function OrganizerLandingPage() {
//   return (
//     <div className="min-h-screen bg-stone-50">
//       <OrganizerLandingHeader />

//       {/* Hero */}
//     <OrganizerHero/>

//       {/* Section nav */}
//       <nav className="sticky top-16 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
//         <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
//           <ul className="flex gap-1 py-2 min-w-max">
//             {sections.map((s) => (
//               <li key={s.id}>
//                 <a
//                   href={`#${s.id}`}
//                   className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-teal-50 hover:text-teal-700 transition-colors whitespace-nowrap"
//                 >
//                   {s.label}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </nav>

//       {/* Why VaybeEx */}
//       <section id="why" className="scroll-mt-32 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//         <div className="text-center max-w-2xl mx-auto mb-12">
//           <h2 className="text-3xl font-bold text-stone-900">Why bring your trips here?</h2>
//           <p className="mt-3 text-stone-500">
//             Stop juggling spreadsheets, DMs, and manual payment follow-ups. VaybeEx is built for organizers
//             who want more bookings and less back-office work.
//           </p>
//         </div>
//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//           {whyBenefits.map((b) => (
//             <Card key={b.title} className="border-stone-200">
//               <CardContent className="p-6">
//                 <b.icon className="h-8 w-8 text-teal-600 mb-4" />
//                 <h3 className="font-semibold text-stone-900">{b.title}</h3>
//                 <p className="text-sm text-stone-500 mt-2 leading-relaxed">{b.desc}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </section>

//       {/* How it works */}
//       <section id="how-it-works" className="scroll-mt-32 bg-white border-y border-stone-200">
//         <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//           <div className="text-center max-w-2xl mx-auto mb-12">
//             <h2 className="text-3xl font-bold text-stone-900">How it works</h2>
//             <p className="mt-3 text-stone-500">From sign-up to your first payout in four steps.</p>
//           </div>
//           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//             {steps.map((s) => (
//               <div key={s.step} className="relative rounded-2xl border border-stone-200 p-6">
//                 <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold">
//                   {s.step}
//                 </span>
//                 <h3 className="mt-4 font-semibold text-stone-900">{s.title}</h3>
//                 <p className="text-sm text-stone-500 mt-2">{s.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Tools */}
//       <section id="tools" className="scroll-mt-32 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//         <div className="text-center max-w-2xl mx-auto mb-12">
//           <h2 className="text-3xl font-bold text-stone-900">Tools built for your workflow</h2>
//           <p className="mt-3 text-stone-500">
//             Everything you need to run group trips — inside one organizer portal.
//           </p>
//         </div>
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {tools.map((t) => (
//             <Card key={t.title} className="hover:border-teal-200 transition-colors">
//               <CardContent className="p-5 flex gap-4">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
//                   <t.icon className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-stone-900">{t.title}</h3>
//                   <p className="text-sm text-stone-500 mt-1">{t.desc}</p>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </section>

//       {/* Payments */}
//       <section id="payments" className="scroll-mt-32 bg-teal-900 text-white">
//         <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//           <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
//             <div>
//               <CreditCard className="h-10 w-10 text-teal-300 mb-4" />
//               <h2 className="text-3xl font-bold">Payments & payouts handled for you</h2>
//               <p className="mt-4 text-teal-100/80 leading-relaxed">
//                 Travelers pay through VaybeEx using the methods they already trust. You focus on the
//                 experience — we handle collection, receipts, and your payout.
//               </p>
//             </div>
//             <ul className="space-y-3">
//               {paymentPoints.map((point) => (
//                 <li key={point} className="flex items-start gap-3 text-sm text-teal-50">
//                   <Check className="h-5 w-5 shrink-0 text-teal-300 mt-0.5" />
//                   {point}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </section>

//       {/* Reach */}
//       <section id="reach" className="scroll-mt-32 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//         <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
//           <div>
//             <Sparkles className="h-10 w-10 text-teal-600 mb-4" />
//             <h2 className="text-3xl font-bold text-stone-900">Put your trips in front of ready travelers</h2>
//             <p className="mt-4 text-stone-500 leading-relaxed">
//               Your trips appear where people are already looking. A strong organizer profile turns
//               first-time viewers into repeat bookers.
//             </p>
//           </div>
//           <ul className="space-y-4">
//             {reachPoints.map((point) => (
//               <li key={point} className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
//                 <Check className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" />
//                 {point}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="mt-16">
//           <h3 className="text-xl font-bold text-stone-900 mb-6">Common questions</h3>
//           <div className="grid gap-4 sm:grid-cols-2">
//             {faqs.map((faq) => (
//               <Card key={faq.q}>
//                 <CardContent className="p-5">
//                   <h4 className="font-semibold text-stone-900">{faq.q}</h4>
//                   <p className="text-sm text-stone-500 mt-2 leading-relaxed">{faq.a}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section id="get-started" className="scroll-mt-32 border-t border-stone-200 bg-gradient-to-b from-teal-50 to-white">
//         <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-3xl font-bold text-stone-900">Ready to list your first trip?</h2>
//           <p className="mt-4 text-stone-500">
//             Create your organizer account, complete verification, and publish your first experience.
//             The portal opens after you sign in.
//           </p>
//           <div className="mt-8 flex flex-wrap justify-center gap-3">
//             <Button size="lg" asChild>
//               <Link href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
//                 Create account
//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//             </Button>
//             <Button size="lg" variant="outline" asChild>
//               <Link href="/organizer/login?redirect=/organizer/dashboard">Sign in</Link>
//             </Button>
//           </div>
//           <p className="mt-6 text-sm text-stone-400">
//             Already exploring as a traveler?{" "}
//             <Link href="/" className={cn("text-teal-600 hover:underline")}>
//               Return to trip listings
//             </Link>
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CreditCard,
  Globe,
  Map,
  MessageSquare,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Star,
  ChevronDown,
  Compass,
  Mountain,
  Zap,
} from "lucide-react";
import { OrganizerLandingHeader } from "@/components/organizer/landing-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import OrganizerHero from "./components/organizerhero";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WhySection } from "./components/whySection";
import ScrollStack, { ScrollStackItem } from "./components/scrollstack";
import { HowItWorks } from "./components/howitworks";
import Tools from "./components/tools";
import CardSwap, { Card } from "./components/cardswap";
import { PaymentsSection } from "./components/payment";
import { ReachSection } from "./components/reachsection";
import { TrustSection } from "./components/trustsection";
import CircularGallery from "@/components/CircularGallery";
import { FAQSection } from "./components/faqsection";

gsap.registerPlugin(ScrollTrigger);

/* ─── DATA ──────────────────────────────────────────────────────── */

const NAV_SECTIONS = [
  { id: "why", label: "Why VaybeEx" },
  { id: "how-it-works", label: "How it works" },
  { id: "tools", label: "Tools" },
  { id: "payments", label: "Payments" },
  { id: "reach", label: "Reach" },
  { id: "trust", label: "Trust" },
  { id: "get-started", label: "Get started" },
];

const WHY_BENEFITS = [
  {
    icon: Globe,
    title: "Built for West Africa",
    desc: "Mobile money, local payment methods, and travelers who actively book group trips across Ghana and the region.",
    accent: "#c4864c",
  },
  {
    icon: Users,
    title: "Fill your trips faster",
    desc: "List on a marketplace where travelers search by destination, dates, and budget — and find you.",
    accent: "#6b3f1d",
  },
  {
    icon: Shield,
    title: "Trust that converts",
    desc: "Verified organizer badges, authentic reviews, and transparent seat counts help travelers book with confidence.",
    accent: "#c4864c",
  },
  {
    icon: TrendingUp,
    title: "Grow repeat business",
    desc: "Build a profile travelers return to. Past guests can review, rebook, and recommend your trips.",
    accent: "#6b3f1d",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up as an organizer, describe your business, and choose the destinations you run.",
    detail: "Takes about 5 minutes.",
  },
  {
    step: "02",
    title: "Get verified",
    desc: "Upload your Ghana Card or business registration. Most reviews complete within 1–2 business days.",
    detail: "One-time process.",
  },
  {
    step: "03",
    title: "Publish your trips",
    desc: "Add itineraries, pricing, capacity, photos, and optional add-ons like accommodation or transport.",
    detail: "No listing fee.",
  },
  {
    step: "04",
    title: "Accept bookings & withdraw",
    desc: "Track attendees, send updates to your group, and receive automatic payouts to MoMo or bank.",
    detail: "Payouts in 1–3 days.",
  },
];

const PAYMENT_POINTS = [
  "Accept card, MTN MoMo, Vodafone Cash, AirtelTigo Money, and direct bank transfer",
  "Collect deposits to secure spots while travelers pay the balance later",
  "Offer instalment plans — reduce friction, increase conversion",
  "Automatic payouts when trips hit minimum capacity or departure date",
  "No hidden charges — one transparent commission per confirmed booking",
];

const REACH_POINTS = [
  {
    label: "Homepage placement",
    desc: "Your trips featured on the traveler homepage and curated destination pages.",
  },
  {
    label: "Organizer profile",
    desc: "A public page with your bio, trip history, response rate, and verified reviews.",
  },
  {
    label: "Wishlist saves",
    desc: "Travelers save and return to your trips — push reminders bring them back.",
  },
  {
    label: "Alerts & nudges",
    desc: "SMS and email notifications keep your upcoming trips top of mind.",
  },
];

const TESTIMONIALS = [
  {
    name: "Kwame Asante",
    role: "Weekend Getaways, Accra",
    quote:
      "I went from chasing payments on WhatsApp to getting paid before departure. VaybeEx changed how I run my business.",
    trips: 14,
    rating: 5,
  },
  {
    name: "Abena Serwaa",
    role: "Cultural Tours, Kumasi",
    quote:
      "My Ashanti heritage tours now reach travelers from London, Lagos, and Accra. The reach I never had on my own.",
    trips: 28,
    rating: 5,
  },
  {
    name: "Ibrahim Issah",
    role: "Adventure Expeditions, Tamale",
    quote:
      "The attendee manager alone saved me hours every week. I can focus on the actual experience.",
    trips: 9,
    rating: 5,
  },
];

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: "Identity verified",
    desc: "Every organizer is verified with Ghana Card or business registration before going live.",
  },
  {
    icon: Star,
    title: "Review system",
    desc: "Real ratings from real travelers. You can't buy or remove a review.",
  },
  {
    icon: Zap,
    title: "Response rate tracked",
    desc: "Travelers see how fast you reply — fast responders convert better.",
  },
  {
    icon: Mountain,
    title: "Trip completion record",
    desc: "Your completed trip count is public. Every trip you run builds your reputation.",
  },
];

const FAQS = [
  {
    q: "Who can become an organizer?",
    a: "Tour operators, travel clubs, independent guides, and experience creators who run group trips in Ghana and West Africa.",
  },
  {
    q: "What does it cost?",
    a: "Creating an account is free. VaybeEx takes a small commission only when you receive a confirmed booking — no listing fee, no monthly charge.",
  },
  {
    q: "Do I handle payments myself?",
    a: "No. VaybeEx processes traveler payments and sends your earnings to your bank account or mobile money wallet automatically.",
  },
  {
    q: "Can I set a minimum group size?",
    a: "Yes. Set a minimum capacity — VaybeEx tracks progress and only triggers payouts once your trip is confirmed to run.",
  },
  {
    q: "Can I list international trips?",
    a: "Absolutely. Many organizers run trips from Ghana to Togo, Côte d'Ivoire, Senegal, and beyond. International trips are fully supported.",
  },
  {
    q: "What happens if a trip is cancelled?",
    a: "You control your cancellation policy. VaybeEx enforces it automatically and handles refunds according to the terms you set.",
  },
];

/* ─── HELPERS ────────────────────────────────────────────────────── */

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
      {children}
    </p>
  );
}

export function RevealBox({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 40, rotateX: 8 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.85,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      },
    );
  }, [delay]);
  return (
    <div
      ref={ref}
      style={{ opacity: 0, perspective: 800 }}
      className={className}
    >
      {children}
    </div>
  );
}

/* ─── PAGE ────────────────────────────────────────────────────────── */

export default function OrganizerLandingPage() {
  const [activeSection, setActiveSection] = useState("why");

  /* Active nav highlight via IntersectionObserver */
  useEffect(() => {
    const ids = NAV_SECTIONS.map((s) => s.id);
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.35 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* ── How it works: horizontal scroll pin ── */
  const howPinRef = useRef<HTMLDivElement>(null);
  const howTrackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!howPinRef.current || !howTrackRef.current) return;
    const track = howTrackRef.current;
    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - track.parentElement!.offsetWidth),
        ease: "none",
        scrollTrigger: {
          trigger: howPinRef.current,
          pin: true,
          scrub: 1,
          end: () =>
            `+=${track.scrollWidth - track.parentElement!.offsetWidth + 200}`,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  /* ── Tools: 3-D card hover tilt ── */
  const toolsGridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!toolsGridRef.current) return;
    const cards = Array.from(
      toolsGridRef.current.querySelectorAll<HTMLDivElement>(".tool-card"),
    );
    const cleanup: (() => void)[] = [];
    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 18;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -18;
        gsap.to(card, {
          rotateY: x,
          rotateX: y,
          scale: 1.03,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 900,
        });
      };
      const onLeave = () =>
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1,0.7)",
        });
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanup.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanup.forEach((fn) => fn());
  }, []);

  /* ── Payments section: counter animation ── */
  const paymentSecRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!paymentSecRef.current || !counterRef.current) return;
    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      gsap.fromTo(
        obj,
        { val: 0 },
        {
          val: 2.4,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: paymentSecRef.current,
            start: "top 70%",
            once: true,
          },
          onUpdate() {
            if (counterRef.current)
              counterRef.current.textContent = `GHS ${obj.val.toFixed(1)}M+`;
          },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  /* ── Testimonials: marquee-style infinite drift ── */
  const marqueeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!marqueeRef.current) return;
    const ctx = gsap.context(() => {
      const items = marqueeRef.current!.querySelectorAll(".tcard");
      const totalW =
        Array.from(items).reduce(
          (w, el) => w + (el as HTMLElement).offsetWidth + 24,
          0,
        ) / 2;
      gsap.to(marqueeRef.current, {
        x: -totalW,
        duration: 28,
        ease: "none",
        repeat: -1,
        modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % totalW) },
      });
    });
    return () => ctx.revert();
  }, []);

  /* ── Final CTA: starburst reveal ── */
  const ctaBgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ctaBgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ctaBgRef.current,
        { clipPath: "circle(0% at 50% 50%)" },
        {
          clipPath: "circle(100% at 50% 50%)",
          duration: 1.4,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: ctaBgRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <OrganizerLandingHeader />
      <OrganizerHero />

      {/* ── Sticky section nav ──────────────────────────────── */}
      <nav
        className="sticky top-16 z-40 border-b"
        style={{
          borderColor: "var(--border)",
          background: "rgba(251,247,241,0.96)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex gap-1 py-2 min-w-max">
            {NAV_SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    activeSection === s.id
                      ? "text-[var(--primary-dark)] font-bold"
                      : "text-[var(--text-secondary)] hover:text-[var(--primary)]",
                  )}
                  style={
                    activeSection === s.id
                      ? { background: "var(--primary-dim)" }
                      : {}
                  }
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          WHY VAYBEEX
      ══════════════════════════════════════════════════════ */}

      <WhySection />

      {/* ══════════════════════════════════════════════════════
          How it Works  Vertical steper
      ══════════════════════════════════════════════════════ */}

      <HowItWorks />

      {/* ══════════════════════════════════════════════════════
          TOOLS — 3D tilt cards
      ══════════════════════════════════════════════════════ */}
      <Tools />

      {/* ══════════════════════════════════════════════════════
          PAYMENTS — dark band with counter
      ══════════════════════════════════════════════════════ */}
   

      <PaymentsSection/>

     

      {/* ══════════════════════════════════════════════════════
          REACH
      ══════════════════════════════════════════════════════ */}
      <ReachSection/>

   

     

      {/* ══════════════════════════════════════════════════════
          TRUST & VERIFICATION
      ══════════════════════════════════════════════════════ */}
     

      {/* <TrustSection/> */}

  

      {/* ══════════════════════════════════════════════════════
          FAQs
      ══════════════════════════════════════════════════════ */}
     

      <FAQSection/>

      {/* ══════════════════════════════════════════════════════
          CTA — starburst reveal
      ══════════════════════════════════════════════════════ */}
      {/* <section
        id="get-started"
        className="scroll-mt-32 relative overflow-hidden"
      >
        <div
          ref={ctaBgRef}
          className="absolute inset-0"
          style={{
            background: "var(--gradient-brand)",
            clipPath: "circle(0% at 50% 50%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--bg-secondary)" }}
        />

        <div className="relative mx-auto max-w-3xl px-4 py-28 sm:px-6 lg:px-8 text-center">
          <RevealBox>
            <div
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl text-[#fbf7f1] shadow-[var(--shadow-glow-teal-strong)]"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Compass className="h-8 w-8" />
            </div>
            <h2 className="font-display text-4xl font-bold text-[#fbf7f1] sm:text-5xl">
              Your next trip is waiting
              <br />
              for its organizer.
            </h2>
            <p className="mt-5 text-lg text-white/75">
              Create your organizer account, complete verification, and publish
              your first experience. It takes less than 10 minutes.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                asChild
                className="border-0 bg-[#fbf7f1] px-8 text-[var(--primary-dark)] shadow-xl transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl"
              >
                <Link href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
                  Create organizer account
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="border border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/organizer/login?redirect=/organizer/dashboard">
                  Sign in to portal
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-white/50">
              Exploring as a traveler?{" "}
              <Link
                href="/"
                className="text-white/80 underline underline-offset-2 hover:text-white"
              >
                Return to trip listings
              </Link>
            </p>
          </RevealBox>
        </div>
      </section> */}
    </div>
  );
}
