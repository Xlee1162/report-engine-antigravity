# Phân tích: Snapshot Service cho Excel Chart Rendering

Tài liệu này phân tích đề xuất xây dựng **Snapshot Service** (C# .NET + Excel COM) để giải quyết bài toán render biểu đồ từ file Excel.

## 1. Đánh giá giải pháp

### Ưu điểm (Pros)

-   **Độ chính xác tuyệt đối (WYSIWYG)**: Sử dụng chính Microsoft Excel để render, nên ảnh đầu ra sẽ y hệt như những gì bạn thấy trên màn hình (đúng font, màu sắc, effect, 3D...).
-   **Hỗ trợ mọi loại Chart**: Excel có hàng trăm loại chart và option phức tạp mà các thư viện như `chartjs` hay `exceljs` không thể mô phỏng hết được.
-   **Tận dụng Template cũ**: Doanh nghiệp thường có sẵn hàng tá file mẫu Report Excel. Giải pháp này giúp tái sử dụng chúng mà không cần code lại biểu đồ bằng code.

### Nhược điểm (Cons) & Thách thức

-   **Phụ thuộc Windows & Office**: Bắt buộc phải chạy trên Windows có cài MS Excel. (Backend hiện tại đang chạy trên Linux/Node.js -> Cần mô hình Distributed).
-   **Hiệu năng**: Mở Excel process rất nặng và chậm. Khó xử lý realtime số lượng lớn (High throughput).
-   **License**: Cần bản quyền Office cho server.

## 2. So sánh với giải pháp khác

| Tiêu chí          | Snapshot Service (Excel COM)    | ChartJS / Re-draw (Node.js)      |
| :---------------- | :------------------------------ | :------------------------------- |
| **Độ chính xác**  | 100% (Y hệt Excel)              | 70-80% (Mô phỏng lại)            |
| **Nguồn dữ liệu** | Lấy từ file Excel có sẵn        | Phải query data và vẽ lại từ đầu |
| **Môi trường**    | **Windows ONLY**                | Cross-platform (Linux/Docker)    |
| **Tốc độ**        | Chậm (giây/phút)                | Rất nhanh (mili-giây)            |
| **Độ phức tạp**   | Cao (Cần quản lý Process Excel) | Trung bình                       |

## 3. Kiến trúc tích hợp đề xuất

Do Core Engine hiện tại (Node.js) đang chạy trên Linux (theo context hiện tại), còn Snapshot Service bắt buộc chạy Windows, ta cần kiến trúc **Client-Server**:

```
[Linux Server]                       [Windows Server]
(Report Engine)                      (Snapshot Service)
      |                                     |
      |--- POST /snapshot (File) ---------->|
      |                                     | [Queue] -> [Worker] -> [Excel COM]
      |<-- Returns Image (PNG) -------------|
      |                                     |
    (Embed Image to Email)
```

### Flow chi tiết:

1.  **Report Engine**: Tạo file Excel (`.xlsx`) chứa dữ liệu bằng `exceljs` (đã có).
2.  **Report Engine**: Gửi file Excel này sang **Snapshot Service** kèm yêu cầu: "Chụp ảnh Chart tên là 'SalesChart' ở Sheet 'Summary'".
3.  **Snapshot Service**:
    -   Nhận file, lưu tạm.
    -   Worker mở Excel, load file.
    -   Tìm Chart, dùng lệnh `.Export("path.png")`.
    -   Trả về file ảnh.
4.  **Report Engine**: Nhận ảnh, nhúng vào HTML body (`cid:image`).

## 4. Kết luận

Giải pháp **Snapshot Service** là con đường **duy nhất** nếu yêu cầu là "Lấy chart **TRONG** Excel". Các thư viện Node.js hiện tại không thể đọc và render object Chart từ file Excel.

### Đề xuất lộ trình (Phase 2 Update)

Nếu bạn chọn hướng này, chúng ta sẽ cần:

1.  Giữ nguyên Report Engine (Node.js) làm Orchestrator.
2.  Xây dựng thêm repo `snapshot-service` (C# .NET) chạy trên Windows.
3.  Report Engine sẽ gọi Snapshot Service qua HTTP API.
