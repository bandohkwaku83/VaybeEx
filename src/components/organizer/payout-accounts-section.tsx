"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Smartphone, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  emptyPayoutAccountForm,
  PayoutAccountFormFields,
  type PayoutAccountFormValues,
} from "@/components/organizer/payout-account-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  addPayoutAccount,
  buildPayoutAccountInput,
  formatPayoutAccountLabel,
  getPayoutAccounts,
  isPayoutAccountComplete,
  PAYOUT_METHOD_LABELS,
  removePayoutAccount,
  setDefaultPayoutAccount,
} from "@/lib/payout-accounts";
import type { PayoutAccount } from "@/lib/types";
import { cn } from "@/lib/utils";

function AccountIcon() {
  return <Smartphone className="h-4 w-4 shrink-0" />;
}

export function PayoutAccountsSection() {
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PayoutAccountFormValues>(emptyPayoutAccountForm);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const refresh = useCallback(() => {
    setAccounts(getPayoutAccounts());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resetDialog = () => {
    setForm(emptyPayoutAccountForm);
    setSetAsDefault(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetDialog();
    setDialogOpen(open);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const input = buildPayoutAccountInput(form);
    if (!isPayoutAccountComplete(input)) {
      toast.error("Complete all payout account fields");
      return;
    }

    addPayoutAccount({ ...input, isDefault: setAsDefault || accounts.length === 0 });
    refresh();
    handleOpenChange(false);
    toast.success("Payout account saved");
  };

  const handleRemove = (id: string) => {
    removePayoutAccount(id);
    refresh();
    toast.success("Payout account removed");
  };

  const handleSetDefault = (id: string) => {
    setDefaultPayoutAccount(id);
    refresh();
    toast.success("Default payout account updated");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Payout accounts</CardTitle>
            <CardDescription>
              Add the mobile money accounts where we send your withdrawals. Saved once, reused
              for every payout.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add account
          </Button>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-6 py-10 text-center">
              <Smartphone className="h-8 w-8 text-stone-400 mx-auto mb-3" />
              <p className="font-medium text-stone-900">No payout accounts yet</p>
              <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                Add a mobile money account before requesting your first withdrawal.
              </p>
              <Button type="button" className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add payout account
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {accounts.map((account) => (
                <li
                  key={account.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-4",
                    account.isDefault ? "border-teal-200 bg-teal-50/40" : "border-stone-200"
                  )}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-stone-200 text-teal-600">
                      <AccountIcon />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-stone-900 truncate">
                          {account.accountName}
                        </p>
                        {account.isDefault && (
                          <Badge variant="verified" className="shrink-0">
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {PAYOUT_METHOD_LABELS[account.type]} · {formatPayoutAccountLabel(account)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    {!account.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(account.id)}
                      >
                        Set default
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemove(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add payout account</DialogTitle>
            <DialogDescription>
              This account will receive your trip earnings when you withdraw.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <PayoutAccountFormFields values={form} onChange={setForm} idPrefix="settings-payout" />
            {accounts.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  className="rounded border-stone-300"
                />
                Set as default payout account
              </label>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
