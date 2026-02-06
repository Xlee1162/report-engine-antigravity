# APPENDIX – DESIGN RATIONALE (HISTORY)

## Mục đích

Tài liệu này lưu lại **tư duy thiết kế ban đầu**, không phải tài liệu vận hành chính.

---

## Vấn đề gốc

* Báo cáo thủ công tốn >60 phút/người/ngày
* Phụ thuộc Excel + macro
* Không scale

---

## Quyết định kiến trúc quan trọng

* Chuyển logic về SQL
* Excel chỉ presentation
* Summary = Render Blocks
* Mail body là output chính

---

## Vì sao không cố định 4 sheet

* Report thực tế đa dạng
* Excel layout thay đổi liên tục
* Block-based cho phép mở rộng lâu dài

---

## Trạng thái hiện tại

* Kiến trúc chính thức nằm ở STEP 1–2–3
* File này chỉ để tham khảo tư duy
