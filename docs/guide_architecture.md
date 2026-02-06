# Kiến trúc & Luồng xử lý

Tài liệu này mô tả cách Report Engine hoạt động "dưới nắp capo".

## 1. High-Level Architecture (Updated)

Hệ thống hoạt động theo mô hình **Producer-Consumer**:

```
[Scheduler] ---> [MongoDB Queue] ---> [Worker] ---> [Pipeline]
     ^                                                  |
     |                                                  v
[API Server] -----------------------------------> [Audit Logs]
```

## 2. Luồng xử lý chi tiết

### Giai đoạn 1: Scheduling (Producer)

1.  **Scheduler** đọc config, đặt lịch Cron.
2.  Khi đến giờ, Scheduler gọi `JobQueue.addJob()`.
3.  Một document (Job) được tạo trong collection `job_queue` với trạng thái `pending`.

### Giai đoạn 2: Execution (Consumer)

1.  **Worker** liên tục polling (hoặc change stream) collection `job_queue`.
2.  Tìm job `pending`, chuyển sang `processing` (Atomic Lock).
3.  Khởi tạo **ReportPipeline** với config từ Job.
4.  pipeline chạy qua các bước:
    -   **Audit Start**: Ghi log vào `report_run_logs`.
    -   **Data Fetching**: Lấy dữ liệu MongoDB (có Retry).
    -   **Excel**: Tạo file báo cáo.
    -   **Render**: Tạo nội dung Email.
    -   **Mail**: Gửi email.
    -   **Audit End**: Cập nhật log thành Success/Failed.
5.  Worker cập nhật Job thành `completed` hoặc `failed`.

## 3. Core Modules (Updated)

-   `src/queue/job-queue.js`: Quản lý thao tác với Queue (Add, Get Next, Complete, Fail).
-   `src/mongo/audit-logger.js`: Ghi nhật ký chạy báo cáo phục vụ tra cứu lịch sử.
-   `src/worker.js`: Vòng lặp vô hạn của Consumer.
-   `src/api/server.js`: Express Server phục vụ Web UI.

Các module cũ (`Pipeline`, `ExcelGenerator`, `BlockEngine`) vẫn giữ nguyên chức năng cốt lõi là xử lý logic nghiệp vụ một khi được Worker kích hoạt.
