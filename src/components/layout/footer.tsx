import Link from "next/link";
import { Compass, Mail, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white">
                Vaybe<span className="text-teal-400">Ex</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              We know you. We care for you. We&apos;re with you — from booking to return.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Travelers</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/" className="transition-colors hover:text-teal-400">
                  Browse Trips
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-teal-400">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="transition-colors hover:text-teal-400">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Organizers</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/organizer" className="transition-colors hover:text-teal-400">
                  Why VaybeEx for organizers
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/login?mode=signup&redirect=/organizer/onboarding"
                  className="transition-colors hover:text-teal-400"
                >
                  Create organizer account
                </Link>
              </li>
              <li>
                <Link href="/organizer/login" className="transition-colors hover:text-teal-400">
                  Sign in to portal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Notifications</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> Email alerts
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> SMS reminders
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-stone-800 pt-6 text-center text-sm text-stone-500">
          © 2026 VaybeEx. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
