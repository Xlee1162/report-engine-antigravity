# Hướng dẫn: Excel Engine & Template

Report Engine xử lý file Excel theo 2 cơ chế khác nhau tùy thuộc vào định dạng file.

## 1. Standard Mode (.xlsx)

Đây là chế độ đầy đủ tính năng nhất, sử dụng thư viện `exceljs`.

### Quy trình:

1.  **Load Template**: Mở file `.xlsx` mẫu.
2.  **Inject Data**:
    -   Dựa vào `dataset_map` trong config.
    -   Tìm Sheet và ô bắt đầu (VD: `A2`).
    -   Ghi mảng dữ liệu (JSON) vào các dòng tiếp theo.
3.  **Save**: Lưu thành file mới trong thư mục `output/`.

### Khi nào dùng?

-   Báo cáo cần số liệu chi tiết để người dùng filter/pivot.
-   Template đơn giản, không chứa Macro phức tạp hoặc Binary data.

---

## 2. Opaque Mode (.xlsb)

File `.xlsb` (Excel Binary) xử lý nhanh hơn và hỗ trợ Macro tốt hơn, nhưng **rất khó để parse/write bằng thư viện JS**. Do đó, Engine sử dụng chế độ "Opaque" (Hộp đen).

### Quy trình:

1.  **Detect**: Nhận diện đuôi file là `.xlsb`.
2.  **Bypass**: Bỏ qua toàn bộ bước đọc/ghi dữ liệu.
3.  **Copy**: Copy nguyên vẹn file template sang thư mục output.
4.  **Log Warning**: Ghi log cảnh báo rằng dữ liệu chưa được ghi vào file Excel.

### Khi nào dùng?

-   Template có chứa VBA Macro phức tạp.
-   File mẫu dùng làm công cụ tính toán riêng, Engine chỉ đóng vai trò phân phối file này đến user.
-   Dữ liệu báo cáo chủ yếu xem trên **Email Body** (HTML), file đính kèm chỉ là phụ hoặc file tĩnh.

## 3. Cấu hình Mapping

```javascript
excel: {
    dataset_map: [
        {
            dataset: 'tên_dataset_trong_config',
            sheet: 'Tên Sheet',
            start_cell: 'A1',
            include_header: true, // Tự động ghi tên cột vào dòng đầu tiên
        },
    ];
}
```
