import { afterAll, beforeAll, expect } from "@rstest/core";
import { test } from "@rstest/playwright";
import type { PlaywrightOptions } from "@rstest/playwright";
import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";

const previewHost = "127.0.0.1";
const previewPort = 4173;
const baseUrl = `http://${previewHost}:${previewPort}`;
const chromiumArgs = ["--no-sandbox", "--disable-gpu"];
const visibleWaitOptions = { state: "visible" as const, timeout: 5_000 };
const strictScriptCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

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

e2e(
  "renders the inventory dashboard under strict script CSP",
  async ({ page }) => {
    const productSku = String((Date.now() % 900_000) + 100_000);
    const productName = `CSP test product ${productSku}`;

    await page.addInitScript(() => {
      window.addEventListener("securitypolicyviolation", (event) => {
        const windowWithViolations = window as typeof window & {
          __cspViolations?: string[];
        };

        windowWithViolations.__cspViolations ??= [];
        windowWithViolations.__cspViolations.push(
          `${event.violatedDirective}: ${event.blockedURI}`,
        );
      });
    });
    await page.route(`${baseUrl}/`, async (route) => {
      const response = await route.fetch();

      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "content-security-policy": strictScriptCsp,
        },
      });
    });
    await page.route("https://fonts.googleapis.com/**", async (route) => {
      await route.fulfill({ body: "", contentType: "text/css" });
    });

    await page.goto(baseUrl);

    await page.getByText("Products created").waitFor(visibleWaitOptions);
    await page.getByText("Pending operations").waitFor(visibleWaitOptions);
    await page
      .getByRole("heading", { name: "Products" })
      .waitFor(visibleWaitOptions);
    await page.getByRole("button", { name: "New" }).waitFor(visibleWaitOptions);

    await page.getByRole("button", { name: "New" }).click();
    await page.getByPlaceholder("342143901").fill(productSku);
    await page.getByPlaceholder("Cotton Red T-shirt").fill(productName);
    await page.getByRole("button", { name: "Save" }).click();

    await page.getByText(productName).waitFor(visibleWaitOptions);

    const cspViolations = await page.evaluate(() => {
      const windowWithViolations = window as typeof window & {
        __cspViolations?: string[];
      };

      return windowWithViolations.__cspViolations ?? [];
    });

    expect(cspViolations).toEqual([]);
  },
  15_000,
);

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
