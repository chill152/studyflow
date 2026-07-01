/* ===========================================================
   StudyFlow - profile.js
   =========================================================== */

function renderProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const initials = (user.fullname || user.username)
    .trim().split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  const avatarEl = document.getElementById("profileAvatar");
  if (user.avatar) {
    avatarEl.innerHTML = `<img src="${user.avatar}" alt="avatar">`;
  } else {
    avatarEl.textContent = initials;
  }

  document.getElementById("profileFullname").textContent = user.fullname || user.username;
  document.getElementById("profileUsername").textContent = "@" + user.username;
  document.getElementById("profileEmail").textContent = user.email || "Chưa cập nhật";
  document.getElementById("profileJoined").textContent = formatDate(user.createdAt);

  document.getElementById("editFullname").value = user.fullname || "";
  document.getElementById("editEmail").value = user.email || "";
  document.getElementById("editUsername").textContent = user.username;

  // Stats tổng quan
  const tasks = getUserData("tasks", []);
  const grades = getUserData("grades", []);
  const notes = getUserData("notes", []);
  const stats = getUserData("pomodoro_stats", { sessions: 0, minutes: 0 });

  document.getElementById("statTasksDone").textContent = tasks.filter(t => t.done).length;
  document.getElementById("statTotalTasks").textContent = tasks.length;
  document.getElementById("statGrades").textContent = grades.length;
  document.getElementById("statNotes").textContent = notes.length;
  document.getElementById("statPomodoro").textContent = stats.sessions || 0;
}

function saveProfileForm(e) {
  e.preventDefault();
  const fullname = document.getElementById("editFullname").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  if (!fullname) { showToast("Vui lòng nhập họ tên", "error"); return; }
  updateCurrentUser({ fullname, email });
  renderProfile();
  showToast("Đã cập nhật hồ sơ ✓", "success");
}

async function savePasswordForm(e) {
  e.preventDefault();
  const current = document.getElementById("currentPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  if (!current || !newPass) { showToast("Vui lòng nhập đủ thông tin", "error"); return; }
  if (newPass.length < 6) { showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error"); return; }
  if (newPass !== confirm) { showToast("Mật khẩu xác nhận không khớp", "error"); return; }
  const user = getCurrentUser();
  const currentHash = await sha256(current);
  if (currentHash !== user.passwordHash) { showToast("Mật khẩu hiện tại không đúng", "error"); return; }
  const newHash = await sha256(newPass);
  updateCurrentUser({ passwordHash: newHash });
  document.getElementById("passwordForm").reset();
  showToast("Đã đổi mật khẩu thành công ✓", "success");
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast("Ảnh không được vượt quá 2MB", "error"); return; }
  const reader = new FileReader();
  reader.onload = (ev) => {
    updateCurrentUser({ avatar: ev.target.result });
    renderProfile();
    showToast("Đã cập nhật ảnh đại diện ✓", "success");
  };
  reader.readAsDataURL(file);
}

function clearAllData() {
  if (!confirm("⚠️ Xóa TẤT CẢ dữ liệu học tập của bạn? Hành động này không thể hoàn tác!")) return;
  const keysToDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("studyflow_") && !key.startsWith("studyflow_users") && !key.startsWith("studyflow_session")) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(k => localStorage.removeItem(k));
  showToast("Đã xóa toàn bộ dữ liệu học tập", "success");
  setTimeout(() => location.reload(), 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("profileAvatar")) return;
  renderProfile();
  document.getElementById("profileForm")?.addEventListener("submit", saveProfileForm);
  document.getElementById("passwordForm")?.addEventListener("submit", savePasswordForm);
  document.getElementById("avatarInput")?.addEventListener("change", handleAvatarUpload);
  document.getElementById("clearDataBtn")?.addEventListener("click", clearAllData);
  document.getElementById("avatarUploadBtn")?.addEventListener("click", () => {
    document.getElementById("avatarInput").click();
  });

  // Theme toggle in profile page
  const sw = document.getElementById("themeSwitch");
  if (sw) {
    sw.checked = document.documentElement.getAttribute("data-theme") === "dark";
    sw.addEventListener("change", () => {
      toggleTheme();
    });
  }
});
