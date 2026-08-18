import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginTailwindcss } from "@rsbuild/plugin-tailwindcss";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";
import path from "node:path";

const { publicVars } = loadEnv({
  cwd: path.join(process.cwd(), "..", ".."),
  prefixes: ["REACT_APP_PUBLIC_"],
});

export default defineConfig({
  html: {},
  plugins: [pluginReact(), pluginTailwindcss()],
  source: {
    define: publicVars,
  },
  tools: {
    rspack: {
      devtool: "source-map",
      plugins: [
        tanstackRouter({
          target: "react",
          autoCodeSplitting: true,
        }),
      ],
    },
  },
});
