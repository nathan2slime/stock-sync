import { defineConfig } from "@rstest/core";
import { withRspackConfig } from "@rstest/adapter-rspack";

export default defineConfig({
  extends: withRspackConfig({
    cwd: import.meta.dirname,
    configPath: "./rspack.config.js",
    nodeEnv: "production",
    modifyRspackConfig: (config) => ({
      ...config,
      plugins: [],
    }),
  }),
  output: {
    module: false,
  },
  include: ["src/**/*.test.ts"],
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,
});
