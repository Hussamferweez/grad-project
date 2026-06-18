const puppeteer = require("puppeteer-core");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"], defaultViewport: { width: 1366, height: 900 }
  });
  const page = await browser.newPage();
  page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE.ERR:", m.text().slice(0, 200)); });
  page.on("pageerror", (e) => console.log("PAGEERR:", String(e).slice(0, 200)));
  page.on("response", async (r) => {
    if (r.url().includes("/api/Auth/login")) {
      let body = ""; try { body = await r.text(); } catch {}
      console.log("LOGIN RESP", r.status(), body.slice(0, 200));
    }
  });

  async function setInput(sel, value) {
    await page.waitForSelector(sel, { timeout: 8000 });
    await page.evaluate((sel, value) => {
      const el = document.querySelector(sel);
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, sel, value);
  }

  await page.goto(BASE + "/login", { waitUntil: "networkidle2" });
  console.log("URL after goto /login:", page.url());
  await setInput("#identifier", "doctor@clinico.com");
  await setInput("#password", "Password1");
  await page.click('form button[type="submit"]');
  await sleep(5000);
  console.log("URL after submit:", page.url());
  const cookie = await page.evaluate(() => document.cookie);
  console.log("document.cookie:", cookie.slice(0, 120));
  const toast = await page.$$eval("[data-sonner-toast]", (els) => els.map((e) => e.innerText.replace(/\s+/g, " ")).join(" | ")).catch(() => "");
  console.log("toast:", toast);
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 200).replace(/\s+/g, " "));
  console.log("bodyText:", bodyText);
  await page.screenshot({ path: path.join(__dirname, "shots", "diag-doctor.png") });
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
