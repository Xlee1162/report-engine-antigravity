# Hướng dẫn Cấu hình Báo cáo

Mỗi báo cáo được định nghĩa bởi một file `.js` hoặc `.json`. Engine sẽ đọc file này để biết cần lấy dữ liệu gì, trình bày ra sao và gửi cho ai.

## Cấu trúc Cấu hình (Schema)

Một file config đầy đủ bao gồm các phần sau:

```javascript
module.exports = {
    report_id: 'daily_production', // Mã báo cáo (duy nhất)
    schedule: '0 8 * * *', // Cron: Chạy lúc 8:00 AM hàng ngày
    timezone: 'Asia/Ho_Chi_Minh',

    // 1. Định nghĩa Dữ liệu (MongoDB)
    datasets: [
        {
            name: 'summary_data', // Tên dataset dùng để tham chiếu sau này
            collection: 'logs', // Collection trong MongoDB
            // Pipeline Aggregation chuẩn của MongoDB
            pipeline: [
                { $match: { status: 'completed' } },
                { $group: { _id: '$machine', qty: { $sum: '$quantity' } } },
            ],
        },
    ],

    // 2. Định nghĩa Excel Output
    excel: {
        template: 'templates/daily_template.xlsx', // Đường dẫn template (optional)
        dataset_map: [
            {
                dataset: 'summary_data', // Lấy dữ liệu từ dataset nào
                sheet: 'Sheet1', // Ghi vào Sheet nào
                start_cell: 'A2', // Ô bắt đầu ghi
                include_header: false, // Có ghi dòng tiêu đề không?
            },
        ],
    },

    // 3. Định nghĩa Nội dung Email (Render Blocks)
    render_blocks: [
        {
            id: 'main_table',
            type: 'table', // Loại: table | chart | mixed
            render: 'html', // Mode: html | image
            dataset: 'summary_data', // Dữ liệu để render
            order: 1,
        },
    ],

    // 4. Cấu hình gửi Mail
    mail: {
        to: ['manager@example.com'],
        subject: 'Báo cáo Sản xuất Hàng ngày',
        attach_excel: true,
    },
};
```

## Giải thích chi tiết

### 1. `datasets` (MongoDB Aggregation)

Thay vì SQL, chúng ta dùng **Aggregation Pipeline**.

-   Engine sẽ thực thi pipeline này và lưu kết quả vào bộ nhớ với tên `name`.
-   Có thể dùng tham số động (ví dụ `{{date}}`) nếu Engine hỗ trợ inject runtime params (tính năng nâng cao).

### 2. `excel` (Excel Generator)

-   **Template**:
    -   Nếu là `.xlsx`: Engine dùng `exceljs` để mở và ghi dữ liệu.
    -   Nếu là `.xlsb`: Engine kích hoạt chế độ **Opaque**. Chỉ copy file template sang output, **không** ghi dữ liệu vào (do hạn chế thư viện). Dữ liệu tính toán chỉ dùng để render mail.
-   **dataset_map**: Ánh xạ dữ liệu vào file Excel.

### 3. `render_blocks` (Trình bày)

Đây là phần cốt lõi của "Block-Based Framework". Nội dung email là tập hợp các block được xếp chồng lên nhau.

-   `type: 'table'`: Render dữ liệu thành HTML Table.
-   `type: 'chart'`: (Hiện tại) Render placeholder hoặc ảnh (nếu tich hợp tool chụp ảnh).
-   `render: 'html'`: Tối ưu cho email client.

### 4. `mail`

-   Block `to`, `cc`, `bcc` hỗ trợ mảng các email.
-   `attach_excel`: Tự động đính kèm file Excel đã tạo ở bước trên.
