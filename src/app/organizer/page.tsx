"use client";

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
} from "lucide-react";
import { OrganizerLandingHeader } from "@/components/organizer/landing-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sections = [
  { id: "why", label: "Why VaybeEx" },
  { id: "how-it-works", label: "How it works" },
  { id: "tools", label: "Tools & features" },
  { id: "payments", label: "Payments" },
  { id: "reach", label: "Reach travelers" },
  { id: "get-started", label: "Get started" },
];

const whyBenefits = [
  {
    icon: Globe,
    title: "Built for West Africa",
    desc: "Mobile money, local payment methods, and travelers who book group trips across Ghana and the region.",
  },
  {
    icon: Users,
    title: "Fill your trips faster",
    desc: "List on a marketplace where travelers already search by destination, dates, and budget.",
  },
  {
    icon: Shield,
    title: "Trust that converts",
    desc: "Verified organizer badges, reviews, and transparent seat counts help travelers book with confidence.",
  },
  {
    icon: TrendingUp,
    title: "Grow repeat business",
    desc: "Build a profile travelers return to. Past guests can review, rebook, and recommend your trips.",
  },
];

const steps = [
  { step: 1, title: "Create your account", desc: "Sign up as an organizer and tell us about your business." },
  { step: 2, title: "Get verified", desc: "Upload ID and business documents. Most reviews complete in 1–2 days." },
  { step: 3, title: "Publish your trips", desc: "Add itineraries, pricing, capacity, and optional add-ons." },
  { step: 4, title: "Accept bookings & withdraw", desc: "Track attendees, send updates, and receive payouts automatically." },
];

const tools = [
  { icon: Map, title: "Trip builder", desc: "Draft, schedule, and publish trips with itineraries, inclusions, and photos." },
  { icon: Users, title: "Attendee management", desc: "See who paid, who is pending, and manage your full guest list in one place." },
  { icon: BarChart3, title: "Analytics", desc: "Track views, conversion rates, and revenue per trip." },
  { icon: MessageSquare, title: "Communication", desc: "Send updates to paid, partial, or pending members on any trip." },
  { icon: Bell, title: "Waitlist alerts", desc: "Automatically notify travelers when a spot opens on a full trip." },
  { icon: Wallet, title: "Payout dashboard", desc: "Monitor pending, processing, and completed payouts." },
];

const paymentPoints = [
  "Accept card, MTN MoMo, Vodafone Cash, AirtelTigo, and bank transfer on your behalf",
  "Collect deposits to secure spots while travelers pay the balance later",
  "Offer instalment plans to reduce booking friction",
  "Automatic payouts when trips hit minimum capacity or departure date",
  "Clear fee breakdown — no hidden charges",
];

const reachPoints = [
  "Featured on the traveler homepage and search filters",
  "Organizer profile page with bio, reviews, and trip history",
  "Wishlist saves that bring travelers back to your trips",
  "SMS and email notifications that keep your trips top of mind",
];

const faqs = [
  {
    q: "Who can become an organizer?",
    a: "Tour operators, travel clubs, independent guides, and experience creators who run group trips in Ghana and West Africa.",
  },
  {
    q: "What does it cost?",
    a: "Creating an account is free. VaybeEx takes a small commission only when you receive a confirmed booking.",
  },
  {
    q: "Do I need to handle payments myself?",
    a: "No. VaybeEx processes traveler payments and sends your earnings to your bank or mobile money account.",
  },
  {
    q: "Can I run trips with a minimum group size?",
    a: "Yes. Set a minimum capacity and VaybeEx tracks progress so you know when your trip is confirmed to run.",
  },
];

export default function OrganizerLandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <OrganizerLandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1e3636] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(61,139,139,0.25),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e07850]">
            For trip organizers
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
            Bring your trips to VaybeEx. Reach more travelers. Get paid with less admin.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70 leading-relaxed">
            Whether you run weekend getaways, cultural tours, or adventure expeditions — VaybeEx gives you
            the tools to list, sell, and manage group trips in one place.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700" asChild>
              <Link href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
                Create organizer account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white" asChild>
              <Link href="/organizer/login?redirect=/organizer/dashboard">Sign in to portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section nav */}
      <nav className="sticky top-16 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex gap-1 py-2 min-w-max">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-teal-50 hover:text-teal-700 transition-colors whitespace-nowrap"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Why VaybeEx */}
      <section id="why" className="scroll-mt-32 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-stone-900">Why bring your trips here?</h2>
          <p className="mt-3 text-stone-500">
            Stop juggling spreadsheets, DMs, and manual payment follow-ups. VaybeEx is built for organizers
            who want more bookings and less back-office work.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyBenefits.map((b) => (
            <Card key={b.title} className="border-stone-200">
              <CardContent className="p-6">
                <b.icon className="h-8 w-8 text-teal-600 mb-4" />
                <h3 className="font-semibold text-stone-900">{b.title}</h3>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-32 bg-white border-y border-stone-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-stone-900">How it works</h2>
            <p className="mt-3 text-stone-500">From sign-up to your first payout in four steps.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-stone-200 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold">
                  {s.step}
                </span>
                <h3 className="mt-4 font-semibold text-stone-900">{s.title}</h3>
                <p className="text-sm text-stone-500 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="scroll-mt-32 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-stone-900">Tools built for your workflow</h2>
          <p className="mt-3 text-stone-500">
            Everything you need to run group trips — inside one organizer portal.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Card key={t.title} className="hover:border-teal-200 transition-colors">
              <CardContent className="p-5 flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <t.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">{t.title}</h3>
                  <p className="text-sm text-stone-500 mt-1">{t.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Payments */}
      <section id="payments" className="scroll-mt-32 bg-teal-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <CreditCard className="h-10 w-10 text-teal-300 mb-4" />
              <h2 className="text-3xl font-bold">Payments & payouts handled for you</h2>
              <p className="mt-4 text-teal-100/80 leading-relaxed">
                Travelers pay through VaybeEx using the methods they already trust. You focus on the
                experience — we handle collection, receipts, and your payout.
              </p>
            </div>
            <ul className="space-y-3">
              {paymentPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-teal-50">
                  <Check className="h-5 w-5 shrink-0 text-teal-300 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reach */}
      <section id="reach" className="scroll-mt-32 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Sparkles className="h-10 w-10 text-teal-600 mb-4" />
            <h2 className="text-3xl font-bold text-stone-900">Put your trips in front of ready travelers</h2>
            <p className="mt-4 text-stone-500 leading-relaxed">
              Your trips appear where people are already looking. A strong organizer profile turns
              first-time viewers into repeat bookers.
            </p>
          </div>
          <ul className="space-y-4">
            {reachPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
                <Check className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Common questions</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.q}>
                <CardContent className="p-5">
                  <h4 className="font-semibold text-stone-900">{faq.q}</h4>
                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="scroll-mt-32 border-t border-stone-200 bg-gradient-to-b from-teal-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-stone-900">Ready to list your first trip?</h2>
          <p className="mt-4 text-stone-500">
            Create your organizer account, complete verification, and publish your first experience.
            The portal opens after you sign in.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/organizer/login?redirect=/organizer/dashboard">Sign in</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-stone-400">
            Already exploring as a traveler?{" "}
            <Link href="/" className={cn("text-teal-600 hover:underline")}>
              Return to trip listings
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
