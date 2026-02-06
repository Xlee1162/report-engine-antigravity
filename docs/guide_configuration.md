# Hướng dẫn Cấu hình Báo cáo (Config Guide)

File cấu hình là "trái tim" của hệ thống này. Tất cả logic về lấy dữ liệu, xử lý Excel, vẽ biểu đồ và gửi mail đều được định nghĩa ở đây.

...

## 3. Render Blocks (Nội dung Email)

Phần này định nghĩa nội dung HTML body của email.

```javascript
render_blocks: [
    // 1. Render Bảng (Table)
    {
        id: 'table_1',
        type: 'table',
        render: 'html',
        dataset: 'ds_sales',
        order: 1,
        options: {
            headers: ['Sản phẩm', 'Doanh thu'],
        },
    },

    // 2. Render Biểu đồ (Image) - Dùng Snapshot Service
    {
        id: 'chart_1',
        type: 'chart',
        render: 'image', // Bắt buộc
        sheet: 'Summary', // Tên Sheet trong Excel
        order: 2,
        options: {
            chartName: 'SalesChart', // Tên Chart trong Excel
            align: 'center',
            style: 'width: 600px;',
        },
    },
];
```

**Lưu ý về Biểu đồ (Image):**

-   Yêu cầu hệ thống đã cấu hình kết nối tới **Snapshot Service** (Windows).
-   Công cụ sẽ tự động xuất ảnh chart từ Excel và nhúng vào email (`cid:chart_1`).

...

## 5. Mail Configuration

(Đã cập nhật SMTP và Fallback, xem tài liệu trước)
