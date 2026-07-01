/* ===========================================================
   StudyFlow - statistics.js  (Chart.js)
   =========================================================== */

function getChartColors() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    text: dark ? "#9ca3af" : "#6b7280",
    grid: dark ? "#262a36" : "#e5e7eb",
  };
}

function buildTaskStatusChart() {
  const ctx = document.getElementById("taskStatusChart");
  if (!ctx) return;
  const tasks = getUserData("tasks", []);
  const done = tasks.filter((t) => t.done).length;
  const pending = tasks.length - done;
  const colors = getChartColors();

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Hoàn thành", "Chưa hoàn thành"],
      datasets: [{ data: [done, pending], backgroundColor: ["#16a34a", "#f59e0b"], borderWidth: 0 }],
    },
    options: {
      plugins: { legend: { position: "bottom", labels: { color: colors.text } } },
    },
  });
}

function buildSubjectGradeChart() {
  const ctx = document.getElementById("subjectGradeChart");
  if (!ctx) return;
  const grades = getUserData("grades", []);
  const subjects = getUserData("subjects", []);
  const colors = getChartColors();

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: grades.map((g) => subjects.find((s) => s.id === g.subjectId)?.name || g.subjectName || "—"),
      datasets: [
        {
          label: "Điểm (thang 10)",
          data: grades.map((g) => g.score10),
          backgroundColor: "#4f46e5",
          borderRadius: 6,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 10, ticks: { color: colors.text }, grid: { color: colors.grid } },
        x: { ticks: { color: colors.text }, grid: { display: false } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

function buildPomodoroWeekChart() {
  const ctx = document.getElementById("pomodoroWeekChart");
  if (!ctx) return;
  const colors = getChartColors();
  const log = getUserData("pomodoro_log", {}); // { 'YYYY-MM-DD': minutes }
  const todayStats = getUserData("pomodoro_stats", null);
  if (todayStats) log[todayStats.date] = todayStats.minutes;

  const days = [];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(log[key] || 0);
    labels.push(d.toLocaleDateString("vi-VN", { weekday: "short" }));
  }

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Phút tập trung",
          data: days,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79,70,229,.15)",
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true, ticks: { color: colors.text }, grid: { color: colors.grid } },
        x: { ticks: { color: colors.text }, grid: { display: false } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

function buildPriorityChart() {
  const ctx = document.getElementById("priorityChart");
  if (!ctx) return;
  const tasks = getUserData("tasks", []);
  const colors = getChartColors();
  const counts = { high: 0, medium: 0, low: 0 };
  tasks.forEach((t) => { if (counts[t.priority] !== undefined) counts[t.priority]++; });

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Ưu tiên cao", "Trung bình", "Thấp"],
      datasets: [{ data: [counts.high, counts.medium, counts.low], backgroundColor: ["#ef4444", "#f59e0b", "#0ea5e9"] }],
    },
    options: { plugins: { legend: { position: "bottom", labels: { color: colors.text } } } },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("taskStatusChart")) return;
  buildTaskStatusChart();
  buildSubjectGradeChart();
  buildPomodoroWeekChart();
  buildPriorityChart();
});
