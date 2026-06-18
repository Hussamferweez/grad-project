// Drives the REAL installed Chrome through the app against the mock API.
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const steps = [];
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
let shotN = 0;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1366,900"],
    defaultViewport: { width: 1366, height: 900 }
  });
  const page = await browser.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push({ url: page.url(), text: m.text().slice(0, 300) });
  });
  page.on("pageerror", (e) => pageErrors.push({ url: page.url(), text: String(e).slice(0, 300) }));
  page.on("requestfailed", (r) =>
    failedRequests.push({ url: r.url(), method: r.method(), err: r.failure() && r.failure().errorText })
  );

  // ── helpers ──
  const shot = async (name) => {
    const file = path.join(SHOTS, `${String(++shotN).padStart(2, "0")}-${name}.png`);
    await page.screenshot({ path: file });
    return path.basename(file);
  };
  async function step(name, fn) {
    try {
      await fn();
      const s = await shot(name);
      steps.push({ name, ok: true, shot: s });
      console.log(`OK   ${name} -> ${s}`);
    } catch (e) {
      const s = await shot(`FAIL-${name}`).catch(() => null);
      steps.push({ name, ok: false, error: String(e).slice(0, 200), shot: s });
      console.log(`FAIL ${name}: ${String(e).slice(0, 150)}`);
    }
  }
  const goto = (p) => page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 30000 });
  const waitText = (t, timeout = 10000) =>
    page.waitForFunction((t) => document.body && document.body.innerText.includes(t), { timeout }, t);
  async function setInput(sel, value) {
    await page.waitForSelector(sel, { timeout: 8000 });
    await page.evaluate(
      (sel, value) => {
        const el = document.querySelector(sel);
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      },
      sel,
      value
    );
  }
  async function clickText(text, sel = "button") {
    return page.evaluate(
      (text, sel) => {
        const els = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null);
        const el = els.reverse().find((e) => (e.textContent || "").trim().toLowerCase().includes(text.toLowerCase()));
        if (el) {
          el.click();
          return true;
        }
        return false;
      },
      text,
      sel
    );
  }
  const toastText = async () => {
    try {
      await page.waitForSelector("[data-sonner-toast]", { timeout: 6000 });
      return (await page.$eval("[data-sonner-toast]", (e) => e.innerText)).replace(/\s+/g, " ").trim();
    } catch {
      return null;
    }
  };
  const logout = async () => {
    await page.evaluate(() => (document.cookie = "clinco_session=; path=/; max-age=0; samesite=lax"));
  };
  const toasts = {};

  // ═══════════════ PUBLIC ═══════════════
  await step("landing", async () => {
    await goto("/");
    await waitText("Dental Practice");
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  // ═══════════════ REGISTER (patient) ═══════════════
  await step("register-form", async () => {
    await goto("/register");
    await waitText("Create your account");
    await setInput("#firstName", "New");
    await setInput("#lastName", "Patient");
    await setInput("#username", "newpatient1");
    await setInput("#email", "new.patient@example.com");
    await setInput("#phoneNumber", "+201112223334");
    await setInput("#dateOfBirth", "1992-07-01");
    await setInput("#address", "10 Tahrir Sq");
    await setInput("#password", "Password1");
  });
  await step("register-submitted-dashboard", async () => {
    await page.click('form button[type="submit"]');
    await page.waitForFunction(() => location.pathname.startsWith("/patient"), { timeout: 15000 });
    await waitText("Patient Overview");
    await sleep(500);
  });
  await logout();

  // ═══════════════ PATIENT LOGIN + FLOWS ═══════════════
  await step("login-form", async () => {
    await goto("/login");
    await waitText("Sign In");
    await setInput("#identifier", "patient@clinico.com");
    await setInput("#password", "Password1");
  });
  await step("patient-dashboard", async () => {
    await page.click('form button[type="submit"]');
    await page.waitForFunction(() => location.pathname.startsWith("/patient"), { timeout: 15000 });
    await waitText("Patient Overview");
    await sleep(600);
  });
  await step("patient-appointments", async () => {
    await goto("/patient/appointments");
    await waitText("Appointment List");
    await sleep(600);
  });
  await step("patient-cancel-appointment", async () => {
    const clicked = await clickText("Cancel", "button");
    if (!clicked) throw new Error("no Cancel button");
    toasts.patientCancel = await toastText();
    await sleep(400);
  });
  await step("patient-medical-records", async () => {
    await goto("/patient/medical-records");
    await waitText("Medical Notes");
    await sleep(400);
  });
  await step("patient-profile", async () => {
    await goto("/patient/profile");
    await waitText("Profile");
    await sleep(500);
    await setInput("#phoneNumber", "+201119998877");
    await clickText("Save Changes", "button");
    toasts.patientProfile = await toastText();
  });
  await logout();

  // ═══════════════ DOCTOR LOGIN + FLOWS ═══════════════
  await step("doctor-login", async () => {
    await goto("/login");
    await waitText("Sign In");
    await sleep(400);
    await setInput("#identifier", "doctor@clinico.com");
    await setInput("#password", "Password1");
    await sleep(200);
    await page.click('form button[type="submit"]');
    await page.waitForFunction(() => location.pathname.startsWith("/doctor"), { timeout: 20000 });
    await waitText("Today at a Glance");
    await sleep(800);
  });
  await step("doctor-appointments", async () => {
    await goto("/doctor/appointments");
    await waitText("Appointments");
    await sleep(700);
  });
  await step("doctor-book-dialog", async () => {
    await clickText("Book Appointment", "button");
    await page.waitForSelector('div[role="dialog"]', { timeout: 6000 });
    await sleep(300);
    await setInput("#patientId", "2");
    await setInput("#dentistId", "1");
    await setInput("#date", new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10));
    await setInput("#time", "15:00");
    // radix service select
    await page.click('div[role="dialog"] button[role="combobox"]').catch(() => {});
    await sleep(400);
    await clickText("Cleaning", '[role="option"]');
    await sleep(300);
  });
  await step("doctor-book-submit-403", async () => {
    await page.click('div[role="dialog"] button[type="submit"]');
    toasts.doctorBook = await toastText();
    await sleep(400);
  });
  await step("doctor-confirm-403", async () => {
    await page.keyboard.press("Escape").catch(() => {});
    await sleep(300);
    await goto("/doctor/appointments");
    await waitText("Appointments");
    await sleep(500);
    // open row actions dropdown (the MoreHorizontal icon button is the last ghost icon button in the row)
    const opened = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("table button")].filter((b) => b.offsetParent !== null);
      const menu = btns.find((b) => b.querySelector("svg.lucide-ellipsis, svg.lucide-more-horizontal"));
      if (menu) { menu.click(); return true; }
      return false;
    });
    if (opened) {
      await sleep(400);
      await clickText("Confirm", '[role="menuitem"]');
      toasts.doctorConfirm = await toastText();
    }
    await sleep(300);
  });
  await step("doctor-mark-delay", async () => {
    await goto("/doctor/appointments");
    await waitText("Appointments");
    await sleep(500);
    const clicked = await clickText("Delay", "button");
    if (clicked) {
      await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
      await setInput("#delayMinutes", "20");
      await setInput("#delayReason", "Doctor running late from prior surgery");
      await clickText("Record Delay", "button");
      toasts.doctorDelay = await toastText();
    }
    await sleep(400);
  });
  await step("doctor-schedule", async () => {
    await goto("/doctor/schedule");
    await waitText("Working Hours");
    await sleep(600);
  });
  await step("doctor-schedule-add", async () => {
    await clickText("Add Schedule", "button");
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
    await setInput("#date", new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10));
    await clickText("Create Slot", "button");
    toasts.scheduleAdd = await toastText();
    await sleep(500);
  });
  await step("doctor-schedule-toggle-403", async () => {
    await page.keyboard.press("Escape").catch(() => {});
    await sleep(300);
    const clicked = await clickText("Block", "button");
    if (clicked) toasts.scheduleToggle = await toastText();
    await sleep(400);
  });
  await step("doctor-settings", async () => {
    await goto("/doctor/settings");
    await waitText("Services");
    await sleep(600);
    await setInput("#serviceName", "Dental Implant");
    await setInput("#serviceDuration", "90");
    // click the "+" add-service button
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")].filter((b) => b.querySelector("svg.lucide-plus") && b.offsetParent !== null);
      if (btns.length) btns[btns.length - 1].click();
    });
    toasts.serviceAdd = await toastText();
    await sleep(500);
  });
  await step("doctor-calendar", async () => {
    await goto("/doctor/calendar");
    await waitText("Calendar");
    await sleep(700);
  });

  // dark mode sample
  await step("landing-dark", async () => {
    await goto("/");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await sleep(400);
  });

  const report = { steps, toasts, consoleErrors, pageErrors, failedRequests };
  fs.writeFileSync(path.join(__dirname, "report.json"), JSON.stringify(report, null, 2));
  console.log("\n===== TOASTS =====");
  console.log(JSON.stringify(toasts, null, 2));
  console.log("\n===== CONSOLE ERRORS:", consoleErrors.length, "=====");
  consoleErrors.slice(0, 20).forEach((e) => console.log("-", e.text));
  console.log("\n===== PAGE ERRORS:", pageErrors.length, "=====");
  pageErrors.slice(0, 20).forEach((e) => console.log("-", e.text));
  console.log("\n===== FAILED REQUESTS:", failedRequests.length, "=====");
  failedRequests.slice(0, 20).forEach((e) => console.log("-", e.method, e.url, e.err));

  await browser.close();
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
