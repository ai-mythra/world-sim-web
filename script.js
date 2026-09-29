// ═══════════════════════════════════════
// WORLD SIMULATION — Frontend
// ═══════════════════════════════════════

const API_URL = "https://world-sim.mrrobotkoni.workers.dev";
const PLAYER_ID = "web_" + (localStorage.getItem("playerId") || Math.random().toString(36).slice(2, 10));
localStorage.setItem("playerId", PLAYER_ID);

let isBusy = false;

// ═══ شروع ═══
async function startGame() {
  if (isBusy) return;
  isBusy = true;
  setStatus("در حال ساخت بازی...");
  showLoading();

  try {
    const res = await fetch(`${API_URL}/api/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: PLAYER_ID })
    });
    const data = await res.json();
    handleResponse(data);
  } catch (err) {
    showError("خطا در اتصال به سرور: " + err.message);
  } finally {
    isBusy = false;
    setStatus("");
  }
}

// ═══ ریست ═══
async function resetGame() {
  if (!confirm("مطمئنی می‌خوای بازی رو ریست کنی؟")) return;
  if (isBusy) return;
  isBusy = true;
  setStatus("در حال ریست...");

  try {
    const res = await fetch(`${API_URL}/api/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: PLAYER_ID })
    });
    const data = await res.json();
    handleResponse(data);
  } catch (err) {
    showError("خطا: " + err.message);
  } finally {
    isBusy = false;
    setStatus("");
  }
}

// ═══ ارسال اقدام ═══
async function sendAction(action) {
  if (isBusy) return;
  isBusy = true;
  setStatus("در حال پردازش...");
  showLoading();

  try {
    const res = await fetch(`${API_URL}/api/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, playerId: PLAYER_ID })
    });
    const data = await res.json();
    handleResponse(data);
  } catch (err) {
    showError("خطا: " + err.message);
  } finally {
    isBusy = false;
    setStatus("");
  }
}

// ═══ مدیریت پاسخ ═══
function handleResponse(data) {
  if (data.error) {
    showError(data.error);
    return;
  }

  renderNarration(data.narration || "...");
  renderSuggestions(data.suggestions || []);
  renderState(data.state || "");
}

// ═══ نمایش‌ها ═══
function renderNarration(text) {
  const el = document.getElementById("narration");
  // تبدیل **bold** به <strong>
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
  el.innerHTML = html;
  el.parentElement.scrollTop = 0;
}

function renderSuggestions(suggestions) {
  const panel = document.getElementById("suggestions");
  panel.innerHTML = "";

  if (!suggestions || suggestions.length === 0) return;

  suggestions.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = `${i + 1}. ${s}`;
    div.onclick = () => sendAction(s);
    panel.appendChild(div);
  });
}

function renderState(state) {
  document.getElementById("state-panel").textContent = state || "";
}

function showLoading() {
  document.getElementById("narration").innerHTML =
    '<span style="color:#666">⏳ در حال پردازش...</span>';
}

function showError(msg) {
  document.getElementById("narration").innerHTML =
    `<span style="color:#c04040">⚠️ ${msg}</span>`;
}

function setStatus(text) {
  document.getElementById("status-bar").textContent = text;
}

// ═══ رویدادها ═══
document.getElementById("send-btn").onclick = () => {
  const input = document.getElementById("custom-action");
  const val = input.value.trim();
  if (val) {
    sendAction(val);
    input.value = "";
  }
};

document.getElementById("custom-action").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("send-btn").click();
  }
});

document.getElementById("new-game-btn").onclick = startGame;
document.getElementById("reset-btn").onclick = resetGame;

// ═══ شروع خودکار ═══
window.addEventListener("load", () => {
  setStatus("آماده. برای شروع «شروع بازی جدید» را بزن.");
  renderNarration(
    "به **WORLD SIMULATION** خوش آمدی.\n\n" +
    "برای شروع، روی «شروع بازی جدید» کلیک کن.\n" +
    "اگر قبلاً بازی کرده‌ای، فقط یک اقدام بنویس تا ادامه پیدا کنه."
  );
});
