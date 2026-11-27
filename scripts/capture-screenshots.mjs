import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
const s = http
  .createServer((q, r) => {
    try {
      const p = new URL(q.url, "http://x").pathname;
      const f = "dist" + (p == "/" ? "/index.html" : p);
      r.setHeader(
        "content-type",
        { ".css": "text/css", ".js": "text/javascript", ".html": "text/html" }[path.extname(f)] ??
          "application/octet-stream",
      );
      r.end(fs.readFileSync(f));
    } catch {
      r.writeHead(404).end();
    }
  })
  .listen(8124);
const b = await chromium.launch();
let p = await b.newPage({
  viewport: { width: 1500, height: 784 },
  deviceScaleFactor: 0.8,
  reducedMotion: "reduce",
});
await p.goto("http://127.0.0.1:8124/", { waitUntil: "networkidle" });
await p.screenshot({ path: "site/share.png" });
const shot = async (n, w, h, hash = "", theme = "dark") => {
  const q = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
  await q.addInitScript((t) => localStorage.setItem("larkmoor-theme-v2", t), theme);
  await q.goto("http://127.0.0.1:8124/" + hash, { waitUntil: "networkidle" });
  await q.screenshot({ path: `public/screenshots/${n}.png` });
  await q.close();
};
fs.mkdirSync("public/screenshots", { recursive: true });
await shot("command-center", 1440, 900);
await shot("command-center-mobile", 390, 844);
await shot("scenario-lab", 1440, 900, "#scenarios");
await shot("finance-light", 1440, 900, "#finance", "light");
await b.close();
s.close();
