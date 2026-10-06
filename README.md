
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

- Một yêu cầu họp = một request_id duy nhất trong suốt vòng đời.
- Requests chỉ giữ trạng thái hiện tại.
- Mọi thay đổi quan trọng được ghi vào AuditLog.
- File vật lý nằm trên Google Drive; metadata file nằm trong Attachments.
- Không hard-code secret/token trong Google Sheets.
- Role/ownership/visibility phải được enforce ở backend.

## Tài liệu

- [Master Plan](docs/master-plan.md)
- [Reviewer Handoff](docs/handoff.md)
- [Architecture](docs/architecture.md)
- [Workflow & Roles](docs/workflow-and-roles.md)
- [Pages](docs/pages.md)
- [Google Sheets Schema](docs/schema.md)
- [Technical Decisions](docs/technical-decisions.md)

## Trạng thái

Baseline V1 đã được tổng hợp trong Master Plan và Handoff.

Checkpoint hiện tại:
- Đã chốt architecture, roles, workflow, status display, role visibility, /requests UX và schema baseline.
- Đang chờ reviewer kiểm tra toàn bộ baseline.
- Phần tiếp theo dự kiến là Part B: thiết kế chi tiết /requests/new.
- Các quyết định còn mở của Part B được liệt kê trong docs/master-plan.md và docs/handoff.md.

## Quy tắc review

Mỗi Part được thực hiện theo chu trình:

1. Chốt requirement.
2. Cập nhật source.
3. Gửi handoff.
4. Reviewer kiểm tra.
5. Chỉ sau khi pass mới chuyển Part tiếp theo.
