const STORAGE_KEY = "trripx-organizer-profile";

export interface OrganizerProfile {
  phone: string;
  whatsapp: string;
  location: string;
  businessName: string;
  bio: string;
  specialties: string;
  profilePicture: string | null;
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
  bio: "",
  specialties: "",
  profilePicture: null,
  notifications: {
    bookingAlerts: true,
    payoutAlerts: true,
  },
};

export function getOrganizerProfile(): OrganizerProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultProfile, ...JSON.parse(stored) };
  } catch {
    /* ignore */
  }
  return defaultProfile;
}

export function saveOrganizerProfile(profile: OrganizerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export { defaultProfile };
