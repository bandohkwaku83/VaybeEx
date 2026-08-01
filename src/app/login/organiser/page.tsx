import { redirect } from "next/navigation";

export default async function OrganiserLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.redirect) params.set("redirect", sp.redirect);
  if (sp.mode) params.set("mode", sp.mode);
  const query = params.toString();
  redirect(`/organizer/login${query ? `?${query}` : ""}`);
}
