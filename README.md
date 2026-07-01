# 📘 StudyFlow — Nền tảng học tập cá nhân

> Website quản lý học tập cá nhân chạy hoàn toàn trên trình duyệt, không cần backend, không cần đăng ký hosting.

![StudyFlow](https://img.shields.io/badge/StudyFlow-v1.0-4f46e5?style=flat-square)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

---

## ✨ Tính năng

| Tính năng | Mô tả |
|---|---|
| 🔐 Xác thực | Đăng ký / Đăng nhập local, mật khẩu hash SHA-256 |
| 👤 Đa tài khoản | Mỗi user có dữ liệu riêng biệt qua LocalStorage |
| 🏠 Dashboard | Tổng quan nhiệm vụ, môn học, thống kê nhanh |
| 📚 Môn học | Thêm/sửa/xóa môn, theo dõi tiến độ |
| ✅ Nhiệm vụ | CRUD, ưu tiên, deadline, lọc đa chiều |
| ⏱️ Pomodoro | Bộ đếm tập trung, thống kê phiên học |
| 📅 Lịch học | Calendar tháng, thêm sự kiện, deadline hiển thị |
| 🎯 Điểm số | Nhập điểm, tính GPA tự động theo thang 4.0 |
| 📝 Ghi chú | Editor với auto-save |
| 📊 Thống kê | Biểu đồ Chart.js (nhiệm vụ, điểm, Pomodoro) |
| 🌙 Dark mode | Chuyển đổi sáng/tối |
| 📱 Responsive | Mobile-first, sidebar thu gọn |

---

## 🚀 Cách chạy local

### Cách 1 — Mở trực tiếp (đơn giản nhất)

```bash
# Mở file index.html trong trình duyệt
# Windows: double-click index.html
# Mac: open index.html
# Linux: xdg-open index.html
```

> ⚠️ Một số trình duyệt chặn file local. Nếu gặp lỗi CORS, dùng Cách 2.

### Cách 2 — Live Server với VS Code

1. Cài extension **Live Server** trong VS Code
2. Mở thư mục `StudyFlow/`
3. Chuột phải `index.html` → **Open with Live Server**
4. Truy cập `http://127.0.0.1:5500`

### Cách 3 — Python HTTP Server

```bash
cd StudyFlow
python -m http.server 8080
# Mở http://localhost:8080
```

### Cách 4 — Node.js serve

```bash
cd StudyFlow
npx serve .
```

---

## 📤 Upload lên GitHub & bật GitHub Pages

### Bước 1 — Tạo repository trên GitHub

1. Đăng nhập [github.com](https://github.com)
2. Nhấn nút **"New"** (hoặc dấu `+` → `New repository`)
3. Đặt tên: `studyflow` (hoặc tên bất kỳ)
4. Chọn **Public**
5. **Không** tích `Add a README file`
6. Nhấn **Create repository**

---

### Bước 2 — Cài Git và upload code

#### Nếu chưa cài Git:
- Tải tại: https://git-scm.com/downloads

#### Upload code:

```bash
# 1. Mở terminal, vào thư mục project
cd StudyFlow

# 2. Khởi tạo git
git init

# 3. Thêm toàn bộ file
git add .

# 4. Commit đầu tiên
git commit -m "🎉 Initial commit: StudyFlow v1.0"

# 5. Đổi nhánh thành main
git branch -M main

# 6. Kết nối với GitHub (thay YOUR_USERNAME và REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 7. Push lên GitHub
git push -u origin main
```

---

### Bước 3 — Bật GitHub Pages

1. Vào repository trên GitHub
2. Nhấn tab **Settings**
3. Kéo xuống mục **Pages** (sidebar trái)
4. Mục **Source** → chọn **Deploy from a branch**
5. Branch: chọn **main** → Folder: **/ (root)**
6. Nhấn **Save**
7. Chờ 1-3 phút

---

### Bước 4 — Truy cập website

Sau khi GitHub Pages build xong, URL sẽ là:

```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

Ví dụ: `https://nguyenvana.github.io/studyflow/`

> 💡 URL xuất hiện trong tab **Settings → Pages** sau khi deploy.

---

## 🔄 Cập nhật code sau này

```bash
git add .
git commit -m "✨ feat: mô tả thay đổi"
git push
```

GitHub Pages tự động cập nhật sau 1-2 phút.

---

## 📁 Cấu trúc dự án

```
StudyFlow/
├── index.html          # Dashboard
├── login.html          # Đăng nhập
├── register.html       # Đăng ký
├── subjects.html       # Môn học
├── tasks.html          # Nhiệm vụ
├── timer.html          # Pomodoro
├── calendar.html       # Lịch học
├── grades.html         # Điểm số
├── notes.html          # Ghi chú
├── statistics.html     # Thống kê
├── profile.html        # Hồ sơ
├── assets/
│   ├── css/
│   │   └── style.css   # Toàn bộ CSS (dark mode, responsive)
│   ├── js/
│   │   ├── auth.js     # Xác thực, SHA-256, session
│   │   ├── script.js   # Layout, sidebar, header, toast
│   │   ├── subjects.js # Module môn học
│   │   ├── tasks.js    # Module nhiệm vụ
│   │   ├── timer.js    # Module Pomodoro
│   │   ├── grades.js   # Module điểm số
│   │   ├── notes.js    # Module ghi chú
│   │   ├── statistics.js # Module thống kê (Chart.js)
│   │   └── profile.js  # Module hồ sơ
│   └── images/         # Ảnh tùy chỉnh (tùy chọn)
└── README.md
```

---

## 🛡️ Bảo mật & Lưu ý

- **Dữ liệu lưu trong LocalStorage** của trình duyệt — riêng tư trên máy bạn.
- **Mật khẩu được hash SHA-256** bằng Web Crypto API — không lưu plaintext.
- **Không có server** — hoàn toàn client-side, phù hợp dùng cá nhân.
- Xóa dữ liệu: vào **Hồ sơ → Xóa toàn bộ dữ liệu**, hoặc xóa LocalStorage trong DevTools.

---

## 🤝 Đóng góp

Pull requests và issues luôn được chào đón!

---

*Made with ❤️ | StudyFlow v1.0*
