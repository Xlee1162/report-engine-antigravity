# Hướng dẫn: Queue & API System

Report Engine Framework V2 chuyển sang kiến trúc **Producer-Consumer** sử dụng MongoDB làm hàng đợi (Queue). Điều này giúp hệ thống bền vững hơn (Persistent Queue) so với việc chạy trực tiếp in-memory.

---

## 1. Hệ thống Queue (`job_queue`)

### Kiến trúc

-   **Producer (Scheduler)**: Khi đến giờ chạy (theo Cron), Scheduler **không** chạy báo cáo ngay. Thay vào đó, nó tạo một bản ghi Job (status: `pending`) vào collection `job_queue` trong MongoDB.
-   **Consumer (Worker)**: Một process riêng biệt (Worker) liên tục quét DB tìm job `pending`. Khi thấy, nó lock job (status: `processing`) và gọi Pipeline để thực thi.
-   **Persistence**: Mọi job được lưu trong DB. Nếu server restart, job chưa làm xong sẽ vẫn còn đó để xử lý tiếp (cần logic reset job treo - _future feature_).

### Lệnh vận hành

-   Chạy Scheduler (chỉ đẩy job): `node src/app.js schedule ./configs`
-   Chạy Worker (chỉ xử lý job): `node src/app.js worker`

---

## 2. API Server

Hệ thống cung cấp REST API để tích hợp với Web UI hoặc các hệ thống khác.

**Khởi động:** `node src/app.js api` (Port mặc định: 3000)

### Endpoints

#### 2.1. Quản lý Config

-   **GET `/api/configs`**

    -   Mô tả: Lấy danh sách tất cả file config trong thư mục `./configs`.
    -   Response: `["report1.json", "report2.js"]`

-   **GET `/api/configs/:filename`**

    -   Mô tả: Đọc nội dung file config.
    -   Response: JSON Content của file config.

-   **PUT `/api/configs/:filename`**
    -   Mô tả: Cập nhật nội dung config.
    -   _Lưu ý: Chỉ hỗ trợ update file `.json`. File `.js` chỉ đọc._
    -   Body: JSON Config mới.

#### 2.2. Lịch sử & Kích hoạt

-   **GET `/api/history`**

    -   Mô tả: Lấy nhật ký chạy từ `report_run_logs`.
    -   Params: `?limit=20&skip=0`
    -   Response: Danh sách log (start_time, status, error...).

-   **POST `/api/run/:filename`**
    -   Mô tả: **Trigger Now**. Kích hoạt chạy báo cáo ngay lập tức bằng cách đẩy một Job mới vào Queue.
    -   Response: `{ "message": "Job queued", "jobId": "..." }`

---

## 3. Câu hỏi thường gặp

-   **Tại sao dùng MongoDB làm Queue?**
    -   Để tận dụng hạ tầng có sẵn.
    -   Dữ liệu đồng nhất và bền vững.
-   **Tôi có thể chạy nhiều Worker không?**
    -   Có (`job_queue` hỗ trợ atomic lock). Tuy nhiên, cần chú ý cấu hình MongoDB connection pool nếu scale quá lớn.
