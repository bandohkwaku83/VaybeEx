const OTP_STORAGE_PREFIX = "vaybeex-traveler-otp:";
const OTP_TTL_MS = 10 * 60 * 1000;
const DEMO_OTP = "123456";

export function sendTravelerOtp(email: string): string {
  const code = DEMO_OTP;
  const payload = { code, expiresAt: Date.now() + OTP_TTL_MS };
  sessionStorage.setItem(`${OTP_STORAGE_PREFIX}${email.toLowerCase()}`, JSON.stringify(payload));
  return code;
}

export function verifyTravelerOtp(email: string, code: string): boolean {
  try {
    const raw = sessionStorage.getItem(`${OTP_STORAGE_PREFIX}${email.toLowerCase()}`);
    if (!raw) return code.trim() === DEMO_OTP;
    const { code: stored, expiresAt } = JSON.parse(raw) as { code: string; expiresAt: number };
    if (Date.now() > expiresAt) return false;
    return stored === code.trim();
  } catch {
    return code.trim() === DEMO_OTP;
  }
}

export function clearTravelerOtp(email: string): void {
  sessionStorage.removeItem(`${OTP_STORAGE_PREFIX}${email.toLowerCase()}`);
}

export { DEMO_OTP };
