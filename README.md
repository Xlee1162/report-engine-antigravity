# Report Engine Framework (Mongo + Excel + Queue + Snapshot)

Report Engine Framework là một hệ thống **Config-Driven** giúp tự động hóa việc xuất báo cáo từ MongoDB ra Excel và Email. Hệ thống hỗ trợ kiến trúc **Producer-Consumer** với Queue bền vững và tích hợp **Snapshot Service** để render biểu đồ Excel.

## 🚀 Tính năng chính

-   **Config-Driven**: Mọi logic nằm trong file JSON/JS config.
-   **MongoDB Aggregation**: Xử lý dữ liệu bằng Pipeline mạnh mẽ (có Retry).
-   **Excel Engine**: Hỗ trợ template `.xlsx` và `.xlsb`.
-   **Snapshot Service (New)**: Microservice C# chạy trên Windows giúp render Chart từ Excel ra ảnh (PNG) chính xác 100%.
-   **Job Queue (Persistent)**: Hàng đợi MongoDB, hỗ trợ Scaling và Recovery.
-   **Advanced Mail**: Gửi mail SMTP hoặc Fallback EXE, hỗ trợ đính kèm ảnh Chart inline.
-   **Enterprise API**: API Server quản lý Config và Trigger báo cáo.

## 📚 Tài liệu chi tiết

-   **[Hướng dẫn Cấu hình (Schema)](docs/guide_configuration.md)**
-   **[Kiến trúc hệ thống (Architecture)](docs/guide_architecture.md)**
-   **[Hướng dẫn Queue & Scaling](docs/guide_queue_api.md)**
-   **[Snapshot Service (Deployment Guide)](docs/guide_snapshot_service.md)** (New): Hướng dẫn cài đặt service render ảnh trên Windows.

## 🛠 Cài đặt & Vận hành

### 1. Report Engine (Node.js - Linux/Windows)

```bash
# Cài đặt
npm install

# Chạy Scheduler (Producer)
node src/app.js schedule ./configs

# Chạy Worker (Consumer)
node src/app.js worker

# Chạy API
node src/app.js api
```

### 2. Snapshot Service (C# - Windows Only)

Yêu cầu máy chủ Windows có cài Microsoft Office (Excel).

1.  Build project trong `src/snapshot-service/`.
2.  Chạy `SnapshotService.exe` (Port mặc định: 7000).
3.  Cấu hình Node.js kết nối: `SNAPSHOT_SERVICE_URL=http://<windows-ip>:7000`.

## 📂 Cấu trúc dự án

```
report-engine/
├── src/
│   ├── api/              # Express API Server
│   ├── core/             # Pipeline & Snapshot Client
│   ├── excel/            # Excel Generator
│   ├── mail/             # Mail Sender (SMTP/Fallback)
│   ├── mongo/            # DB & Audit
│   ├── queue/            # Persistent Job Queue
│   ├── snapshot-service/ # (C#) Source code Snapshot Service
│   └── worker.js         # Worker entry point
├── docs/                 # Tài liệu hướng dẫn
└── output/               # Kết quả báo cáo
```
