# Plan & Future Roadmap

Tài liệu này ghi nhận trạng thái phát triển và lộ trình tiếp theo của **Report Engine Framework**.

---

## 1. Trạng thái hiện tại

### ✅ Đã hoàn thành (Done)

-   **Core Engine**: Config Loader, MongoDB Aggregation, Excel Generator (.xlsx/.xlsb), Render Block Engine.
-   **Scheduler**: Cron-based scheduling.
-   **Database Queue**: MongoDB-based Job Queue (`job_queue`).
-   **Worker**: Consumer xử lý job tách biệt.
-   **API Server**: Express API (`/configs`, `/run`, `/history`) phục vụ Web UI.
-   **Hardening**:
    -   Retry Mechanism cho MongoDB Executor.
    -   Persistent Audit Logs (`report_run_logs`).

---

## 2. Hạn chế còn tồn tại (Limitations)

### 2.1. Excel Chart Rendering

-   **Vấn đề**: `exceljs` không hỗ trợ render Chart ra ảnh.
-   **Hiện trạng**: Email body chưa có biểu đồ thật (chỉ là placeholder).
-   **Giải pháp (Phase 2)**: Tích hợp thư viện vẽ chart phía server (ChartJS Canvas) hoặc Headless Browser.

### 2.2. Real Mail Sender

-   **Vấn đề**: Module `MailSender` vẫn đang là **Mock** (ghi ra file HTML debug), chưa gửi email thật.
-   **Giải pháp (Phase 1 Follow-up)**: Cần tích hợp SMTP (Nodemailer).

### 2.3. Queue Recovery

-   **Vấn đề**: Nếu Worker đang xử lý (`status: processing`) mà bị crash đột ngột, job đó sẽ bị treo mãi mãi ở trạng thái `processing`.
-   **Giải pháp**: Cần một tiến trình "Health Check" để reset các job `processing` quá lâu (timeout) về `pending`.

---

## 3. Roadmap tiếp theo

### Phase 2: Advanced Rendering (Nâng cao trải nghiệm) - **NEXT**

-   [ ] **Chart Rendering**: Sử dụng `chartjs-node-canvas` để vẽ biểu đồ từ dữ liệu JSON và nhúng vào Email.
-   [ ] **Dynamic Report Params**: API hỗ trợ truyền tham số động (VD: `runtimeParams`) khi gọi Trigger Run.

### Phase 4: Full Web UI (Frontend)

-   [ ] Xây dựng giao diện Dashboard (React/Vue) kết nối với API Server đã có.
-   [ ] Tính năng kéo thả Config Builder.
-   [ ] Xem trước mẫu báo cáo (Preview).

### Phase 5: Production Readiness

-   [ ] **Real Mail Sender**: Tích hợp SMTP.
-   [ ] **Queue Recovery**: Xử lý stuck jobs.
-   [ ] **Dockerize**: Đóng gói Scheduler, Worker, API thành các container.
