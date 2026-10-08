# Architecture

## Tổng quan

```text
Google Workspace Login
          |
          v
+---------------------------+
| Next.js Web App / Vercel  |
|                           |
| Requests                  |
| Calendar                  |
| Staff                     |
| Settings                  |
+-----------+---------------+
            |
      +-----+------+
      |            |
      v            v
Google Sheets   Google Drive
   data            files
      |
      v
   Zalo OA
notifications
```

## Thành phần

### Frontend / Backend
- Next.js + TypeScript.
- Deploy trên Vercel.
- UI dự kiến Tailwind CSS + shadcn/ui.
- API backend nằm server-side; browser không giữ Google service credentials.

### Authentication
- Google Workspace OAuth / OpenID Connect.
- Chỉ tài khoản domain trường và có trong `Staff` mới được truy cập hệ thống.
- Session cookie cho phép người dùng quay lại mà không phải đăng nhập lại thường xuyên.

### Data
- Một Google Spreadsheet vận hành.
- Các sheet chính: `Requests`, `Staff`, `Units`, `MeetingTypes`, `Locations`, `Attachments`, `AuditLog`, `ZaloNotifications`, `Settings`.

### File storage
- Google Drive.
- Web upload file bằng Drive API.
- Lưu `drive_file_id`, không xem URL Drive là khóa chính.
- Backend có thể proxy file để preview/download theo quyền của web app.
- Mỗi request có folder riêng: `root/YYYY/request_id/`; lưu `drive_folder_id` trong Requests và `drive_file_id` trong Attachments.
- Upload V1 tối đa 20 MB/file phải tránh gửi file lớn qua body của Vercel Function (giới hạn 4.5 MB). Thiết kế resumable/direct-to-Drive session hoặc đường upload tương đương; kiểm chứng CORS, quyền và retry trước khi code.
- Không đưa service account credentials, refresh/access tokens hoặc secrets cho browser.
- Với Drive và Sheets, không có transaction chung; dùng cleanup bù trừ và reconciliation cho file/folder rác hoặc kết quả commit không rõ.

### Calendar
- V1 chưa tích hợp Google Calendar.
- Page Calendar render từ các request đã được duyệt.

### Notifications
- Ưu tiên Zalo OA/Bot thay vì gửi email hàng loạt.
- Chỉ gửi thông báo cần hành động hoặc thay đổi quan trọng.

### Request submit / idempotency

- Client tạo `submission_id` duy nhất cho một submit; retries phải dùng cùng key.
- Backend bảo đảm commit idempotent và cấp `request_id` an toàn khi concurrent submissions.
- Sau khi upload Drive thành công, ghi `Requests`, `Attachments`, `AuditLog` bằng một atomic Sheets `spreadsheets.batchUpdate`.
- Chỉ trả kết quả thành công khi commit xác nhận. Nếu timeout, kiểm tra lại bằng `submission_id`; không mặc định tạo lại.
