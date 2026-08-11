"use client";

import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { AdminAntdProvider } from "@/components/admin/antd-provider";

export default function AdminPortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAntdProvider>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </AdminAntdProvider>
  );
}
