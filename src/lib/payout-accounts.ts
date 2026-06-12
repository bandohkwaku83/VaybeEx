import type { PayoutAccount, PayoutAccountType } from "@/lib/types";

const STORAGE_KEY = "trripx-payout-accounts";

export const PAYOUT_METHOD_LABELS: Record<PayoutAccountType, string> = {
  mtn: "MTN MoMo",
  vodafone: "Vodafone Cash",
  airteltigo: "AirtelTigo Money",
};

export const PAYOUT_ACCOUNT_TYPES = Object.keys(PAYOUT_METHOD_LABELS) as PayoutAccountType[];

export function maskAccountNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `****${digits.slice(-4)}`;
}

export function formatPayoutAccountLabel(account: PayoutAccount): string {
  const label = PAYOUT_METHOD_LABELS[account.type];
  return `${label} · ${maskAccountNumber(account.momoNumber)}`;
}

export function getPayoutAccounts(): PayoutAccount[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const accounts = JSON.parse(stored) as PayoutAccount[];
      return accounts.filter((a) => PAYOUT_ACCOUNT_TYPES.includes(a.type));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function savePayoutAccounts(accounts: PayoutAccount[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function getDefaultPayoutAccount(): PayoutAccount | undefined {
  const accounts = getPayoutAccounts();
  return accounts.find((a) => a.isDefault) ?? accounts[0];
}

export type NewPayoutAccountInput = Omit<PayoutAccount, "id" | "isDefault" | "createdAt"> & {
  isDefault?: boolean;
};

export function addPayoutAccount(input: NewPayoutAccountInput): PayoutAccount {
  const accounts = getPayoutAccounts();
  const account: PayoutAccount = {
    ...input,
    id: `pa-${Date.now()}`,
    isDefault: input.isDefault ?? accounts.length === 0,
    createdAt: new Date().toISOString(),
  };

  const next = input.isDefault
    ? [...accounts.map((a) => ({ ...a, isDefault: false })), account]
    : [...accounts, account];

  savePayoutAccounts(next);
  return account;
}

export function removePayoutAccount(id: string): void {
  const accounts = getPayoutAccounts().filter((a) => a.id !== id);
  if (accounts.length > 0 && !accounts.some((a) => a.isDefault)) {
    accounts[0].isDefault = true;
  }
  savePayoutAccounts(accounts);
}

export function setDefaultPayoutAccount(id: string): void {
  savePayoutAccounts(
    getPayoutAccounts().map((a) => ({ ...a, isDefault: a.id === id }))
  );
}

export function isPayoutAccountComplete(input: Partial<NewPayoutAccountInput>): boolean {
  return Boolean(input.accountName?.trim() && input.type && input.momoNumber?.trim());
}

export function buildPayoutAccountInput(values: {
  type: PayoutAccountType;
  accountName: string;
  momoNumber: string;
}): NewPayoutAccountInput {
  return {
    type: values.type,
    accountName: values.accountName.trim(),
    momoNumber: values.momoNumber.trim(),
  };
}
