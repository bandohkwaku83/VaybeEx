"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PlusCircle, Wallet, ArrowDownToLine, RotateCcw,
  MessageSquare, Compass, LogOut, BookOpen, Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/trips/verified-badge";

const links = [
  { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer/trips/new", label: "Create Trip", icon: PlusCircle },
  { href: "/organizer/payouts", label: "Payouts", icon: Wallet },
  { href: "/organizer/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/organizer/withdrawals", label: "Withdrawals", icon: ArrowDownToLine },
  { href: "/organizer/messages", label: "Communication", icon: MessageSquare },
  { href: "/organizer/settings", label: "Settings", icon: Settings },
];

export function OrganizerSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 border-r border-stone-200 bg-white hidden lg:flex flex-col">
      <div className="p-5 border-b border-stone-200">
        <Link href="/organizer/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-stone-900 text-sm">Vaybe<span className="text-teal-600">Ex</span></span>
            <p className="text-xs text-stone-400">Organizer Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/organizer/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-teal-50 text-teal-700" : "text-stone-600 hover:bg-stone-50"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-200">
        <div className="flex items-center gap-2 mb-3">
          <VerifiedBadge />
        </div>
        <Link href="/organizer" className="flex items-center gap-2 text-sm text-stone-500 hover:text-teal-600 mb-2">
          <BookOpen className="h-4 w-4" /> Organizer guide
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm text-stone-500 hover:text-teal-600 mb-2">
          <Compass className="h-4 w-4" /> Traveler site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 text-sm text-stone-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
