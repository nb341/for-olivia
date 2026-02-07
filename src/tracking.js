import emailjs from "@emailjs/browser";

// ─── EmailJS configuration ───────────────────────────────────────────────────
// Sign up free at https://www.emailjs.com then fill in these three values.
// 1. Create an account → "Email Services" → add Gmail/Outlook → copy Service ID.
// 2. "Email Templates" → new template with variables:
//      {{visit_count}}, {{total_time}}, {{current_session}}, {{last_visit}}
//    Copy the Template ID
// 3. "Account" → copy Public Key.
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const RECIPIENT_EMAIL = "narindrab4@gmail.com";

// ─── localStorage keys ───────────────────────────────────────────────────────
const KEYS = {
  visitCount: "livvy-visit-count",
  totalTime: "livvy-total-time-ms",
  sessionStart: "livvy-session-start",
  lastEmailSent: "livvy-last-email-ts",
};

const EMAIL_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours

// ─── helpers ─────────────────────────────────────────────────────────────────
function getNum(key, fallback = 0) {
  const v = localStorage.getItem(key);
  return v !== null ? Number(v) : fallback;
}

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

// ─── record visit ────────────────────────────────────────────────────────────
export function recordVisit() {
  const count = getNum(KEYS.visitCount, 0) + 1;
  localStorage.setItem(KEYS.visitCount, count);
  localStorage.setItem(KEYS.sessionStart, Date.now());
}

// ─── get elapsed time for current session ────────────────────────────────────
function currentSessionMs() {
  const start = getNum(KEYS.sessionStart, Date.now());
  return Date.now() - start;
}

// ─── flush session time into total (call on unload / visibility-hidden) ──────
export function flushSessionTime() {
  const elapsed = currentSessionMs();
  const total = getNum(KEYS.totalTime, 0) + elapsed;
  localStorage.setItem(KEYS.totalTime, total);
  // reset session start so we don't double-count
  localStorage.setItem(KEYS.sessionStart, Date.now());
}

// ─── send email ──────────────────────────────────────────────────────────────
function sendTrackingEmail() {
  if (
    EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
    EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID" ||
    EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY"
  ) {
    console.info(
      "[tracking] EmailJS not configured — skipping email. See src/tracking.js for setup instructions."
    );
    return;
  }

  const params = {
    to_email: RECIPIENT_EMAIL,
    visit_count: getNum(KEYS.visitCount, 0),
    total_time: formatMs(getNum(KEYS.totalTime, 0) + currentSessionMs()),
    current_session: formatMs(currentSessionMs()),
    last_visit: new Date().toLocaleString(),
  };

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY)
    .then(() => {
      console.info("[tracking] Email sent", params);
      localStorage.setItem(KEYS.lastEmailSent, Date.now());
    })
    .catch((err) => console.error("[tracking] Email failed", err));
}

// ─── maybe send (respects 3-hour cooldown) ───────────────────────────────────
function maybeSendEmail() {
  const last = getNum(KEYS.lastEmailSent, 0);
  if (Date.now() - last >= EMAIL_INTERVAL_MS) {
    sendTrackingEmail();
  }
}

// ─── public: start tracking (call once on mount) ────────────────────────────
let intervalId = null;

export function startTracking() {
  recordVisit();
  maybeSendEmail();

  // check every 60 s whether 3 h have elapsed
  intervalId = setInterval(maybeSendEmail, 60_000);

  // flush time when user hides or leaves the page
  const handleVisibility = () => {
    if (document.visibilityState === "hidden") flushSessionTime();
  };
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("beforeunload", flushSessionTime);

  // cleanup function
  return () => {
    clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("beforeunload", flushSessionTime);
    flushSessionTime();
  };
}
