/* ===========================================================
   StudyFlow - grades.js
   =========================================================== */

function getGrades() {
  return getUserData("grades", []);
}
function saveGrades(list) {
  setUserData("grades", list);
}

function calcGPA() {
  const grades = getGrades();
  const subjects = getSubjects();
  if (grades.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;
  grades.forEach((g) => {
    const subject = subjects.find((s) => s.id === g.subjectId);
    const credits = subject?.credits || 1;
    totalPoints += g.score4 * credits;
    totalCredits += credits;
  });
  return totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;
}

function score10to4(score10) {
  if (score10 >= 8.5) return 4.0;
  if (score10 >= 8.0) return 3.5;
  if (score10 >= 7.0) return 3.0;
  if (score10 >= 6.5) return 2.5;
  if (score10 >= 5.5) return 2.0;
  if (score10 >= 5.0) return 1.5;
  if (score10 >= 4.0) return 1.0;
  return 0.0;
}
function scoreToLetter(score10) {
  if (score10 >= 8.5) return "A";
  if (score10 >= 7.0) return "B";
  if (score10 >= 5.5) return "C";
  if (score10 >= 4.0) return "D";
  return "F";
}

function renderGrades() {
  const tbody = document.getElementById("gradesBody");
  if (!tbody) return;
  const grades = getGrades();
  const subjects = getSubjects();

  document.getElementById("gpaValue").textContent = calcGPA();
  document.getElementById("totalSubjectsGraded").textContent = grades.length;

  if (grades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="e-icon">🎯</div><h4>Chưa có điểm nào</h4><p>Thêm điểm số để theo dõi GPA của bạn.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = grades
    .map((g) => {
      const subject = subjects.find((s) => s.id === g.subjectId);
      return `<tr>
        <td>${subject ? `<span class="color-dot" style="background:${subject.color}"></span> ` : ""}${escapeHtml(subject?.name || g.subjectName || "—")}</td>
        <td>${subject?.credits ?? "—"}</td>
        <td><b>${g.score10}</b>/10</td>
        <td>${g.score4}/4.0</td>
        <td><span class="tag tag-info">${g.letter}</span></td>
        <td>
          <button class="icon-action" onclick="editGrade('${g.id}')">✏️</button>
          <button class="icon-action" onclick="deleteGrade('${g.id}')">🗑️</button>
        </td>
      </tr>`;
    })
    .join("");
}

function openGradeModal(grade = null) {
  document.getElementById("gradeModalTitle").textContent = grade ? "Sửa điểm" : "Thêm điểm";
  document.getElementById("gradeId").value = grade?.id || "";
  populateSubjectSelect(document.getElementById("gradeSubject"), grade?.subjectId || "");
  document.getElementById("gradeScore").value = grade?.score10 ?? "";
  document.getElementById("gradeModal").classList.add("show");
}
function closeGradeModal() {
  document.getElementById("gradeModal").classList.remove("show");
}
function editGrade(id) {
  const grade = getGrades().find((g) => g.id === id);
  if (grade) openGradeModal(grade);
}
function deleteGrade(id) {
  if (!confirm("Xóa điểm này?")) return;
  saveGrades(getGrades().filter((g) => g.id !== id));
  renderGrades();
  showToast("Đã xóa điểm", "success");
}

function saveGradeForm(e) {
  e.preventDefault();
  const id = document.getElementById("gradeId").value;
  const subjectId = document.getElementById("gradeSubject").value;
  const score10 = Number(document.getElementById("gradeScore").value);
  if (!subjectId || isNaN(score10) || score10 < 0 || score10 > 10) {
    showToast("Vui lòng nhập điểm hợp lệ (0-10) và chọn môn học", "error");
    return;
  }
  const subjects = getSubjects();
  const subjectName = subjects.find((s) => s.id === subjectId)?.name || "";

  const data = {
    subjectId,
    subjectName,
    score10,
    score4: score10to4(score10),
    letter: scoreToLetter(score10),
  };

  let grades = getGrades();
  if (id) {
    grades = grades.map((g) => (g.id === id ? { ...g, ...data } : g));
  } else {
    grades.push({ id: uid("grade"), ...data, createdAt: new Date().toISOString() });
  }
  saveGrades(grades);
  closeGradeModal();
  renderGrades();
  showToast("Đã lưu điểm", "success");
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("gradesBody")) return;
  renderGrades();
  document.getElementById("addGradeBtn")?.addEventListener("click", () => openGradeModal());
  document.getElementById("gradeForm")?.addEventListener("submit", saveGradeForm);
});
