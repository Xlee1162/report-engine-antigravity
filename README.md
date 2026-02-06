# Report Engine Framework (Mongo + Excel + Queue)

Report Engine Framework là một hệ thống **Config-Driven** (điều khiển bằng cấu hình) giúp tự động hóa việc xuất báo cáo từ MongoDB ra Excel và Email. Hệ thống hỗ trợ kiến trúc **Producer-Consumer** với Queue bền vững và API quản lý.

## 🚀 Tính năng chính

-   **Config-Driven**: Mọi logic nằm trong file JSON/JS config.
-   **MongoDB Aggregation**: Xử lý dữ liệu bằng Pipeline mạnh mẽ.
-   **Excel Engine**: Hỗ trợ template `.xlsx` (điền data) và `.xlsb` (opaque copy).
-   **Job Queue (New)**: Hàng đợi công việc sử dụng MongoDB (`job_queue`), đảm bảo không mất job khi restart.
-   **Enterprise API (New)**: API Server để xem/sửa cấu hình và kích hoạt báo cáo từ Web UI.
-   **Persistent Logs**: Lưu lịch sử chạy vào DB để truy vết.

## 📚 Tài liệu chi tiết

-   **[Cấu hình báo cáo (Schema & Config)](docs/guide_configuration.md)**
-   **[Kiến trúc Core System](docs/guide_architecture.md)** (Updated)
-   **[Excel Adapter & Xử lý Template](docs/guide_excel_engine.md)**
-   **[Scheduler & Queue & API](docs/guide_queue_api.md)** (New): Hướng dẫn vận hành hệ thống Queue/Worker và sử dụng API.

## 🛠 Cài đặt & Sử dụng

### 1. Yêu cầu

-   Node.js >= 16
-   MongoDB

### 2. Cài đặt

```bash
npm install
```

### 3. Vận hành (Production)

Trong môi trường thực tế, bạn cần chạy song song 3 services:

1.  **Scheduler** (Producer): Lên lịch và đẩy job vào Queue.
    ```bash
    node src/app.js schedule ./configs
    ```
2.  **Worker** (Consumer): Lấy job từ Queue và thực thi (có thể chạy nhiều workers).
    ```bash
    node src/app.js worker
    ```
3.  **API Server**: Phục vụ Web UI.
    ```bash
    node src/app.js api
    ```

### 4. Chạy thủ công (Dev/Debug)

Chạy ngay lập tức (không qua queue):

```bash
node src/app.js run ./configs/my-report-config.js
```

## 📂 Cấu trúc dự án

```
report-engine/
├── src/
│   ├── api/          # Express API Server
│   ├── config/       # Logic load & validate config
│   ├── core/         # Pipeline & Block Engine
│   ├── excel/        # Excel Generator
│   ├── mail/         # Mail Renderer
│   ├── mongo/        # MongoDB Executor & Audit Logger
│   ├── queue/        # Job Queue Logic
│   ├── rawdata/      # Quản lý dataset
│   ├── render/       # HTML & Image Renderers
│   ├── scheduler/    # Lập lịch (Cron)
│   ├── worker.js     # Worker Job Consumer
│   └── app.js        # Entry point
├── docs/             # Tài liệu dự án
└── output/           # Folder chứa file kết quả
```
