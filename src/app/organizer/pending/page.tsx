import { redirect } from "next/navigation";
import { ORGANIZER_VERIFICATION_PATH } from "@/lib/organizer-kyc";

/** Legacy path — waiting screen now lives at /organizer/verification. */
export default function OrganizerPendingRedirectPage() {
  redirect(ORGANIZER_VERIFICATION_PATH);
}
