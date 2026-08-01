"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import { getOrganizerProfile } from "@/lib/organizer-profile";
import { OrganizerMobileMenuButton } from "@/components/organizer/mobile-nav";

export function OrganizerTopbar({
  menuOpen,
  onMenuToggle,
}: {
  menuOpen?: boolean;
  onMenuToggle?: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>("");

  useEffect(() => {
    try {
      const profile = getOrganizerProfile();
      setAvatar(profile.profilePicture);
      setBusinessName(profile.businessName.trim());
    } catch {
      setAvatar(null);
      setBusinessName("");
    }
  }, [user?.name, user?.email, user?.organizerStatus]);

  const firstName = user?.name?.split(" ")[0] ?? "Organizer";
  const subtitle = businessName || "Profile";

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/organizer/trips/new");
      return;
    }
    router.push(`/organizer/trips/new?q=${encodeURIComponent(q)}`);
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-[65px] shrink-0 items-center gap-2.5 border-b px-3 sm:gap-4 sm:px-6"
      style={{
        borderColor: "var(--border)",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
      }}
    >
      {onMenuToggle ? (
        <OrganizerMobileMenuButton
          open={Boolean(menuOpen)}
          onToggle={onMenuToggle}
        />
      ) : null}

      <form onSubmit={onSearch} className="relative min-w-0 max-w-xl flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--text-tertiary)" }}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search trips…"
          className="h-10 w-full rounded-xl border bg-transparent pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)]"
          style={{
            borderColor: "var(--border)",
            color: "var(--text)",
            background: "var(--surface)",
          }}
          aria-label="Search trips"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <Link
          href="/organizer/messages"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Messages"
        >
          <Bell className="h-[18px] w-[18px]" />
        </Link>

        <Link
          href="/organizer/settings"
          className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-1.5 transition-colors sm:pr-3"
          aria-label="Open profile settings"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold"
            style={{
              background: "var(--primary-dim)",
              color: "var(--primary)",
            }}
          >
            <img
              src={avatar || DEFAULT_PROFILE_IMAGE}
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span
              className="block truncate text-sm font-semibold leading-tight"
              style={{ color: "var(--text)" }}
            >
              {firstName}
            </span>
            <span
              className="block truncate text-[11px] leading-tight"
              style={{ color: "var(--text-tertiary)" }}
            >
              {subtitle}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
