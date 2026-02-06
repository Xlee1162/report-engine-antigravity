# STEP 1 – ARCHITECTURE & MODULE DESIGN

## 1. Mục tiêu
- Xây dựng **Report Engine Framework** theo hướng **config-driven & block-based**
- Không cố định số lượng / tên sheet trong file Excel
- Tách bạch rõ: **Data – Presentation – Rendering – Delivery**
- Cho phép mở rộng nhiều loại report, layout, kênh gửi **mà không sửa core engine**

---

## 2. Tư duy kiến trúc cốt lõi

### 2.1. Những điều framework *không* giả định
- Không giả định file Excel có 4 sheet
- Không giả định tồn tại sheet tên `summary`
- Không giả định summary chỉ có 1 bảng
- Không giả định Excel là source of truth

### 2.2. Những điều framework *quan tâm*
- Dataset (raw / summary) đến từ SQL
- **Render Block**: đơn vị nội dung nhỏ nhất để đưa ra output
- Output channel: Email (HTML + attachment), mở rộng được sau này

> Summary được hiểu là **tập hợp các Render Block**, không phải một sheet cụ thể.

---

## 3. High-level Architecture

Framework được thiết kế theo mô hình **Config-driven + Block-based Pipeline**:

```
[Report Config]
   ├─ Schedule
   ├─ Data Scope (rawdata rules)
   ├─ SQL Definition
   ├─ Excel Template (optional)
   └─ Render Blocks (summary layout)
        ↓
   [Scheduler]
        ↓
[Report Engine Core]
   ├─ Config Loader
   ├─ SQL Executor
   ├─ Rawdata Manager
   ├─ Excel Generator
   ├─ Render Block Engine
   ├─ Mail Renderer
   ├─ Mail Sender
   └─ Logger / Audit
```

Engine mang tính **stateless**: mọi report được quyết định hoàn toàn bằng config.

---

## 4. Core Modules & Responsibilities

### Scheduler
- Kích hoạt report theo cron / timezone
- Không xử lý dữ liệu

### Config Loader
- Load & validate report config

### SQL Executor
- Thực thi stored procedure
- SQL là **source of truth** cho nghiệp vụ

### Rawdata Manager
- Merge dữ liệu theo lookback (7 ngày, 14 ngày, 3 tháng…)
- Hỗ trợ dữ liệu tĩnh / ít thay đổi
- Retention & cleanup (thay thế macro Excel)
- Hoàn toàn **độc lập với số sheet Excel**

### Excel Generator
- Load template (nếu có)
- Đổ rawdata / dataset vào sheet tương ứng
- Giữ nguyên format, chart, công thức
- Chỉ phục vụ **presentation & attachment**, không quyết định mail content

### Render Block Engine
- Đọc danh sách `render_blocks` từ config
- Mỗi block xác định:
  - Sheet (optional)
  - Range
  - Type: table / chart / mixed
  - Render mode: HTML / image
  - Order
- Resolve block thành đơn vị render cụ thể

### Mail Renderer
- Nhận danh sách block đã resolve
- Render từng block theo thứ tự
- HTML table cho block đơn giản
- Image snapshot cho chart / block phức tạp
- Assemble thành HTML mail

### Mail Sender
- Gửi mail
- Đính kèm file Excel output

### Logger / Audit
- Log chi tiết từng lần chạy report

---

## 5. Boundary rõ ràng giữa các tầng

### SQL Layer
- 70–80% logic nghiệp vụ
- Tính toán, tổng hợp, so sánh kế hoạch – thực tế

### Node.js Engine
- 20–30% logic
- Điều phối pipeline, render, gửi

### Excel Template
- Chỉ presentation
- Không chứa logic nghiệp vụ
- Không ràng buộc cấu trúc sheet

---

## 6. End-to-End Flow

1. Scheduler trigger report
2. Load & validate config
3. Execute SQL
4. Merge / manage rawdata
5. Generate Excel output
6. Resolve render blocks
7. Build HTML mail
8. Send mail + attachment
9. Audit & logging

---

## 7. Kết luận
> STEP 1 xác lập nền móng kiến trúc: **Excel không còn là trung tâm**.
> Report được định nghĩa bằng **config + render blocks**, cho phép mở rộng linh hoạt, bền vững lâu dài.

