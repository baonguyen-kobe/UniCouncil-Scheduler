# Technical Decisions V1

## Chốt

1. Form đăng ký được xây trực tiếp trên web; không dùng Google Form ở V1.
2. Không tạo hai bản request song song. Một `request_id` đi xuyên suốt workflow.
3. Google Sheets là data store V1.
4. Google Drive là file storage.
5. Lịch họp render trực tiếp trên web; chưa đồng bộ Google Calendar.
6. Đăng nhập bằng Google Workspace.
7. Deploy Next.js trên Vercel, dùng custom domain.
8. Zalo OA/Bot là kênh notification ưu tiên; tránh spam email.
9. `AuditLog` giữ lịch sử thay vì giữ một sheet “request gốc” riêng.
10. Soft delete thay vì xóa vật lý dữ liệu nghiệp vụ.
11. Dùng `version` để chống ghi đè khi nhiều người cùng sửa request.
12. Secrets nằm trong Vercel Environment Variables; không để trong Google Sheets.

## Stack dự kiến

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Auth.js hoặc giải pháp tương đương cho Google OIDC/session
- Google Sheets API
- Google Drive API
- Zalo OA API
- Vercel

## Drive

- Tạo một root folder cho hệ thống.
- Có thể tổ chức theo năm / request ID.
- Lưu `drive_file_id` trong metadata.
- Preview PDF/image có thể proxy qua backend để web kiểm soát quyền.

## Phase sau

- Google Calendar integration.
- Dashboard / reporting.
- Database thật (PostgreSQL/Supabase) nếu Sheets trở thành bottleneck.
- Workflow nâng cao / nhiều cấp duyệt nếu thực tế yêu cầu.
