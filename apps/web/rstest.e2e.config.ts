import { defineConfig } from "@rstest/core";

export default defineConfig({
  include: ["tests/e2e/**/*.test.ts"],
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,
});
