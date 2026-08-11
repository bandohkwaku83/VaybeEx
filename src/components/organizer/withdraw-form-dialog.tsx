"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  createTripWithdrawal,
  type MomoProvider,
} from "@/lib/api/organizer-payouts";
import {
  emptyPayoutAccountForm,
  PayoutAccountFormFields,
  type PayoutAccountFormValues,
} from "@/components/organizer/payout-account-form-fields";
import {
  addPayoutAccount,
  buildPayoutAccountInput,
  formatPayoutAccountLabel,
  getDefaultPayoutAccount,
  getPayoutAccounts,
  isPayoutAccountComplete,
  PAYOUT_METHOD_LABELS,
} from "@/lib/payout-accounts";
import type { PayoutAccount } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WithdrawEligibleTrip = {
  tripId: string;
  title: string;
  availableToWithdraw: number;
  reservedForRefunds?: number;
  currency?: string;
};

interface WithdrawFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eligibleTrips: WithdrawEligibleTrip[];
  onSuccess?: () => void;
}

const initialForm = {
  tripId: "",
  amount: "",
  payoutAccountId: "",
};

export function WithdrawFormDialog({
  open,
  onOpenChange,
  eligibleTrips,
  onSuccess,
}: WithdrawFormDialogProps) {
  const [form, setForm] = useState(initialForm);
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([]);
  const [accountMode, setAccountMode] = useState<"saved" | "new">("saved");
  const [newAccountForm, setNewAccountForm] = useState<PayoutAccountFormValues>(
    emptyPayoutAccountForm
  );
  const [saveNewAccount, setSaveNewAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const accounts = getPayoutAccounts();
    setPayoutAccounts(accounts);
    const defaultAccount = getDefaultPayoutAccount();
    setForm({
      tripId: eligibleTrips[0]?.tripId ?? "",
      amount: eligibleTrips[0]
        ? String(eligibleTrips[0].availableToWithdraw)
        : "",
      payoutAccountId: defaultAccount?.id ?? "",
    });
    setAccountMode(accounts.length > 0 ? "saved" : "new");
    setNewAccountForm(emptyPayoutAccountForm);
    setSaveNewAccount(true);
  }, [open, eligibleTrips]);

  const selectedTrip = useMemo(
    () => eligibleTrips.find((t) => t.tripId === form.tripId),
    [eligibleTrips, form.tripId]
  );
  const selectedAccount = payoutAccounts.find(
    (a) => a.id === form.payoutAccountId
  );
  const available = selectedTrip?.availableToWithdraw ?? 0;
  const currency = selectedTrip?.currency ?? "GHS";
  const reserved = selectedTrip?.reservedForRefunds ?? 0;
  const amountValue = Number(form.amount) || 0;

  const newAccountInput = buildPayoutAccountInput(newAccountForm);
  const newAccountValid = isPayoutAccountComplete(newAccountInput);

  const resetForm = () => setForm(initialForm);

  const handleOpenChange = (nextOpen: boolean) => {
    if (submitting) return;
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const update = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resolvedAccount: PayoutAccount | null = (() => {
    if (accountMode === "saved") return selectedAccount ?? null;
    if (!newAccountValid) return null;
    return {
      id: `temp-${Date.now()}`,
      ...newAccountInput,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
  })();

  const canSubmit =
    Boolean(form.tripId) &&
    amountValue > 0 &&
    amountValue <= available &&
    Boolean(resolvedAccount?.momoNumber?.trim()) &&
    Boolean(resolvedAccount?.type) &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedTrip || !resolvedAccount) return;

    setSubmitting(true);
    try {
      if (accountMode === "new" && saveNewAccount) {
        addPayoutAccount({
          ...newAccountInput,
          isDefault: payoutAccounts.length === 0,
        });
        setPayoutAccounts(getPayoutAccounts());
      }

      const res = await createTripWithdrawal(selectedTrip.tripId, {
        ...(amountValue === available ? {} : { amount: amountValue }),
        momoProvider: resolvedAccount.type as MomoProvider,
        momoNumber: resolvedAccount.momoNumber.trim(),
        accountName: resolvedAccount.accountName.trim() || undefined,
        note: "Trip settlement",
      });

      toast.success(
        res.message ||
          "Request received. An admin will pay your MoMo shortly."
      );
      handleOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not request withdrawal. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const noEligibleTrips = eligibleTrips.length === 0;
  const noSavedAccounts = payoutAccounts.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Withdraw earnings</DialogTitle>
          <DialogDescription>
            Request a payout from a trip balance. An admin reviews it and sends
            the money to your MoMo. Pending requests lock that amount until they
            are paid or rejected.
          </DialogDescription>
        </DialogHeader>

        {noEligibleTrips ? (
          <p
            className="py-4 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            No trips have funds available for withdrawal right now.
          </p>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div>
              <Label htmlFor="withdraw-trip">Trip</Label>
              <Select
                value={form.tripId || undefined}
                onValueChange={(id) => {
                  const trip = eligibleTrips.find((t) => t.tripId === id);
                  update("tripId", id);
                  update(
                    "amount",
                    trip ? String(trip.availableToWithdraw) : ""
                  );
                }}
              >
                <SelectTrigger id="withdraw-trip" className="mt-1.5">
                  <SelectValue placeholder="Select a trip" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTrips.map((trip) => (
                    <SelectItem key={trip.tripId} value={trip.tripId}>
                      {trip.title} ·{" "}
                      {formatCurrency(
                        trip.availableToWithdraw,
                        trip.currency ?? "GHS"
                      )}{" "}
                      available
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTrip && (
              <div
                className="space-y-2 rounded-xl px-4 py-3 text-sm"
                style={{ background: "var(--bg-secondary)" }}
              >
                <div className="flex justify-between gap-3">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Available to withdraw
                  </span>
                  <span
                    className="font-medium tabular-nums"
                    style={{ color: "var(--text)" }}
                  >
                    {formatCurrency(available, currency)}
                  </span>
                </div>
                {reserved > 0 && (
                  <div className="flex justify-between gap-3">
                    <span style={{ color: "var(--text-tertiary)" }}>
                      Reserved for refunds
                    </span>
                    <span
                      className="tabular-nums"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {formatCurrency(reserved, currency)}
                    </span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  style={{ color: "var(--primary)" }}
                  onClick={() => update("amount", String(available))}
                >
                  Withdraw full amount
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="withdraw-amount">Amount ({currency})</Label>
              <Input
                id="withdraw-amount"
                type="number"
                min={1}
                max={available || undefined}
                step={1}
                placeholder="0"
                className="mt-1.5"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                disabled={!form.tripId}
              />
              {form.tripId && amountValue > available && (
                <p className="mt-1 text-xs" style={{ color: "var(--coral)" }}>
                  Amount cannot exceed {formatCurrency(available, currency)}.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Payout account</Label>
                {!noSavedAccounts && (
                  <Link
                    href="/organizer/settings?tab=payouts"
                    className="inline-flex items-center gap-1 text-xs"
                    style={{ color: "var(--primary)" }}
                    onClick={() => handleOpenChange(false)}
                  >
                    <Settings className="h-3 w-3" />
                    Manage accounts
                  </Link>
                )}
              </div>

              {!noSavedAccounts && (
                <RadioGroup
                  value={accountMode}
                  onValueChange={(value) =>
                    setAccountMode(value as "saved" | "new")
                  }
                  className="flex gap-4"
                >
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value="saved" id="account-mode-saved" />
                    Saved account
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value="new" id="account-mode-new" />
                    New account
                  </label>
                </RadioGroup>
              )}

              {accountMode === "saved" && !noSavedAccounts ? (
                <Select
                  value={form.payoutAccountId || undefined}
                  onValueChange={(id) => update("payoutAccountId", id)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payout account" />
                  </SelectTrigger>
                  <SelectContent>
                    {payoutAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName} ·{" "}
                        {PAYOUT_METHOD_LABELS[account.type]} ·{" "}
                        {formatPayoutAccountLabel(account)}
                        {account.isDefault ? " (default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div
                  className="space-y-4 rounded-xl border p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  {noSavedAccounts && (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Add a payout account to receive your withdrawal. You can
                      also save accounts in{" "}
                      <Link
                        href="/organizer/settings?tab=payouts"
                        className="underline"
                        style={{ color: "var(--primary)" }}
                        onClick={() => handleOpenChange(false)}
                      >
                        Settings
                      </Link>
                      .
                    </p>
                  )}
                  <PayoutAccountFormFields
                    values={newAccountForm}
                    onChange={setNewAccountForm}
                    idPrefix="withdraw-payout"
                  />
                  <label
                    className="flex cursor-pointer items-center gap-2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <input
                      type="checkbox"
                      checked={saveNewAccount}
                      onChange={(e) => setSaveNewAccount(e.target.checked)}
                      className="rounded"
                    />
                    Save this account for future withdrawals
                  </label>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                style={{ background: "var(--primary)", color: "#fbf7f1" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Requesting…
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="h-4 w-4" />
                    Request payout
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
