/* ===========================================================
   StudyFlow - notes.js
   =========================================================== */

let currentNoteId = null;
let autoSaveTimer = null;

function getNotes() {
  return getUserData("notes", []);
}
function saveNotes(list) {
  setUserData("notes", list);
}

function renderNotesList() {
  const list = document.getElementById("notesList");
  if (!list) return;
  const notes = getNotes().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  if (notes.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="e-icon">📝</div><h4>Chưa có ghi chú</h4></div>`;
    return;
  }

  list.innerHTML = notes
    .map(
      (n) => `
    <div class="note-card ${n.id === currentNoteId ? "active" : ""}" onclick="openNote('${n.id}')">
      <div class="n-title">${escapeHtml(n.title || "Không có tiêu đề")}</div>
      <div class="n-preview">${escapeHtml((n.content || "").slice(0, 80))}</div>
      <div class="n-date">${formatDateTime(n.updatedAt)}</div>
    </div>`
    )
    .join("");
}

function openNote(id) {
  currentNoteId = id;
  const note = getNotes().find((n) => n.id === id);
  document.getElementById("noteEditorEmpty").style.display = "none";
  document.getElementById("noteEditorForm").style.display = "block";
  document.getElementById("noteTitleInput").value = note?.title || "";
  document.getElementById("noteContentInput").value = note?.content || "";
  renderNotesList();
}

function createNote() {
  const notes = getNotes();
  const newNote = {
    id: uid("note"),
    title: "Ghi chú mới",
    content: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.push(newNote);
  saveNotes(notes);
  openNote(newNote.id);
}

function deleteCurrentNote() {
  if (!currentNoteId) return;
  if (!confirm("Xóa ghi chú này?")) return;
  saveNotes(getNotes().filter((n) => n.id !== currentNoteId));
  currentNoteId = null;
  document.getElementById("noteEditorEmpty").style.display = "flex";
  document.getElementById("noteEditorForm").style.display = "none";
  renderNotesList();
  showToast("Đã xóa ghi chú", "success");
}

function autoSaveNote() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (!currentNoteId) return;
    const notes = getNotes().map((n) =>
      n.id === currentNoteId
        ? {
            ...n,
            title: document.getElementById("noteTitleInput").value.trim() || "Không có tiêu đề",
            content: document.getElementById("noteContentInput").value,
            updatedAt: new Date().toISOString(),
          }
        : n
    );
    saveNotes(notes);
    renderNotesList();
    document.getElementById("noteSaveStatus").textContent = "Đã lưu ✓";
    setTimeout(() => (document.getElementById("noteSaveStatus").textContent = ""), 1500);
  }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("notesList")) return;
  renderNotesList();
  document.getElementById("newNoteBtn")?.addEventListener("click", createNote);
  document.getElementById("deleteNoteBtn")?.addEventListener("click", deleteCurrentNote);
  document.getElementById("noteTitleInput")?.addEventListener("input", autoSaveNote);
  document.getElementById("noteContentInput")?.addEventListener("input", autoSaveNote);
});
