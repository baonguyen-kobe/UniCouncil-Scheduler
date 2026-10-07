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
19. Request đã từng bước vào vòng lãnh đạo không quay lại ADJUSTED.
20. Ở REVISED, Assistant có hai hướng: tự xử lý và trình lại → PENDING_APPROVAL; hoặc gửi requester chỉnh, trong thời gian requester chỉnh status vẫn là REVISED.
21. Requester gửi lại sau yêu cầu chỉnh của leader → REVISED_PROCESSING.
22. REVISED_PROCESSING nghĩa là request hậu-leader đang được Assistant xử lý trước khi trình lại; Assistant trình lại → PENDING_APPROVAL, hoặc gửi requester chỉnh tiếp → REVISED.
23. APPROVED → COMPLETED được tự động hóa sau khi cuộc họp đã qua ngày/thời điểm hiệu lực.
24. Chỉ ADMIN và ASSISTANT được phép chuyển thủ công một request COMPLETED sang trạng thái khác.
25. Leader nhìn thấy PENDING_APPROVAL, REVISED, REVISED_PROCESSING, APPROVED, COMPLETED. Leader không thấy PROCESSING, ADJUSTED, CANCELLED.
26. Status display là role-specific; system status là nguồn dữ liệu chuẩn, nhãn hiển thị không được dùng làm logic backend.
27. Requester hiển thị Đang xử lý cho PROCESSING, PENDING_APPROVAL, REVISED_PROCESSING; hiển thị Điều chỉnh cho ADJUSTED, REVISED.
28. Một request có thể có nhiều role trên cùng một user; authorization phải tính theo quyền role và quan hệ với request.
29. Web app V1 hỗ trợ chuyển đổi VI/EN. System text, labels, validation và status labels phải được localize; free-text do người dùng nhập không tự dịch.
30. Danh mục dùng trong UI có nhãn VI/EN. Units, MeetingTypes và Locations dùng cột tên theo locale và fallback sang ngôn ngữ còn lại khi cần.
31. Requester form V1 gồm: Full name read-only từ login/Staff; School/Office/Unit multi-select; Proposed meeting agenda; Proposed meeting participants dạng free text; Preferred meeting date chỉ có ngày và default today; attachment optional.
32. Requester form V1 không có requested leader, requested start time, estimated duration, requested location, requester note riêng hoặc Meeting Type.
33. School/Office/Unit trên requester form là multi-select và được lưu riêng với snapshot đơn vị chính của requester.
34. Meeting Type nằm trong sheet MeetingTypes riêng; request mới tự gán item active đầu tiên theo sort_order.
35. Meeting Type không hiển thị với Requester. Chỉ Assistant được thay đổi Meeting Type trong workflow thông thường; Leader chỉ được xem. Mọi thay đổi phải ghi AuditLog.
36. Proposed meeting participants là free text ở V1; không có field attendee count riêng.
37. Preferred meeting date chỉ là ngày đề xuất; lịch chính thức không bắt buộc trùng ngày này và được Assistant hoàn thiện sau.
38. Attachment vật lý lưu trên Google Drive; metadata lưu trong Attachments.

## Status display đã chốt

| System status | Requester | Assistant | Leader |
|---|---|---|---|
| PROCESSING | Processing / Đang xử lý | New / Mới | — |
| PENDING_APPROVAL | Processing / Đang xử lý | Pending Approval / Chờ duyệt | New / Mới |
| ADJUSTED | Revised / Điều chỉnh | Adjusted / Chờ bổ sung | — |
| REVISED | Revised / Điều chỉnh | Revised / Điều chỉnh | Revising / Điều chỉnh |
| REVISED_PROCESSING | Processing / Đang xử lý | Processing / Đang xử lý | Revising / Điều chỉnh |
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
- MeetingTypes
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
