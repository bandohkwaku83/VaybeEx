"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Settings } from "lucide-react";
import { toast } from "sonner";
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
import { getOrganizerTrips, getTripAttendees } from "@/lib/mock-data";
import type { Payout, PayoutAccount } from "@/lib/types";
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

const ORGANIZER_ID = "org-1";
const PLATFORM_FEE_RATE = 0.1;

interface WithdrawFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPayouts: Payout[];
  onSubmit: (payout: Payout) => void;
}

function getTripCollected(tripId: string) {
  return getTripAttendees(tripId).reduce((sum, a) => sum + a.amountPaid, 0);
}

function getPendingWithdrawal(tripId: string, payouts: Payout[]) {
  return payouts.find(
    (p) => p.tripId === tripId && (p.status === "pending" || p.status === "processing")
  );
}

function getAvailableBalance(tripId: string, payouts: Payout[]) {
  if (getPendingWithdrawal(tripId, payouts)) return 0;
  const collected = getTripCollected(tripId);
  const withdrawn = payouts
    .filter((p) => p.tripId === tripId && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const netCollected = Math.round(collected * (1 - PLATFORM_FEE_RATE));
  return Math.max(0, netCollected - withdrawn);
}

const initialForm = {
  tripId: "",
  amount: "",
  payoutAccountId: "",
};

export function WithdrawFormDialog({
  open,
  onOpenChange,
  existingPayouts,
  onSubmit,
}: WithdrawFormDialogProps) {
  const [form, setForm] = useState(initialForm);
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([]);
  const [accountMode, setAccountMode] = useState<"saved" | "new">("saved");
  const [newAccountForm, setNewAccountForm] = useState<PayoutAccountFormValues>(
    emptyPayoutAccountForm
  );
  const [saveNewAccount, setSaveNewAccount] = useState(true);

  useEffect(() => {
    if (!open) return;
    const accounts = getPayoutAccounts();
    setPayoutAccounts(accounts);
    const defaultAccount = getDefaultPayoutAccount();
    setForm((prev) => ({
      ...prev,
      payoutAccountId: defaultAccount?.id ?? "",
    }));
    setAccountMode(accounts.length > 0 ? "saved" : "new");
    setNewAccountForm(emptyPayoutAccountForm);
    setSaveNewAccount(true);
  }, [open]);

  const eligibleTrips = useMemo(() => {
    return getOrganizerTrips(ORGANIZER_ID)
      .filter((trip) => trip.booked > 0)
      .map((trip) => ({
        ...trip,
        available: getAvailableBalance(trip.id, existingPayouts),
      }))
      .filter((trip) => trip.available > 0 && !getPendingWithdrawal(trip.id, existingPayouts));
  }, [existingPayouts]);

  const selectedTrip = eligibleTrips.find((t) => t.id === form.tripId);
  const selectedAccount = payoutAccounts.find((a) => a.id === form.payoutAccountId);
  const available = selectedTrip?.available ?? 0;
  const amountValue = Number(form.amount) || 0;

  const newAccountInput = buildPayoutAccountInput(newAccountForm);
  const newAccountValid = isPayoutAccountComplete(newAccountInput);

  const resetForm = () => setForm(initialForm);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit =
    form.tripId &&
    amountValue > 0 &&
    amountValue <= available &&
    (accountMode === "saved"
      ? Boolean(selectedAccount)
      : newAccountValid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedTrip) return;

    let payoutAccount: PayoutAccount | undefined = selectedAccount;

    if (accountMode === "new") {
      if (saveNewAccount) {
        payoutAccount = addPayoutAccount({
          ...newAccountInput,
          isDefault: payoutAccounts.length === 0,
        });
        setPayoutAccounts(getPayoutAccounts());
      } else {
        payoutAccount = {
          id: `temp-${Date.now()}`,
          ...newAccountInput,
          isDefault: false,
          createdAt: new Date().toISOString(),
        };
      }
    }

    if (!payoutAccount) return;

    onSubmit({
      id: `p-${Date.now()}`,
      tripId: selectedTrip.id,
      tripTitle: selectedTrip.title,
      amount: amountValue,
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
      payoutAccountId: payoutAccount.id.startsWith("temp-") ? undefined : payoutAccount.id,
      payoutDestination: formatPayoutAccountLabel(payoutAccount),
    });

    toast.success(
      `Withdrawal of ${formatCurrency(amountValue)} requested for ${selectedTrip.title}.`
    );
    handleOpenChange(false);
  };

  const noEligibleTrips = eligibleTrips.length === 0;
  const noSavedAccounts = payoutAccounts.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Withdraw earnings</DialogTitle>
          <DialogDescription>
            Request a transfer from your trip balance to a saved payout account.
          </DialogDescription>
        </DialogHeader>

        {noEligibleTrips ? (
          <p className="text-sm text-stone-500 py-4">
            No trips have funds available for withdrawal right now.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="withdraw-trip">Trip</Label>
              <Select
                value={form.tripId}
                onValueChange={(id) => {
                  update("tripId", id);
                  update("amount", "");
                }}
              >
                <SelectTrigger id="withdraw-trip" className="mt-1.5">
                  <SelectValue placeholder="Select a trip" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.title} · {formatCurrency(trip.available)} available
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTrip && (
              <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Available (after 10% platform fee)</span>
                  <span className="font-medium text-stone-900 tabular-nums">
                    {formatCurrency(available)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-teal-700"
                  onClick={() => update("amount", String(available))}
                >
                  Withdraw full amount
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="withdraw-amount">Amount (GH₵)</Label>
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
                <p className="text-xs text-red-500 mt-1">
                  Amount cannot exceed {formatCurrency(available)}.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Payout account</Label>
                {!noSavedAccounts && (
                  <Link
                    href="/organizer/settings?tab=payouts"
                    className="text-xs text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
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
                  onValueChange={(value) => setAccountMode(value as "saved" | "new")}
                  className="flex gap-4"
                >
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <RadioGroupItem value="saved" id="account-mode-saved" />
                    Saved account
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
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
                        {account.accountName} · {PAYOUT_METHOD_LABELS[account.type]} ·{" "}
                        {formatPayoutAccountLabel(account)}
                        {account.isDefault ? " (default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-xl border border-stone-200 p-4 space-y-4">
                  {noSavedAccounts && (
                    <p className="text-sm text-stone-500">
                      Add a payout account to receive your withdrawal. You can also save accounts
                      in{" "}
                      <Link
                        href="/organizer/settings?tab=payouts"
                        className="text-teal-600 hover:underline"
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
                  <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveNewAccount}
                      onChange={(e) => setSaveNewAccount(e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    Save this account for future withdrawals
                  </label>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                <ArrowDownToLine className="h-4 w-4" />
                Request withdrawal
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
