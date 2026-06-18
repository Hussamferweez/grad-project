// Doctor journey in a fresh browser (avoids cross-session harness races).
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const SHOTS = path.join(__dirname, "shots");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const consoleErrors = [], pageErrors = [], toasts = {}, steps = [];
let n = 30;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"], defaultViewport: { width: 1366, height: 900 }
  });
  const page = await browser.newPage();
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 200)));

  const shot = async (name) => { const f = path.join(SHOTS, `${++n}-${name}.png`); await page.screenshot({ path: f }); return path.basename(f); };
  const goto = (p) => page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 30000 });
  const waitText = (t, to = 12000) => page.waitForFunction((t) => document.body && document.body.innerText.includes(t), { timeout: to }, t);
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
  async function step(name, fn) {
    try { await fn(); const s = await shot(name); steps.push({ name, ok: true, shot: s }); console.log(`OK   ${name} -> ${s}`); }
    catch (e) { const s = await shot(`FAIL-${name}`).catch(() => null); steps.push({ name, ok: false, error: String(e).slice(0, 160) }); console.log(`FAIL ${name}: ${String(e).slice(0, 140)}`); }
  }

  await step("d-login-dashboard", async () => {
    await goto("/login");
    await setInput("#identifier", "doctor@clinico.com");
    await setInput("#password", "Password1");
    await page.click('form button[type="submit"]');
    await page.waitForFunction(() => location.pathname.startsWith("/doctor"), { timeout: 20000 });
    await waitText("Today at a Glance");
    await sleep(800);
  });
  await step("d-appointments", async () => { await goto("/doctor/appointments"); await waitText("Appointments"); await sleep(800); });

  await step("d-book-dialog", async () => {
    await clickText("Book Appointment");
    await page.waitForSelector('div[role="dialog"]', { timeout: 6000 }); await sleep(300);
    await setInput("#patientId", "2"); await setInput("#dentistId", "1");
    await setInput("#date", new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10));
    await setInput("#time", "15:00");
    await page.click('div[role="dialog"] button[role="combobox"]').catch(() => {});
    await sleep(500); await clickText("Cleaning", '[role="option"]'); await sleep(300);
  });
  await step("d-book-403", async () => {
    await page.click('div[role="dialog"] button[type="submit"]');
    toasts.book = await toastText(); await sleep(400);
  });
  await step("d-reschedule-403", async () => {
    await page.keyboard.press("Escape").catch(() => {}); await sleep(300);
    await goto("/doctor/appointments"); await waitText("Appointments"); await sleep(500);
    await clickText("Reschedule");
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 }); await sleep(300);
    await clickText("Save Changes");
    toasts.reschedule = await toastText(); await sleep(400);
  });
  await step("d-mark-delay", async () => {
    await page.keyboard.press("Escape").catch(() => {}); await sleep(300);
    await goto("/doctor/appointments"); await waitText("Appointments"); await sleep(500);
    await clickText("Delay");
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 }); await sleep(300);
    await setInput("#delayMinutes", "20");
    await setInput("#delayReason", "Doctor running late from prior surgery");
    await clickText("Record Delay");
    toasts.delay = await toastText(); await sleep(500);
  });
  await step("d-schedule", async () => { await goto("/doctor/schedule"); await waitText("Working Hours"); await sleep(700); });
  await step("d-schedule-add", async () => {
    await clickText("Add Schedule");
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 }); await sleep(300);
    await setInput("#date", new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10));
    await clickText("Create Slot");
    toasts.scheduleAdd = await toastText(); await sleep(600);
  });
  await step("d-schedule-toggle-403", async () => {
    await page.keyboard.press("Escape").catch(() => {}); await sleep(300);
    await clickText("Block"); toasts.scheduleToggle = await toastText(); await sleep(400);
  });
  await step("d-settings-add-service", async () => {
    await goto("/doctor/settings"); await waitText("Services"); await sleep(600);
    await setInput("#serviceName", "Dental Implant"); await setInput("#serviceDuration", "90");
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].filter((x) => x.querySelector("svg.lucide-plus") && x.offsetParent !== null); if (b.length) b[b.length - 1].click(); });
    toasts.serviceAdd = await toastText(); await sleep(600);
  });
  await step("d-calendar", async () => { await goto("/doctor/calendar"); await waitText("Calendar"); await sleep(800); });

  fs.writeFileSync(path.join(__dirname, "report-doctor.json"), JSON.stringify({ steps, toasts, consoleErrors, pageErrors }, null, 2));
  console.log("\nTOASTS:", JSON.stringify(toasts, null, 2));
  console.log("CONSOLE ERRORS:", consoleErrors.length, consoleErrors.slice(0, 10));
  console.log("PAGE ERRORS:", pageErrors.length, pageErrors.slice(0, 10));
  await browser.close();
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
