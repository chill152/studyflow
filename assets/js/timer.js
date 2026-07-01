/* ===========================================================
   StudyFlow - timer.js  (Pomodoro)
   =========================================================== */

const TIMER_MODES = {
  pomodoro: { label: "Tập trung", seconds: 25 * 60 },
  short: { label: "Nghỉ ngắn", seconds: 5 * 60 },
  long: { label: "Nghỉ dài", seconds: 15 * 60 },
};

let timerState = {
  mode: "pomodoro",
  remaining: TIMER_MODES.pomodoro.seconds,
  total: TIMER_MODES.pomodoro.seconds,
  running: false,
  intervalId: null,
};

const RING_RADIUS = 130;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function getPomodoroStats() {
  return getUserData("pomodoro_stats", { date: todayKey(), sessions: 0, minutes: 0 });
}
function savePomodoroStats(stats) {
  setUserData("pomodoro_stats", stats);
}
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function refreshStatsIfNewDay() {
  const stats = getPomodoroStats();
  if (stats.date !== todayKey()) {
    const reset = { date: todayKey(), sessions: 0, minutes: 0 };
    savePomodoroStats(reset);
    return reset;
  }
  return stats;
}

function renderTimerStats() {
  const stats = refreshStatsIfNewDay();
  document.getElementById("statSessions").textContent = stats.sessions;
  document.getElementById("statMinutes").textContent = stats.minutes;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  document.getElementById("timerTime").textContent = formatTime(timerState.remaining);
  document.getElementById("timerModeLabel").textContent = TIMER_MODES[timerState.mode].label;
  const progress = 1 - timerState.remaining / timerState.total;
  const offset = RING_CIRC * (1 - progress);
  document.getElementById("ringProgress").style.strokeDashoffset = offset;
  document.title = `${formatTime(timerState.remaining)} - StudyFlow`;
}

function setTimerMode(mode) {
  pauseTimer();
  timerState.mode = mode;
  timerState.total = TIMER_MODES[mode].seconds;
  timerState.remaining = TIMER_MODES[mode].seconds;
  document.querySelectorAll(".timer-mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  updateTimerDisplay();
}

function startTimer() {
  if (timerState.running) return;
  timerState.running = true;
  document.getElementById("startBtn").textContent = "⏸️ Tạm dừng";
  timerState.intervalId = setInterval(() => {
    timerState.remaining--;
    updateTimerDisplay();
    if (timerState.remaining <= 0) {
      clearInterval(timerState.intervalId);
      timerState.running = false;
      document.getElementById("startBtn").textContent = "▶️ Bắt đầu";
      onTimerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  timerState.running = false;
  clearInterval(timerState.intervalId);
  const btn = document.getElementById("startBtn");
  if (btn) btn.textContent = "▶️ Bắt đầu";
}

function resetTimer() {
  pauseTimer();
  timerState.remaining = timerState.total;
  updateTimerDisplay();
}

function onTimerComplete() {
  if (timerState.mode === "pomodoro") {
    const stats = refreshStatsIfNewDay();
    stats.sessions += 1;
    stats.minutes += Math.round(timerState.total / 60);
    savePomodoroStats(stats);
    renderTimerStats();
    showToast("🎉 Hoàn thành 1 phiên Pomodoro! Hãy nghỉ ngơi nhé.", "success");
  } else {
    showToast("⏰ Hết giờ nghỉ! Quay lại học thôi.", "default");
  }
  try {
    const audio = new AudioContext();
    const osc = audio.createOscillator();
    osc.connect(audio.destination);
    osc.frequency.value = 880;
    osc.start();
    setTimeout(() => osc.stop(), 300);
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("timerTime")) return;
  renderTimerStats();
  updateTimerDisplay();

  document.getElementById("startBtn").addEventListener("click", () => {
    timerState.running ? pauseTimer() : startTimer();
  });
  document.getElementById("resetBtn").addEventListener("click", resetTimer);
  document.querySelectorAll(".timer-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTimerMode(btn.dataset.mode));
  });
});
