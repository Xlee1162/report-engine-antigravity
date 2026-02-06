# Plan & Future Roadmap

Tài liệu này ghi nhận trạng thái phát triển và lộ trình tiếp theo của **Report Engine Framework**.

---

## 1. Trạng thái hiện tại

### ✅ Đã hoàn thành (Done)

-   **Core Engine**: Config Loader, Mongo Pipeline, Excel Generator.
-   **Queue System**: MongoDB Persistent Queue, Recovery, Scaling.
-   **Mail System**: SMTP, Fallback EXE, và **Inline Chart Images**.
-   **Snapshot Service**: Microservice C# hỗ trợ render chart từ Excel chuẩn 100%.
-   **API Server**: Backend cho Web UI.

---

## 2. Roadmap tiếp theo

### Phase 4: Full Web UI (Frontend) - **NEXT**

-   [ ] **Dashboard**: Giao diện quản lý báo cáo (React/Vue).
-   [ ] **Config Editor**: Trình soạn thảo cấu hình JSON trực quan.
-   [ ] **Job Monitor**: Xem trạng thái Queue realtime.

### Phase 5: Production Readiness (DevOps)

-   [ ] **Monitoring**: Prometheus/Grafana dashboard cho Queue/Service.
-   [ ] **CI/CD**: Pipeline build tự động cho cả Node.js và C#.
