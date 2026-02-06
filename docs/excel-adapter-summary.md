# Excel Adapter Summary

## Mục tiêu
- Adapter phải **trừu tượng**, không phụ thuộc vào khả năng Excel.
- Engine **không** giả định sheet cố định, không Excel làm source of truth.
- Template có thể **không tồn tại**.
- `.xlsb` được xem là **opaque** (không parse).

## Logic hiện tại
### ExcelAdapter
- Dùng `exceljs` cho `.xlsx`.
- Nếu template là `.xlsb`: **chỉ copy template** sang output và log cảnh báo (không ghi dataset).
- Ghi dữ liệu theo `dataset_map` hoặc tự động tạo sheet theo tên dataset.
- Không render mail content, không quyết định summary.

### SnapshotAdapter
- Render **ảnh PNG** từ range cho `.xlsx` bằng ExcelJS + SVG + Sharp.
- Với `.xlsb`: trả ảnh placeholder và log cảnh báo.

## Các file liên quan
- Excel adapter: [excel/excel-adapter.js](../excel/excel-adapter.js)
- Snapshot adapter: [render/snapshot-adapter.js](../render/snapshot-adapter.js)
- Image renderer (gọi snapshot): [render/image-renderer.js](../render/image-renderer.js)
- Ví dụ config: [config/c021-quality-report.json](../config/c021-quality-report.json)

## Quy ước config quan trọng
- `excel.template`: đường dẫn template (tương đối hoặc tuyệt đối).
- `excel.output_path`: đường dẫn output (nếu muốn cố định).
- `excel.dataset_map[]`:
  - `dataset`: tên dataset trong SQL result
  - `sheet`: tên sheet đích
  - `start_cell`: ô bắt đầu (ví dụ: A1)
  - `include_header`: true/false

## Đã làm được gì
- Adapter `.xlsx` hoàn chỉnh: load template, ghi dataset, xuất file.
- `.xlsb` xử lý đúng rule: copy opaque, không parse, không viết dữ liệu.
- SnapshotAdapter hoạt động cho `.xlsx` (PNG từ range).

## Lưu ý quan trọng
- `.xlsb` **không** hỗ trợ ghi dữ liệu hoặc snapshot thật.
- Snapshot hiện tại chỉ là **bảng text** render từ cell values, không tái tạo style/chart.
- Nếu muốn ảnh chart thật, cần tool khác (ví dụ automation Excel/LibreOffice/Playwright) và phải là adapter riêng.

## Việc cần làm tiếp
- Nếu cần `.xlsb` có dữ liệu: chuẩn hoá template sang `.xlsx`.
- Nếu cần snapshot chart thật:
  - Tích hợp adapter chuyên chụp ảnh (ví dụ Windows COM, LibreOffice headless, hoặc dịch vụ render).
  - Adapter này chỉ làm 1 việc: render range -> image.
- Thêm validation cho `dataset_map` (range/sheet tồn tại).

## Hướng phát triển
- Tách ExcelAdapter thành 2 chế độ:
  - `xlsx` (đọc/ghi)
  - `opaque` (copy template)
- Bổ sung adapter registry theo loại template.
- Chuẩn hóa logs/audit cho dataset mapping & snapshot output.
