"use client";

import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function OrganizerLandingHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/organizer" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-stone-900">
              Vaybe<span className="text-teal-600">Ex</span>
            </span>
            <p className="text-xs text-stone-400 leading-none">For Organizers</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Traveler site</span>
            </Link>
          </Button>
          {!isAuthenticated && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/organizer/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
                  Create account
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
