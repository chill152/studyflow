/* ===========================================================
   StudyFlow - subjects.js
   =========================================================== */

const SUBJECT_COLORS = ["#4f46e5", "#0ea5e9", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

function getSubjects() {
  return getUserData("subjects", []);
}
function saveSubjects(list) {
  setUserData("subjects", list);
}

function renderSubjects() {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;
  const subjects = getSubjects();
  const tasks = getUserData("tasks", []);

  if (subjects.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="e-icon">📚</div>
      <h4>Chưa có môn học nào</h4>
      <p>Nhấn "Thêm môn học" để bắt đầu quản lý việc học của bạn.</p>
    </div>`;
    return;
  }

  grid.innerHTML = subjects
    .map((s) => {
      const subjectTasks = tasks.filter((t) => t.subjectId === s.id);
      const done = subjectTasks.filter((t) => t.done).length;
      const percent = subjectTasks.length ? Math.round((done / subjectTasks.length) * 100) : 0;
      return `
      <div class="card subject-card" style="border-top-color:${s.color}">
        <div class="s-name">${escapeHtml(s.name)}</div>
        <div class="s-meta">${escapeHtml(s.teacher || "Chưa có giảng viên")} • ${s.credits || 0} tín chỉ</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${percent}%;background:${s.color}"></div></div>
        <div class="s-meta" style="margin-top:8px">${done}/${subjectTasks.length} nhiệm vụ hoàn thành (${percent}%)</div>
        <div class="toolbar" style="margin-top:14px">
          <button class="btn btn-secondary btn-sm" onclick="editSubject('${s.id}')">✏️ Sửa</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSubject('${s.id}')">🗑️ Xóa</button>
        </div>
      </div>`;
    })
    .join("");
}

function openSubjectModal(subject = null) {
  document.getElementById("subjectModalTitle").textContent = subject ? "Sửa môn học" : "Thêm môn học";
  document.getElementById("subjectId").value = subject?.id || "";
  document.getElementById("subjectName").value = subject?.name || "";
  document.getElementById("subjectTeacher").value = subject?.teacher || "";
  document.getElementById("subjectCredits").value = subject?.credits || 3;
  document.getElementById("subjectColor").value = subject?.color || SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
  document.getElementById("subjectModal").classList.add("show");
}
function closeSubjectModal() {
  document.getElementById("subjectModal").classList.remove("show");
}

function editSubject(id) {
  const subject = getSubjects().find((s) => s.id === id);
  if (subject) openSubjectModal(subject);
}

function deleteSubject(id) {
  if (!confirm("Xóa môn học này? Các nhiệm vụ/điểm liên quan sẽ vẫn được giữ nhưng không còn gắn môn.")) return;
  saveSubjects(getSubjects().filter((s) => s.id !== id));
  renderSubjects();
  showToast("Đã xóa môn học", "success");
}

function saveSubjectForm(e) {
  e.preventDefault();
  const id = document.getElementById("subjectId").value;
  const name = document.getElementById("subjectName").value.trim();
  if (!name) return;

  const data = {
    name,
    teacher: document.getElementById("subjectTeacher").value.trim(),
    credits: Number(document.getElementById("subjectCredits").value) || 0,
    color: document.getElementById("subjectColor").value,
  };

  let subjects = getSubjects();
  if (id) {
    subjects = subjects.map((s) => (s.id === id ? { ...s, ...data } : s));
  } else {
    subjects.push({ id: uid("sub"), ...data, createdAt: new Date().toISOString() });
  }
  saveSubjects(subjects);
  closeSubjectModal();
  renderSubjects();
  showToast("Đã lưu môn học", "success");
}

function populateSubjectSelect(selectEl, selectedId = "") {
  if (!selectEl) return;
  const subjects = getSubjects();
  selectEl.innerHTML =
    `<option value="">-- Không chọn môn --</option>` +
    subjects.map((s) => `<option value="${s.id}" ${s.id === selectedId ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("subjectsGrid")) return;
  renderSubjects();
  document.getElementById("addSubjectBtn")?.addEventListener("click", () => openSubjectModal());
  document.getElementById("subjectForm")?.addEventListener("submit", saveSubjectForm);
});
