import { redirect } from "next/navigation";

export default function VerificationRedirectPage() {
  redirect("/organizer/pending");
}
