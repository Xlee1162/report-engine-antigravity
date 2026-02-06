# Hướng dẫn: Snapshot Service (C#)

**Snapshot Service** là một thành phần Microservice chạy trên Windows, chịu trách nhiệm mở file Excel bằng **Microsoft Excel (COM)** để chụp ảnh các Biểu đồ (Chart) hoặc Vùng dữ liệu (Range) và trả về cho Report Engine.

Tại sao phải dùng? Vì các thư viện Node.js (như `exceljs`) **không thể render** được biểu đồ Excel ra ảnh. Chỉ có Excel thật mới làm được điều này chính xác nhất.

---

## 1. Yêu cầu hệ thống (Server Windows)

-   **OS**: Windows 10, Windows 11, hoặc Windows Server (2016+).
-   **Software**: Microsoft Office (Excel) đã được cài đặt và activated.
-   **Runtime**: .NET Framework 4.8.

## 2. Cài đặt & Build

Source code nằm tại: `src/snapshot-service/SnapshotService/`.

### Bước 1: Build

Sử dụng Visual Studio (2019/2022) mở file solution (hoặc tạo từ source):

1.  Mở project.
2.  Restore NuGet Packages (nếu có).
3.  Build chế độ **Release**.

### Bước 2: Deploy

Copy thư mục `bin/Release` sang máy chủ Windows đích (VD: `C:\Tools\SnapshotService`).

### Bước 3: Cấu hình

File `SnapshotService.exe.config` (hoặc `App.config` trước khi build):

-   Cổng mặc định: `7000`.
-   Cần mở Firewall cho cổng 7000 nếu gọi từ server khác.

## 3. Chạy Service

Chạy file `SnapshotService.exe` dưới quyền Administrator (để mở HTTP Listener).

```cmd
C:\Tools\SnapshotService\SnapshotService.exe
```

Console hiện: `HTTP Server started on port 7000` là thành công.

---

## 4. Tích hợp với Node.js Report Engine

Trên server chạy Node.js (Report Engine), cấu hình biến môi trường trong `.env`:

```env
SNAPSHOT_SERVICE_URL=http://<IP_MAY_WINDOWS>:7000
```

Nếu chạy chung trên 1 máy Windows: `http://localhost:7000`.

## 5. Sử dụng trong Config Báo cáo

Để lấy ảnh biểu đồ, trong `render_blocks` của file config JSON/JS:

```javascript
render_blocks: [
    {
        id: 'sales_chart_img',
        type: 'chart', // Loại block
        render: 'image', // Quan trọng: render ra ảnh
        dataset: '...', // (Không quan trọng với type chart)
        sheet: 'Summary', // Tên Sheet chứa biểu đồ
        options: {
            chartName: 'Chart 1', // Tên biểu đồ trong Excel (Click chuột phải vào chart -> xem Name box)
            style: 'width: 100%;', // CSS styling cho thẻ <img> trong email
        },
        order: 1,
    },
];
```

## 6. Lưu ý quan trọng

-   **Single Thread**: Service xử lý job tuần tự để tránh treo Excel. Nếu gửi 10 file cùng lúc, file thứ 10 phải chờ các file trước xong.
-   **Màn hình tắt**: Trên server, cần đảm bảo user đang login (hoặc cấu hình DCOM đặc biệt) để Excel có thể render GUI (kể cả khi hidden).
