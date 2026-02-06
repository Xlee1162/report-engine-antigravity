# Hướng dẫn: Queue & API System

Report Engine Framework V2 chuyển sang kiến trúc **Producer-Consumer** sử dụng MongoDB làm hàng đợi (Queue). Điều này giúp hệ thống bền vững hơn (Persistent Queue) và hỗ trợ **Horizontal Scaling**.

---

## 1. Hệ thống Queue (`job_queue`)

### Kiến trúc & Scaling

-   **Producer (Scheduler)**: Chỉ có nhiệm vụ tạo job. Rất nhẹ.
-   **Consumer (Worker)**: Thực thi logic nặng (Excel, Zip, Mail).
    -   **Scaling**: Bạn có thể bật **N** Worker process song song. Nhờ cơ chế `Atomic Lock` của MongoDB, các worker sẽ tự động chia việc mà không tranh chấp.
    -   _Khuyến nghị_: Chạy số lượng Worker tương đương số Core CPU nếu tác vụ nặng về tính toán.

### Cơ chế Tự phục hồi (Recovery)

Hệ thống có tích hợp sẵn "Janitor" (người dọn dẹp) chạy trong Scheduler:

-   **Pending Timeout**: Nếu job chờ quá 90 phút (do worker chết hoặc quá tải) -> Đánh dấu Failed.
-   **Processing Timeout**: Nếu job đang chạy quá 90 phút (do worker crash/stuck) -> Đánh dấu Failed.

Tùy chỉnh thời gian timeout bằng env var `QUEUE_JOB_TTL`.

### Lệnh vận hành

-   Chạy Scheduler: `node src/app.js schedule ./configs`
-   Chạy 1 Worker: `node src/app.js worker`
-   Chạy 4 Workers (Production): `pm2 start src/app.js --name "worker" -i 4 -- worker`

---

## 2. API Server

Hệ thống cung cấp REST API để tích hợp với Web UI hoặc các hệ thống khác.

**Khởi động:** `node src/app.js api` (Port mặc định: 3000)

(Thông tin API endpoint giữ nguyên như phiên bản trước...)
