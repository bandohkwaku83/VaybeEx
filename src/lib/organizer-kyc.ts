import { ApiError } from "@/lib/api/client";

export type OrganizerKycStatus = "pending" | "approved" | "rejected" | null;

export type OrganizerKyc = {
  status: OrganizerKycStatus;
  onboardingCompleted: boolean;
  canPublish: boolean;
  canResubmit: boolean;
  rejectionReason: string | null;
  reviewedAt: string | null;
  resubmittedAt: string | null;
  resubmissionCount: number;
};

export const ORGANIZER_KYC_CODES = {
  REJECTED: "ORGANIZER_REJECTED",
  PENDING_REVIEW: "ORGANIZER_PENDING_REVIEW",
  SETUP_REQUIRED: "ORGANIZER_SETUP_REQUIRED",
  ALREADY_PENDING: "ORGANIZER_ALREADY_PENDING",
  ALREADY_APPROVED: "ORGANIZER_ALREADY_APPROVED",
  RESUBMITTED: "ORGANIZER_RESUBMITTED",
} as const;

export type OrganizerKycCode =
  (typeof ORGANIZER_KYC_CODES)[keyof typeof ORGANIZER_KYC_CODES];

export const ORGANIZER_SETUP_PATH = "/organizer/profile/setup";
export const ORGANIZER_VERIFICATION_PATH = "/organizer/verification";
export const ORGANIZER_DASHBOARD_PATH = "/organizer/dashboard";
export const ORGANIZER_SETTINGS_PATH = "/organizer/settings";

const EMPTY_KYC: OrganizerKyc = {
  status: null,
  onboardingCompleted: false,
  canPublish: false,
  canResubmit: false,
  rejectionReason: null,
  reviewedAt: null,
  resubmittedAt: null,
  resubmissionCount: 0,
};

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  return fallback;
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function asCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function normalizeOrganizerKycStatus(
  value: unknown
): OrganizerKycStatus {
  const raw = String(value ?? "")
    .toLowerCase()
    .trim();
  if (raw === "rejected") return "rejected";
  if (raw === "approved" || raw === "verified") return "approved";
  if (raw === "pending" || raw === "pending_approval" || raw === "in_review") {
    return "pending";
  }
  return null;
}

type KycSource = {
  kyc?: Partial<OrganizerKyc> | null;
  status?: unknown;
  onboardingCompleted?: unknown;
  canPublish?: unknown;
  canResubmit?: unknown;
  rejectionReason?: unknown;
  reviewedAt?: unknown;
  resubmittedAt?: unknown;
  resubmissionCount?: unknown;
};

export function kycFromAuthUser(user?: {
  kyc?: Partial<OrganizerKyc> | null;
  organizerStatus?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
} | null): OrganizerKyc {
  if (user?.kyc) return normalizeOrganizerKyc(user);
  return normalizeOrganizerKyc({
    status:
      user?.organizerStatus === "verified"
        ? "approved"
        : user?.organizerStatus ?? null,
    onboardingCompleted: Boolean(user?.organizerStatus),
    canPublish: user?.organizerStatus === "verified",
    canResubmit: user?.organizerStatus === "rejected",
    rejectionReason: user?.rejectionReason ?? null,
  });
}

/** Prefer nested `user.kyc`, then flat login/me/dashboard fields. */
export function normalizeOrganizerKyc(
  user?: KycSource | null
): OrganizerKyc {
  if (!user) return { ...EMPTY_KYC };

  const nested = user.kyc ?? {};
  const status = normalizeOrganizerKycStatus(nested.status ?? user.status);

  const onboardingCompleted = asBoolean(
    nested.onboardingCompleted ?? user.onboardingCompleted,
    false
  );

  const canPublish = asBoolean(
    nested.canPublish ?? user.canPublish,
    status === "approved"
  );
  const canResubmit = asBoolean(
    nested.canResubmit ?? user.canResubmit,
    status === "rejected"
  );

  return {
    status,
    onboardingCompleted,
    canPublish,
    canResubmit,
    rejectionReason: asNullableString(
      nested.rejectionReason ?? user.rejectionReason
    ),
    reviewedAt: asNullableString(nested.reviewedAt ?? user.reviewedAt),
    resubmittedAt: asNullableString(nested.resubmittedAt ?? user.resubmittedAt),
    resubmissionCount: asCount(
      nested.resubmissionCount ?? user.resubmissionCount
    ),
  };
}

export function nextOrganizerRoute(kyc: OrganizerKyc): string {
  if (!kyc.onboardingCompleted) return ORGANIZER_SETUP_PATH;
  if (kyc.status === "pending") return ORGANIZER_VERIFICATION_PATH;
  if (kyc.status === "rejected") return ORGANIZER_SETUP_PATH;
  return ORGANIZER_DASHBOARD_PATH;
}

export function kycToLegacyOrganizerStatus(
  kyc: OrganizerKyc
): "pending" | "verified" | "rejected" | undefined {
  if (!kyc.onboardingCompleted) return undefined;
  if (kyc.status === "rejected") return "rejected";
  if (kyc.status === "approved") return "verified";
  return "pending";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Pull KYC from dashboard / me / error payloads. */
export function extractOrganizerKyc(payload: unknown): OrganizerKyc | null {
  const root = asRecord(payload);
  if (!root) return null;

  const user = asRecord(root.user) ?? asRecord(root.organizer);
  const nestedKyc = asRecord(root.kyc) ?? (user ? asRecord(user.kyc) : null);

  if (nestedKyc || user) {
    return normalizeOrganizerKyc({
      ...(user ?? {}),
      kyc: (nestedKyc ?? user?.kyc) as Partial<OrganizerKyc> | undefined,
      status: nestedKyc?.status ?? user?.status ?? root.status,
      onboardingCompleted:
        nestedKyc?.onboardingCompleted ??
        user?.onboardingCompleted ??
        root.onboardingCompleted,
      canPublish: nestedKyc?.canPublish ?? user?.canPublish ?? root.canPublish,
      canResubmit:
        nestedKyc?.canResubmit ?? user?.canResubmit ?? root.canResubmit,
      rejectionReason:
        nestedKyc?.rejectionReason ??
        user?.rejectionReason ??
        root.rejectionReason,
      reviewedAt: nestedKyc?.reviewedAt ?? user?.reviewedAt ?? root.reviewedAt,
      resubmittedAt:
        nestedKyc?.resubmittedAt ?? user?.resubmittedAt ?? root.resubmittedAt,
      resubmissionCount:
        nestedKyc?.resubmissionCount ??
        user?.resubmissionCount ??
        root.resubmissionCount,
    });
  }

  if (
    root.status != null ||
    root.canPublish != null ||
    root.canResubmit != null ||
    root.onboardingCompleted != null ||
    root.rejectionReason != null
  ) {
    return normalizeOrganizerKyc({
      ...root,
      status: root.status ?? "rejected",
    });
  }

  return null;
}

export function routeForOrganizerCode(code?: string | null): string | null {
  switch (code) {
    case ORGANIZER_KYC_CODES.REJECTED:
    case ORGANIZER_KYC_CODES.SETUP_REQUIRED:
      return ORGANIZER_SETUP_PATH;
    case ORGANIZER_KYC_CODES.PENDING_REVIEW:
    case ORGANIZER_KYC_CODES.ALREADY_PENDING:
    case ORGANIZER_KYC_CODES.RESUBMITTED:
      return ORGANIZER_VERIFICATION_PATH;
    case ORGANIZER_KYC_CODES.ALREADY_APPROVED:
      return ORGANIZER_SETTINGS_PATH;
    default:
      return null;
  }
}

export function isOrganizerKycCode(code?: string | null): code is string {
  return Boolean(code && Object.values(ORGANIZER_KYC_CODES).includes(code as OrganizerKycCode));
}

type RouterLike = { push: (href: string) => void; replace: (href: string) => void };

/**
 * Branch typed organizer 403s by `code`, not the message string.
 * Returns true when the error was recognized.
 */
export function handleOrganizerKycError(
  error: unknown,
  router?: RouterLike,
  options?: { replace?: boolean; stayOnPath?: string }
): boolean {
  if (!(error instanceof ApiError)) return false;

  const code = error.code;
  if (!code && error.status !== 403) return false;

  const fromData = extractOrganizerKyc(error.data);
  const path = routeForOrganizerCode(code);

  if (!path) {
    return Boolean(fromData && code);
  }

  if (options?.stayOnPath && path === options.stayOnPath) {
    return true;
  }

  if (router) {
    if (options?.replace) router.replace(path);
    else router.push(path);
  }
  return true;
}

export function organizerCannotPublishReason(kyc?: OrganizerKyc | null): string {
  if (!kyc) return "Your account must be approved before you can publish trips.";
  if (kyc.status === "rejected") {
    return kyc.rejectionReason
      ? `Application not approved. ${kyc.rejectionReason}`
      : "Application not approved. Update your profile and resubmit.";
  }
  if (kyc.status === "pending") {
    return kyc.resubmissionCount > 0
      ? "We received your update and are reviewing it again."
      : "Your profile is under review. You can publish once you’re approved.";
  }
  if (!kyc.onboardingCompleted) {
    return "Finish organizer setup before creating trips.";
  }
  return "Your account must be approved before you can publish trips.";
}
