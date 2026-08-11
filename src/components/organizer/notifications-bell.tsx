"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  CheckCheck,
  Loader2,
  Megaphone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { ApiError } from "@/lib/api/client";
import {
  getOrganizerUnreadCount,
  listOrganizerNotifications,
  markAllOrganizerNotificationsRead,
  markOrganizerNotificationRead,
  organizerNotificationHref,
  type OrganizerNotification,
} from "@/lib/api/organizer-notifications";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const POLL_MS = 30_000;

function typeIcon(type: string) {
  if (type.startsWith("refund_")) return RotateCcw;
  if (type.startsWith("withdrawal_")) return Wallet;
  if (type === "kyc_approved") return ShieldCheck;
  if (type === "kyc_rejected") return ShieldAlert;
  if (type === "admin_announcement") return Megaphone;
  return CalendarCheck;
}

export function OrganizerNotificationsBell() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<OrganizerNotification[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refreshCount = useCallback(async () => {
    try {
      setUnreadCount(await getOrganizerUnreadCount());
    } catch {
      /* keep last known badge */
    }
  }, []);

  const loadInbox = useCallback(
    async (nextPage = 1, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await listOrganizerNotifications({
          unread: unreadOnly || undefined,
          page: nextPage,
          limit: 15,
        });
        const rows = res.data.notifications;
        setItems((prev) => (append ? [...prev, ...rows] : rows));
        setPage(res.data.pagination.page);
        setPages(res.data.pagination.pages);
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        if (!append) setItems([]);
        if (err instanceof ApiError && err.status === 401) return;
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [unreadOnly]
  );

  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    const openInbox = () => setOpen(true);
    window.addEventListener("organizer:open-notifications", openInbox);
    return () => {
      window.removeEventListener("organizer:open-notifications", openInbox);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshCount();
    }, POLL_MS);
    const onFocus = () => {
      void refreshCount();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return;
    void loadInbox(1, false);
  }, [open, loadInbox]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openItem = async (item: OrganizerNotification) => {
    const href = organizerNotificationHref(item);
    setBusyId(item.id);
    if (!item.read) {
      try {
        const res = await markOrganizerNotificationRead(item.id);
        const next = res.data.notification;
        setItems((rows) =>
          rows.map((row) =>
            row.id === item.id ? { ...row, ...(next ?? { read: true }) } : row
          )
        );
        setUnreadCount((n) => Math.max(0, n - 1));
      } catch {
        /* still navigate */
      }
    }
    setBusyId(null);
    setOpen(false);
    router.push(href);
  };

  const markAll = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllOrganizerNotificationsRead();
      setUnreadCount(0);
      setItems((rows) => rows.map((row) => ({ ...row, read: true })));
    } catch {
      /* keep list */
    } finally {
      setMarkingAll(false);
    }
  };

  const badge =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-[var(--bg-secondary)]"
        style={{ color: "var(--text-secondary)" }}
        aria-label={
          badge ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-[18px] w-[18px]" />
        {badge ? (
          <span
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
            style={{ background: "var(--coral)" }}
          >
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(calc(100vw-1.5rem),22rem)] overflow-hidden rounded-2xl border bg-white shadow-xl"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="flex items-start justify-between gap-3 border-b px-4 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text)" }}
              >
                Notifications
              </p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You’re all caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void markAll()}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold disabled:opacity-40"
              style={{ color: "var(--primary)" }}
            >
              {markingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Mark all read
            </button>
          </div>

          <div className="flex gap-1.5 px-3 py-2">
            {(
              [
                { id: "all", label: "All", on: !unreadOnly },
                { id: "unread", label: "Unread", on: unreadOnly },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setUnreadOnly(tab.id === "unread")}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  tab.on ? "" : "opacity-70"
                )}
                style={{
                  background: tab.on ? "var(--primary-dim)" : "transparent",
                  color: tab.on ? "var(--primary)" : "var(--text-secondary)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
            {loading ? (
              <div
                className="flex items-center justify-center gap-2 py-10 text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <p
                className="px-4 py-10 text-center text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                {unreadOnly ? "No unread notifications." : "No notifications yet."}
              </p>
            ) : (
              <ul>
                {items.map((item) => {
                  const Icon = typeIcon(item.type);
                  const busy = busyId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => void openItem(item)}
                        disabled={busy}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-70"
                      >
                        <span
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            background: item.read
                              ? "var(--bg-secondary)"
                              : "var(--primary-dim)",
                            color: item.read
                              ? "var(--text-secondary)"
                              : "var(--primary)",
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span
                              className="text-sm font-semibold leading-snug"
                              style={{ color: "var(--text)" }}
                            >
                              {item.title}
                            </span>
                            {!item.read ? (
                              <span
                                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ background: "var(--coral)" }}
                              />
                            ) : null}
                          </span>
                          <span
                            className="mt-0.5 line-clamp-2 block text-xs leading-snug"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {item.body}
                          </span>
                          <span
                            className="mt-1 block text-[11px]"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {item.createdAt
                              ? formatRelativeTime(item.createdAt)
                              : ""}
                            {item.data?.ctaLabel
                              ? ` · ${item.data.ctaLabel}`
                              : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {page < pages ? (
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={() => void loadInbox(page + 1, true)}
                  disabled={loadingMore}
                  className="w-full rounded-xl py-2 text-xs font-semibold"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
