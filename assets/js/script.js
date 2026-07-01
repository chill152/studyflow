/* ===========================================================
   StudyFlow - script.js
   Layout dùng chung (sidebar + header), dark mode, toast, helpers
   =========================================================== */

const NAV_ITEMS = [
  { href: "./index.html", icon: "🏠", label: "Dashboard", key: "index" },
  { href: "./subjects.html", icon: "📚", label: "Môn học", key: "subjects" },
  { href: "./tasks.html", icon: "✅", label: "Nhiệm vụ", key: "tasks" },
  { href: "./timer.html", icon: "⏱️", label: "Pomodoro", key: "timer" },
  { href: "./calendar.html", icon: "📅", label: "Lịch học", key: "calendar" },
  { href: "./grades.html", icon: "🎯", label: "Điểm số", key: "grades" },
  { href: "./notes.html", icon: "📝", label: "Ghi chú", key: "notes" },
  { href: "./statistics.html", icon: "📊", label: "Thống kê", key: "statistics" },
  { href: "./profile.html", icon: "👤", label: "Hồ sơ", key: "profile" },
];

/* ---------- Dark mode ---------- */
function applyTheme() {
  const theme = localStorage.getItem("studyflow_theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("studyflow_theme", next);
  const checkbox = document.getElementById("themeSwitch");
  if (checkbox) checkbox.checked = next === "dark";
}

/* ---------- Toast ---------- */
function showToast(message, type = "default") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ---------- Xây dựng sidebar + header ---------- */
function buildLayout(activeKey) {
  const mount = document.getElementById("app-layout");
  if (!mount) return;

  const user = getCurrentUser();
  const initials = (user?.fullname || user?.username || "?")
    .trim()
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navHtml = NAV_ITEMS.map(
    (item) => `
    <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
      <span class="icon">${item.icon}</span><span>${item.label}</span>
    </a>`
  ).join("");

  mount.innerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo"><span>📘</span> StudyFlow</div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-footer">
        <button class="btn btn-outline btn-block" id="logoutBtn">🚪 Đăng xuất</button>
      </div>
    </aside>

    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-btn menu-toggle" id="menuToggle">☰</button>
        <div class="search-bar">
          <span>🔍</span>
          <input type="text" id="globalSearch" placeholder="Tìm môn học, nhiệm vụ, ghi chú..." />
        </div>
      </div>
      <div class="topbar-right">
        <button class="icon-btn" id="themeBtn" title="Chuyển giao diện">🌙</button>
        <button class="icon-btn" id="notifBtn" title="Thông báo">
          🔔<span class="badge-dot" id="notifDot" style="display:none"></span>
        </button>
        <a class="user-chip" href="./profile.html">
          <span class="avatar" id="headerAvatar">${initials}</span>
          <span class="uname">${user?.fullname || user?.username || ""}</span>
        </a>
      </div>
      <div class="dropdown-panel" id="notifPanel">
        <h4>Thông báo</h4>
        <div id="notifList"></div>
      </div>
    </header>
  `;

  // avatar image nếu có
  if (user?.avatar) {
    document.getElementById("headerAvatar").innerHTML = `<img src="${user.avatar}" alt="avatar">`;
  }

  // logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) logoutUser();
  });

  // theme
  const theme = applyTheme();
  document.getElementById("themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
  document.getElementById("themeBtn").addEventListener("click", () => {
    toggleTheme();
    document.getElementById("themeBtn").textContent =
      document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
  });

  // sidebar mobile toggle
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  document.getElementById("menuToggle").addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });

  // notifications
  buildNotifications();
  document.getElementById("notifBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("notifPanel").classList.toggle("show");
  });
  document.addEventListener("click", () => {
    document.getElementById("notifPanel")?.classList.remove("show");
  });

  // global search
  document.getElementById("globalSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      sessionStorage.setItem("studyflow_search_query", e.target.value.trim());
      window.location.href = "./tasks.html";
    }
  });
}

/* ---------- Thông báo: nhiệm vụ sắp tới hạn ---------- */
function buildNotifications() {
  const tasks = getUserData("tasks", []);
  const now = new Date();
  const soon = tasks
    .filter((t) => !t.done && t.deadline)
    .map((t) => ({ ...t, diff: (new Date(t.deadline) - now) / 36e5 }))
    .filter((t) => t.diff >= -24 && t.diff <= 72)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 6);

  const list = document.getElementById("notifList");
  const dot = document.getElementById("notifDot");
  if (!list) return;

  if (soon.length === 0) {
    list.innerHTML = `<div class="notif-empty">Không có thông báo mới 🎉</div>`;
    dot.style.display = "none";
    return;
  }
  dot.style.display = "block";
  list.innerHTML = soon
    .map((t) => {
      const overdue = t.diff < 0;
      return `<div class="notif-item">
        <div class="t">${overdue ? "⚠️ Quá hạn: " : "⏰ Sắp đến hạn: "}${escapeHtml(t.title)}</div>
        <div class="d">${formatDateTime(t.deadline)}</div>
      </div>`;
    })
    .join("");
}

/* ---------- Helpers ---------- */
function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/* ---------- Khởi tạo chung cho mọi trang nội bộ (đã đăng nhập) ---------- */
function initAppPage(activeKey) {
  requireAuth();
  applyTheme();
  buildLayout(activeKey);
}

document.addEventListener("DOMContentLoaded", () => {
  // áp dụng theme ngay cả ở trang login/register
  applyTheme();
});
