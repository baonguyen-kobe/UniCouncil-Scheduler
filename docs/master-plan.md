
# Master Plan V1 — UniCouncil Scheduler

> Đây là master plan baseline đã thống nhất đến checkpoint hiện tại. Tài liệu này là bản tổng hợp để reviewer có thể đánh giá toàn bộ định hướng trước khi chuyển sang phần thiết kế tiếp theo.

## 1. Mục tiêu sản phẩm

Xây một web app quản lý toàn bộ vòng đời yêu cầu đăng ký họp với lãnh đạo trường:

1. Cán bộ/requester đăng ký trực tiếp trên web.
2. Trợ lý tiếp nhận, kiểm tra và hoàn thiện request.
3. Trợ lý trình request cho lãnh đạo.
4. Lãnh đạo duyệt hoặc yêu cầu chỉnh sửa.
5. Requester/trợ lý xử lý vòng chỉnh sửa theo đúng ngữ cảnh.
6. Request đã duyệt được hiển thị trên lịch web.
7. File đính kèm được lưu trên Google Drive.
8. Thông báo nghiệp vụ ưu tiên qua Zalo OA/Bot.
9. Toàn bộ thay đổi quan trọng có audit trail.

## 2. Phạm vi V1

### Có trong V1

- Login bằng Google Workspace / Google OIDC.
- Session-based authentication.
- Role-based authorization.
- Web request form.
- Request list/detail theo role.
- Workflow xử lý → trình duyệt → chỉnh sửa → duyệt → hoàn thành.
- Google Sheets làm operational data store.
- Google Drive làm file storage.
- Calendar render trực tiếp từ request đã duyệt.
- Zalo OA/Bot là notification channel ưu tiên.
- AuditLog.
- Optimistic locking bằng version.
- Soft delete.
- Responsive UI với layout PC và mobile được tối ưu riêng.

### Không có trong V1

- Google Form.
- Đồng bộ Google Calendar.
- Trạng thái REJECTED.
- Hai bản request song song.
- Email hàng loạt làm notification chính.
- Database PostgreSQL/Supabase ngay từ đầu.
- Workflow nhiều cấp duyệt, trừ khi thực tế phát sinh yêu cầu mới.

## 3. Kiến trúc

~~~text
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
 operational      files
     data
      |
      v
   Zalo OA/Bot
 notifications
~~~

### Technology baseline

- Next.js + TypeScript.
- Tailwind CSS + shadcn/ui.
- Vercel + custom domain.
- Google Workspace OIDC/session.
- Google Sheets API.
- Google Drive API.
- Zalo OA/Bot API.

Secret/token chỉ nằm trong Vercel Environment Variables.

## 4. Roles

### REQUESTER

- Tạo request.
- Xem request do chính mình tạo.
- Chỉnh sửa khi workflow yêu cầu.
- Gửi lại request.
- Hủy khi workflow cho phép.

### ASSISTANT

- Tiếp nhận request.
- Kiểm tra/chuẩn hóa.
- Bổ sung thông tin nghiệp vụ.
- Yêu cầu requester bổ sung.
- Trình lãnh đạo.
- Xử lý request sau khi lãnh đạo yêu cầu chỉnh sửa.
- Quản lý lịch chính thức trong phạm vi được phân quyền.

### LEADER

- Mọi user có role LEADER thấy cùng một leader queue ở V1; chưa phân tách visibility theo từng leader cụ thể.
- Xem request đã bước vào vòng lãnh đạo.
- Duyệt.
- Yêu cầu chỉnh sửa.
- Theo dõi request đang trong vòng chỉnh sửa sau ý kiến lãnh đạo.

### ADMIN

- Quản trị Staff/Settings và các thao tác ngoại lệ.
- Có thể xử lý các trường hợp workflow cần can thiệp.

Một user có thể có nhiều role.

## 5. Workflow chính thức

~~~text
PROCESSING
   |
   | Assistant yêu cầu requester bổ sung
   v
ADJUSTED
   |
   | Requester chỉnh sửa + gửi lại
   v
PROCESSING
   |
   | Assistant hoàn tất + trình lãnh đạo
   v
PENDING_APPROVAL
   |---------------------------|
   |                           |
   | Leader duyệt              | Leader yêu cầu chỉnh sửa
   v                           v
APPROVED                    REVISED
   |                           |\
   |                           | \ Assistant tự xử lý + trình lại
   v                           |  \------------------> PENDING_APPROVAL
COMPLETED                    |
                             | Assistant gửi requester chỉnh
                             | Requester chỉnh sửa + gửi lại
                             v
                    REVISED_PROCESSING
                             |
                             | Assistant xử lý + trình lại
                             v
                    PENDING_APPROVAL

CANCELLED là nhánh hủy riêng.
~~~

### Nguyên tắc phân biệt trạng thái

- **ADJUSTED**: assistant yêu cầu requester bổ sung/chỉnh sửa trước khi request từng được trình lãnh đạo. Leader không thấy.
- **REVISED**: request đã từng được trình lãnh đạo và leader yêu cầu chỉnh sửa. Leader vẫn thấy. Assistant có thể tự xử lý rồi trình lại, hoặc gửi requester chỉnh.
- **REVISED_PROCESSING**: requester đã gửi lại request sau yêu cầu chỉnh của leader; Assistant đang xử lý trước khi trình lại. Leader vẫn thấy.
- Một request đã từng vào vòng lãnh đạo không quay lại ADJUSTED.
- Không dùng PROCESSING cho request hậu-leader đã được requester gửi lại; dùng REVISED_PROCESSING.
- Không tạo request mới cho các vòng chỉnh sửa.

## 6. Status display matrix

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

System status là dữ liệu chuẩn; display label theo role chỉ là presentation layer.

## 7. Visibility rules

### Requester

Chỉ được xem request có requester_id bằng staff_id hiện tại.

### Assistant

Được xem các request thuộc phạm vi nghiệp vụ được phân quyền và có status phù hợp.

### Leader

Chỉ đưa vào tập hiển thị các request đã từng bước vào vòng lãnh đạo:

- PENDING_APPROVAL
- REVISED
- REVISED_PROCESSING
- APPROVED
- COMPLETED

Không hiển thị:

- PROCESSING
- ADJUSTED
- CANCELLED

Đây là rule backend, không chỉ là filter UI.

## 8. Pages

### /login

- Google sign-in.
- Chặn user không hợp lệ.

### /requests

Role-specific request list.

Desktop:
- Table.
- Click row → detail drawer.

Mobile:
- Compact card.
- Click → detail Card/full-page style.

Requester:
- Time filters: Tất cả, Hôm nay, Ngày mai, Tuần này, Tháng này.
- Multi-select status filter.
- Đang xử lý = PROCESSING + PENDING_APPROVAL + REVISED_PROCESSING.
- Điều chỉnh = ADJUSTED + REVISED.

Assistant:
- Status, time, unit, leader, assigned assistant, search.

Leader:
- PENDING_APPROVAL là tập xử lý chính.
- REVISED và REVISED_PROCESSING là tập theo dõi sau khi leader yêu cầu chỉnh sửa.
- APPROVED/COMPLETED dùng cho tra cứu.

### /requests/new

Form đăng ký trực tiếp trên web.

### /calendar

- Month/week/list.
- Render từ request APPROVED/COMPLETED theo lịch chính thức.
- Filter theo leader/unit/location/meeting type khi có.
- Không sync Google Calendar ở V1.

### /staff

Quản lý Staff, role, unit, active status, Zalo mapping.

### /settings

System/request/workflow/Drive/Zalo settings.

## 9. Data model V1

Một Google Spreadsheet gồm:

- Requests
- Staff
- Units
- MeetingTypes
- Locations
- Attachments
- AuditLog
- ZaloNotifications
- Settings

### Requests — nhóm field chính

- request identity: request_id, version, status, submission_id, drive_folder_id, drive_folder_url.
- requester snapshot: requester_id, requester_name, requester_email, requester_unit_id.
- requested content: requested_unit_ids, meeting_content, requested_participants, requested_date.
- internal classification: meeting_type_id.
- official schedule: meeting_date, meeting_start_time, meeting_end_time.
- official participants/organization: leader_ids, location_id, participants.
- assistant/approval: assistant_id, assistant_note, priority, approval_note, revision_target, revision_instruction, leader_decision_note, approved_by, approved_at.
- lifecycle metadata: created_at, created_by, updated_at, updated_by, submitted_at, deleted_at, deleted_by.

### Attachments

File vật lý ở Drive; metadata ở Attachments.

### AuditLog

Mọi thay đổi quan trọng và status transition phải được audit.

## 10. Data integrity & security

- Backend enforce authorization.
- Requester không thể đọc request của người khác bằng cách sửa request_id trên client.
- Leader visibility được enforce ở backend.
- Secrets không nằm trong Sheets.
- version chống lost update.
- Soft delete.
- Một request_id xuyên suốt workflow.
- File truy cập thông qua quyền của web app/backend, không coi Drive URL là business key.

## 11. Auto-complete

APPROVED tự chuyển COMPLETED sau khi meeting đã qua thời điểm hiệu lực.

Ưu tiên:
1. meeting_date + meeting_end_time.
2. meeting_date + meeting_start_time nếu không có end time.
3. requested_date + requested time nếu chưa có lịch chính thức.

ADMIN và ASSISTANT mới được sửa thủ công request COMPLETED sang status khác; thao tác phải audit.

## 12. UX principles

- PC và mobile được thiết kế tối ưu riêng, không chỉ co nhỏ cùng một layout.
- Request list PC dùng Table.
- Request list mobile dùng compact Card.
- Detail PC dùng drawer.
- Detail mobile dùng Card/full-page style.
- Status label phải đúng ngữ cảnh role.
- Không để user thấy internal status nếu không cần.
- Action button phải thể hiện rõ ai là người cần hành động tiếp theo.

## 13. Development roadmap

### Phase 0 — Product baseline
**Trạng thái: Đã chốt về mặt thiết kế**

- Architecture.
- Roles.
- Workflow.
- Status matrix.
- Role visibility.
- Page map.
- Schema baseline.
- Technical decisions.

### Phase 1 — Foundation
**Sắp triển khai**

- Khởi tạo Next.js/TypeScript/Tailwind/shadcn.
- App shell/layout.
- Google Workspace authentication.
- Session.
- Staff lookup.
- Role guard.
- Vercel environment configuration.

### Phase 2 — Requests list/detail
**Sắp triển khai sau khi reviewer duyệt baseline**

- /requests.
- Role-specific query.
- Backend visibility.
- Table desktop.
- Card mobile.
- Filters/search.
- Detail drawer/card.
- Status badges.

### Phase 3 — Request form
**Part B đã chốt về mặt yêu cầu; còn triển khai và QA**

- /requests/new hỗ trợ VI/EN.
- Full name read-only từ Google Workspace/Staff.
- School/Office/Unit multi-select từ Units.
- Proposed meeting agenda.
- Proposed meeting participants là free text và có thể bao gồm lãnh đạo dự kiến.
- Preferred meeting date chỉ ngày, default today.
- Attachment optional, lưu Drive.
- Requester không chọn leader/time/duration/location/Meeting Type.
- Meeting Type là metadata nội bộ từ MeetingTypes; Assistant được đổi, Leader chỉ xem.
- Assistant chuẩn hóa leader_ids và participants chính thức.
- Không có Save Draft/local autosave/server draft.
- Submit thành công tạo request PROCESSING.
- Validation đã chốt: Units >= 1; agenda và participants bắt buộc, tối đa 3.000 ký tự; preferred date >= today; server validation authoritative.
- Attachment đã chốt: optional, tối đa 10 file, **4 MB/file**; PDF/Office/ảnh phổ biến.
- Submit flow đã chốt: client submission_id; backend validate và chống gửi trùng; folder Drive `root/YYYY/request_id/`; upload file xong mới commit Requests + Attachments + AuditLog atomically trong Sheets; trả success sau commit.
- Nếu **một file** upload lỗi: hiển thị chính xác file lỗi, nguyên nhân và Retry/Replace/Remove. File khác đã upload thành công được giữ trong staging Drive; không rollback toàn bộ ngay. Chỉ commit request khi các file còn trong danh sách đều thành công.
- Nếu form bị bỏ dở hoặc staging hết hạn: cleanup folder/file chưa commit qua reconciliation. Lỗi commit Sheets xử lý riêng, phải kiểm tra submission_id trước khi retry/cleanup, không bắt upload lại file đã thành công.
- File có upload_item_id cố định theo submission_id để retry/timeout không tạo file trùng.
- Upload mỗi file tối đa **4 MB** trong một HTTP request riêng qua Vercel backend sang Google Drive, đảm bảo tổng payload dưới giới hạn 4.5 MB; không dùng Vercel làm nơi lưu file.
- **Đã chốt không tạo Drive mapping sheet riêng**. Requests lưu drive_folder_id/drive_folder_url và Attachments lưu drive_file_id/drive_file_url; link để bấm mở trong Google Sheets, IDs là khóa chuẩn.
- **Requester edit/resubmit đã chốt:** chỉ cho chủ request sửa khi ADJUSTED+REQUESTER hoặc REVISED+REQUESTER; giữ request_id, optimistic locking/version và AuditLog.
- **Assistant bắt buộc ghi revision_instruction** khi chuyển cho Requester chỉnh. **Leader có textarea góp ý tùy chọn** (leader_decision_note) khi yêu cầu chỉnh; nếu để trống vẫn REVISED+ASSISTANT.
- Resubmit ADJUSTED→PROCESSING; REVISED+REQUESTER→REVISED_PROCESSING; reset revision_target. Không có status mới.

### Phase 4 — Assistant workflow
**Chưa triển khai**

- Process request.
- ADJUSTED+REQUESTER (revision_instruction required), requester resubmit.
- Chuẩn hóa nội dung.
- Gắn lịch chính thức.
- PENDING_APPROVAL.
- Audit.
- Optimistic locking.
- Permission checks.

### Phase 5 — Leader workflow
**Chưa triển khai**

- PENDING_APPROVAL queue.
- Approve.
- Request revision + leader_decision_note optional.
- REVISED với revision_target=ASSISTANT/REQUESTER.
- REVISED_PROCESSING.
- Resubmission.
- Leader visibility rule.

### Phase 6 — Calendar
**Chưa triển khai**

- Calendar UI.
- Approved events.
- Filters.
- Detail navigation.

### Phase 7 — Staff & Settings
**Chưa triển khai**

- Staff management.
- Units.
- Locations.
- Settings.
- Permission management.

### Phase 8 — Zalo
**Chưa triển khai**

- Notification templates.
- Recipient mapping.
- Queue/status.
- Retry.
- Error handling.

### Phase 9 — Hardening & release
**Chưa triển khai**

- Permission/security testing.
- Workflow transition testing.
- Concurrent edit testing.
- Attachment testing.
- Mobile/desktop QA.
- Audit verification.
- Vercel deployment.
- Production smoke test.

## 14. V1 → Phase sau

Chỉ cân nhắc sau khi V1 chạy ổn:

- Google Calendar integration.
- PostgreSQL/Supabase nếu Google Sheets trở thành bottleneck.
- Dashboard/reporting.
- Workflow nhiều cấp duyệt.
- Advanced notification rules.

## 14A. Part C — EIU branding và UI/UX trước implementation

- Tham chiếu [UniCouncil Part C UI/UX Guidelines](ui-ux-guidelines.md).
- Bộ màu EIU đã chốt với user (2026-10-08): EIU Blue `#144069`, EIU Gold `#A78656`, EIU Gray **`#58595B`**, EIU Cream **`#EAE2D6`** và các màu phụ trong `ui-ux-guidelines.md`.
- Sidebar kế thừa đúng **EIU MedLabs V2 Master** (gradient xanh, menu active nền trắng + vạch gold), Full Logo EIU trong nền trắng; Login dùng EIU Corner Logo.
- Typography theo override của user: **Crimson Pro chính (đã chốt)**, **Be Vietnam Pro phụ** (khác MedLabs V2 vốn dùng Be Vietnam Pro).
- Người dùng muốn **badge trạng thái nền pastel nhạt**, tham khảo [EIU Schedule](https://github.com/nhutbao1314-hub/eiu-schedule): 5 tone Info/Warning/Success/Danger/Neutral. Chi tiết foreground/background và role-label mapping trong ui-ux-guidelines.md; mapping cụ thể là đề xuất chờ review.
- Người dùng **đã xác nhận** EIU Gray `#58595B` và EIU Cream `#EAE2D6` sau khi đối chiếu sai lệch HEX/RGB trong ảnh branding.
- **Tất cả icon dùng Heroicons v2 (`@heroicons/react`)**, theo đính chính mới nhất của người dùng; không trộn các bộ icon. Còn chốt role-based workspace/navigation và mapping badge pastel trước UI coding.
- Quyền role/workflow/status theo Part B giữ nguyên; không copy business logic MedLabs.

## 15. Current checkpoint

Đã chốt:
- Architecture baseline.
- Roles.
- Workflow semantics.
- Status names English/Vietnamese.
- Role-specific status visibility.
- ADJUSTED vs REVISED vs REVISED_PROCESSING distinction.
- /requests UX baseline.
- Google Sheets schema baseline.
- Technical decisions.

Part B đã chốt về mặt yêu cầu:
- Field baseline, validation, attachment, submit flow và xử lý lỗi đã chốt.
- Requester edit/resubmit, revision_target, Assistant instructions required và Leader comments optional đã chốt.
- Cần triển khai/kiểm chứng workflow, concurrency, staging upload và permissions trước production.

Reviewer checkpoint hiện tại:
**Part B requirement baseline hoàn tất; tiếp theo là implementation và QA permission/workflow/upload.**
