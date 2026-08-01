"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App } from "antd";
import type { ThemeConfig } from "antd";

const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: "#171717",
    colorInfo: "#171717",
    colorSuccess: "#16a34a",
    colorWarning: "#d97706",
    colorError: "#dc2626",
    colorText: "#171717",
    colorTextSecondary: "#525252",
    colorTextTertiary: "#a3a3a3",
    colorBorder: "#e5e5e5",
    colorBorderSecondary: "#f0f0f0",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f5f5f5",
    borderRadius: 10,
    borderRadiusLG: 12,
    fontFamily:
      'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 13,
    controlHeight: 40,
  },
  components: {
    Table: {
      headerBg: "#f5f5f5",
      headerColor: "#525252",
      headerSplitColor: "#e5e5e5",
      rowHoverBg: "#fafafa",
      borderColor: "#e5e5e5",
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
      headerBorderRadius: 12,
    },
    Tag: {
      borderRadiusSM: 6,
      defaultBg: "#f5f5f5",
      defaultColor: "#525252",
    },
    Button: {
      borderRadius: 0,
      controlHeight: 36,
      fontWeight: 500,
      primaryShadow: "none",
    },
    Input: {
      borderRadius: 10,
      activeBorderColor: "#171717",
      hoverBorderColor: "#a3a3a3",
    },
    Select: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Pagination: {
      itemActiveBg: "#171717",
      borderRadius: 8,
    },
    Alert: {
      borderRadiusLG: 12,
    },
  },
};

export function AdminAntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={adminTheme}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
