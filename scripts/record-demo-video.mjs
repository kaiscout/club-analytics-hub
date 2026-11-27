// Builds a captioned MP4 from screenshots of dist/. Needs an installed Google Chrome for H.264.
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium } from "@playwright/test";

const types = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".html": "text/html",
  ".woff2": "font/woff2",
  ".png": "image/png",
};
const server = createServer(async (request, response) => {
  try {
    const name = new URL(request.url, "http://localhost").pathname;
    response.setHeader("Content-Type", types[path.extname(name)] ?? "text/html");
    response.end(await readFile(path.join("dist", name === "/" ? "index.html" : name)));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
const scenes = [
  ["command", "Club Analytics Hub: a portfolio project by Deniz Izci"],
  ["command", "Fictional club, synthetic data. Not affiliated with any club."],
  ["command", "The year ends $3,800 ahead, but cash goes negative from June", 330],
  ["finance", "Where cash comes from, and where it goes"],
  ["commercial", "Sponsor delivery and the fan acquisition funnel"],
  ["matchday", "Match by match: attendance and contribution"],
  ["scenarios", "Scenario Lab: change an assumption, see the break-even"],
  ["decisions", "Every finding leads to a decision with an owner"],
  ["quality", "Every number is checked: 24 of 24 model checks pass"],
  ["about", "Requirements, KPIs, data model and scenario rules by Deniz"],
  ["command", "Try it: clubanalytics.denizci.dev"],
];
const browser = await chromium.launch({ channel: "chrome" });
const frames = [];
for (const [view, caption, scroll = 0] of scenes) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 640 },
    reducedMotion: "reduce",
  });
  await page.goto(`${url}#${view === "about" ? "command" : view}`, { waitUntil: "networkidle" });
  if (view === "about") await page.locator("#about-button").click();
  await page.evaluate((y) => window.scrollTo(0, y), scroll);
  await page.waitForTimeout(250);
  frames.push({ image: (await page.screenshot()).toString("base64"), caption });
  await page.close();
}
const page = await browser.newPage();
page.setDefaultTimeout(120000);
await page.goto(url);
const encoded = await page.evaluate(async (items) => {
  const type = "video/mp4;codecs=avc1.42E01F";
  if (!MediaRecorder.isTypeSupported(type)) throw new Error("This Chrome cannot record MP4");
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  const images = await Promise.all(
    items.map(async (item) => {
      const image = new Image();
      image.src = `data:image/png;base64,${item.image}`;
      await image.decode();
      return image;
    }),
  );
  const recorder = new MediaRecorder(canvas.captureStream(30), {
    mimeType: type,
    videoBitsPerSecond: 4_000_000,
  });
  const chunks = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);
  const stopped = new Promise((resolve) => (recorder.onstop = resolve));
  recorder.start(1000);
  const seconds = 6;
  const began = performance.now();
  await new Promise((resolve) => {
    const timer = setInterval(() => {
      const elapsed = (performance.now() - began) / 1000;
      const index = Math.min(items.length - 1, Math.floor(elapsed / seconds));
      ctx.fillStyle = "#0c1822";
      ctx.fillRect(0, 0, 1280, 720);
      ctx.drawImage(images[index], 0, 0);
      ctx.fillStyle = "#12394f";
      ctx.fillRect(0, 640, 1280, 80);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 28px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(items[index].caption, 640, 690);
      if (elapsed >= seconds * items.length) {
        clearInterval(timer);
        resolve();
      }
    }, 33);
  });
  recorder.stop();
  await stopped;
  const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
  let text = "";
  for (let i = 0; i < bytes.length; i += 32768)
    text += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(text);
}, frames);
const output = "outputs/linkedin-demo/club-analytics-hub-demo.mp4";
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, Buffer.from(encoded, "base64"));
const video = await page.evaluate(async (data) => {
  const element = document.createElement("video");
  element.src = `data:video/mp4;base64,${data}`;
  await new Promise((resolve, reject) => {
    element.onloadeddata = resolve;
    element.onerror = reject;
  });
  return { width: element.videoWidth, height: element.videoHeight, seconds: element.duration };
}, encoded);
console.log(JSON.stringify({ output, ...video, scenes: scenes.length }));
await browser.close();
server.close();
