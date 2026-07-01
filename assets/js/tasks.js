/* ===========================================================
   StudyFlow - tasks.js
   =========================================================== */

function getTasks() {
  return getUserData("tasks", []);
}
function saveTasks(list) {
  setUserData("tasks", list);
}

function getTaskFilters() {
  return {
    status: document.getElementById("filterStatus")?.value || "all",
    priority: document.getElementById("filterPriority")?.value || "all",
    subjectId: document.getElementById("filterSubject")?.value || "all",
    search: document.getElementById("taskSearch")?.value.trim().toLowerCase() || "",
  };
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;
  const tasks = getTasks();
  const subjects = getSubjects();
  const filters = getTaskFilters();

  let filtered = tasks.filter((t) => {
    if (filters.status === "done" && !t.done) return false;
    if (filters.status === "pending" && t.done) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.subjectId !== "all" && t.subjectId !== filters.subjectId) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(a.deadline || "2999-01-01") - new Date(b.deadline || "2999-01-01");
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="e-icon">✅</div>
      <h4>Không có nhiệm vụ nào</h4>
      <p>Thêm nhiệm vụ mới để bắt đầu theo dõi việc học của bạn.</p>
    </div>`;
    return;
  }

  list.innerHTML = filtered
    .map((t) => {
      const subject = subjects.find((s) => s.id === t.subjectId);
      const overdue = !t.done && t.deadline && new Date(t.deadline) < new Date();
      const priorityTag = { high: "tag-danger", medium: "tag-warning", low: "tag-info" }[t.priority] || "tag-muted";
      const priorityLabel = { high: "Cao", medium: "Trung bình", low: "Thấp" }[t.priority] || "—";
      return `
      <div class="task-item ${t.done ? "done" : ""}">
        <input type="checkbox" ${t.done ? "checked" : ""} onchange="toggleTaskDone('${t.id}')">
        <div class="task-main">
          <div class="task-title">${escapeHtml(t.title)}</div>
          <div class="task-meta">
            ${subject ? `<span><span class="color-dot" style="background:${subject.color}"></span> ${escapeHtml(subject.name)}</span>` : ""}
            <span class="tag ${priorityTag}">${priorityLabel}</span>
            ${t.deadline ? `<span class="${overdue ? "tag tag-danger" : ""}">${overdue ? "⚠️ " : "📅 "}${formatDateTime(t.deadline)}</span>` : ""}
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-action" onclick="editTask('${t.id}')" title="Sửa">✏️</button>
          <button class="icon-action" onclick="deleteTask('${t.id}')" title="Xóa">🗑️</button>
        </div>
      </div>`;
    })
    .join("");
}

function toggleTaskDone(id) {
  const tasks = getTasks().map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  if (!confirm("Xóa nhiệm vụ này?")) return;
  saveTasks(getTasks().filter((t) => t.id !== id));
  renderTasks();
  showToast("Đã xóa nhiệm vụ", "success");
}

function openTaskModal(task = null) {
  document.getElementById("taskModalTitle").textContent = task ? "Sửa nhiệm vụ" : "Thêm nhiệm vụ";
  document.getElementById("taskId").value = task?.id || "";
  document.getElementById("taskTitle").value = task?.title || "";
  document.getElementById("taskDesc").value = task?.desc || "";
  document.getElementById("taskDeadline").value = task?.deadline ? task.deadline.slice(0, 16) : "";
  document.getElementById("taskPriority").value = task?.priority || "medium";
  populateSubjectSelect(document.getElementById("taskSubject"), task?.subjectId || "");
  document.getElementById("taskModal").classList.add("show");
}
function closeTaskModal() {
  document.getElementById("taskModal").classList.remove("show");
}
function editTask(id) {
  const task = getTasks().find((t) => t.id === id);
  if (task) openTaskModal(task);
}

function saveTaskForm(e) {
  e.preventDefault();
  const id = document.getElementById("taskId").value;
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return;

  const data = {
    title,
    desc: document.getElementById("taskDesc").value.trim(),
    deadline: document.getElementById("taskDeadline").value || "",
    priority: document.getElementById("taskPriority").value,
    subjectId: document.getElementById("taskSubject").value,
  };

  let tasks = getTasks();
  if (id) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, ...data } : t));
  } else {
    tasks.push({ id: uid("task"), ...data, done: false, createdAt: new Date().toISOString() });
  }
  saveTasks(tasks);
  closeTaskModal();
  renderTasks();
  showToast("Đã lưu nhiệm vụ", "success");
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("taskList")) return;
  populateSubjectSelect(document.getElementById("filterSubject"));
  document.getElementById("filterSubject").insertAdjacentHTML("afterbegin", `<option value="all" selected>Tất cả môn học</option>`);

  const pending = sessionStorage.getItem("studyflow_search_query");
  if (pending) {
    document.getElementById("taskSearch").value = pending;
    sessionStorage.removeItem("studyflow_search_query");
  }

  renderTasks();

  document.getElementById("addTaskBtn")?.addEventListener("click", () => openTaskModal());
  document.getElementById("taskForm")?.addEventListener("submit", saveTaskForm);
  ["filterStatus", "filterPriority", "filterSubject", "taskSearch"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderTasks);
    document.getElementById(id)?.addEventListener("change", renderTasks);
  });
});
