# Hướng dẫn Cấu hình Báo cáo (Config Guide)

File cấu hình là "trái tim" của hệ thống này. Tất cả logic về lấy dữ liệu, xử lý Excel, vẽ biểu đồ và gửi mail đều được định nghĩa ở đây.

Bạn có thể dùng file `.json` hoặc `.js` (nếu cần logic động).

## 1. Cấu trúc tổng quan

Một file config gồm các phần chính:

```javascript
module.exports = {
  report_id: "daily_sales",
  schedule: "0 8 * * *", // Cron format
  timezone: "Asia/Ho_Chi_Minh",

  // 1. Dữ liệu nguồn (MongoDB Pipeline)
  datasets: [ ... ],

  // 2. Cấu hình Excel (Template & Mapping)
  excel: { ... },

  // 3. Render Blocks (Nội dung Email)
  render_blocks: [ ... ],

  // 4. Cấu hình Gửi Mail (SMTP + Fallback)
  mail: { ... }
};
```

... (Các phần datasets, excel, render_blocks giữ nguyên như cũ) ...

## 5. Mail Configuration (Updated)

Cấu hình gửi email hỗ trợ 2 chế độ: **SMTP** và **Fallback EXE**.

```javascript
mail: {
  // Người nhận
  to: ["manager@example.com"],
  cc: ["boss@example.com"],
  subject: "Báo cáo ngày {{date}}",

  // Đính kèm file Excel vừa tạo?
  attach_excel: true,

  // --- Option A: SMTP Standard ---
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "bot@example.com",
      pass: "secret_password"
    }
  },

  // --- Option B: Fallback EXE (Nếu SMTP lỗi) ---
  fallback: {
    enabled: true,
    // Đường dẫn tới file EXE của bạn
    command: "C:\\Tools\\SSOSender.exe",

    // Tham số truyền vào EXE
    // Hỗ trợ placeholders: {{to}}, {{subject}}, {{body_path}}, {{attach_path}}
    args: [
      "-t", "{{to}}",
      "-s", "{{subject}}",
      "-body", "{{body_path}}",   // Hệ thống tự tạo file HTML temp và điền path vào đây
      "-attach", "{{attach_path}}"
    ]
  }
}
```

**Cơ chế hoạt động:**

1.  Hệ thống thử gửi bằng **SMTP** trước.
2.  Nếu SMTP thất bại (hoặc không cấu hình), hệ thống kiểm tra `fallback.enabled`.
3.  Nếu Enabled, hệ thống ghi nội dung Email ra một file HTML tạm (`%TEMP%/mail_body_xxx.html`).
4.  Gọi lệnh EXE với các tham số đã thay thế.
