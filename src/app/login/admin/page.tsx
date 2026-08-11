import { redirect } from "next/navigation";

export default async function AdminLoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.redirect) params.set("redirect", sp.redirect);
  const query = params.toString();
  redirect(`/admin-portal/login${query ? `?${query}` : ""}`);
}
