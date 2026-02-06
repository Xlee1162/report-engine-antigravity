# Plan & Future Roadmap

Tài liệu này ghi nhận trạng thái phát triển và lộ trình tiếp theo của **Report Engine Framework**.

---

## 1. Trạng thái hiện tại

### ✅ Đã hoàn thành (Done)

-   **Core Engine**: Config Loader, MongoDB Aggregation, Excel Generator (.xlsx/.xlsb), Render Block Engine.
-   **Scheduler**: Cron-based scheduling.
-   **Database Queue**: MongoDB-based Job Queue với khả năng **Horizontal Scaling** (chạy nhiều Worker song song).
-   **Advanced Mail**:
    -   Hỗ trợ SMTP (Nodemailer).
    -   Hỗ trợ **Fallback EXE** (gọi tool ngoài nếu SMTP lỗi).
-   **Resiliency (Độ bền vững)**:
    -   **Retry Logic**: Tự động thử lại khi truy vấn Data lỗi.
    -   **Queue Recovery**: Tự động quét và đánh dấu lỗi các job bị treo (Pending/Processing) quá 90 phút.
    -   **Persistent Logs**: Lưu lịch sử chạy đầy đủ.
-   **API Server**: Phục vụ xem/sửa config và kích hoạt báo cáo.

---

## 2. Hạn chế còn tồn tại (Limitations)

### 2.1. Excel Chart Rendering

-   **Vấn đề**: `exceljs` không hỗ trợ render Chart ra ảnh.
-   **Hiện trạng**: Email body chưa có biểu đồ thật (chỉ là placeholder).
-   **Giải pháp (Phase 2)**: Tích hợp thư viện vẽ chart phía server (ChartJS Canvas) hoặc Headless Browser.

---

## 3. Roadmap tiếp theo

### Phase 2: Advanced Rendering (Biểu đồ) - **NEXT**

-   [ ] **Chart Rendering**: Sử dụng `chartjs-node-canvas` để vẽ biểu đồ từ dữ liệu JSON và nhúng vào Email.
-   [ ] **Dynamic Report Params**: API hỗ trợ truyền tham số động (VD: `runtimeParams`) khi gọi Trigger Run.

### Phase 4: Full Web UI (Frontend)

-   [ ] Xây dựng giao diện Dashboard (React/Vue) kết nối với API Server đã có.
-   [ ] Tính năng kéo thả Config Builder.
-   [ ] Xem trước mẫu báo cáo (Preview).

### Phase 5: Production Readiness (DevOps)

-   [ ] **Dockerize**: Đóng gói Scheduler, Worker, API thành các container riêng biệt.
-   [ ] **Monitoring**: Tích hợp Prometheus/Grafana để theo dõi Queue Lag và Error Rate.
