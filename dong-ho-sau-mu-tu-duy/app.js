const HATS = [
  {
    id: "white",
    name: "Mũ Trắng — Thông tin",
    emoji: "⚪",
    cls: "hat-white",
    prompt: "Chúng ta có những dữ kiện, thông tin gì? Cần biết thêm gì?",
  },
  {
    id: "red",
    name: "Mũ Đỏ — Cảm xúc",
    emoji: "🔴",
    cls: "hat-red",
    prompt: "Cảm giác, trực giác của em về vấn đề này là gì? Không cần giải thích.",
  },
  {
    id: "black",
    name: "Mũ Đen — Cẩn trọng",
    emoji: "⚫",
    cls: "hat-black",
    prompt: "Rủi ro, khó khăn, điểm yếu, điều gì có thể sai?",
  },
  {
    id: "yellow",
    name: "Mũ Vàng — Tích cực",
    emoji: "🟡",
    cls: "hat-yellow",
    prompt: "Lợi ích, điểm mạnh, cơ hội, vì sao ý này có thể thành công?",
  },
  {
    id: "green",
    name: "Mũ Xanh Lá — Sáng tạo",
    emoji: "🟢",
    cls: "hat-green",
    prompt: "Có ý tưởng mới, cách làm khác, giải pháp thay thế nào không?",
  },
  {
    id: "blue",
    name: "Mũ Xanh Dương — Điều phối",
    emoji: "🔵",
    cls: "hat-blue",
    prompt: "Tổng kết lại: chúng ta đã học được gì? Bước tiếp theo là gì?",
  },
];

const STORAGE_KEY = "sau-mu-tu-duy-session";

let state = loadState();
let activeHatId = null;
let timer = { remaining: 0, total: 0, running: false, intervalId: null };
let audioCtx = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const initial = {};
  HATS.forEach((h) => (initial[h.id] = { notes: "", minutes: 3, secondsSpent: 0 }));
  return initial;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function fmt(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderHats() {
  const container = document.getElementById("hats");
  container.innerHTML = "";
  HATS.forEach((hat) => {
    const btn = document.createElement("button");
    btn.className = `hat-card ${hat.cls}` + (hat.id === activeHatId ? " active" : "");
    const spent = state[hat.id]?.secondsSpent || 0;
    btn.innerHTML = `
      <span class="emoji">${hat.emoji}</span>
      <span>${hat.name}</span>
      <span class="time-badge">${spent > 0 ? "⏱ " + fmt(spent) : ""}</span>
    `;
    btn.addEventListener("click", () => selectHat(hat.id));
    container.appendChild(btn);
  });
}

function selectHat(hatId) {
  if (activeHatId && activeHatId !== hatId) {
    stopTimer(false);
  }
  activeHatId = hatId;
  const hat = HATS.find((h) => h.id === hatId);
  const data = state[hatId];

  document.getElementById("panelEmpty").hidden = true;
  document.getElementById("panelActive").hidden = false;
  document.getElementById("hatTitle").textContent = `${hat.emoji} ${hat.name}`;
  document.getElementById("hatPrompt").textContent = hat.prompt;
  document.getElementById("notesInput").value = data.notes || "";
  document.getElementById("minutesInput").value = data.minutes || 3;

  timer.total = (data.minutes || 3) * 60;
  timer.remaining = timer.total;
  timer.running = false;
  updateTimerDisplay();
  setTimerButtons(false);

  renderHats();
}

function updateTimerDisplay() {
  const el = document.getElementById("timerDisplay");
  el.textContent = fmt(timer.remaining);
  el.classList.toggle("warning", timer.remaining <= 10 && timer.remaining > 0);
}

function setTimerButtons(running) {
  document.getElementById("startBtn").disabled = running;
  document.getElementById("pauseBtn").disabled = !running;
}

function playChime() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0001, now + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.3, now + i * 0.25 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.25 + 0.4);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 0.45);
    });
  } catch (e) {}
}

function startTimer() {
  if (!activeHatId) return;
  timer.running = true;
  setTimerButtons(true);
  timer.intervalId = setInterval(() => {
    timer.remaining -= 1;
    if (state[activeHatId]) {
      state[activeHatId].secondsSpent = (state[activeHatId].secondsSpent || 0) + 1;
      saveState();
      renderHats();
      document.querySelectorAll(".hat-card").forEach((c) => {
        if (c.classList.contains(HATS.find((h) => h.id === activeHatId).cls)) c.classList.add("active");
      });
    }
    updateTimerDisplay();
    if (timer.remaining <= 0) {
      clearInterval(timer.intervalId);
      timer.running = false;
      setTimerButtons(false);
      playChime();
    }
  }, 1000);
}

function stopTimer(resetDisplay) {
  clearInterval(timer.intervalId);
  timer.running = false;
  setTimerButtons(false);
  if (resetDisplay) updateTimerDisplay();
}

document.getElementById("startBtn").addEventListener("click", startTimer);

document.getElementById("pauseBtn").addEventListener("click", () => stopTimer(false));

document.getElementById("resetBtn").addEventListener("click", () => {
  stopTimer(false);
  const minutes = parseInt(document.getElementById("minutesInput").value, 10) || 3;
  timer.total = minutes * 60;
  timer.remaining = timer.total;
  updateTimerDisplay();
});

document.getElementById("minutesInput").addEventListener("change", (e) => {
  if (!activeHatId) return;
  let minutes = parseInt(e.target.value, 10) || 3;
  minutes = Math.min(30, Math.max(1, minutes));
  e.target.value = minutes;
  state[activeHatId].minutes = minutes;
  saveState();
  if (!timer.running) {
    timer.total = minutes * 60;
    timer.remaining = timer.total;
    updateTimerDisplay();
  }
});

document.getElementById("notesInput").addEventListener("input", (e) => {
  if (!activeHatId) return;
  state[activeHatId].notes = e.target.value;
  saveState();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN");
  let text = `TÓM TẮT BUỔI THẢO LUẬN — SÁU MŨ TƯ DUY\nNgày: ${dateStr}\n\n`;
  HATS.forEach((hat) => {
    const data = state[hat.id];
    text += `${hat.emoji} ${hat.name}\n`;
    text += `Thời gian: ${fmt(data.secondsSpent || 0)}\n`;
    text += `Ghi chú:\n${data.notes && data.notes.trim() ? data.notes.trim() : "(chưa có ghi chú)"}\n\n`;
  });
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tom-tat-sau-mu-tu-duy-${now.toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (!confirm("Xóa toàn bộ ghi chú và thời gian của phiên hiện tại?")) return;
  stopTimer(false);
  HATS.forEach((h) => (state[h.id] = { notes: "", minutes: 3, secondsSpent: 0 }));
  saveState();
  activeHatId = null;
  document.getElementById("panelEmpty").hidden = false;
  document.getElementById("panelActive").hidden = true;
  renderHats();
});

renderHats();
