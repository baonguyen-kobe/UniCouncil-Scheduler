
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
- [Part C — UI/UX & EIU Branding](docs/ui-ux-guidelines.md)

## Trạng thái

Baseline V1 đã được tổng hợp trong Master Plan và Handoff.

Checkpoint hiện tại:
- Đã chốt architecture, roles, workflow, status display, role visibility, /requests UX và schema baseline.
- Workflow sử dụng 8 system status, gồm REVISED_PROCESSING cho request hậu-leader đã được requester gửi lại và đang được Assistant xử lý.
- Baseline workflow đã qua reviewer checkpoint.
- Đang thực hiện Part B: field baseline, validation và attachment constraints của /requests/new đã chốt.
- Form hỗ trợ VI/EN, tối giản, Meeting Type nội bộ, không có Save Draft; attachment optional tối đa 10 file và **4 MB/file**.
- Submit flow/idempotency và folder Drive đã chốt ở mức thiết kế. **4 MB/file, tối đa 10 file/request**, upload từng file qua Vercel backend rồi lưu lâu dài trên Google Drive; Vercel không phải file storage.
- Link Drive lưu ở hai sheet hiện có (Requests/Attachments), không tạo Drive map sheet riêng.
- **Part B đã chốt về mặt yêu cầu**: Requester chỉ sửa khi được Assistant giao (`revision_target=REQUESTER`); Assistant bắt buộc có `revision_instruction`; Leader có `leader_decision_note` tùy chọn, được để trống khi yêu cầu chỉnh.
- **Part C đang chốt**: bộ màu EIU theo ảnh branding người dùng; sidebar kế thừa MedLabs V2 Master; Full Logo nền trắng ở Sidebar, Corner Logo ở Login; Crimson Pro là font chính đã chốt, Be Vietnam Pro là font phụ. Badge trạng thái dùng phong cách pastel tham khảo EIU Schedule; bảng mapping nhãn/role đang ở mức đề xuất. Mã EIU Cream `#EAE2D6` và EIU Gray `#58595B` đã chốt. **Toàn bộ icon dùng Heroicons v2**, không trộn bộ icon khác.
- Sau Part C: triển khai và QA workflow, upload, optimistic locking và role permissions; xem docs/ui-ux-guidelines.md, docs/master-plan.md và docs/handoff.md.

## Quy tắc review

Mỗi Part được thực hiện theo chu trình:

1. Chốt requirement.
2. Cập nhật source.
3. Gửi handoff.
4. Reviewer kiểm tra.
5. Chỉ sau khi pass mới chuyển Part tiếp theo.
