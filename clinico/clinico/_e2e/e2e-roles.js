const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const SHOTS = path.join(__dirname, "shots");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = { receptionist: {}, doctor: {} };

async function newPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  return page;
}
function helpers(page) {
  const goto = (p) => page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 30000 });
  const waitText = (t, to = 15000) => page.waitForFunction((t) => document.body && document.body.innerText.includes(t), { timeout: to }, t);
  async function setInput(sel, value) {
    await page.waitForSelector(sel, { timeout: 8000 });
    await page.evaluate((sel, value) => {
      const el = document.querySelector(sel);
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true }));
    }, sel, value);
  }
  const clickText = (text, sel = "button") => page.evaluate((text, sel) => {
    const els = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null);
    const el = els.reverse().find((e) => (e.textContent || "").trim().toLowerCase().includes(text.toLowerCase()));
    if (el) { el.click(); return true; } return false;
  }, text, sel);
  const toastText = async () => {
    try { await page.waitForSelector("[data-sonner-toast]", { timeout: 6000 });
      return (await page.$eval("[data-sonner-toast]", (e) => e.innerText)).replace(/\s+/g, " ").trim(); }
    catch { return null; }
  };
  const login = async (identifier) => {
    await goto("/login");
    await setInput("#identifier", identifier);
    await setInput("#password", "Password1");
    await page.click('form button[type="submit"]');
    await page.waitForFunction(() => location.pathname.startsWith("/doctor"), { timeout: 20000 });
  };
  const visibleButtonTexts = () => page.evaluate(() =>
    [...document.querySelectorAll("button")].filter((b) => b.offsetParent !== null).map((b) => (b.textContent || "").trim()).filter(Boolean));
  return { goto, waitText, setInput, clickText, toastText, login, visibleButtonTexts };
}

async function main() {
  // ─────────── RECEPTIONIST ───────────
  let browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  let page = await newPage(browser);
  let h = helpers(page);
  await h.login("reception@clinico.com");
  await h.waitText("Today at a Glance");
  await sleep(700);
  await page.screenshot({ path: path.join(SHOTS, "50-reception-dashboard.png") });

  await h.goto("/doctor/appointments");
  await h.waitText("Appointments");
  await sleep(600);
  results.receptionist.hasBookButton = (await h.visibleButtonTexts()).some((t) => t.includes("Book Appointment"));
  await page.screenshot({ path: path.join(SHOTS, "51-reception-appointments.png") });

  // Book an appointment (should succeed for Receptionist)
  await h.clickText("Book Appointment");
  await page.waitForSelector('div[role="dialog"]', { timeout: 6000 }); await sleep(300);
  const bookDate = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10);
  await h.setInput("#patientId", "2");
  await h.setInput("#dentistId", "1");
  await h.setInput("#date", bookDate);
  await h.setInput("#time", "16:00");
  await page.click('div[role="dialog"] button[role="combobox"]').catch(() => {});
  await sleep(400); await h.clickText("Cleaning", '[role="option"]'); await sleep(300);
  await page.click('div[role="dialog"] button[type="submit"]');
  results.receptionist.bookToast = await h.toastText();
  await page.screenshot({ path: path.join(SHOTS, "52-reception-book-result.png") });
  await sleep(400);

  // View the booked date and confirm management controls exist
  await h.setInput("#filterDate", bookDate);
  await sleep(1200);
  results.receptionist.rowButtons = await page.evaluate(() =>
    [...document.querySelectorAll("table button")].filter((b) => b.offsetParent !== null).map((b) => (b.textContent || "").trim()).filter(Boolean));
  await page.screenshot({ path: path.join(SHOTS, "53-reception-booked-row.png") });
  await browser.close();

  // ─────────── DOCTOR ───────────
  browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  page = await newPage(browser);
  h = helpers(page);
  await h.login("doctor@clinico.com");
  await h.waitText("Today at a Glance");
  await sleep(600);

  await h.goto("/doctor/appointments");
  await h.waitText("Appointments");
  await sleep(700);
  results.doctor.hasBookButton = (await h.visibleButtonTexts()).some((t) => t.includes("Book Appointment"));
  results.doctor.rowButtons = await page.evaluate(() =>
    [...document.querySelectorAll("table button")].filter((b) => b.offsetParent !== null).map((b) => (b.textContent || "").trim()).filter(Boolean));
  await page.screenshot({ path: path.join(SHOTS, "54-doctor-appointments-gated.png") });

  await h.goto("/doctor/schedule");
  await h.waitText("Working Hours");
  await sleep(700);
  results.doctor.scheduleAvailabilityCol = await page.evaluate(() => {
    const cells = [...document.querySelectorAll("table tbody tr td:last-child")];
    return cells.map((c) => (c.textContent || "").trim());
  });
  results.doctor.hasAddSchedule = (await h.visibleButtonTexts()).some((t) => t.includes("Add Schedule"));
  await page.screenshot({ path: path.join(SHOTS, "55-doctor-schedule-gated.png") });
  await browser.close();

  fs.writeFileSync(path.join(__dirname, "report-roles.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}
main().catch((e) => { console.error("FATAL", e); process.exit(1); });
