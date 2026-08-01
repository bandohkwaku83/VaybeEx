import { redirect } from "next/navigation";

/** Legacy path — KYC lives on /organizer/pending now. */
export default function VerificationRedirectPage() {
  redirect("/organizer/pending");
}
