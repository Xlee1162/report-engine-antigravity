# Hướng dẫn: Scheduler & Cron

Scheduler là thành phần "Producer" trong hệ thống Queue.

## Cơ chế hoạt động

1.  Quét thư mục cấu hình (VD: `./configs`).
2.  Đăng ký Cron Job theo thuộc tính `schedule`.
3.  Khi kích hoạt: **Đẩy Job vào MongoDB Queue** (Không chạy trực tiếp báo cáo).

## Cách chạy

```bash
node src/app.js schedule <path-to-config-folder>
```

**Quan trọng**:

-   Scheduler **nhẹ** hơn rất nhiều so với bản cũ vì nó không xử lý logic báo cáo.
-   Scheduler cần kết nối MongoDB để insert job.

## Cú pháp Cron

Sử dụng chuẩn Unix Cron (node-cron).

```
  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional)
```

Ví dụ: `0 8 * * *` (8:00 sáng hàng ngày).

Để xử lý các Job được tạo ra bởi Scheduler, bạn **BẮT BUỘC** phải chạy thêm **Worker**. Xem thêm: [Queue & API Guide](guide_queue_api.md).
