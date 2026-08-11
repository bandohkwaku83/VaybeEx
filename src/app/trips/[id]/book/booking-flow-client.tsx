"use client";

import { useEffect, useRef, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { MediaImage } from "@/components/ui/media-image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HeartHandshake,
  Loader2,
  Lock,
  Calendar,
  MessageCircle,
  Users,
  Bell,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trackTripEvent } from "@/lib/api/public-trips";
import { ApiError } from "@/lib/api/client";
import {
  buildSelectedAddOns,
  createBooking,
  findActiveBookingForTrip,
  getPaymentInputBounds,
  getPaystackConfig,
  payBooking,
  previewBooking,
  type BookingGuestInput,
  type BookingPreview,
  type BookingType,
  type PaymentInputBounds,
} from "@/lib/api/bookings";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatCurrency, formatDateRange } from "@/lib/utils";
import type { Booking, Trip } from "@/lib/types";

const STEPS = [
  { id: "party", label: "Party" },
  { id: "addons", label: "Add-ons" },
  { id: "contact", label: "Contact" },
  { id: "pay", label: "Pay" },
] as const;
const STEP_COUNT = STEPS.length;

type GuestForm = {
  fullName: string;
  email: string;
  age: string;
};

interface BookingFlowClientProps {
  trip: Trip;
  isWaitlist: boolean;
  /** Canonical public trip URL (tenant). */
  tripHref: string;
  /** Canonical book base URL without query (tenant). */
  bookBaseHref: string;
}

function emptyGuest(): GuestForm {
  return { fullName: "", email: "", age: "" };
}

function guestsForType(
  type: BookingType,
  partySize: number,
  lead?: { fullName?: string; email?: string }
): GuestForm[] {
  const count =
    type === "solo" ? 1 : type === "couple" ? 2 : Math.max(2, partySize);
  return Array.from({ length: count }, (_, i) => ({
    fullName: i === 0 ? lead?.fullName ?? "" : "",
    email: i === 0 ? lead?.email ?? "" : "",
    age: "",
  }));
}

function toGuestPayload(
  type: BookingType,
  guests: GuestForm[]
): BookingGuestInput[] {
  if (type === "solo") {
    const lead = guests[0];
    if (!lead) return [];
    const payload: BookingGuestInput = {};
    if (lead.fullName.trim()) payload.fullName = lead.fullName.trim();
    if (lead.email.trim()) payload.email = lead.email.trim();
    if (lead.age.trim()) payload.age = Number(lead.age);
    return Object.keys(payload).length ? [payload] : [];
  }

  return guests.map((g, i) => {
    const payload: BookingGuestInput = {
      fullName: g.fullName.trim(),
    };
    if (i === 0 && g.email.trim()) payload.email = g.email.trim();
    if (g.age.trim()) payload.age = Number(g.age);
    return payload;
  });
}

function partyValid(
  type: BookingType,
  guests: GuestForm[],
  partySize: number
): boolean {
  if (type === "solo") {
    const lead = guests[0];
    return Boolean(lead?.fullName.trim() && lead?.email.trim());
  }
  if (type === "couple") {
    return (
      guests.length >= 2 &&
      Boolean(guests[0]?.fullName.trim() && guests[0]?.email.trim()) &&
      Boolean(guests[1]?.fullName.trim())
    );
  }
  if (guests.length !== partySize) return false;
  return guests.every((g, i) =>
    i === 0
      ? Boolean(g.fullName.trim() && g.email.trim())
      : Boolean(g.fullName.trim())
  );
}

const fieldClass =
  "h-12 rounded-xl border-[var(--border)] bg-white px-3.5 text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus-visible:ring-[var(--primary)]/25";

function StepRail({ step }: { step: number }) {
  return (
    <nav aria-label="Booking progress" className="mb-10">
      <ol className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-none text-sm font-semibold transition-all duration-300",
                    done && "text-[#fbf7f1]",
                    current && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg)]",
                    !done && !current && "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                  )}
                  style={
                    done
                      ? { background: "var(--primary)" }
                      : current
                        ? {
                            background: "var(--primary-dim)",
                            color: "var(--primary)",
                          }
                        : undefined
                  }
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-[11px] font-medium uppercase tracking-[0.12em] sm:block",
                    current ? "text-[var(--text)]" : "text-[var(--text-tertiary)]"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-2 mb-5 h-px flex-1 sm:mb-6"
                  style={{
                    background: done ? "var(--primary)" : "var(--border)",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <h1
        className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed sm:text-base" style={{ color: "var(--text-secondary)" }}>
        {subtitle}
      </p>
    </div>
  );
}

function BookingFlow({
  trip,
  isWaitlist,
  tripHref,
  bookBaseHref,
}: BookingFlowClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const goBackToTrip = () => {
    // Pop booking off the stack. A Link would push a new trip entry and
    // make trip detail's router.back() return here (ping-pong).
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(tripHref);
  };

  const showCouple =
    trip.offerCouplePrice !== false && trip.couplePrice != null;
  const showGroup =
    trip.offerGroupPrice !== false && trip.groupPrice != null;

  const [step, setStep] = useState(0);
  const [bookingType, setBookingType] = useState<BookingType>("solo");
  const [partySize, setPartySize] = useState(trip.groupSize ?? 5);
  const [guests, setGuests] = useState<GuestForm[]>(() =>
    guestsForType("solo", 1, {
      fullName: user?.name,
      email: user?.email,
    })
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? "");
  const [smsNotify, setSmsNotify] = useState(true);
  const [preview, setPreview] = useState<BookingPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentBounds, setPaymentBounds] =
    useState<PaymentInputBounds | null>(null);
  const [amountTouched, setAmountTouched] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [existingBooking, setExistingBooking] = useState<
    Booking | null | undefined
  >(undefined);
  const hydratedDefaults = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void findActiveBookingForTrip(trip.id)
      .then((booking) => {
        if (!cancelled) setExistingBooking(booking);
      })
      .catch(() => {
        if (!cancelled) setExistingBooking(null);
      });
    return () => {
      cancelled = true;
    };
  }, [trip.id]);

  useEffect(() => {
    if (existingBooking !== null) return;
    void trackTripEvent(trip.id, "checkout_start").catch(() => {});
  }, [trip.id, existingBooking]);

  useEffect(() => {
    // Load once for Inline/Popup readiness; checkout still redirects via auth URL.
    void getPaystackConfig().catch(() => {});
  }, []);

  useEffect(() => {
    if (!user || user.role !== "traveler") return;
    // Always pin lead traveler to the signed-in account.
    setGuests((prev) => {
      if (!prev[0]) return prev;
      const next = [...prev];
      next[0] = {
        ...next[0],
        fullName: user.name || next[0].fullName,
        email: user.email || next[0].email,
      };
      return next;
    });
    if (user.phone) setWhatsapp((v) => v || user.phone || "");
  }, [user]);

  const setType = (type: BookingType) => {
    setBookingType(type);
    setAmountTouched(false);
    setAmountError(null);
    const size =
      type === "solo"
        ? 1
        : type === "couple"
          ? 2
          : Math.max(2, trip.groupSize ?? partySize);
    if (type === "group") setPartySize(size);
    setGuests(
      guestsForType(type, size, {
        fullName: user?.name || guests[0]?.fullName,
        email: user?.email || guests[0]?.email,
      })
    );
  };

  const updateGuest = (index: number, patch: Partial<GuestForm>) => {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...patch } : g))
    );
  };

  useEffect(() => {
    if (isWaitlist) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const addOnIds = trip.addOns.map((a) => a.id);
        const res = await previewBooking(trip.id, {
          bookingType,
          ...(bookingType === "group" ? { partySize } : {}),
          guests: toGuestPayload(bookingType, guests),
          selectedAddOns: buildSelectedAddOns(addOnIds, selectedAddOns),
          ...(amountTouched && paymentAmount > 0
            ? { paymentAmount }
            : {}),
        });
        if (cancelled || !res.data) return;
        setPreview(res.data);

        const bounds = getPaymentInputBounds(res.data, {
          deposit: res.data.pricing?.depositTotal || trip.depositAmount || 0,
          total: res.data.pricing?.totalAmount || trip.price || 0,
        });
        if (bounds) {
          setPaymentBounds((prev) => {
            // Keep the lowest known deposit floor so later previews can't
            // collapse min to the full total.
            if (!prev) return bounds;
            const min =
              prev.min > 0 && prev.min < bounds.max
                ? Math.min(prev.min, bounds.min)
                : bounds.min;
            const max = Math.max(prev.max, bounds.max);
            const safeMin = min < max ? min : bounds.min;
            return {
              min: safeMin,
              max,
              suggested: Math.min(Math.max(bounds.suggested, safeMin), max),
            };
          });
          if (!amountTouched) {
            setPaymentAmount(bounds.suggested);
          }
          // When the user is editing, never overwrite their amount from preview.
        }

        if (!hydratedDefaults.current && res.data.travelerDefaults) {
          hydratedDefaults.current = true;
          const d = res.data.travelerDefaults;
          if (d.location) setLocation((v) => v || d.location || "");
          if (d.whatsapp && !user?.phone) {
            setWhatsapp((v) => v || d.whatsapp || "");
          }
          if (d.phone && !user?.phone) {
            setWhatsapp((v) => v || d.phone || "");
          }
        }
      } catch {
        /* keep last good preview */
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [
    trip.id,
    trip.addOns,
    trip.depositAmount,
    trip.price,
    bookingType,
    partySize,
    guests,
    selectedAddOns,
    amountTouched ? paymentAmount : 0,
    amountTouched,
    isWaitlist,
    user?.email,
    user?.name,
    user?.phone,
  ]);

  const pricing = preview?.pricing;
  const subtotal = pricing?.totalAmount ?? trip.price;
  // Prefer the traveler's chosen amount once they've edited the field.
  const amountDueNow = amountTouched
    ? paymentAmount > 0
      ? paymentAmount
      : pricing?.amountDueNow ??
        pricing?.depositTotal ??
        trip.depositAmount ??
        subtotal
    : pricing?.amountDueNow ??
      (paymentAmount > 0
        ? paymentAmount
        : pricing?.depositTotal || trip.depositAmount || subtotal);
  const addOnTotal = pricing?.addOnsTotal ?? 0;
  const depositTotal = pricing?.depositTotal ?? 0;
  const hasDeposit = depositTotal > 0 && depositTotal < subtotal;
  const balanceLater = Math.max(0, subtotal - amountDueNow);
  const amountLocked = Boolean(
    paymentBounds && paymentBounds.min >= paymentBounds.max
  );

  const minDeposit =
    paymentBounds?.min ||
    depositTotal ||
    (typeof trip.depositAmount === "number" && trip.depositAmount > 0
      ? trip.depositAmount
      : 0);

  const applyPaymentAmount = (value: number) => {
    const bounds = paymentBounds;
    let next = Math.round(value);
    if (!Number.isFinite(next)) return;
    if (bounds && next > bounds.max) {
      // Never allow above trip total.
      next = bounds.max;
    }
    setAmountTouched(true);
    setAmountError(null);
    setPaymentAmount(next);
  };

  const validatePaymentAmount = (value = paymentAmount): boolean => {
    const min = minDeposit;
    if (min > 0 && value < min) {
      const message = `Amount must be at least the initial deposit (${formatCurrency(min)}).`;
      setAmountError(message);
      toast.error(message);
      return false;
    }
    if (paymentBounds && value > paymentBounds.max) {
      const message = `Amount cannot exceed the trip total (${formatCurrency(paymentBounds.max)}).`;
      setAmountError(message);
      toast.error(message);
      return false;
    }
    setAmountError(null);
    return true;
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleWaitlist = () => {
    toast.success(
      "You've been added to the waitlist! We'll notify you when a spot opens."
    );
    router.push(`${bookBaseHref}/confirm?waitlist=true`);
  };

  const handlePay = async () => {
    if (!partyValid(bookingType, guests, partySize)) {
      toast.error("Please complete traveler details.");
      setStep(0);
      return;
    }
    if (!whatsapp.trim()) {
      toast.error("WhatsApp number is required for booking updates.");
      setStep(2);
      return;
    }
    if (!user?.email?.trim()) {
      toast.error("A verified email is required for Paystack checkout.");
      return;
    }

    const chargeAmount = amountDueNow;
    if (!(chargeAmount > 0)) {
      toast.error("Enter a valid amount to pay.");
      setStep(3);
      return;
    }
    if (!validatePaymentAmount(chargeAmount)) {
      setStep(3);
      return;
    }

    setSubmitting(true);
    try {
      const alreadyBooked =
        existingBooking ?? (await findActiveBookingForTrip(trip.id));
      if (alreadyBooked) {
        setExistingBooking(alreadyBooked);
        toast.info(
          alreadyBooked.paymentStatus === "paid"
            ? "You already have a booking for this trip."
            : "You already reserved this trip. Continue from your existing booking."
        );
        return;
      }

      const origin = window.location.origin;
      const callbackUrl = `${origin}/booking/callback?return=${encodeURIComponent(
        `${bookBaseHref}/confirm`
      )}`;

      const addOnIds = trip.addOns.map((a) => a.id);
      const res = await createBooking({
        tripId: trip.id,
        bookingType,
        ...(bookingType === "group" ? { partySize } : {}),
        location: location.trim() || undefined,
        whatsapp: whatsapp.trim(),
        paymentAmount: chargeAmount,
        guests: toGuestPayload(bookingType, guests),
        selectedAddOns: buildSelectedAddOns(addOnIds, selectedAddOns),
        callbackUrl,
      });

      const authUrl = res.data?.paystackAuthorizationUrl;
      if (!authUrl) {
        toast.error("Payment link was not returned. Please try again.");
        return;
      }

      toast.success(res.message || "Redirecting to Paystack…");
      window.location.href = authUrl;
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 409 ||
          err.code === "BOOKING_ALREADY_EXISTS" ||
          /already (have a )?book/i.test(err.message))
      ) {
        toast.info(
          err.message ||
            "You already have a booking for this trip. Opening your dashboard."
        );
        router.push("/dashboard");
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not start payment. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResumeExisting = async () => {
    if (!existingBooking) return;
    if (existingBooking.paymentStatus === "paid") {
      router.push("/dashboard");
      return;
    }
    const chargeAmount =
      existingBooking.remainingBalance && existingBooking.remainingBalance > 0
        ? existingBooking.remainingBalance
        : Math.max(0, existingBooking.amount - existingBooking.amountPaid);
    if (!(chargeAmount > 0)) {
      router.push("/dashboard");
      return;
    }
    setSubmitting(true);
    try {
      const origin = window.location.origin;
      const callbackUrl = `${origin}/booking/callback?return=${encodeURIComponent(
        `${bookBaseHref}/confirm`
      )}`;
      const res = await payBooking(existingBooking.id, {
        callbackUrl,
        paymentAmount: chargeAmount,
      });
      const authUrl = res.data?.paystackAuthorizationUrl;
      if (!authUrl) {
        toast.error("Payment link was not returned. Please try again.");
        return;
      }
      toast.success(res.message || "Redirecting to Paystack…");
      window.location.href = authUrl;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not start payment. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const canAdvance =
    (step === 0 && partyValid(bookingType, guests, partySize)) ||
    step === 1 ||
    (step === 2 && Boolean(whatsapp.trim()));

  if (existingBooking === undefined) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    );
  }

  if (existingBooking) {
    const paidInFull = existingBooking.paymentStatus === "paid";
    const due =
      existingBooking.remainingBalance && existingBooking.remainingBalance > 0
        ? existingBooking.remainingBalance
        : Math.max(0, existingBooking.amount - existingBooking.amountPaid);
    return (
      <div
        className="relative min-h-[70vh] overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <div className="relative mx-auto max-w-md px-5 pb-14 pt-24 sm:px-6 sm:pt-28">
          <button
            type="button"
            onClick={goBackToTrip}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to trip
          </button>
          <SectionHeading
            title={paidInFull ? "You're already booked" : "Finish this booking"}
            subtitle={
              paidInFull
                ? `${trip.title} is already on your bookings. A new reservation would create a duplicate.`
                : `You already reserved ${trip.title}. Pay the remaining balance on that booking instead of starting over.`
            }
          />
          {!paidInFull && due > 0 && (
            <p
              className="mb-6 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Remaining:{" "}
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {formatCurrency(due)}
              </span>
            </p>
          )}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => void handleResumeExisting()}
              disabled={submitting}
              className="h-12 w-full rounded-xl font-semibold"
              style={{ background: "var(--primary)", color: "#fbf7f1" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : paidInFull ? (
                "View my bookings"
              ) : (
                `Pay ${formatCurrency(due)}`
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="h-12 w-full rounded-xl"
            >
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isWaitlist && step === 0) {
    return (
      <div
        className="relative min-h-[70vh] overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, var(--gold-dim), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-md px-5 pb-14 pt-24 sm:px-6 sm:pt-28">
          <button
            type="button"
            onClick={goBackToTrip}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to trip
          </button>

          <div className="mb-8 flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
            >
              <Bell className="h-7 w-7" />
            </div>
          </div>

          <div className="text-center">
            <h1
              className="font-display text-3xl font-bold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Join the waitlist
            </h1>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              <span className="font-medium" style={{ color: "var(--text)" }}>
                {trip.title}
              </span>{" "}
              is full. Leave your details and we&apos;ll notify you the moment a
              spot opens.
            </p>
          </div>

          <div className="mt-10 space-y-5">
            <div>
              <Label className="text-[var(--text-secondary)]">Full name</Label>
              <Input
                value={guests[0]?.fullName ?? ""}
                onChange={(e) => updateGuest(0, { fullName: e.target.value })}
                placeholder="Your name"
                className={cn("mt-2", fieldClass)}
              />
            </div>
            <div>
              <Label className="text-[var(--text-secondary)]">Email</Label>
              <Input
                type="email"
                value={guests[0]?.email ?? ""}
                onChange={(e) => updateGuest(0, { email: e.target.value })}
                placeholder="you@email.com"
                className={cn("mt-2", fieldClass)}
              />
            </div>
            <div>
              <Label className="text-[var(--text-secondary)]">
                Phone (SMS alerts)
              </Label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+233 XX XXX XXXX"
                className={cn("mt-2", fieldClass)}
              />
            </div>
            <label className="flex items-start gap-3 pt-1">
              <Checkbox
                id="sms"
                checked={smsNotify}
                onCheckedChange={(c) => setSmsNotify(!!c)}
                className="mt-0.5"
              />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Notify me via SMS when a spot opens
              </span>
            </label>

            <Button
              className="mt-4 h-12 w-full text-base font-semibold"
              style={{ background: "var(--primary)", color: "#fbf7f1" }}
              size="lg"
              onClick={handleWaitlist}
              disabled={!guests[0]?.fullName || !guests[0]?.email}
            >
              Join waitlist
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const typeOptions: {
    id: BookingType;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "solo",
      label: "Solo",
      desc: `${formatCurrency(trip.price)} / person`,
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "couple",
      label: "Couple",
      desc: showCouple
        ? formatCurrency(trip.couplePrice!)
        : `${formatCurrency(trip.price)} × 2`,
      icon: <HeartHandshake className="h-5 w-5" />,
    },
    {
      id: "group",
      label: "Group",
      desc: showGroup
        ? `${formatCurrency(trip.groupPrice!)} · ${trip.groupSize ?? "group"}`
        : "Custom party size",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const stepCopy = [
    {
      title: "Who's traveling?",
      subtitle: "Choose how you're booking, then add traveler details.",
    },
    {
      title: "Enhance the trip",
      subtitle: "Optional extras — skip if you don't need any.",
    },
    {
      title: "Stay reachable",
      subtitle: "We'll use these details for booking updates.",
    },
    {
      title: "Review & pay",
      subtitle: "Confirm details, then pay securely with Paystack.",
    },
  ];

  return (
    <div className="relative min-h-[80vh]" style={{ background: "var(--bg)" }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{
          background:
            "linear-gradient(180deg, var(--bg-secondary) 0%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-24 sm:px-6 sm:pt-28 lg:pb-12">
        <button
          type="button"
          onClick={goBackToTrip}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to trip
        </button>

        {/* Trip context strip */}
        <div className="mb-10 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-20">
            <MediaImage
              src={trip.image}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="min-w-0">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--gold)" }}
            >
              Booking
            </p>
            <h2
              className="font-display truncate text-lg font-bold tracking-tight sm:text-xl"
              style={{ color: "var(--text)" }}
            >
              {trip.title}
            </h2>
            <p
              className="mt-0.5 flex items-center gap-1.5 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
        </div>

        <StepRail step={step} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div className="min-w-0 pb-28 lg:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <SectionHeading
                  title={stepCopy[step].title}
                  subtitle={stepCopy[step].subtitle}
                />

                {step === 0 && (
                  <div className="space-y-8">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {typeOptions.map((opt) => {
                        const selected = bookingType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setType(opt.id)}
                            className={cn(
                              "group relative rounded-2xl border p-4 text-left transition-all duration-200",
                              selected
                                ? "shadow-[var(--glow-teal)]"
                                : "hover:border-[var(--border-strong)]"
                            )}
                            style={{
                              borderColor: selected
                                ? "var(--primary)"
                                : "var(--border)",
                              background: selected
                                ? "var(--primary-dim)"
                                : "var(--surface)",
                            }}
                          >
                            <div
                              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                              style={{
                                background: selected
                                  ? "var(--primary)"
                                  : "var(--bg-secondary)",
                                color: selected
                                  ? "#fbf7f1"
                                  : "var(--text-secondary)",
                              }}
                            >
                              {opt.icon}
                            </div>
                            <p
                              className="font-display text-base font-semibold"
                              style={{ color: "var(--text)" }}
                            >
                              {opt.label}
                            </p>
                            <p
                              className="mt-1 text-xs leading-snug"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {opt.desc}
                            </p>
                            {selected && (
                              <span
                                className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                                style={{
                                  background: "var(--primary)",
                                  color: "#fbf7f1",
                                }}
                              >
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {bookingType === "group" && (
                      <div
                        className="flex items-center justify-between rounded-2xl px-5 py-4"
                        style={{ background: "var(--bg-secondary)" }}
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--text)" }}
                          >
                            Party size
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            Set by the organizer
                          </p>
                        </div>
                        <span
                          className="font-display text-xl font-bold tabular-nums"
                          style={{ color: "var(--text)" }}
                        >
                          {partySize}
                        </span>
                      </div>
                    )}

                    <div className="space-y-6">
                      {guests.map((guest, i) => (
                        <div key={i} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                              style={{
                                background: "var(--primary-dim)",
                                color: "var(--primary)",
                              }}
                            >
                              {i + 1}
                            </span>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "var(--text)" }}
                            >
                              {i === 0 ? "Lead traveler" : `Guest ${i + 1}`}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "grid gap-4",
                              i === 0 ? "sm:grid-cols-2" : "sm:grid-cols-2"
                            )}
                          >
                            <div className={i === 0 ? "sm:col-span-1" : ""}>
                              <Label className="text-[var(--text-secondary)]">
                                Full name
                              </Label>
                              <Input
                                value={guest.fullName}
                                onChange={(e) =>
                                  updateGuest(i, { fullName: e.target.value })
                                }
                                className={cn("mt-2", fieldClass)}
                              />
                            </div>
                            {i === 0 && (
                              <div>
                                <Label className="text-[var(--text-secondary)]">
                                  Email
                                </Label>
                                <Input
                                  type="email"
                                  value={guest.email}
                                  onChange={(e) =>
                                    updateGuest(i, { email: e.target.value })
                                  }
                                  className={cn("mt-2", fieldClass)}
                                />
                              </div>
                            )}
                            <div className={i === 0 ? "sm:col-span-2 sm:max-w-[200px]" : ""}>
                              <Label className="text-[var(--text-secondary)]">
                                Age{" "}
                                <span style={{ color: "var(--text-tertiary)" }}>
                                  (optional)
                                </span>
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                max={120}
                                value={guest.age}
                                onChange={(e) =>
                                  updateGuest(i, { age: e.target.value })
                                }
                                className={cn("mt-2", fieldClass)}
                              />
                            </div>
                          </div>
                          {i < guests.length - 1 && (
                            <div
                              className="pt-2"
                              style={{
                                borderBottom: "1px solid var(--border-subtle)",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-3">
                    {trip.addOns.length === 0 ? (
                      <div
                        className="rounded-2xl px-6 py-10 text-center"
                        style={{ background: "var(--bg-secondary)" }}
                      >
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          No add-ons for this trip — you&apos;re all set.
                        </p>
                      </div>
                    ) : (
                      trip.addOns.map((addon) => {
                        const on = selectedAddOns.includes(addon.id);
                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => toggleAddOn(addon.id)}
                            className="flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200"
                            style={{
                              borderColor: on
                                ? "var(--primary)"
                                : "var(--border)",
                              background: on
                                ? "var(--primary-dim)"
                                : "var(--surface)",
                            }}
                          >
                            <div className="flex items-center gap-3.5">
                              <span
                                className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-none border transition-colors",
                                  on && "border-transparent"
                                )}
                                style={{
                                  borderColor: on
                                    ? "transparent"
                                    : "var(--border-strong)",
                                  background: on
                                    ? "var(--primary)"
                                    : "transparent",
                                  color: "#fbf7f1",
                                }}
                              >
                                {on && (
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                )}
                              </span>
                              <div>
                                <span
                                  className="font-medium"
                                  style={{ color: "var(--text)" }}
                                >
                                  {addon.name}
                                </span>
                                {addon.perPerson && (
                                  <p
                                    className="text-xs"
                                    style={{ color: "var(--text-tertiary)" }}
                                  >
                                    Per person
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className="shrink-0 text-sm font-semibold"
                              style={{
                                color: on
                                  ? "var(--primary)"
                                  : "var(--text-secondary)",
                              }}
                            >
                              +{formatCurrency(addon.price)}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="max-w-md space-y-5">
                    <div>
                      <Label className="text-[var(--text-secondary)]">
                        Location
                      </Label>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Accra, Ghana"
                        className={cn("mt-2", fieldClass)}
                      />
                    </div>
                    <div>
                      <Label className="text-[var(--text-secondary)]">
                        WhatsApp{" "}
                        <span style={{ color: "var(--coral)" }}>*</span>
                      </Label>
                      <Input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+233 24 123 4567"
                        className={cn("mt-2", fieldClass)}
                      />
                      <p
                        className="mt-2 flex items-start gap-1.5 text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        Used for booking updates from the organizer.
                      </p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <dl
                      className="overflow-hidden rounded-2xl"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      {(
                        [
                          {
                            label: "Booking type",
                            value: bookingType,
                            capitalize: true as boolean,
                          },
                          {
                            label: "Lead traveler",
                            value: guests[0]?.fullName || "—",
                            capitalize: false,
                          },
                          {
                            label: "Party size",
                            value: String(
                              pricing?.partySize ??
                                (bookingType === "solo"
                                  ? 1
                                  : bookingType === "couple"
                                    ? 2
                                    : partySize)
                            ),
                            capitalize: false,
                          },
                          ...(whatsapp
                            ? [
                                {
                                  label: "WhatsApp",
                                  value: whatsapp,
                                  capitalize: false,
                                },
                              ]
                            : []),
                          ...(location
                            ? [
                                {
                                  label: "Location",
                                  value: location,
                                  capitalize: false,
                                },
                              ]
                            : []),
                        ] as {
                          label: string;
                          value: string;
                          capitalize: boolean;
                        }[]
                      ).map((row, idx, arr) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm"
                          style={{
                            borderBottom:
                              idx < arr.length - 1
                                ? "1px solid var(--border-subtle)"
                                : undefined,
                          }}
                        >
                          <dt style={{ color: "var(--text-secondary)" }}>
                            {row.label}
                          </dt>
                          <dd
                            className={cn(
                              "text-right font-medium",
                              row.capitalize && "capitalize"
                            )}
                            style={{ color: "var(--text)" }}
                          >
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div
                      className="rounded-2xl px-5 py-5"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p
                            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            Trip total
                          </p>
                          <p
                            className="mt-1 font-display text-2xl font-bold tabular-nums"
                            style={{ color: "var(--text)" }}
                          >
                            {formatCurrency(subtotal)}
                          </p>
                        </div>
                        {previewLoading && (
                          <Loader2
                            className="mb-1 h-4 w-4 animate-spin"
                            style={{ color: "var(--text-tertiary)" }}
                          />
                        )}
                      </div>

                      <div className="mt-5">
                        <div className="flex items-end justify-between gap-3">
                          <Label className="text-[var(--text-secondary)]">
                            Pay now
                          </Label>
                          {(depositTotal > 0 || (paymentBounds?.min ?? 0) > 0) && (
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              Initial deposit{" "}
                              <span
                                className="font-semibold"
                                style={{ color: "var(--text)" }}
                              >
                                {formatCurrency(
                                  depositTotal || paymentBounds?.min || 0
                                )}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="relative mt-2">
                          <span
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            GHS
                          </span>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={minDeposit || 0}
                            max={paymentBounds?.max ?? undefined}
                            step={1}
                            value={paymentAmount || ""}
                            disabled={amountLocked}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                setAmountTouched(true);
                                setAmountError(null);
                                setPaymentAmount(0);
                                return;
                              }
                              const n = Number(raw);
                              if (Number.isFinite(n)) applyPaymentAmount(n);
                            }}
                            onBlur={() => {
                              if (paymentAmount > 0) {
                                validatePaymentAmount(paymentAmount);
                              }
                            }}
                            aria-invalid={Boolean(amountError)}
                            className={cn(
                              "h-12 rounded-none border-[var(--border)] bg-white pl-14 pr-3.5 text-[var(--text)] tabular-nums focus-visible:ring-[var(--primary)]/25",
                              amountLocked && "opacity-80",
                              amountError && "border-[var(--coral)]"
                            )}
                          />
                        </div>

                        {amountError ? (
                          <p
                            className="mt-2 text-xs leading-relaxed"
                            style={{ color: "var(--coral)" }}
                          >
                            {amountError}
                          </p>
                        ) : (
                          <p
                            className="mt-2 text-xs leading-relaxed"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {pricing?.paymentNote ||
                              (hasDeposit
                                ? `You can pay more, but not less than the initial deposit.`
                                : "Pay the full trip total to confirm.")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
                      style={{ background: "var(--primary-dim)" }}
                    >
                      <Lock
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: "var(--primary)" }}
                      />
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        You&apos;ll complete payment securely on Paystack — card
                        or mobile money.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Desktop nav */}
            <div className="mt-10 hidden items-center justify-between border-t pt-6 lg:flex"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0 || submitting}
                className="text-[var(--text-secondary)]"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < STEP_COUNT - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canAdvance}
                  className="h-11 rounded-xl px-6 font-semibold"
                  style={{ background: "var(--primary)", color: "#fbf7f1" }}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => void handlePay()}
                  disabled={submitting}
                  className="h-12 rounded-xl px-7 font-semibold"
                  style={{ background: "var(--primary)", color: "#fbf7f1" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>Pay {formatCurrency(amountDueNow)}</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order summary */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div
                className="overflow-hidden rounded-2xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--glow-teal)",
                }}
              >
                <div className="relative h-36 overflow-hidden">
                  <MediaImage
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 40%, rgba(42,27,15,0.55) 100%)",
                    }}
                  />
                  <p
                    className="absolute bottom-3 left-4 right-4 font-display text-sm font-semibold text-[#fbf7f1] line-clamp-2"
                  >
                    {trip.title}
                  </p>
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.14em]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Summary
                    </p>
                    {previewLoading && (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    )}
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {pricing?.rateType === "couple"
                          ? "Couple rate"
                          : pricing?.rateType === "group"
                            ? "Group rate"
                            : `${formatCurrency(pricing?.pricePerPerson ?? trip.price)} × ${pricing?.partySize ?? 1}`}
                      </span>
                      <span
                        className="shrink-0 font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        {formatCurrency(pricing?.tripSubtotal ?? trip.price)}
                      </span>
                    </div>
                    {addOnTotal > 0 && (
                      <div className="flex justify-between gap-3">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Add-ons
                        </span>
                        <span
                          className="shrink-0 font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {formatCurrency(addOnTotal)}
                        </span>
                      </div>
                    )}
                    <div
                      className="my-1 h-px"
                      style={{ background: "var(--border-subtle)" }}
                    />
                    <div className="flex justify-between gap-3">
                      <span
                        className="font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        Total
                      </span>
                      <span
                        className="font-display text-base font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span style={{ color: "var(--primary)" }}>Pay now</span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--primary)" }}
                      >
                        {formatCurrency(amountDueNow)}
                      </span>
                    </div>
                    {balanceLater > 0 && (
                      <div className="flex justify-between gap-3 text-xs">
                        <span style={{ color: "var(--text-tertiary)" }}>
                          Balance later
                        </span>
                        <span style={{ color: "var(--text-tertiary)" }}>
                          {formatCurrency(balanceLater)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 backdrop-blur-md lg:hidden"
        style={{
          borderColor: "var(--border)",
          background: "rgba(251,247,241,0.94)",
        }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStep(step - 1)}
              disabled={submitting}
              className="h-12 w-12 shrink-0 rounded-xl border-[var(--border)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            {step < STEP_COUNT - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance}
                className="h-12 w-full rounded-xl font-semibold"
                style={{ background: "var(--primary)", color: "#fbf7f1" }}
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={() => void handlePay()}
                disabled={submitting}
                className="h-12 w-full rounded-xl font-semibold"
                style={{ background: "var(--primary)", color: "#fbf7f1" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                  </>
                ) : (
                  <>Pay {formatCurrency(amountDueNow)}</>
                )}
              </Button>
            )}
          </div>
          <div className="hidden min-w-[4.5rem] text-right xs:block sm:block">
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Pay now
            </p>
            <p
              className="font-display text-sm font-bold"
              style={{ color: "var(--text)" }}
            >
              {formatCurrency(amountDueNow)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingFlowClient(props: BookingFlowClientProps) {
  return (
    <RequireAuth travelerOnly>
      <BookingFlow {...props} />
    </RequireAuth>
  );
}
