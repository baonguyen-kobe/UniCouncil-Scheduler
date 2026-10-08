
# Handoff — Reviewer Checkpoint

## 1. Mục đích

Tài liệu này dùng để handoff cho reviewer khác trước khi tiếp tục thiết kế/triển khai phần tiếp theo.

Nguyên tắc đọc:
- Nội dung chi tiết đã có trong source thì reviewer đọc trực tiếp file source tương ứng.
- File này chỉ tóm tắt nơi cần đọc, những gì đã chốt, những gì còn mở và checklist review.
- Không coi phần “chưa chốt” là requirement đã được quyết định.

## 2. Source of truth

Thứ tự nên đọc:

1. **docs/master-plan.md**
   - Bức tranh tổng thể.
   - Scope V1 / out of scope.
   - Architecture.
   - Roles.
   - Workflow.
   - Pages.
   - Schema.
   - Roadmap.
   - Current checkpoint.

2. **docs/workflow-and-roles.md**
   - Source of truth cho workflow.
   - Status transition.
   - Status display theo role.
   - ADJUSTED vs REVISED.
   - Leader visibility.
   - Auto-complete.
   - Optimistic locking.

3. **docs/pages.md**
   - Source of truth cho UX/list/detail theo role.
   - Desktop vs mobile.
   - Filter.
   - Role-specific actions.
   - /requests.
   - /requests/new baseline.
   - Calendar/Staff/Settings baseline.

4. **docs/schema.md**
   - Source of truth cho Google Sheets schema V1.
   - Requests / Staff / Units / Locations / Attachments / AuditLog / ZaloNotifications / Settings.

5. **docs/architecture.md**
   - Source of truth cho kiến trúc tích hợp.

6. **docs/technical-decisions.md**
   - Source of truth cho các quyết định kỹ thuật đã chốt và các giới hạn V1.

7. **README.md**
   - Entry point của repository.

## 3. Đã chốt trong source

### Product / architecture

- Web app quản lý meeting request cho lãnh đạo trường.
- Next.js + TypeScript + Tailwind + shadcn/ui.
- Vercel + custom domain.
- Google Workspace login.
- Google Sheets là operational data store V1.
- Google Drive là file storage.
- Zalo OA/Bot là notification channel ưu tiên.
- Calendar chỉ render trên web ở V1; chưa tích hợp Google Calendar.
- Một request dùng một request_id xuyên suốt vòng đời.
- AuditLog cho lịch sử thay đổi.
- version cho optimistic locking.
- Secrets không lưu trong Sheets.

### Roles

- REQUESTER
- ASSISTANT
- LEADER
- ADMIN

Một user có thể có nhiều role.

### Workflow

- PROCESSING
- PENDING_APPROVAL
- ADJUSTED
- REVISED
- REVISED_PROCESSING
- APPROVED
- CANCELLED
- COMPLETED

Không có REJECTED.

### Quy tắc ADJUSTED vs REVISED — điểm reviewer cần kiểm tra kỹ

**ADJUSTED**
- Assistant yêu cầu requester bổ sung/chỉnh sửa.
- Xảy ra trước khi request từng được trình leader.
- Leader không thấy request.
- Assistant hiển thị: **Adjusted / Chờ bổ sung**.
- Requester hiển thị: **Revised / Điều chỉnh**.
- Requester gửi lại → PROCESSING.

**REVISED**
- Request đã từng được trình leader.
- Leader yêu cầu chỉnh sửa.
- Leader vẫn thấy request.
- Leader hiển thị: **Revising / Điều chỉnh**.
- Assistant hiển thị: **Revised / Điều chỉnh**.
- Requester hiển thị: **Revised / Điều chỉnh**.
- Assistant có thể tự xử lý và trình lại → PENDING_APPROVAL.
- Hoặc Assistant gửi requester chỉnh; khi requester đang chỉnh status vẫn là REVISED.
- Requester gửi lại → REVISED_PROCESSING.

**REVISED_PROCESSING**
- Chỉ dùng cho request đã qua vòng leader.
- Requester đã chỉnh sửa và gửi lại sau yêu cầu chỉnh của leader.
- Assistant đang xử lý trước khi trình lại.
- Requester hiển thị: **Processing / Đang xử lý**.
- Assistant hiển thị: **Processing / Đang xử lý**.
- Leader vẫn hiển thị: **Revising / Điều chỉnh**.
- Assistant trình lại → PENDING_APPROVAL.
- Nếu cần requester chỉnh tiếp → REVISED.

**Rule bắt buộc**
- Không ADJUSTED → REVISED.
- Không REVISED → ADJUSTED.
- Request đã bước vào vòng leader không quay lại ADJUSTED.
- Requester gửi lại từ vòng chỉnh hậu-leader không dùng PROCESSING; dùng REVISED_PROCESSING.
- Không tạo request mới cho vòng chỉnh sửa.

### Status display

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

### Leader visibility

Leader chỉ thấy:
- PENDING_APPROVAL
- REVISED
- REVISED_PROCESSING
- APPROVED
- COMPLETED

Leader không thấy:
- PROCESSING
- ADJUSTED
- CANCELLED

Đây phải là backend authorization/visibility rule, không chỉ là UI filter.

### /requests UX

Requester:
- PC: Table.
- Mobile: compact Card.
- Detail PC: drawer.
- Detail mobile: Card.
- Time filters: Tất cả / Hôm nay / Ngày mai / Tuần này / Tháng này.
- Status multi-select.
- Đang xử lý = PROCESSING + PENDING_APPROVAL + REVISED_PROCESSING.
- Điều chỉnh = ADJUSTED + REVISED.
- Chỉ xem request của chính mình.

Assistant:
- PC: Table.
- Mobile: compact Card.
- Detail PC: drawer.
- Detail mobile: Card.
- Filter status/time/unit/leader/assistant/search.
- Status labels theo matrix ở trên.

Leader:
- PC: Table.
- Mobile: compact Card.
- Detail PC: drawer.
- Detail mobile: Card.
- PENDING_APPROVAL là queue xử lý chính.
- REVISED và REVISED_PROCESSING là queue theo dõi.
- APPROVED/COMPLETED để tra cứu.
- PENDING_APPROVAL: Duyệt / Yêu cầu chỉnh sửa.
- Không có Từ chối.

### Auto-complete

- APPROVED → COMPLETED tự động sau khi meeting qua thời điểm hiệu lực.
- Ưu tiên lịch chính thức.
- Fallback lịch đề xuất nếu chưa có lịch chính thức.
- Chỉ ADMIN/ASSISTANT được chỉnh thủ công COMPLETED.
- Manual status change phải audit.

## 4. Đã có trong source nhưng chưa phải implementation

Các tài liệu đã có:
- Architecture.
- Technical decisions.
- Workflow/roles.
- Pages/UX.
- Schema.
- Master plan.
- Handoff.

Đây là **design baseline**, không có nghĩa các integration/UI/backend đã được triển khai production.

## 5. Part B — /requests/new: field baseline đã chốt

- Web app hỗ trợ VI/EN; free-text không tự dịch.
- Full name lấy từ Google Workspace/Staff và read-only.
- School/Office/Unit lấy từ Units và cho multi-select.
- Proposed meeting agenda là free text.
- Proposed meeting participants là free text, có thể bao gồm cả lãnh đạo dự kiến.
- Requester không chọn leader bằng control riêng.
- Assistant chuẩn hóa leader_ids và participants chính thức.
- Preferred meeting date chỉ có ngày, default today; không có giờ đề xuất.
- Attachment optional; file lưu Google Drive, metadata lưu Attachments.
- Meeting Type nằm trong MeetingTypes, tự lấy item active đầu tiên theo sort_order; Requester không thấy, Assistant được đổi, Leader chỉ xem.
- Requester không chọn requested time/duration/location.
- Không có attendee count riêng.
- Không có Save Draft, DRAFT, server-side draft hoặc local autosave/persistence.
- Submit thành công mới tạo request PROCESSING.
- Mọi user có role LEADER thấy cùng một leader queue ở V1; không scope visibility theo leader_ids.

### Validation và attachment đã chốt

- Full name phải resolve từ session/Staff và read-only.
- School/Office/Unit bắt buộc chọn ít nhất 1.
- Proposed meeting agenda bắt buộc, tối đa 3.000 ký tự.
- Proposed meeting participants bắt buộc, tối đa 3.000 ký tự.
- Preferred meeting date bắt buộc, default today theo timezone hệ thống, không cho ngày quá khứ.
- Validation chạy cả client và server; server authoritative; message hỗ trợ VI/EN.
- Attachment optional, tối đa 10 file/request, 20 MB/file.
- Cho phép PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, JPG/JPEG, PNG, WEBP.
- Requester có thể bỏ file khỏi upload list trước submit; backend kiểm tra lại type/MIME và size.

### Part B còn cần chốt chi tiết

1. Submit transaction và behavior khi Drive/Sheets/Audit gặp lỗi.
2. Cấu trúc folder Drive và naming convention.
3. Requester edit/resubmit UX khi ADJUSTED/REVISED.

## 6. Những phần sắp triển khai

### Ngay sau reviewer checkpoint

**Part B — /requests/new**
- Field baseline đã chốt.
- Validation đã chốt.
- Attachment constraints đã chốt.
- Chốt submit flow.
- Chốt requester edit/resubmit behavior.

### Sau Part B

**Phase 1 — Foundation**
- Next.js app shell.
- Authentication.
- Session.
- Staff lookup.
- Role guard.
- Environment configuration.

**Phase 2 — Requests list/detail**
- Role-specific queries.
- Backend visibility.
- Table/Card responsive UX.
- Detail drawer/Card.
- Filters/search.
- Status badges.

**Phase 3 — Request form**
- Create request.
- Validation.
- Drive upload.
- PROCESSING initial state.
- Audit.

**Phase 4 — Assistant workflow**
- PROCESSING.
- ADJUSTED.
- PENDING_APPROVAL.
- REVISED.
- REVISED_PROCESSING.
- Assistant actions.
- Concurrency control.

**Phase 5 — Leader workflow**
- PENDING_APPROVAL queue.
- Approve.
- Request revision.
- REVISED.
- REVISED_PROCESSING.
- Resubmission.
- Visibility enforcement.

**Phase 6 — Calendar**
- Approved meeting calendar.
- Filters.
- Detail navigation.

**Phase 7 — Staff/Settings**

**Phase 8 — Zalo notifications**

**Phase 9 — QA/security/deployment**

## 7. Reviewer checklist

Reviewer nên tập trung kiểm tra:

### Workflow
- ADJUSTED có đúng là pre-leader revision không?
- REVISED có đúng là post-leader revision không?
- Một request đã vào leader có bao giờ quay về ADJUSTED không?
- Sau khi leader yêu cầu chỉnh, Assistant có đúng hai nhánh: tự xử lý → PENDING_APPROVAL hoặc trả requester chỉnh không?
- Requester submit lại từ REVISED có đúng chuyển sang REVISED_PROCESSING không?
- REVISED_PROCESSING → PENDING_APPROVAL có đúng là do Assistant trình lại không?
- APPROVED → COMPLETED có logic rõ không?

### Visibility
- Leader có chắc chắn không thấy ADJUSTED không?
- Leader có vẫn thấy REVISED và REVISED_PROCESSING không?
- Backend có enforce visibility thay vì chỉ hide UI không?
- Requester có bị chặn truy cập request của người khác không?

### Status terminology
- English/Vietnamese có dễ hiểu với từng role không?
- “Chờ duyệt” của assistant và “Mới” của leader có đúng context không?
- “Chờ bổ sung” của assistant có phân biệt được với “Điều chỉnh” của leader/requester không?

### UX
- PC Table và mobile Card có hợp lý không?
- Detail drawer/Card có đủ thông tin không?
- Các action button có đúng người cần hành động tiếp theo không?
- Status filter của requester có đúng grouping: Đang xử lý = PROCESSING + PENDING_APPROVAL + REVISED_PROCESSING; Điều chỉnh = ADJUSTED + REVISED không?

### Data
- Một request_id xuyên suốt có đáp ứng audit không?
- version có đủ cho optimistic locking không?
- AuditLog có đủ để truy vết status change không?
- Attachments có đủ metadata không?

### Scope
- V1 có đang bị kéo thêm Google Calendar/DB/reporting quá sớm không?
- Có giữ nguyên nguyên tắc Google Sheets + Drive + Zalo cho V1 không?

## 8. Quy tắc làm việc sau handoff

- Reviewer chỉ cần phản hồi các điểm cần sửa/chốt.
- Nếu reviewer không phản đối baseline, tiếp tục Part B.
- Không triển khai code workflow trước khi workflow/status/visibility được reviewer xác nhận.
- Mỗi Part sẽ tiếp tục theo quy trình:
  1. Chốt requirement.
  2. Cập nhật source.
  3. Gửi handoff.
  4. Reviewer kiểm tra.
  5. Chỉ sau khi pass mới chuyển Part tiếp theo.
