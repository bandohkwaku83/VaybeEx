"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  activityLabel,
  approveOrganizer,
  getAdminUser,
  getAdminUserReview,
  parseAdminReviewQueue,
  rejectOrganizer,
  type AdminActivityItem,
  type AdminReviewQueue,
  type AdminUser,
} from "@/lib/api/admin";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import {
  formatDateShort,
  formatGHS,
  formatGHSMoney,
  formatRelativeTime,
} from "@/lib/format";
import { tripSpecialtyLabel } from "@/lib/trip-specialties";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function SoftPill({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

function statusPill(user: AdminUser) {
  if (user.role === "organizer") {
    const review = getAdminUserReview(user);
    if (review.isResubmission) {
      return <SoftPill label="Resubmitted" bg="#fff7ed" color="#c2410c" />;
    }
    const status = review.status || user.status || "unset";
    if (status === "pending" && user.onboardingCompleted) {
      return <SoftPill label="Pending approval" bg="#fffbeb" color="#b45309" />;
    }
    if (status === "approved") {
      return <SoftPill label="Approved" bg="#f0fdf4" color="#15803d" />;
    }
    if (status === "rejected") {
      return <SoftPill label="Rejected" bg="#fef2f2" color="#b91c1c" />;
    }
    if (!user.onboardingCompleted) {
      return (
        <SoftPill label="Setup incomplete" bg="#f5f5f5" color="#525252" />
      );
    }
  }
  if (user.isVerified) {
    return <SoftPill label="Verified" bg="#eff6ff" color="#1d4ed8" />;
  }
  return <SoftPill label="Unverified" bg="#f5f5f5" color="#737373" />;
}

function rolePill(role: string) {
  if (role === "organizer") {
    return <SoftPill label="Organizer" bg="#171717" color="#fff" />;
  }
  if (role === "traveler") {
    return <SoftPill label="Traveler" bg="#f5f5f5" color="#404040" />;
  }
  return <SoftPill label={role} bg="#f5f5f5" color="#404040" />;
}

function FieldRow({
  label,
  children,
  copyValue,
}: {
  label: string;
  children: React.ReactNode;
  copyValue?: string;
}) {
  const onCopy = async () => {
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#f0f0f0] py-3.5 last:border-0">
      <div className="min-w-0">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.14em]"
          style={{ color: "#a3a3a3" }}
        >
          {label}
        </p>
        <div className="mt-1 text-sm font-medium" style={{ color: "#171717" }}>
          {children}
        </div>
      </div>
      {copyValue ? (
        <button
          type="button"
          onClick={() => void onCopy()}
          className="mt-0.5 shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[#f5f5f5]"
          style={{ color: "#a3a3a3" }}
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function StatBlock({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <p
        className="text-[11px] font-medium uppercase tracking-[0.14em]"
        style={{ color: "#a3a3a3" }}
      >
        {label}
      </p>
      <p
        className="mt-2 font-display text-2xl font-bold tabular-nums tracking-tight sm:text-[1.75rem]"
        style={{ color: "#171717" }}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs" style={{ color: "#737373" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ActivityRow({ item }: { item: AdminActivityItem }) {
  return (
    <li className="flex gap-3 border-b border-[#f0f0f0] py-3.5 last:border-0">
      <span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: "#d4d4d4" }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: "#171717" }}>
          {item.summary || activityLabel(item.action)}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "#a3a3a3" }}>
          {activityLabel(item.action)}
          {item.action === "logged_in"
            ? item.loginAt || item.createdAt
              ? ` · ${formatRelativeTime(item.loginAt || item.createdAt)}`
              : ""
            : item.createdAt
              ? ` · ${formatRelativeTime(item.createdAt)}`
              : ""}
          {item.device?.label ? ` · ${item.device.label}` : ""}
          {item.ip ? ` · ${item.ip}` : ""}
          {item.trip?.title ? ` · ${item.trip.title}` : ""}
        </p>
        {item.cancellationId ? (
          <Link
            href={`/admin-portal/refunds/${item.cancellationId}`}
            className="mt-1 inline-block text-xs font-medium hover:underline"
            style={{ color: "#171717" }}
          >
            View refund
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function UserDetailInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;

  const fromQueue =
    parseAdminReviewQueue(searchParams.get("from")) ??
    (searchParams.get("from") === "approvals" ? "pending_approval" : null);
  const backHref = fromQueue
    ? `/admin-portal/users?queue=${fromQueue}`
    : "/admin-portal/users";

  const queueLabel = (queue: AdminReviewQueue) =>
    queue === "resubmitted"
      ? "Resubmitted"
      : queue === "rejected"
        ? "Rejected"
        : "Approvals";

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [idLightbox, setIdLightbox] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUser(id);
      setUser(res.data?.user ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load user."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const review = user ? getAdminUserReview(user) : null;
  const canApprove = Boolean(review?.canApprove);
  const canReject = Boolean(review?.canReject);
  const canDecide = canApprove || canReject;
  const rejectReasonOk = rejectReason.trim().length >= 8;

  const onApprove = async () => {
    if (!user || !review?.canApprove) return;
    setActing(true);
    try {
      const res = await approveOrganizer(user.id);
      const code = res.code;
      const previouslyRejected = Boolean(res.data?.previouslyRejected);
      toast.success(
        res.message ||
          (code === "ORGANIZER_ALREADY_APPROVED"
            ? "Already approved"
            : previouslyRejected
              ? "Updated application approved"
              : "Organizer approved")
      );
      setUser(res.data?.user ?? user);
      if (fromQueue) {
        router.push(`/admin-portal/users?queue=${fromQueue}`);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Approve failed."
      );
    } finally {
      setActing(false);
    }
  };

  const onReject = async () => {
    if (!user || !review?.canReject) return;
    const reason = rejectReason.trim();
    if (reason.length < 8) {
      toast.error("Add a rejection reason (at least 8 characters).");
      return;
    }
    setActing(true);
    try {
      const res = await rejectOrganizer(user.id, { reason });
      const code = res.code;
      toast.success(
        res.message ||
          (code === "ORGANIZER_REJECTION_UPDATED"
            ? "Rejection reason updated"
            : code === "ORGANIZER_ALREADY_REJECTED"
              ? "Already rejected"
              : "Application rejected")
      );
      setRejectOpen(false);
      setRejectReason("");
      setUser(res.data?.user ?? user);
      if (fromQueue) {
        router.push(`/admin-portal/users?queue=${fromQueue}`);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Reject failed."
      );
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 p-8 text-sm"
        style={{ color: "#737373" }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile…
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#737373" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#fff",
            boxShadow: "inset 0 0 0 1px rgba(220,38,38,0.2)",
          }}
        >
          <p style={{ color: "#dc2626" }}>{error || "User not found"}</p>
          <Button className="mt-3" variant="outline" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const isOrganizer = user.role === "organizer";
  const displayName =
    user.fullName || user.businessName || user.email.split("@")[0];

  const tripStats = user.stats?.trips;
  const bookingStats = user.stats?.bookings;
  const withdrawalStats = user.stats?.withdrawals;
  const refundStats = user.stats?.refunds;
  const refundsHref = isOrganizer
    ? `/admin-portal/refunds?organizerId=${user.id}`
    : `/admin-portal/refunds?travelerId=${user.id}`;
  const activityHref = `/admin-portal/activity?userId=${user.id}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4, ease }}
        className="mb-6 flex items-center gap-2"
      >
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-neutral-900"
          style={{ color: "#737373" }}
        >
          <ArrowLeft className="h-4 w-4" />
          {fromQueue ? queueLabel(fromQueue) : "People"}
        </Link>
        <span style={{ color: "#d4d4d4" }}>/</span>
        <span className="truncate text-sm font-medium" style={{ color: "#171717" }}>
          {displayName}
        </span>
      </motion.div>

      {/* Identity header */}
      <motion.header
        {...fadeUp}
        transition={{ delay: 0.04, duration: 0.45, ease }}
        className="rounded-2xl bg-white p-4 sm:p-5"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl sm:h-16 sm:w-16"
              style={{
                background: "#f5f5f5",
                boxShadow: "inset 0 0 0 1px #e5e5e5",
              }}
            >
              <Image
                src={user.profilePhoto || DEFAULT_PROFILE_IMAGE}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="64px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="font-display text-xl font-bold tracking-tight sm:text-2xl"
                  style={{ color: "#171717" }}
                >
                  {displayName}
                </h1>
                {rolePill(user.role)}
                {statusPill(user)}
              </div>

              <p
                className="mt-1 truncate text-sm"
                style={{ color: "#737373" }}
              >
                {user.email}
                {isOrganizer && user.brandSlug ? (
                  <span style={{ color: "#a3a3a3" }}>
                    {" "}
                    · @{user.brandSlug}
                  </span>
                ) : null}
              </p>

              {(user.phone || user.location || user.createdAt || user.lastLoginAt) && (
                <div
                  className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm"
                  style={{ color: "#737373" }}
                >
                  {user.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone
                        className="h-3 w-3"
                        style={{ color: "#a3a3a3" }}
                      />
                      {user.phone}
                    </span>
                  ) : null}
                  {user.phone && (user.location || user.createdAt) ? (
                    <span style={{ color: "#d4d4d4" }}>·</span>
                  ) : null}
                  {user.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin
                        className="h-3 w-3"
                        style={{ color: "#a3a3a3" }}
                      />
                      {user.location}
                    </span>
                  ) : null}
                  {user.location && user.createdAt ? (
                    <span style={{ color: "#d4d4d4" }}>·</span>
                  ) : null}
                  {user.createdAt ? (
                    <span>
                      Joined {formatDateShort(user.createdAt)}
                      <span style={{ color: "#a3a3a3" }}>
                        {" "}
                        · {formatRelativeTime(user.createdAt)}
                      </span>
                    </span>
                  ) : null}
                  {user.lastLoginAt ? (
                    <>
                      {user.createdAt ? (
                        <span style={{ color: "#d4d4d4" }}>·</span>
                      ) : null}
                      <span>
                        Last seen {formatRelativeTime(user.lastLoginAt)}
                        {user.lastLoginDevice?.label
                          ? ` · ${user.lastLoginDevice.label}`
                          : ""}
                      </span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {canDecide ? (
            <div className="flex shrink-0 gap-2 sm:pt-0.5">
              <Button
                variant="outline"
                disabled={acting || !canReject}
                onClick={() => setRejectOpen(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <X className="mr-1.5 h-4 w-4" />
                Reject
              </Button>
              <Button
                disabled={acting || !canApprove}
                onClick={() => void onApprove()}
                className="bg-[#171717] text-white hover:bg-neutral-800"
              >
                {acting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                {review?.isResubmission ? "Approve resubmission" : "Approve"}
              </Button>
            </div>
          ) : null}
        </div>
      </motion.header>

      {canDecide ? (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.08, duration: 0.45, ease }}
          className="mt-5 flex gap-3 rounded-2xl p-4 sm:p-5"
          style={{
            background: "#171717",
            boxShadow: "0 18px 40px -24px rgba(23,23,23,0.55)",
          }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
          >
            <ShieldCheck className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-white">
              {review?.isResubmission
                ? "Resubmission — check what you asked them to fix"
                : "Awaiting your decision"}
            </p>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {review?.isResubmission
                ? "They came back after a rejection. Confirm the previous issue is resolved, then approve or reject again."
                : "Review their National ID and profile below, then approve or reject this organizer application."}
            </p>
            {review?.isResubmission && review.resubmissionCount > 0 ? (
              <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                Resubmitted {review.resubmissionCount} time
                {review.resubmissionCount === 1 ? "" : "s"}
                {review.resubmittedAt
                  ? ` · ${formatRelativeTime(review.resubmittedAt)}`
                  : ""}
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      {review?.isResubmission && review.previousRejectionReason ? (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.08, duration: 0.45, ease }}
          className="mt-5 flex gap-3 rounded-2xl p-4 sm:p-5"
          style={{
            background: "#fff7ed",
            boxShadow: "inset 0 0 0 1px rgba(194,65,12,0.18)",
          }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "#ffedd5", color: "#c2410c" }}
          >
            <ShieldAlert className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold" style={{ color: "#9a3412" }}>
              What you asked them to fix
            </p>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: "#c2410c" }}
            >
              {review.previousRejectionReason}
            </p>
          </div>
        </motion.div>
      ) : null}

      {(review?.rejectionReason || user.rejectionReason) &&
      review?.status === "rejected" ? (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.08, duration: 0.45, ease }}
          className="mt-5 flex gap-3 rounded-2xl p-4 sm:p-5"
          style={{
            background: "#fef2f2",
            boxShadow: "inset 0 0 0 1px rgba(220,38,38,0.15)",
          }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "#fee2e2", color: "#b91c1c" }}
          >
            <ShieldAlert className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold" style={{ color: "#991b1b" }}>
              Rejection reason
            </p>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: "#b91c1c" }}
            >
              {review?.rejectionReason || user.rejectionReason}
            </p>
          </div>
        </motion.div>
      ) : null}

      <div
        className={cn(
          "mt-5 grid gap-5",
          isOrganizer ? "lg:grid-cols-[1fr_1.05fr]" : "lg:grid-cols-1"
        )}
      >
        {/* Profile & contact */}
        <motion.section
          {...fadeUp}
          transition={{ delay: 0.1, duration: 0.45, ease }}
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: "#fff",
            boxShadow: "inset 0 0 0 1px #e5e5e5",
          }}
        >
          <h2
            className="font-display text-base font-semibold tracking-tight"
            style={{ color: "#171717" }}
          >
            Profile
          </h2>

          <div className="mt-1">
            <FieldRow label="Full name" copyValue={user.fullName}>
              {user.fullName || "—"}
            </FieldRow>
            <FieldRow label="Email" copyValue={user.email}>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" style={{ color: "#a3a3a3" }} />
                {user.email}
              </span>
            </FieldRow>
            {user.phone ? (
              <FieldRow label="Phone" copyValue={user.phone}>
                {user.phone}
              </FieldRow>
            ) : null}
            {isOrganizer && user.businessName ? (
              <FieldRow label="Business" copyValue={user.businessName}>
                <span className="inline-flex items-center gap-1.5">
                  <Building2
                    className="h-3.5 w-3.5"
                    style={{ color: "#a3a3a3" }}
                  />
                  {user.businessName}
                </span>
              </FieldRow>
            ) : null}
            {isOrganizer && user.brandSlug ? (
              <FieldRow label="Brand slug" copyValue={user.brandSlug}>
                @{user.brandSlug}
              </FieldRow>
            ) : null}
            {user.location ? (
              <FieldRow label="Location">{user.location}</FieldRow>
            ) : null}
            {user.authProvider ? (
              <FieldRow label="Auth">{user.authProvider}</FieldRow>
            ) : null}
            {user.lastLoginAt ? (
              <FieldRow label="Last seen">
                {formatDateShort(user.lastLoginAt)}
                <span className="ml-1.5 text-xs font-normal" style={{ color: "#a3a3a3" }}>
                  {formatRelativeTime(user.lastLoginAt)}
                </span>
              </FieldRow>
            ) : null}
            {user.lastLoginDevice?.label ? (
              <FieldRow label="Device">
                {user.lastLoginDevice.label}
                {user.lastLoginIp ? (
                  <span className="ml-1.5 font-mono text-xs font-normal" style={{ color: "#a3a3a3" }}>
                    {user.lastLoginIp}
                  </span>
                ) : null}
              </FieldRow>
            ) : user.lastLoginIp ? (
              <FieldRow label="Last IP" copyValue={user.lastLoginIp}>
                {user.lastLoginIp}
              </FieldRow>
            ) : null}
            {user.reviewedAt ? (
              <FieldRow label="Reviewed">
                {formatDateShort(user.reviewedAt)}
              </FieldRow>
            ) : null}
          </div>

          {isOrganizer && user.aboutYou ? (
            <div className="mt-5 border-t border-[#f0f0f0] pt-5">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.14em]"
                style={{ color: "#a3a3a3" }}
              >
                About
              </p>
              <p
                className="mt-2 whitespace-pre-wrap text-sm leading-relaxed"
                style={{ color: "#525252" }}
              >
                {user.aboutYou}
              </p>
            </div>
          ) : null}

          {isOrganizer && (user.tripSpecialties?.length ?? 0) > 0 ? (
            <div className="mt-5 border-t border-[#f0f0f0] pt-5">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.14em]"
                style={{ color: "#a3a3a3" }}
              >
                Specialties
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {user.tripSpecialties!.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{ background: "#f5f5f5", color: "#525252" }}
                  >
                    {tripSpecialtyLabel(s)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {isOrganizer && user.brandLogo ? (
            <div className="mt-5 border-t border-[#f0f0f0] pt-5">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.14em]"
                style={{ color: "#a3a3a3" }}
              >
                Brand logo
              </p>
              <div
                className="relative mt-2.5 h-14 w-14 overflow-hidden rounded-xl"
                style={{
                  background: "#fafafa",
                  boxShadow: "inset 0 0 0 1px #e5e5e5",
                }}
              >
                <Image
                  src={user.brandLogo}
                  alt=""
                  fill
                  unoptimized
                  className="object-contain p-1.5"
                  sizes="56px"
                />
              </div>
            </div>
          ) : null}
        </motion.section>

        {/* National ID — organizers */}
        {isOrganizer ? (
          <motion.section
            {...fadeUp}
            transition={{ delay: 0.14, duration: 0.45, ease }}
            className="rounded-2xl p-5 sm:p-6"
            style={{
              background: "#fff",
              boxShadow: "inset 0 0 0 1px #e5e5e5",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  className="font-display text-base font-semibold tracking-tight"
                  style={{ color: "#171717" }}
                >
                  National ID
                </h2>
                <p className="mt-1 text-sm" style={{ color: "#737373" }}>
                  {user.nationalIdPhoto
                    ? "Tap to enlarge for verification"
                    : "No document uploaded"}
                </p>
              </div>
              {user.nationalIdPhoto ? (
                <button
                  type="button"
                  onClick={() => setIdLightbox(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[#f5f5f5]"
                  style={{ color: "#525252" }}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  Enlarge
                </button>
              ) : null}
            </div>

            {user.nationalIdPhoto ? (
              <button
                type="button"
                onClick={() => setIdLightbox(true)}
                className="group relative mt-4 block aspect-[4/3] w-full overflow-hidden rounded-xl text-left"
                style={{
                  background: "#0a0a0a",
                  boxShadow: "inset 0 0 0 1px #e5e5e5",
                }}
              >
                <Image
                  src={user.nationalIdPhoto}
                  alt="National ID"
                  fill
                  unoptimized
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
                <span
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background: "rgba(23,23,23,0.85)",
                    color: "#fff",
                  }}
                >
                  <ZoomIn className="h-3 w-3" />
                  View full size
                </span>
              </button>
            ) : (
              <div
                className="mt-4 flex aspect-[4/3] flex-col items-center justify-center rounded-xl"
                style={{
                  background: "#fafafa",
                  boxShadow: "inset 0 0 0 1px #e5e5e5",
                }}
              >
                <ShieldAlert
                  className="h-8 w-8"
                  style={{ color: "#d4d4d4" }}
                  strokeWidth={1.5}
                />
                <p className="mt-3 text-sm" style={{ color: "#a3a3a3" }}>
                  No National ID on file
                </p>
              </div>
            )}
          </motion.section>
        ) : null}
      </div>

      {/* Activity */}
      {user.stats ? (
        <motion.section
          {...fadeUp}
          transition={{ delay: 0.18, duration: 0.45, ease }}
          className="mt-5 rounded-2xl p-5 sm:p-6"
          style={{
            background: "#fff",
            boxShadow: "inset 0 0 0 1px #e5e5e5",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2
              className="font-display text-base font-semibold tracking-tight"
              style={{ color: "#171717" }}
            >
              Activity
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={activityHref}
                className="group inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: "#171717" }}
              >
                View all activity
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={refundsHref}
                className="group inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: "#171717" }}
              >
                View refunds
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              {isOrganizer ? (
                <>
                  <Link
                    href={`/admin-portal/trips?organizerId=${user.id}`}
                    className="group inline-flex items-center gap-1 text-sm font-semibold"
                    style={{ color: "#171717" }}
                  >
                    Trips
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href={`/admin-portal/withdrawals?organizerId=${user.id}`}
                    className="group inline-flex items-center gap-1 text-sm font-semibold"
                    style={{ color: "#171717" }}
                  >
                    Payouts
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "mt-5 grid gap-6",
              "sm:grid-cols-2 lg:grid-cols-4"
            )}
          >
            {tripStats ? (
              <>
                <StatBlock
                  label="Trips"
                  value={tripStats.total}
                  hint={`${tripStats.live} live · ${tripStats.completed} done`}
                />
                <StatBlock
                  label="Scheduled"
                  value={tripStats.scheduled}
                  hint={`${tripStats.draft} draft · ${tripStats.cancelled} cancelled`}
                />
              </>
            ) : null}
            {withdrawalStats ? (
              <StatBlock
                label="Paid out"
                value={formatGHS(withdrawalStats.totalAmount)}
                hint={`${withdrawalStats.success} paid · ${withdrawalStats.failed} rejected`}
              />
            ) : null}
            {bookingStats ? (
              <StatBlock
                label="Bookings"
                value={bookingStats.total}
                hint={`${bookingStats.confirmed} confirmed · ${bookingStats.cancelled} cancelled`}
              />
            ) : null}
            {refundStats ? (
              <StatBlock
                label="Refunds"
                value={refundStats.total}
                hint={`${refundStats.refunded} sent · ${formatGHSMoney(refundStats.refundedAmount)}`}
              />
            ) : null}
          </div>
        </motion.section>
      ) : (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.18, duration: 0.45, ease }}
          className="mt-5 flex flex-wrap gap-4"
        >
          <Link
            href={activityHref}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "#171717" }}
          >
            View all activity
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={refundsHref}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "#171717" }}
          >
            View refunds
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {isOrganizer ? (
            <Link
              href={`/admin-portal/withdrawals?organizerId=${user.id}`}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "#171717" }}
            >
              View payouts
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </motion.div>
      )}

      <motion.section
        {...fadeUp}
        transition={{ delay: 0.22, duration: 0.45, ease }}
        className="mt-5 rounded-2xl p-5 sm:p-6"
        style={{
          background: "#fff",
          boxShadow: "inset 0 0 0 1px #e5e5e5",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              className="font-display text-base font-semibold tracking-tight"
              style={{ color: "#171717" }}
            >
              Recent activity
            </h2>
            <p className="mt-1 text-sm" style={{ color: "#737373" }}>
              Last {user.recentActivity?.length ?? 0} events on this account
            </p>
          </div>
          <Link
            href={activityHref}
            className="group inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: "#171717" }}
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {(user.recentActivity?.length ?? 0) > 0 ? (
          <ol className="mt-5 space-y-0">
            {user.recentActivity!.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </ol>
        ) : (
          <p className="mt-5 text-sm" style={{ color: "#a3a3a3" }}>
            No recent activity recorded.
          </p>
        )}
      </motion.section>

      {/* Sticky mobile actions — sits above bottom tab bar */}
      {canDecide ? (
        <>
          <div className="h-16 lg:hidden" aria-hidden />
          <div
            className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t border-[#e5e5e5] bg-white/95 p-3 backdrop-blur-sm lg:hidden"
            style={{ boxShadow: "0 -8px 24px -16px rgba(0,0,0,0.18)" }}
          >
            <div className="mx-auto flex max-w-6xl gap-2">
              <Button
                variant="outline"
                disabled={acting || !canReject}
                onClick={() => setRejectOpen(true)}
                className="flex-1 border-red-200 text-red-600"
              >
                Reject
              </Button>
              <Button
                disabled={acting || !canApprove}
                onClick={() => void onApprove()}
                className="flex-1 bg-[#171717] text-white"
              >
                {acting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                {review?.isResubmission ? "Approve resubmission" : "Approve"}
              </Button>
            </div>
          </div>
        </>
      ) : null}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              A reason is required. The organizer sees this on their account and
              in the rejection email.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. National ID photo is unclear. Please upload a sharper image."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs" style={{ color: rejectReasonOk ? "#737373" : "#b91c1c" }}>
            {rejectReason.trim().length}/8 characters minimum
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={acting || !rejectReasonOk}
              onClick={() => void onReject()}
              className="bg-[#b91c1c] text-white hover:bg-red-800"
            >
              {acting ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={idLightbox} onOpenChange={setIdLightbox}>
        <DialogContent className="max-w-3xl p-2 sm:p-3">
          <DialogHeader className="sr-only">
            <DialogTitle>National ID</DialogTitle>
          </DialogHeader>
          {user.nationalIdPhoto ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
              <Image
                src={user.nationalIdPhoto}
                alt="National ID full size"
                fill
                unoptimized
                className="object-contain"
                sizes="800px"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminUserDetailPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center gap-2 p-8 text-sm"
          style={{ color: "#737373" }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      }
    >
      <UserDetailInner />
    </Suspense>
  );
}
