import { apiRequest } from "./client";
import { getOrganizerToken } from "./auth-token";
import { resolveMediaUrl } from "./media";
import {
  getOrganizerMe as fetchOrganizerMe,
  type OrganizerPublicUser,
} from "./organizer-auth";
import {
  getOrganizerProfile,
  saveOrganizerProfile,
} from "@/lib/organizer-profile";

export type TripSpecialtyOption = {
  value: string;
  label: string;
};

export type OrganizerProfileOptions = {
  tripSpecialties: TripSpecialtyOption[];
};

/**
 * Profile fields from GET /api/organizer/auth/me and PATCH /api/organizer/profile.
 * Matches live API media names; `*Url` / `bio` kept as aliases.
 */
export type OrganizerProfileApiData = Partial<OrganizerPublicUser> & {
  bio?: string;
};

/** Editable fields for PATCH /api/organizer/profile (multipart). */
export type OrganizerProfileUpdateInput = {
  fullName?: string;
  location?: string;
  whatsapp?: string;
  aboutYou?: string;
  tripSpecialties?: string[];
  profilePhoto?: File | null;
  brandLogo?: File | null;
};

export type OrganizerProfileSetupInput = {
  fullName: string;
  location: string;
  phone: string;
  whatsapp?: string;
  businessName: string;
  brandSlug: string;
  aboutYou: string;
  tripSpecialties: string[];
  profilePhoto?: File | null;
  brandLogo?: File | null;
  nationalIdPhoto: File;
};

/** Normalized form state used by settings UI. */
export type OrganizerProfileFormState = {
  fullName: string;
  location: string;
  whatsapp: string;
  aboutYou: string;
  tripSpecialties: string[];
  profilePhotoUrl: string | null;
  brandLogoUrl: string | null;
  email: string;
  phone: string;
  businessName: string;
  brandSlug: string;
  nationalIdPhotoUrl: string | null;
};

export const emptyOrganizerProfileForm = (): OrganizerProfileFormState => ({
  fullName: "",
  location: "",
  whatsapp: "",
  aboutYou: "",
  tripSpecialties: [],
  profilePhotoUrl: null,
  brandLogoUrl: null,
  email: "",
  phone: "",
  businessName: "",
  brandSlug: "",
  nationalIdPhotoUrl: null,
});

function bearerHeaders(): HeadersInit {
  const token = getOrganizerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function specialtiesFromApi(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/** Prefer live API field names, fall back to legacy `*Url` aliases. */
export function pickOrganizerMediaPath(
  data: OrganizerProfileApiData | undefined | null,
  kind: "profile" | "brand" | "nationalId"
): string | null {
  if (!data) return null;
  if (kind === "profile") {
    return data.profilePhoto ?? data.profilePhotoUrl ?? null;
  }
  if (kind === "brand") {
    return data.brandLogo ?? data.brandLogoUrl ?? null;
  }
  return data.nationalIdPhoto ?? data.nationalIdPhotoUrl ?? null;
}

/** Map API profile → settings form (resolves media URLs for display). */
export function mapOrganizerProfileToForm(
  data: OrganizerProfileApiData | undefined | null,
  fallback?: Partial<OrganizerProfileFormState>
): OrganizerProfileFormState {
  const base = { ...emptyOrganizerProfileForm(), ...fallback };
  if (!data) return base;

  return {
    fullName: data.fullName?.trim() || base.fullName,
    location: data.location?.trim() || base.location,
    whatsapp:
      typeof data.whatsapp === "string"
        ? data.whatsapp.trim()
        : data.whatsapp === null
          ? ""
          : base.whatsapp,
    aboutYou:
      data.aboutYou?.trim() || data.bio?.trim() || base.aboutYou,
    tripSpecialties: Array.isArray(data.tripSpecialties)
      ? specialtiesFromApi(data.tripSpecialties)
      : base.tripSpecialties,
    profilePhotoUrl:
      resolveMediaUrl(pickOrganizerMediaPath(data, "profile")) ||
      base.profilePhotoUrl,
    brandLogoUrl:
      resolveMediaUrl(pickOrganizerMediaPath(data, "brand")) ||
      base.brandLogoUrl,
    email: data.email?.trim() || base.email,
    phone: data.phone?.trim() || base.phone,
    businessName: data.businessName?.trim() || base.businessName,
    brandSlug: data.brandSlug?.trim() || base.brandSlug,
    nationalIdPhotoUrl:
      resolveMediaUrl(pickOrganizerMediaPath(data, "nationalId")) ||
      base.nationalIdPhotoUrl,
  };
}

/**
 * Mirror /me (or PATCH response) into the local organizer profile cache
 * used by topbar, trip URLs, and contact helpers.
 */
export function syncOrganizerProfileCache(
  data: OrganizerProfileApiData | undefined | null
) {
  if (!data || typeof window === "undefined") return;

  const mapped = mapOrganizerProfileToForm(data);
  const local = getOrganizerProfile();
  saveOrganizerProfile({
    ...local,
    phone: mapped.phone || local.phone,
    whatsapp: mapped.whatsapp || local.whatsapp,
    location: mapped.location || local.location,
    businessName: mapped.businessName || local.businessName,
    brandSlug: mapped.brandSlug || local.brandSlug,
    bio: mapped.aboutYou || local.bio,
    specialties: mapped.tripSpecialties.length
      ? mapped.tripSpecialties
      : local.specialties,
    profilePicture: mapped.profilePhotoUrl ?? local.profilePicture,
    brandLogo: mapped.brandLogoUrl ?? local.brandLogo,
  });
}

/**
 * Build a partial PATCH payload — only fields that differ from the loaded baseline.
 * Locked fields are never included.
 */
export function diffOrganizerProfileUpdate(
  current: OrganizerProfileFormState,
  baseline: OrganizerProfileFormState,
  files: { profilePhoto?: File | null; brandLogo?: File | null }
): OrganizerProfileUpdateInput {
  const patch: OrganizerProfileUpdateInput = {};

  if (current.fullName.trim() !== baseline.fullName.trim()) {
    patch.fullName = current.fullName.trim();
  }
  if (current.location.trim() !== baseline.location.trim()) {
    patch.location = current.location.trim();
  }
  if (current.whatsapp.trim() !== baseline.whatsapp.trim()) {
    // Empty string clears WhatsApp on the backend.
    patch.whatsapp = current.whatsapp.trim();
  }
  if (current.aboutYou.trim() !== baseline.aboutYou.trim()) {
    patch.aboutYou = current.aboutYou.trim();
  }

  const curSpecs = [...current.tripSpecialties].sort().join("\0");
  const baseSpecs = [...baseline.tripSpecialties].sort().join("\0");
  if (curSpecs !== baseSpecs) {
    patch.tripSpecialties = [...current.tripSpecialties];
  }

  if (files.profilePhoto) patch.profilePhoto = files.profilePhoto;
  if (files.brandLogo) patch.brandLogo = files.brandLogo;

  return patch;
}

export function hasOrganizerProfileChanges(
  patch: OrganizerProfileUpdateInput
): boolean {
  return Object.keys(patch).length > 0;
}

function appendEditableFields(
  form: FormData,
  input: OrganizerProfileUpdateInput
) {
  if (input.fullName !== undefined) form.append("fullName", input.fullName);
  if (input.location !== undefined) form.append("location", input.location);
  if (input.whatsapp !== undefined) form.append("whatsapp", input.whatsapp);
  if (input.aboutYou !== undefined) form.append("aboutYou", input.aboutYou);
  if (input.tripSpecialties !== undefined) {
    form.append("tripSpecialties", JSON.stringify(input.tripSpecialties));
  }
}

/** GET /api/organizer/profile/options — specialty chips for setup/edit. */
export function getOrganizerProfileOptions() {
  return apiRequest<OrganizerProfileOptions>("/api/organizer/profile/options", {
    method: "GET",
    headers: bearerHeaders(),
  });
}

/**
 * GET /api/organizer/auth/me — current organizer session + profile.
 * Prefer this for settings prefill and portal hydration.
 */
export function getOrganizerMe() {
  return fetchOrganizerMe();
}

/** @deprecated Prefer getOrganizerMe(). Kept for older call sites. */
export function fetchOrganizerProfile() {
  return getOrganizerMe();
}

/** POST /api/organizer/profile/setup — initial complete-profile (multipart). */
export function setupOrganizerProfile(input: OrganizerProfileSetupInput) {
  const form = new FormData();
  form.append("fullName", input.fullName);
  form.append("location", input.location);
  form.append("phone", input.phone);
  form.append("whatsapp", input.whatsapp ?? "");
  form.append("businessName", input.businessName);
  form.append("brandSlug", input.brandSlug);
  form.append("aboutYou", input.aboutYou);
  form.append("tripSpecialties", JSON.stringify(input.tripSpecialties));
  if (input.profilePhoto) {
    form.append("profilePhoto", input.profilePhoto, input.profilePhoto.name);
  }
  if (input.brandLogo) {
    form.append("brandLogo", input.brandLogo, input.brandLogo.name);
  }
  form.append("nationalIdPhoto", input.nationalIdPhoto, input.nationalIdPhoto.name);

  return apiRequest<OrganizerProfileApiData>("/api/organizer/profile/setup", {
    method: "POST",
    headers: bearerHeaders(),
    body: form,
  });
}

/**
 * PATCH /api/organizer/profile — partial update (multipart).
 * Only append editable fields. Never send locked fields.
 */
export function updateOrganizerProfile(input: OrganizerProfileUpdateInput) {
  const form = new FormData();
  appendEditableFields(form, input);
  if (input.profilePhoto) {
    form.append("profilePhoto", input.profilePhoto, input.profilePhoto.name);
  }
  if (input.brandLogo) {
    form.append("brandLogo", input.brandLogo, input.brandLogo.name);
  }

  return apiRequest<OrganizerProfileApiData>("/api/organizer/profile", {
    method: "PATCH",
    headers: bearerHeaders(),
    body: form,
  });
}

export function pickBrandSlugFromApi(
  data: OrganizerProfileApiData | undefined,
  fallback: string
): string {
  const fromApi = data?.brandSlug?.trim();
  return fromApi || fallback;
}
