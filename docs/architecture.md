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
- Các sheet chính: `Requests`, `Staff`, `Units`, `Locations`, `Attachments`, `AuditLog`, `ZaloNotifications`, `Settings`.

### File storage
- Google Drive.
- Web upload file bằng Drive API.
- Lưu `drive_file_id`, không xem URL Drive là khóa chính.
- Backend có thể proxy file để preview/download theo quyền của web app.

### Calendar
- V1 chưa tích hợp Google Calendar.
- Page Calendar render từ các request đã được duyệt.

### Notifications
- Ưu tiên Zalo OA/Bot thay vì gửi email hàng loạt.
- Chỉ gửi thông báo cần hành động hoặc thay đổi quan trọng.
