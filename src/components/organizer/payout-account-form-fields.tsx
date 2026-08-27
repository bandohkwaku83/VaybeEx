"use client";

import { Check, Building2, Smartphone, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAYOUT_ACCOUNT_TYPES, PAYOUT_METHOD_LABELS } from "@/lib/payout-accounts";
import type { PayoutAccountType } from "@/lib/types";

export type PayoutAccountFormValues = {
  type: PayoutAccountType;
  accountName: string;
  momoNumber: string;
};

export const emptyPayoutAccountForm: PayoutAccountFormValues = {
  type: "mtn",
  accountName: "",
  momoNumber: "",
};

const PROVIDER_ICONS: Record<PayoutAccountType, typeof Smartphone> = {
  mtn: Smartphone,
  vodafone: CreditCard,
  airteltigo: Smartphone,
};

const PROVIDER_COLORS: Record<PayoutAccountType, { selected: string; border: string; bg: string }> = {
  mtn: { selected: "#f59e0b", border: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
  vodafone: { selected: "#ef4444", border: "#ef4444", bg: "rgba(239,68,68,0.06)" },
  airteltigo: { selected: "#3b82f6", border: "#3b82f6", bg: "rgba(59,130,246,0.06)" },
};

interface PayoutAccountFormFieldsProps {
  values: PayoutAccountFormValues;
  onChange: (values: PayoutAccountFormValues) => void;
  idPrefix?: string;
}

export function PayoutAccountFormFields({
  values,
  onChange,
  idPrefix = "payout",
}: PayoutAccountFormFieldsProps) {
  const update = <K extends keyof PayoutAccountFormValues>(
    field: K,
    value: PayoutAccountFormValues[K]
  ) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* Provider selection — pill chips */}
      <div>
        <Label>Mobile money provider</Label>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
          Pick the network your account is on.
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {PAYOUT_ACCOUNT_TYPES.map((key) => {
            const isSelected = values.type === key;
            const colors = PROVIDER_COLORS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => update("type", key)}
                className="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-[13px] font-semibold transition-all duration-200"
                style={{
                  borderColor: isSelected ? colors.border : "var(--border-strong, #e5e5e5)",
                  background: isSelected ? colors.bg : "var(--surface, #fff)",
                  color: isSelected ? colors.selected : "var(--text-secondary, #525252)",
                  boxShadow: isSelected
                    ? `0 0 0 1px ${colors.border}`
                    : "none",
                }}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200"
                  style={{
                    borderColor: isSelected ? colors.border : "var(--border-strong, #d4d4d4)",
                    background: isSelected ? colors.border : "transparent",
                  }}
                >
                  {isSelected && <Check className="h-3 w-3" style={{ color: "#fff" }} />}
                </span>
                {PAYOUT_METHOD_LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Account holder name */}
      <div>
        <Label htmlFor={`${idPrefix}-account-name`}>Account holder name</Label>
        <Input
          id={`${idPrefix}-account-name`}
          className="mt-1.5"
          placeholder="Name on account"
          value={values.accountName}
          onChange={(e) => update("accountName", e.target.value)}
        />
      </div>

      {/* Mobile money number */}
      <div>
        <Label htmlFor={`${idPrefix}-momo-number`}>Mobile money number</Label>
        <Input
          id={`${idPrefix}-momo-number`}
          className="mt-1.5"
          placeholder="+233 XX XXX XXXX"
          value={values.momoNumber}
          onChange={(e) => update("momoNumber", e.target.value)}
        />
      </div>
    </div>
  );
}
