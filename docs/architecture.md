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
- Google Drive là nơi duy nhất lưu file lâu dài.
- Vercel chạy web/backend, không dùng làm file storage; backend nhận từng file nhỏ và chuyển ngay vào Drive bằng Drive API.
- Lưu `drive_file_id`, không xem URL Drive là khóa chính.
- Backend có thể proxy file để preview/download theo quyền của web app.
- Mỗi request có folder riêng: `root/YYYY/request_id/`; lưu `drive_folder_id`, `drive_folder_url` trong Requests và `drive_file_id`, `drive_file_url` trong Attachments. Không tạo sheet mapping Drive riêng.
- V1 giới hạn **4 MB/file**, tối đa 10 file/request. Vì Vercel Function giới hạn request body **4.5 MB**, upload từng file qua một HTTP request riêng (bao gồm multipart overhead dưới ngưỡng), không gộp file, không dùng base64. Backend gửi file sang Drive và không lưu bản sao lâu dài trên Vercel.
- Không đưa service account credentials, refresh/access tokens hoặc secrets cho browser; backend xác thực/validate từng file trước khi chuyển sang Drive.
- Với Drive và Sheets, không có transaction chung; dùng cleanup bù trừ và reconciliation cho file/folder rác hoặc kết quả commit không rõ.
- Khi submit có nhiều file, backend tạo staging Drive folder theo submission; **không xóa các file đã upload thành công** nếu file khác lỗi. UI theo dõi từng `upload_item_id`: Pending/Uploading/Uploaded/Failed; requester retry, thay thế hoặc loại bỏ đúng file lỗi.
- Backend chống upload trùng theo `submission_id + upload_item_id`, tra cứu trạng thái upload trước khi retry sau timeout. Dữ liệu trạng thái staging phải có thể khôi phục từ lưu trữ đáng tin cậy/Drive metadata; không phụ thuộc RAM hay filesystem tạm của Vercel Functions.
- Staging folders/files chưa commit được kiểm tra và cleanup theo timeout/reconciliation; chỉ cleanup toàn folder khi user bỏ dở, staging quá hạn hoặc commit bị hủy có xác nhận. Quy tắc cleanup tuyệt đối không xóa request/file đã commit.


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
