
# Technical Decisions V1

## Chốt

1. Form đăng ký được xây trực tiếp trên web; không dùng Google Form ở V1.
2. Không tạo hai bản request song song. Một request_id đi xuyên suốt workflow.
3. Google Sheets là data store V1.
4. Google Drive là file storage.
5. Lịch họp render trực tiếp trên web; chưa đồng bộ Google Calendar.
6. Đăng nhập bằng Google Workspace.
7. Deploy Next.js trên Vercel, dùng custom domain.
8. Zalo OA/Bot là kênh notification ưu tiên; tránh spam email.
9. AuditLog giữ lịch sử thay đổi thay vì giữ một sheet “request gốc” riêng.
10. Soft delete thay vì xóa vật lý dữ liệu nghiệp vụ.
11. Dùng version để chống ghi đè khi nhiều người cùng sửa request.
12. Secrets nằm trong Vercel Environment Variables; không để trong Google Sheets.
13. V1 không có trạng thái REJECTED; lãnh đạo chỉ duyệt hoặc yêu cầu chỉnh sửa.
14. Requester gửi request lần đầu hoặc gửi lại sau khi chỉnh sửa trước vòng lãnh đạo đều vào PROCESSING.
15. Assistant yêu cầu requester bổ sung/chỉnh sửa trước vòng lãnh đạo → ADJUSTED.
16. Requester chỉnh sửa và gửi lại từ ADJUSTED → PROCESSING.
17. Assistant hoàn tất request → PENDING_APPROVAL.
18. Leader yêu cầu chỉnh sửa một request đã ở PENDING_APPROVAL → REVISED.
19. Request đã từng bước vào vòng lãnh đạo không quay lại ADJUSTED; các vòng chỉnh sửa tiếp theo tiếp tục dùng REVISED.
20. Requester chỉnh sửa và gửi lại từ REVISED → PENDING_APPROVAL.
21. APPROVED → COMPLETED được tự động hóa sau khi cuộc họp đã qua ngày/thời điểm hiệu lực.
22. Chỉ ADMIN và ASSISTANT được phép chuyển thủ công một request COMPLETED sang trạng thái khác.
23. Leader chỉ nhìn thấy request đã từng bước vào vòng lãnh đạo: PENDING_APPROVAL, REVISED, APPROVED, COMPLETED. Leader không thấy PROCESSING, ADJUSTED, CANCELLED.
24. Status display là role-specific; system status là nguồn dữ liệu chuẩn, nhãn hiển thị không được dùng làm logic backend.
25. Một request có thể có nhiều role trên cùng một user; authorization phải tính theo quyền role và quan hệ với request.

## Status display đã chốt

| System status | Requester | Assistant | Leader |
|---|---|---|---|
| PROCESSING | Processing / Đang xử lý | New / Mới | — |
| PENDING_APPROVAL | Processing / Đang xử lý | Pending Approval / Chờ duyệt | New / Mới |
| ADJUSTED | Revised / Điều chỉnh | Adjusted / Chờ bổ sung | — |
| REVISED | Revised / Điều chỉnh | Revised / Điều chỉnh | Revising / Điều chỉnh |
| APPROVED | Approved / Đã duyệt | Approved / Đã duyệt | Approved / Đã duyệt |
| CANCELLED | Cancelled / Đã hủy | Cancelled / Đã hủy | — |
| COMPLETED | Completed / Hoàn thành | Completed / Hoàn thành | Completed / Hoàn thành |

## Roles

- REQUESTER
- ASSISTANT
- LEADER
- ADMIN

Một user có thể có nhiều role.

## Stack dự kiến

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Auth.js / giải pháp tương đương cho Google OIDC/session
- Google Sheets API
- Google Drive API
- Zalo OA API
- Vercel

## Google Sheets

Một Google Spreadsheet vận hành gồm:
- Requests
- Staff
- Units
- Locations
- Attachments
- AuditLog
- ZaloNotifications
- Settings

Không lưu API secret/password/token nhạy cảm trong Sheet.

## Google Drive

- Tạo một root folder cho hệ thống.
- Có thể tổ chức theo năm / request ID.
- Lưu drive_file_id trong metadata.
- Preview PDF/image có thể proxy qua backend để web kiểm soát quyền.

## Calendar

- V1 chưa tích hợp Google Calendar.
- Page Calendar render từ các request đã được duyệt.

## Notifications

- Ưu tiên Zalo OA/Bot.
- Chỉ gửi thông báo cần hành động hoặc thay đổi quan trọng.
- Không coi email hàng loạt là kênh notification chính của V1.

## Data integrity

- request_id duy nhất trong toàn bộ vòng đời request.
- version dùng optimistic locking.
- AuditLog cho thay đổi quan trọng và status transition.
- Soft delete cho dữ liệu nghiệp vụ.
- Backend enforce role/ownership/visibility; không tin vào filter phía client.

## Phase sau V1

- Google Calendar integration.
- Dashboard / reporting.
- Database thật (PostgreSQL/Supabase) nếu Sheets trở thành bottleneck.
- Workflow nâng cao / nhiều cấp duyệt nếu thực tế yêu cầu.
