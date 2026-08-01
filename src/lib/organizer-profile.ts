const STORAGE_KEY = "trripx-organizer-profile";

export interface OrganizerProfile {
  phone: string;
  whatsapp: string;
  location: string;
  businessName: string;
  /** Editable public subdomain for tenant URLs (e.g. kofi-adventures). */
  brandSlug: string;
  bio: string;
  specialties: string[];
  profilePicture: string | null;
  brandLogo: string | null;
  notifications: {
    bookingAlerts: boolean;
    payoutAlerts: boolean;
  };
}

const defaultProfile: OrganizerProfile = {
  phone: "",
  whatsapp: "",
  location: "",
  businessName: "",
  brandSlug: "",
  bio: "",
  specialties: [],
  profilePicture: null,
  brandLogo: null,
  notifications: {
    bookingAlerts: true,
    payoutAlerts: true,
  },
};

function normalizeSpecialties(value: unknown): string[] {
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

export function getOrganizerProfile(): OrganizerProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<OrganizerProfile> & {
        specialties?: unknown;
      };
      return {
        ...defaultProfile,
        ...parsed,
        brandSlug: typeof parsed.brandSlug === "string" ? parsed.brandSlug.trim() : "",
        specialties: normalizeSpecialties(parsed.specialties),
        brandLogo: parsed.brandLogo ?? null,
      };
    }
  } catch {
    /* ignore */
  }
  return defaultProfile;
}

export function saveOrganizerProfile(profile: OrganizerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export { defaultProfile };
