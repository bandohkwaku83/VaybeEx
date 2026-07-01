/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus, Smartphone, Star, Trash2, X, Wallet,
  CreditCard, Building2, CalendarClock, Check,
} from "lucide-react";
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
  getPayoutAccounts,
  isPayoutAccountComplete,
  PAYOUT_METHOD_LABELS,
  removePayoutAccount,
  setDefaultPayoutAccount,
} from "@/lib/payout-accounts";
import type { PayoutAccount } from "@/lib/types";

/* ── Method icon mapping (visual variety, all on-theme) ───────────── */
function methodIcon(type: string) {
  if (type === "bank") return Building2;
  if (type === "installment") return CalendarClock;
  if (type === "card") return CreditCard;
  return Smartphone; // mtn / vodafone / airteltigo
}

/* ── Themed primitives ───────────────────────────────────────────── */
function PrimaryButton({
  children, onClick, type = "button", className = "",
}: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold transition-all ${className}`}
      style={{ background: "var(--primary)", color: "#fbf7f1" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--primary-dark)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--primary)")}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  children, onClick, type = "button", className = "",
}: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-colors ${className}`}
      style={{ borderColor: "var(--border-strong)", color: "var(--text-secondary)", background: "var(--surface)" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
    >
      {children}
    </button>
  );
}

/* ── Modal ───────────────────────────────────────────────────────── */
function Modal({
  open, onClose, children,
}: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(42,27,15,0.45)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[20px] border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export function PayoutAccountsSection() {
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PayoutAccountFormValues>(emptyPayoutAccountForm);
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setAccounts(getPayoutAccounts());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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
    setRemovingId(id);
    setTimeout(() => {
      removePayoutAccount(id);
      refresh();
      setRemovingId(null);
      toast.success("Payout account removed");
    }, 180);
  };

  const handleSetDefault = (id: string) => {
    setDefaultPayoutAccount(id);
    refresh();
    toast.success("Default payout account updated");
  };

  return (
    <>
      {/* ── Header row ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <p className="text-[12px] leading-relaxed max-w-sm" style={{ color: "var(--text-tertiary)" }}>
          Add the mobile money accounts where we send your withdrawals. Saved once, reused for every payout.
        </p>
        <OutlineButton onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="h-3.5 w-3.5" /> Add account
        </OutlineButton>
      </div>

      {/* ── Accounts list ───────────────────────────────────────── */}
      {accounts.length === 0 ? (
        <div
          className="rounded-[14px] border border-dashed px-6 py-10 text-center"
          style={{ borderColor: "var(--border-strong)", background: "var(--bg-secondary)" }}
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--primary-dim)" }}
          >
            <Wallet className="h-6 w-6" style={{ color: "var(--primary)" }} />
          </div>
          <p className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
            No payout accounts yet
          </p>
          <p className="text-[12px] mt-1.5 max-w-sm mx-auto" style={{ color: "var(--text-tertiary)" }}>
            Add a mobile money account before requesting your first withdrawal.
          </p>
          <PrimaryButton onClick={() => setDialogOpen(true)} className="mt-5 mx-auto">
            <Plus className="h-3.5 w-3.5" /> Add payout account
          </PrimaryButton>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {accounts.map(account => {
            const Icon = methodIcon(account.type);
            const isRemoving = removingId === account.id;
            return (
              <li
                key={account.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-[14px] border p-4 transition-all duration-200"
                style={{
                  borderColor: account.isDefault ? "rgba(196,134,76,0.4)" : "var(--border)",
                  background: account.isDefault ? "var(--gold-dim)" : "var(--surface)",
                  opacity: isRemoving ? 0 : 1,
                  transform: isRemoving ? "translateX(8px)" : "translateX(0)",
                }}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                    style={{
                      background: account.isDefault ? "var(--gold)" : "var(--primary-dim)",
                      color: account.isDefault ? "#fff" : "var(--primary)",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text)" }}>
                        {account.accountName}
                      </p>
                      {account.isDefault && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0"
                          style={{ background: "var(--gold)", color: "#fff" }}
                        >
                          <Star className="h-2.5 w-2.5 fill-current" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {PAYOUT_METHOD_LABELS[account.type]} · {formatPayoutAccountLabel(account)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:shrink-0">
                  {!account.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(account.id)}
                      className="text-[12px] font-semibold rounded-lg px-3 py-1.5 transition-colors"
                      style={{ color: "var(--primary)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--primary-dim)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(account.id)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold rounded-lg px-3 py-1.5 transition-colors"
                    style={{ color: "var(--coral)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(181,82,58,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Add account modal ───────────────────────────────────── */}
      <Modal open={dialogOpen} onClose={() => handleOpenChange(false)}>
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 px-6 py-5 border-b"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: "linear-gradient(135deg,#6b3f1d,#c4864c)" }}
            >
              <Wallet className="h-4 w-4" style={{ color: "#fbf7f1" }} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
                Add payout account
              </h2>
              <p className="text-[12px] mt-0.5 max-w-[260px]" style={{ color: "var(--text-tertiary)" }}>
                This account will receive your trip earnings when you withdraw.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--border)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAdd} className="px-6 py-5 space-y-5">
          <div className="payout-form-theme">
            <PayoutAccountFormFields values={form} onChange={setForm} idPrefix="settings-payout" />
          </div>

          {accounts.length > 0 && (
            <button
              type="button"
              onClick={() => setSetAsDefault(s => !s)}
              className="flex items-center gap-3 w-full text-left rounded-[12px] border p-3 transition-all"
              style={{
                borderColor: setAsDefault ? "rgba(196,134,76,0.35)" : "var(--border)",
                background: setAsDefault ? "var(--gold-dim)" : "var(--bg-secondary)",
              }}
            >
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all"
                style={{
                  background: setAsDefault ? "var(--gold)" : "var(--surface)",
                  borderColor: setAsDefault ? "var(--gold)" : "var(--border-strong)",
                }}
              >
                {setAsDefault && <Check className="h-3 w-3" style={{ color: "#fff" }} />}
              </div>
              <div>
                <p className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>
                  Set as default payout account
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Withdrawals will be sent here unless you choose another account.
                </p>
              </div>
            </button>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <OutlineButton onClick={() => handleOpenChange(false)}>
              Cancel
            </OutlineButton>
            <PrimaryButton type="submit">
              <Plus className="h-3.5 w-3.5" /> Save account
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <style jsx global>{`
        .payout-form-theme label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
        }
        .payout-form-theme input,
        .payout-form-theme select,
        .payout-form-theme textarea {
          border-radius: 10px !important;
          border-color: var(--border-strong) !important;
          background: var(--surface) !important;
          color: var(--text) !important;
          font-size: 13px !important;
        }
        .payout-form-theme input:focus,
        .payout-form-theme select:focus,
        .payout-form-theme textarea:focus {
          outline: none !important;
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px var(--primary-dim) !important;
        }
      `}</style>
    </>
  );
}