import { QueryClientProvider } from "@tanstack/react-query";
import type { ThemeConfig } from "antd";
import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import type { ReactNode } from "react";

import { queryClient } from "~/api";

/**
 * Props for the root Ant Design application provider.
 */
type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const industrialTheme = {
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      ...antdTheme.useToken().token,
      borderRadius: 10,
      borderRadiusLG: 15,
      borderRadiusSM: 5,
      colorBgBase: "#f1f5f9",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#f8fafc",
      fontFamily: "IBM Plex Sans, sans-serif",
    },
  } satisfies ThemeConfig;

  return (
    <ConfigProvider
      componentSize="medium"
      theme={industrialTheme}
      variant="outlined"
    >
      <AntdApp component={false}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
};
