/* ===========================================================
   StudyFlow - auth.js
   Xử lý đăng ký / đăng nhập / đăng xuất / phiên làm việc (local)
   =========================================================== */

const AUTH_USERS_KEY = "studyflow_users";
const AUTH_SESSION_KEY = "studyflow_session";

/* ---------- Hash mật khẩu bằng SHA-256 (Web Crypto API) ---------- */
async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- Helpers đọc/ghi danh sách user ---------- */
function getUsers() {
  return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || "[]");
}
function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}
function findUser(username) {
  return getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

/* ---------- Đăng ký ---------- */
async function registerUser({ username, password, fullname, email }) {
  username = username.trim();
  if (!username || !password) throw new Error("Vui lòng nhập đầy đủ thông tin.");
  if (username.length < 3) throw new Error("Tên đăng nhập phải có ít nhất 3 ký tự.");
  if (password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
  if (findUser(username)) throw new Error("Tên đăng nhập đã tồn tại.");

  const users = getUsers();
  const passwordHash = await sha256(password);
  const newUser = {
    id: "u_" + Date.now(),
    username,
    passwordHash,
    fullname: fullname || username,
    email: email || "",
    avatar: "",
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

/* ---------- Đăng nhập ---------- */
async function loginUser(username, password) {
  const user = findUser(username);
  if (!user) throw new Error("Tài khoản không tồn tại.");
  const hash = await sha256(password);
  if (hash !== user.passwordHash) throw new Error("Mật khẩu không đúng.");

  const session = {
    userId: user.id,
    username: user.username,
    loginAt: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  return user;
}

/* ---------- Phiên hiện tại ---------- */
function getSession() {
  return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
}
function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find((u) => u.id === session.userId) || null;
}
function updateCurrentUser(patch) {
  const users = getUsers();
  const session = getSession();
  if (!session) return null;
  const idx = users.findIndex((u) => u.id === session.userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return users[idx];
}

/* ---------- Đăng xuất ---------- */
function logoutUser() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  window.location.href = "./login.html";
}

/* ---------- Bảo vệ trang: yêu cầu đăng nhập ---------- */
function requireAuth() {
  if (!getSession() || !getCurrentUser()) {
    window.location.href = "./login.html";
  }
}

/* ---------- Khóa namespace dữ liệu riêng theo user ---------- */
function userKey(suffix) {
  const session = getSession();
  const uid = session ? session.userId : "guest";
  return `studyflow_${uid}_${suffix}`;
}

function getUserData(suffix, fallback) {
  const raw = localStorage.getItem(userKey(suffix));
  return raw ? JSON.parse(raw) : fallback;
}
function setUserData(suffix, data) {
  localStorage.setItem(userKey(suffix), JSON.stringify(data));
}
