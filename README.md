# UniCouncil Scheduler

Hệ thống quản lý đăng ký, xử lý, phê duyệt và hiển thị lịch họp dành cho lãnh đạo trường.

## Mục tiêu V1

- Thay Google Form bằng form đăng ký trực tiếp trên web.
- Dùng Google Workspace để đăng nhập.
- Dùng Google Sheets làm data store vận hành.
- Dùng Google Drive làm nơi lưu file đính kèm.
- Dùng Zalo OA/Bot cho thông báo nghiệp vụ.
- Chưa tích hợp Google Calendar ở V1; lịch được hiển thị trực tiếp trên web.
- Deploy bằng Vercel với custom domain.

## Nguyên tắc dữ liệu

- Một yêu cầu họp = một `request_id` duy nhất trong suốt vòng đời.
- `Requests` chỉ giữ trạng thái hiện tại.
- Mọi thay đổi quan trọng được ghi vào `AuditLog`.
- File vật lý nằm trên Google Drive; metadata file nằm trong `Attachments`.
- Không hard-code secret/token trong Google Sheets.

## Tài liệu

- [Architecture](docs/architecture.md)
- [Workflow & Roles](docs/workflow-and-roles.md)
- [Pages](docs/pages.md)
- [Google Sheets Schema](docs/schema.md)
- [Technical Decisions](docs/technical-decisions.md)

## Trạng thái

Tài liệu hiện là baseline V1 được chốt trong giai đoạn thiết kế. Chi tiết field/UI sẽ tiếp tục được tinh chỉnh trước khi triển khai.
