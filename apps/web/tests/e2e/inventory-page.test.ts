import { afterAll, beforeAll } from "@rstest/core";
import { expect, test } from "@rstest/playwright";
import type { PlaywrightOptions } from "@rstest/playwright";
import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";

const previewHost = "127.0.0.1";
const previewPort = 4173;
const baseUrl = `http://${previewHost}:${previewPort}`;
const chromiumArgs = ["--no-sandbox", "--disable-gpu"];

let previewServer: ChildProcess | null = null;
let previewServerOutput = "";
let previewServerExitCode: number | null = null;

const e2e = test.extend({
  playwright: {
    browserName: "chromium",
    launchOptions: {
      headless: true,
      args: chromiumArgs,
    },
  } satisfies PlaywrightOptions,
});

beforeAll(async () => {
  previewServer = spawn(
    "pnpm",
    [
      "exec",
      "rsbuild",
      "preview",
      "--host",
      previewHost,
      "--port",
      String(previewPort),
    ],
    {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  previewServer.stdout?.on("data", appendPreviewServerOutput);
  previewServer.stderr?.on("data", appendPreviewServerOutput);
  previewServer.on("exit", (code) => {
    previewServerExitCode = code;
  });

  await waitForPreviewServer();
});

afterAll(() => {
  previewServer?.kill();
  previewServer = null;
});

e2e("renders the inventory dashboard", async ({ page }) => {
  await page.goto(baseUrl);

  await expect(page.getByText("Products created")).toBeVisible();
  await expect(page.getByText("Pending operations")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New" })).toBeVisible();
});

const appendPreviewServerOutput = (chunk: Buffer) => {
  previewServerOutput += chunk.toString();
};

const sleep = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const waitForPreviewServer = async () => {
  const deadline = Date.now() + 30_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    if (previewServerExitCode !== null) {
      throw new Error(
        `Rsbuild preview exited early with code ${previewServerExitCode}.\n${previewServerOutput}`,
      );
    }

    try {
      const response = await fetch(baseUrl);

      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(250);
  }

  throw new Error(
    `Timed out waiting for ${baseUrl}. Last error: ${String(lastError)}\n${previewServerOutput}`,
  );
};
