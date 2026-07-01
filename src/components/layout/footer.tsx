"use client"
import Link from "next/link";
import { Compass, Mail, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--border)",
        background: "var(--primary-dark)",
        color: "var(--bg-secondary)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center text-white"
                style={{
                  background: "var(--gradient-warm)",
                  borderRadius: "10px",
                }}
              >
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold" style={{ color: "#fbf7f1" }}>
                Vaybe
                <span
                  style={{
                    background: "linear-gradient(90deg, var(--gold), var(--amber))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Ex
                </span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(251, 247, 241, 0.55)" }}>
              We know you. We care for you. We&apos;re with you — from booking to return.
            </p>
          </div>

          <div>
            <h4 className="font-display mb-3 font-semibold" style={{ color: "#fbf7f1" }}>
              Travelers
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(251, 247, 241, 0.55)" }}>
              <li>
                <FooterLink href="/">Browse Trips</FooterLink>
              </li>
              <li>
                <FooterLink href="/dashboard">My Dashboard</FooterLink>
              </li>
              <li>
                <FooterLink href="/wishlist">Wishlist</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-3 font-semibold" style={{ color: "#fbf7f1" }}>
              Organizers
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(251, 247, 241, 0.55)" }}>
              <li>
                <FooterLink href="/organizer">Why VaybeEx for organizers</FooterLink>
              </li>
              <li>
                <FooterLink href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
                  Create organizer account
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/organizer/login">Sign in to portal</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-3 font-semibold" style={{ color: "#fbf7f1" }}>
              Notifications
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(251, 247, 241, 0.55)" }}>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} /> Email alerts
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} /> SMS
                reminders
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 border-t pt-6 text-center text-sm"
          style={{
            borderColor: "rgba(251, 247, 241, 0.1)",
            color: "rgba(251, 247, 241, 0.4)",
          }}
        >
          © 2026 VaybeEx. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="transition-colors"
      style={{ color: "inherit" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--gold)")}
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(251, 247, 241, 0.55)")
      }
    >
      {children}
    </Link>
  );
}