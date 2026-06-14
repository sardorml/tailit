"use client";

import { App, ConfigProvider } from "antd";
import type { ReactNode } from "react";

/**
 * Client providers for Ant Design. Stock theme (no token overrides). The antd
 * <App> wrapper supplies context for the static message/modal/notification APIs
 * (e.g. App.useApp().modal.confirm) used across the app.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider>
      <App>{children}</App>
    </ConfigProvider>
  );
}
