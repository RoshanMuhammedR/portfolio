/* global process, console */
// Capture screenshots of live sites or local pages with the installed Chrome.
//
//   node scripts/screenshot.mjs jobs.json
//
// jobs.json: [{ "url": "...", "out": "public/work/x.png", "width": 1440,
//               "height": 900, "wait": 2500, "scroll": 0 }]
//
// playwright-core ships no browser of its own, so this drives the Chrome that is
// already on the machine rather than downloading ~150MB of Chromium.
import { chromium } from "playwright-core";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";

const jobs = JSON.parse(readFileSync(process.argv[2], "utf8"));
const browser = await chromium.launch({ executablePath: CHROME, headless: true });

for (const job of jobs) {
  const width = job.width ?? 1440;
  const height = job.height ?? 900;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: job.scale ?? 1,
    colorScheme: job.colorScheme ?? "light",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const started = Date.now();
  try {
    await page.goto(job.url, { waitUntil: "networkidle", timeout: job.timeout ?? 45000 });
  } catch (e) {
    // Sites that hold a socket open never go idle; what has painted is still worth having.
    console.warn(`  ! ${job.url}: ${e.message.split("\n")[0]}`);
  }
  if (job.scroll) await page.mouse.wheel(0, job.scroll);
  await page.waitForTimeout(job.wait ?? 2500);
  mkdirSync(dirname(job.out), { recursive: true });
  await page.screenshot({ path: job.out, type: job.out.endsWith(".jpg") ? "jpeg" : "png" });
  console.log(`  ✓ ${job.out}  (${Math.round((Date.now() - started) / 1000)}s)  ${job.url}`);
  await context.close();
}

await browser.close();
