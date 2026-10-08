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
25. Mọi user có role LEADER nhìn thấy cùng tập PENDING_APPROVAL, REVISED, REVISED_PROCESSING, APPROVED, COMPLETED. V1 chưa filter visibility theo từng leader cụ thể; Leader không thấy PROCESSING, ADJUSTED, CANCELLED.
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
39. Proposed meeting participants là free text và có thể bao gồm cả lãnh đạo dự kiến; Requester không có control riêng để chọn leader.
40. Assistant chịu trách nhiệm chuẩn hóa từ requested_participants/nghiệp vụ sang leader_ids và participants chính thức. leader_ids không được dùng để giới hạn Leader visibility ở V1.
41. V1 không có Save Draft, status DRAFT, server-side draft hoặc local autosave/persistence cho requester form.
42. Request chỉ được tạo khi requester submit thành công; trạng thái khởi tạo là PROCESSING.
43. Request form validation V1: Full name phải resolve từ session/Staff; Units chọn ít nhất 1; agenda bắt buộc tối đa 3.000 ký tự; participants bắt buộc tối đa 3.000 ký tự; preferred date bắt buộc, default today theo timezone hệ thống và không được ở quá khứ.
44. Validation chạy cả client và server; server-side validation là authoritative. Validation message hỗ trợ VI/EN.
45. Attachment V1 là optional, tối đa 10 file/request và **4 MB/file**; giới hạn an toàn dưới 4.5 MB HTTP request body của Vercel Functions.
46. Attachment V1 cho phép PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, JPG/JPEG, PNG, WEBP; backend kiểm tra dung lượng và file type/MIME.
47. Trước khi submit, requester có thể bỏ file đã chọn khỏi upload list.
48. Submit có `submission_id` idempotency key: retry phải trả đúng request đã commit, tránh duplicate do timeout/double-click.
49. Backend xác thực + validate lại trước upload. Khi Submit, UI disable nút và giữ form/file list nếu upload lỗi.
50. Mỗi request có Drive folder riêng dưới `root/YYYY/request_id/`; lưu `drive_folder_id` trong Requests. File vật lý có prefix `attachment_id__` để tránh trùng; tên gốc giữ ở Attachments.
51. Upload toàn bộ file thành công trước khi commit Sheet. Chỉ khi Requests + Attachments + AuditLog được ghi thành công mới báo success và chuyển về /requests.
52. Sheets commit ưu tiên một `spreadsheets.batchUpdate` atomic chứa thao tác ghi dữ liệu các tab liên quan; không hiểu nhầm API batch với transaction liên dịch vụ.
53. Drive và Sheets không có distributed transaction chung. Khi lỗi, cleanup folder/file tạm theo cơ chế bù trừ (best effort); phải hỗ trợ reconciliation nếu cleanup thất bại hoặc không xác định được commit đã hoàn tất.
54. Idempotency/unique request_id phải chống race condition của submit đồng thời; không cấp request_id bằng số dòng Sheet + 1, cũng không chỉ read-then-write để chống duplicate.
55. Vercel Functions có giới hạn request body 4.5 MB (bao gồm multipart overhead), nên V1 chốt **4 MB/file** và upload từng file qua một HTTP request riêng tới backend Vercel, backend chuyển vào Google Drive. Không base64 encode hoặc gộp nhiều file trong một request; không lộ Google credentials ở browser.
56. **Chốt không tạo sheet Drive map riêng**. Requests lưu `drive_folder_id` và `drive_folder_url`; Attachments lưu `drive_file_id` và `drive_file_url`. Link lấy từ Drive API khi có; ID là khóa ổn định; quyền truy cập được enforce qua backend/Drive permissions.
57. Vercel là nơi chạy web app/backend, **không là nơi lưu trữ file**. File lưu lâu dài duy nhất tại Google Drive; Sheets chỉ lưu request và metadata/link.
58. Upload từng file phải hiển thị trạng thái riêng (Pending/Uploading/Uploaded/Failed), tên file và nguyên nhân lỗi theo VI/EN; file lỗi có Retry/Replace/Remove.
59. Nếu một file upload lỗi, giữ nguyên file khác đã upload thành công trong staging folder Drive, không rollback toàn bộ ngay. Chỉ retry đúng file lỗi hoặc cho requester bỏ file lỗi rồi tiếp tục nếu danh sách còn lại hợp lệ.
60. Không finalize `Requests`/`Attachments`/`AuditLog` chừng nào file còn trong danh sách chưa upload thành công. Không tạo request PROCESSING từ bộ file còn lỗi.
61. Mỗi file của một submission có `upload_item_id` ổn định; backend idempotent theo cặp `submission_id + upload_item_id`, kiểm tra kết quả khi timeout thay vì upload lại ngay để tránh file trùng.
62. Upload thành công là staging (chưa phải request commit). Xóa file khỏi danh sách thì cleanup đúng file đó; khi bỏ form/phiên staging hết hạn cần reconciliation cleanup các Drive file/folder chưa commit, không tạo Save Draft.
63. Lỗi ghi Sheets sau tất cả upload được xử lý riêng với lỗi từng file: kiểm tra `submission_id` đã commit hay chưa; không ép requester upload lại file đã thành công.


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
