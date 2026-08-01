"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  createTripWithdrawal,
  type MomoProvider,
} from "@/lib/api/organizer-payouts";
import {
  getDefaultPayoutAccount,
  getPayoutAccounts,
  PAYOUT_METHOD_LABELS,
  PAYOUT_ACCOUNT_TYPES,
} from "@/lib/payout-accounts";
import type { PayoutAccountType } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const NETWORK_OPTIONS: { value: PayoutAccountType; short: string }[] = [
  { value: "mtn", short: "MTN" },
  { value: "vodafone", short: "Vodafone" },
  { value: "airteltigo", short: "AirtelTigo" },
];

interface TripWithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripTitle: string;
  availableToWithdraw: number;
  currency?: string;
  onSuccess?: () => void;
}

type ModalPhase = "form" | "submitted";

export function TripWithdrawDialog({
  open,
  onOpenChange,
  tripId,
  tripTitle,
  availableToWithdraw,
  currency = "GHS",
  onSuccess,
}: TripWithdrawDialogProps) {
  const [phase, setPhase] = useState<ModalPhase>("form");
  const [useAllAvailable, setUseAllAvailable] = useState(true);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<PayoutAccountType>("mtn");
  const [momoNumber, setMomoNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);

  useEffect(() => {
    if (!open) return;
    setPhase("form");
    setUseAllAvailable(true);
    setAmount(availableToWithdraw > 0 ? String(availableToWithdraw) : "");
    setSubmitting(false);

    const saved = getPayoutAccounts();
    const def = getDefaultPayoutAccount() ?? saved[0];
    if (def && PAYOUT_ACCOUNT_TYPES.includes(def.type)) {
      setNetwork(def.type);
      setMomoNumber(def.momoNumber);
      setAccountName(def.accountName);
    } else {
      setNetwork("mtn");
      setMomoNumber("");
      setAccountName("");
    }
  }, [open, availableToWithdraw]);

  useEffect(() => {
    if (useAllAvailable && availableToWithdraw > 0) {
      setAmount(String(availableToWithdraw));
    }
  }, [useAllAvailable, availableToWithdraw]);

  const amountValue = useAllAvailable
    ? availableToWithdraw
    : Number(amount) || 0;

  const canSubmit =
    availableToWithdraw > 0 &&
    amountValue > 0 &&
    amountValue <= availableToWithdraw &&
    Boolean(momoNumber.trim()) &&
    !submitting;

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    if (!next && phase === "submitted") {
      onSuccess?.();
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await createTripWithdrawal(tripId, {
        amount: amountValue,
        momoProvider: network as MomoProvider,
        momoNumber: momoNumber.trim(),
        accountName: accountName.trim() || undefined,
      });
      setSubmittedAmount(amountValue);
      setPhase("submitted");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not send to MoMo. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {phase === "submitted" ? (
          <>
            <DialogHeader>
              <DialogTitle>Sending to MoMo</DialogTitle>
              <DialogDescription>
                {formatCurrency(submittedAmount, currency)} to{" "}
                {PAYOUT_METHOD_LABELS[network]}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "rgba(208,138,60,0.14)" }}
              >
                <Loader2
                  className="h-7 w-7 animate-spin"
                  style={{ color: "var(--amber)" }}
                />
              </div>
              <div>
                <p
                  className="font-display text-lg font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Processing
                </p>
                <p
                  className="mt-1.5 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Paystack is transferring to your MoMo. Status will update to
                  Success or Failed — not instant cash handoff.
                </p>
              </div>
              <Button
                className="mt-2 w-full"
                style={{ background: "var(--primary)", color: "#fbf7f1" }}
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Withdraw to MoMo</DialogTitle>
              <DialogDescription>
                Send earnings from{" "}
                <span className="font-medium" style={{ color: "var(--text)" }}>
                  {tripTitle}
                </span>
              </DialogDescription>
            </DialogHeader>

            {availableToWithdraw <= 0 ? (
              <p
                className="py-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                No funds available to withdraw for this trip right now.
              </p>
            ) : (
              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="space-y-5"
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <Label htmlFor="trip-withdraw-amount">Amount</Label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={useAllAvailable}
                        onChange={(e) => setUseAllAvailable(e.target.checked)}
                        className="rounded"
                      />
                      <span style={{ color: "var(--text-secondary)" }}>
                        All available
                      </span>
                    </label>
                  </div>
                  <Input
                    id="trip-withdraw-amount"
                    type="number"
                    min={1}
                    max={availableToWithdraw}
                    step={1}
                    className="tabular-nums"
                    value={
                      useAllAvailable
                        ? String(availableToWithdraw)
                        : amount
                    }
                    onChange={(e) => {
                      setUseAllAvailable(false);
                      setAmount(e.target.value);
                    }}
                    disabled={useAllAvailable}
                  />
                  <p
                    className="mt-1.5 text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Available {formatCurrency(availableToWithdraw, currency)}
                  </p>
                  {!useAllAvailable && amountValue > availableToWithdraw && (
                    <p className="mt-1 text-xs" style={{ color: "var(--coral)" }}>
                      Amount cannot exceed{" "}
                      {formatCurrency(availableToWithdraw, currency)}.
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-1.5 block">Network</Label>
                  <div
                    className="flex rounded-2xl p-1"
                    style={{ background: "var(--bg-secondary)" }}
                    role="radiogroup"
                    aria-label="MoMo network"
                  >
                    {NETWORK_OPTIONS.map((opt) => {
                      const selected = network === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setNetwork(opt.value)}
                          className={cn(
                            "!rounded-xl flex-1 px-2 py-2.5 text-sm font-semibold transition-all duration-200",
                            selected && "shadow-sm"
                          )}
                          style={{
                            background: selected
                              ? "var(--surface)"
                              : "transparent",
                            color: selected
                              ? "var(--primary)"
                              : "var(--text-secondary)",
                            boxShadow: selected
                              ? "0 1px 3px rgba(42,27,15,0.08)"
                              : "none",
                          }}
                        >
                          {opt.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="trip-withdraw-momo">MoMo number</Label>
                  <Input
                    id="trip-withdraw-momo"
                    className="mt-1.5"
                    inputMode="tel"
                    placeholder="0244123456"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <Label htmlFor="trip-withdraw-name">
                    Account name{" "}
                    <span style={{ color: "var(--text-tertiary)" }}>
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="trip-withdraw-name"
                    className="mt-1.5"
                    placeholder="Jane Organizer"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full font-semibold"
                  style={{ background: "var(--primary)", color: "#fbf7f1" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="h-4 w-4" />
                      Send to MoMo
                    </>
                  )}
                </Button>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
