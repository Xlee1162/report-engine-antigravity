# Kiến trúc & Luồng xử lý

## 1. High-Level Architecture (Hybrid)

Hệ thống hoạt động theo mô hình Hybrid (Node.js + C#) để tận dụng sức mạnh của cả hai:

```
[Cron Scheduler] --> [MongoDB Queue] --> [Node.js Worker] --(HTTP/7000)--> [C# Snapshot Service]
                                              |                                   |
                                              |                                [Excel COM]
                                              v                                   |
                                         [Email/SMTP] <--(Image/PNG)--------------|
```

## 2. Các thành phần chính

-   **Report Engine (Node.js)**: Orchestrator chính. Quản lý Data, Logic, Excel Generation (Data Filling).
-   **Snapshot Service (C# .NET)**: Worker chuyên dụng chạy trên Windows. Chỉ làm nhiệm vụ mở file Excel đã có data và chụp ảnh các Chart.

## 3. Luồng xử lý chi tiết (Updated)

1.  **Worker (Node)** nhận job.
2.  **Worker** fetch data Mongo -> Tạo file Excel (dùng `exceljs`).
3.  **Worker** quét thấy config có `render: "image"`.
4.  **Worker** gửi request (POST) kèm đường dẫn file Excel sang **Snapshot Service**.
5.  **Snapshot Service** (Windows) mở Excel (Background), export Chart ra file ảnh PNG, trả về OK.
6.  **Worker** đọc file ảnh, đính kèm vào Email (Inline Attachments).
7.  **Worker** gửi mail hoàn tất.

## 4. Scaling

-   **Node.js Workers**: Scale thoải mái (N process).
-   **Snapshot Service**: Scale bằng cách chạy nhiều instance trên nhiều server Windows khác nhau (cần Load Balancer hoặc cấu hình IP riêng cho từng nhóm worker).
