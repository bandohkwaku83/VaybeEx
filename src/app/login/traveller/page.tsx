import { redirect } from "next/navigation";

export default async function TravellerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  params.set("mode", sp.mode === "signin" ? "signin" : "signup");
  if (sp.redirect) params.set("redirect", sp.redirect);
  redirect(`/login?${params.toString()}`);
}
