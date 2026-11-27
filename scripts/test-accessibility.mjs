// WCAG 2.2 A/AA automated checks for the static demo, plus keyboard and layout behavior.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { chromium } from "@playwright/test";

const { AxeBuilder } = createRequire(import.meta.url)("@axe-core/playwright");
const directory = path.resolve("dist");
const types = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".html": "text/html",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
const csp = (await readFile(path.join(directory, "_headers"), "utf8"))
  .match(/Content-Security-Policy: (.*)/)[1]
  .replace("; upgrade-insecure-requests", "");
const server = createServer(async (request, response) => {
  try {
    const name = new URL(request.url, "http://127.0.0.1").pathname;
    const file = path.resolve(directory, name === "/" ? "index.html" : name.slice(1));
    assert.ok(file.startsWith(directory + path.sep));
    const bytes = await readFile(file);
    response.setHeader("Content-Security-Policy", csp);
    response.setHeader("Content-Type", types[path.extname(file)] ?? "application/octet-stream");
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
const views =
  "command finance commercial matchday programs scenarios decisions quality access".split(" ");
const out = path.resolve("test-results/accessibility");
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const problems = [];
const errors = [];
let scans = 0;
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [320, 720],
  ]) {
    for (const theme of ["dark", "light"]) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      await page.addInitScript((value) => localStorage.setItem("larkmoor-theme-v2", value), theme);
      const scan = async (label) => {
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        scans++;
        for (const violation of result.violations)
          problems.push(
            `${label}: ${violation.id} (${violation.nodes.length}) ${violation.nodes
              .slice(0, 4)
              .map((node) => `${node.target} ${node.any[0]?.message ?? ""}`)
              .join(" | ")}`,
          );
      };
      for (const view of views) {
        await page.goto(`${url}#${view}`);
        await page.reload({ waitUntil: "networkidle" });
        const label = `${view}/${width}/${theme}`;
        await page.screenshot({ path: path.join(out, label.replaceAll("/", "-") + ".png") });
        if (
          await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
          )
        )
          problems.push(`${label}: horizontal overflow`);
        await page
          .locator("details")
          .evaluateAll((items) => items.forEach((item) => (item.open = true)));
        await scan(label);
      }
      await page.goto(`${url}#command`);
      await page.locator("#about-button").click();
      await page.screenshot({ path: path.join(out, `about-${width}-${theme}.png`) });
      await scan(`about/${width}/${theme}`);
      assert.ok(await page.locator("#drawer-body a").count());
      await page.keyboard.press("Escape");
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "about-button",
        "focus returns after closing a panel",
      );
      await context.close();
    }
  }
  const page = await browser.newPage();
  await page.goto(`${url}#commercial`);
  await page.locator("#sponsor-table-body tr").first().focus();
  await page.keyboard.press("Enter");
  await page.locator("#detail-drawer.open").waitFor();
  assert.ok(await page.locator("#app-shell").evaluate((shell) => shell.inert));
  for (let index = 0; index < 12; index++) await page.keyboard.press("Tab");
  assert.ok(
    await page.evaluate(
      () =>
        document.activeElement === document.body ||
        Boolean(document.activeElement.closest("#detail-drawer")),
    ),
    "focus stays in the open panel",
  );
} finally {
  await browser.close();
  server.close();
}
await writeFile(path.join(out, "problems.txt"), [...problems, ...errors].join("\n"));
assert.deepEqual(errors, []);
assert.deepEqual(problems, []);
console.log(JSON.stringify({ status: "PASS", scans, consoleErrors: 0 }));
