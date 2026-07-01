/* StudyFlow - script.js v2 */
const NAV_ITEMS = [
  { href:"./index.html",      icon:"🏠", label:"Dashboard",  key:"index" },
  { href:"./subjects.html",   icon:"📚", label:"Môn học",    key:"subjects" },
  { href:"./tasks.html",      icon:"✅", label:"Nhiệm vụ",   key:"tasks" },
  { href:"./timer.html",      icon:"⏱️", label:"Pomodoro",   key:"timer" },
  { href:"./calendar.html",   icon:"📅", label:"Lịch học",   key:"calendar" },
  { href:"./grades.html",     icon:"🎯", label:"Điểm số",    key:"grades" },
  { href:"./notes.html",      icon:"📝", label:"Ghi chú",    key:"notes" },
  { href:"./statistics.html", icon:"📊", label:"Thống kê",   key:"statistics" },
  { href:"./profile.html",    icon:"👤", label:"Hồ sơ",      key:"profile" },
];

function applyTheme() {
  const t = localStorage.getItem("studyflow_theme") || "light";
  document.documentElement.setAttribute("data-theme", t);
  return t;
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("studyflow_theme", next);
  const cb = document.getElementById("themeSwitch");
  if (cb) cb.checked = next === "dark";
  return next;
}

function showToast(message, type = "default") {
  let c = document.getElementById("toast-container");
  if (!c) { c = document.createElement("div"); c.id = "toast-container"; document.body.appendChild(c); }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = message;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(20px)"; setTimeout(() => t.remove(), 200); }, 3000);
}

function buildLayout(activeKey) {
  const mount = document.getElementById("app-layout");
  if (!mount) return;
  const user = getCurrentUser();
  const initials = (user?.fullname || user?.username || "?")
    .trim().split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();

  const navHtml = NAV_ITEMS.map(item => `
    <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>`).join("");

  mount.innerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon-sm">📘</div>
        <span>StudyFlow</span>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Menu chính</div>
        ${navHtml}
      </nav>
      <div class="sidebar-footer">
        <button class="btn btn-outline" id="logoutBtn">🚪 Đăng xuất</button>
      </div>
    </aside>

    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-btn menu-toggle" id="menuToggle" style="border:none">☰</button>
        <div class="search-bar">
          <span class="s-icon">🔍</span>
          <input type="text" id="globalSearch" placeholder="Tìm kiếm..." />
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
    </header>`;

  if (user?.avatar) {
    document.getElementById("headerAvatar").innerHTML = `<img src="${user.avatar}" alt="av">`;
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) logoutUser();
  });

  const theme = applyTheme();
  const themeBtn = document.getElementById("themeBtn");
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  themeBtn.addEventListener("click", () => {
    const next = toggleTheme();
    themeBtn.textContent = next === "dark" ? "☀️" : "🌙";
  });

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  document.getElementById("menuToggle").addEventListener("click", () => {
    sidebar.classList.toggle("open"); overlay.classList.toggle("show");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open"); overlay.classList.remove("show");
  });

  buildNotifications();
  document.getElementById("notifBtn").addEventListener("click", e => {
    e.stopPropagation();
    document.getElementById("notifPanel").classList.toggle("show");
  });
  document.addEventListener("click", () => document.getElementById("notifPanel")?.classList.remove("show"));

  document.getElementById("globalSearch").addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.value.trim()) {
      sessionStorage.setItem("studyflow_search_query", e.target.value.trim());
      window.location.href = "./tasks.html";
    }
  });
}

function buildNotifications() {
  const tasks = getUserData("tasks", []);
  const now = new Date();
  const soon = tasks
    .filter(t => !t.done && t.deadline)
    .map(t => ({ ...t, diff: (new Date(t.deadline) - now) / 36e5 }))
    .filter(t => t.diff >= -24 && t.diff <= 72)
    .sort((a,b) => a.diff - b.diff).slice(0,6);

  const list = document.getElementById("notifList");
  const dot  = document.getElementById("notifDot");
  if (!list) return;
  if (!soon.length) {
    list.innerHTML = `<div class="notif-empty">✨ Không có thông báo mới</div>`;
    dot.style.display = "none"; return;
  }
  dot.style.display = "block";
  list.innerHTML = soon.map(t => {
    const ov = t.diff < 0;
    return `<div class="notif-item">
      <div class="t">${ov ? "⚠️ Quá hạn: " : "⏰ Sắp đến: "}${escapeHtml(t.title)}</div>
      <div class="d">${formatDateTime(t.deadline)}</div>
    </div>`;
  }).join("");
}

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN");
}
function formatDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("vi-VN", {day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function uid(p = "id") { return `${p}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

function initAppPage(activeKey) {
  requireAuth(); applyTheme(); buildLayout(activeKey);
}
document.addEventListener("DOMContentLoaded", applyTheme);
