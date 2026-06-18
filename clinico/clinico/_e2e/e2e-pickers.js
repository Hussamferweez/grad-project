const puppeteer = require("puppeteer-core");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = {};

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage"], defaultViewport: { width: 1366, height: 900 } });
  const page = await browser.newPage();
  const goto = (p) => page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 30000 });
  const waitText = (t, to = 15000) => page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: to }, t);
  async function setInput(sel, value) {
    await page.waitForSelector(sel, { timeout: 8000 });
    await page.evaluate((sel, value) => { const el = document.querySelector(sel);
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); }, sel, value);
  }
  const clickText = (text, sel = "button") => page.evaluate((text, sel) => {
    const els = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null);
    const el = els.reverse().find((e) => (e.textContent || "").trim().toLowerCase().includes(text.toLowerCase()));
    if (el) { el.click(); return true; } return false;
  }, text, sel);
  async function selectRadix(index, optionText) {
    const combos = await page.$$('div[role="dialog"] button[role="combobox"]');
    await combos[index].click();
    await sleep(450);
    await page.evaluate((text) => {
      const o = [...document.querySelectorAll('[role="option"]')].find((e) => (e.textContent || "").toLowerCase().includes(text.toLowerCase()));
      if (o) o.click();
    }, optionText);
    await sleep(350);
  }

  // Receptionist login
  await goto("/login");
  await setInput("#identifier", "reception@clinico.com");
  await setInput("#password", "Password1");
  await page.click('form button[type="submit"]');
  await page.waitForFunction(() => location.pathname.startsWith("/doctor"), { timeout: 20000 });
  await goto("/doctor/appointments");
  await waitText("Appointments");
  await sleep(500);

  await clickText("Book Appointment");
  await page.waitForSelector('div[role="dialog"]', { timeout: 6000 });
  await sleep(500);
  const dlgText = await page.$eval('div[role="dialog"]', (e) => e.innerText);
  out.hasPatientPicker = dlgText.includes("Select a patient");
  out.hasDentistPicker = dlgText.includes("Select a dentist");
  out.comboCount = (await page.$$('div[role="dialog"] button[role="combobox"]')).length;
  await page.screenshot({ path: path.join(__dirname, "shots", "60-pickers-empty.png") });

  await selectRadix(0, "Mona Ali");
  await selectRadix(1, "John Smith");
  await selectRadix(2, "Cleaning");
  await setInput("#date", new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10));
  await setInput("#time", "17:00");
  await page.screenshot({ path: path.join(__dirname, "shots", "61-pickers-filled.png") });

  await page.click('div[role="dialog"] button[type="submit"]');
  try { await page.waitForSelector("[data-sonner-toast]", { timeout: 6000 });
    out.bookToast = (await page.$eval("[data-sonner-toast]", (e) => e.innerText)).replace(/\s+/g, " ").trim(); }
  catch { out.bookToast = null; }
  await page.screenshot({ path: path.join(__dirname, "shots", "62-pickers-booked.png") });

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
