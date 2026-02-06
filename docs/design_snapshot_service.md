# Design: Snapshot Service (C# .NET 4.8)

## 1. Tổng quan

Service chạy nền trên Windows (Windows Service hoặc Console App), chịu trách nhiệm mở file Excel thông qua COM Interop và xuất các Chart/Range thành file ảnh.

## 2. Công nghệ

-   **Language**: C#
-   **Runtime**: .NET Framework 4.8 (Tương thích tốt nhất với Excel COM cũ/ổn định).
-   **Dependencies**: `Microsoft.Office.Interop.Excel`.
-   **Server**: `HttpListener` (Simple HTTP Server, không cần IIS).

## 3. Kiến trúc Project

Thư mục: `src/snapshot-service/`

```
SnapshotService.sln
SnapshotService/
├── Program.cs             // Entry point
├── App.config             // Config (Port, TempDir)
├── Service/
│   ├── HttpServer.cs      // Lắng nghe request từ Node.js
│   ├── JobQueue.cs        // BlockingCollection queue
│   └── SnapshotWorker.cs  // Thread xử lý Excel COM (STA Thread)
├── Core/
│   ├── ExcelHost.cs       // Wrapper quản lý Excel App instance
│   └── ComHelper.cs       // Release COM object an toàn
└── Models/
    ├── SnapshotRequest.cs // JSON Payload
    └── SnapshotResponse.cs
```

## 4. API Contract

**POST /snapshot**

-   **Request Body**:

    ```json
    {
        "inputPath": "C:\\path\\to\\report.xlsx",
        "items": [
            {
                "type": "chart", // or "range"
                "sheet": "Summary",
                "name": "SalesChart", // Chart Name in Excel
                "outputPath": "C:\\path\\to\\output_chart.png"
            }
        ]
    }
    ```

-   **Logic Xử lý**:
    1.  Nhận Request, validate file tồn tại.
    2.  Đẩy vào `BlockingCollection<SnapshotRequest>`.
    3.  Worker (Single Thread STA) lấy job ra.
    4.  Mở Excel (Hidden), Open Workbook.
    5.  Loop items -> Export ảnh.
    6.  Close Workbook (No Save).
    7.  Trả về `200 OK`.

## 5. Tích hợp vào Report Engine (Node.js)

Thêm `image-renderer` mới:

-   Nếu block type là `chart` và render mode `image`:
-   Gửi HTTP POST sang `http://localhost:port/snapshot`.
-   Nhúng ảnh result vào HTML (`<img src="cid:..." />`).

## 6. Lưu ý Cực Quan Trọng (Excel COM)

-   **Single Thread**: Chỉ chạy 1 Excel Instance xử lý tuần tự.
-   **Cleanup**: Phải gọi `Marshal.ReleaseComObject` cho từng object (Chart, Sheet, Workbook, App) để tránh ghost process.
-   **Error Handling**: Nếu Excel treo, process phải tự kill Excel và restart instance.
