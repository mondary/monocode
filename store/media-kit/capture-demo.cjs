const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "frames");
const N = 72;
const VW = 1200, VH = 675, DSF = 2;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    defaultViewport: { width: VW, height: VH, deviceScaleFactor: DSF },
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:4173/store/media-kit/dynamic-demo.html");
  await new Promise(r => setTimeout(r, 600));
  for (let i = 0; i < N; i++) {
    await page.evaluate(n => window.__seek(n), i);
    await new Promise(r => setTimeout(r, 60));
    await page.screenshot({ path: path.join(OUT, `f${String(i).padStart(3, "0")}.png`) });
  }
  await browser.close();
  console.log(`captured ${N} frames in ${OUT}`);
})();
