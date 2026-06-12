"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="space-y-4">
      <div>
        <Label>Mobile money provider</Label>
        <RadioGroup
          value={values.type}
          onValueChange={(value) => update("type", value as PayoutAccountType)}
          className="mt-2 grid gap-2 sm:grid-cols-3"
        >
          {PAYOUT_ACCOUNT_TYPES.map((key) => (
            <label
              key={key}
              htmlFor={`${idPrefix}-method-${key}`}
              className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 cursor-pointer hover:bg-stone-50 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/50"
            >
              <RadioGroupItem value={key} id={`${idPrefix}-method-${key}`} />
              <span className="text-sm text-stone-700">{PAYOUT_METHOD_LABELS[key]}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

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
