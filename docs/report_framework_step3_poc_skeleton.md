# STEP 3 (NEW) – POC & FRAMEWORK SKELETON (BLOCK-BASED)

## 1. Mục tiêu

* Hiện thực hoá kiến trúc STEP 1 & hợp đồng STEP 2
* Chứng minh **Render Block Engine** hoạt động với summary phức tạp
* Tạo skeleton đủ chuẩn để mở rộng thành framework nội bộ

---

## 2. Nguyên tắc thiết kế (khóa cứng)

* ❌ Không hard-code sheet
* ❌ Không hard-code summary
* ❌ Không giả định số block
* ❌ Không macro Excel
* ✅ Mọi thứ đi qua config

---

## 3. Project Structure (Node.js)

```
report-engine/
 ├─ app.js
 ├─ core/
 │   ├─ pipeline.js          # Orchestration
 │   ├─ context.js           # Execution context
 │   └─ block-engine.js      # Resolve & order render blocks
 ├─ scheduler/
 ├─ config/
 ├─ sql/
 ├─ rawdata/
 │   └─ rawdata-manager.js
 ├─ excel/
 │   └─ excel-generator.js
 ├─ render/
 │   ├─ html-table-renderer.js
 │   ├─ image-renderer.js
 │   └─ renderer-factory.js
 ├─ mail/
 │   ├─ mail-renderer.js
 │   └─ mail-sender.js
 └─ logger/
```

---

## 4. Core Runtime Flow

```
Scheduler
  → Load Config
  → Execute SQL
  → Rawdata Manager
  → Excel Generator
  → Render Block Engine
      → Resolve blocks
      → Select renderer
  → Mail Renderer
  → Send Mail + Attach Excel
  → Audit Log
```

---

## 5. Render Block Engine – Trách nhiệm

* Nhận `render_blocks[]` từ config
* Với mỗi block:

  * Validate sheet / range
  * Xác định renderer (HTML vs Image)
  * Chuẩn hoá output thành `RenderableBlock`

```ts
RenderableBlock {
  id,
  type,
  order,
  htmlContent?,
  imagePath?
}
```

---

## 6. Renderer Strategy

### HTML Table Renderer

* Áp dụng cho:

  * Table đơn giản
  * KPI, conditional color
* Output: HTML fragment

### Image Renderer

* Áp dụng cho:

  * Chart
  * Mixed block
* Output: PNG/JPEG

---

## 7. POC Scope (bắt buộc)

* 1 report thật
* ≥ 3 render blocks

  * 2 table
  * 1 chart
* Render **tất cả block vào body mail**
* Đính kèm file Excel output

---

## 8. Kết luận

> STEP 3 (NEW) xác nhận framework **không phụ thuộc Excel layout**, đủ khả năng render summary phức tạp, sẵn sàng mở rộng quy mô.
