import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginTailwindcss } from "@rsbuild/plugin-tailwindcss";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

export default defineConfig({
  html: {},
  plugins: [pluginReact(), pluginTailwindcss()],
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
