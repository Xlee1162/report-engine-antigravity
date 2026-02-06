# Plan & Future Roadmap

Tài liệu này ghi nhận trạng thái phát triển và lộ trình tiếp theo của **Report Engine Framework**.

---

## 1. Trạng thái hiện tại

### ✅ Đã hoàn thành (Done)

-   **Core Engine**: Config Loader, MongoDB Aggregation, Excel Generator (.xlsx/.xlsb), Render Block Engine.
-   **Scheduler**: Cron-based scheduling.
-   **Database Queue**: MongoDB-based Job Queue với khả năng Scaling.
-   **Mail System**: SMTP (Nodemailer) & Fallback EXE.
-   **Resiliency**: Retry Mechanism, Queue Recovery, Persistent Logs.
-   **API Server**: Express API.

---

## 2. Roadmap tiếp theo

### Phase 2.1: Snapshot Service (Excel Chart Rendering) - **IN PROGRESS**

-   **Kiến trúc**: Microservice chạy trên Windows Server, sử dụng .NET Framework 4.8.
-   **Công nghệ**: C# + Excel COM Interop.
-   **Nhiệm vụ**: Nhận file Excel -> Mở bằng Excel -> Export Chart ra ảnh -> Trả về cho Node.js Engine.
-   **Giao tiếp**: HTTP API (Node.js gọi Localhost hoặc Server IP).

### Phase 4: Full Web UI (Frontend)

-   [ ] Xây dựng giao diện Dashboard (React/Vue).
-   [ ] Config Builder & Preview.

### Phase 5: Production Readiness

-   [ ] **Monitoring**: Prometheus/Grafana.
-   [ ] **Installer**: Đóng gói toàn bộ (Node.js + C# Service) thành 1 bộ cài Windows (MSI).
