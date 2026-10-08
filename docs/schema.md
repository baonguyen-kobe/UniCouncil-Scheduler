# Google Sheets Schema V1

Một Google Spreadsheet vận hành gồm các sheet sau.

## Requests

| Column | Mục đích |
|---|---|
| request_id | ID nghiệp vụ, ví dụ `REQ-2026-000001` |
| submission_id | Idempotency key do client tạo mỗi lần submit; dùng lại khi retry để không tạo request trùng |
| drive_folder_id | Folder Google Drive chứa file của request; ID chuẩn để backend truy xuất/đối soát |
| version | Optimistic locking |
| status | `PROCESSING` / `PENDING_APPROVAL` / `ADJUSTED` / `REVISED` / `REVISED_PROCESSING` / `APPROVED` / `CANCELLED` / `COMPLETED` |
| requester_id | Staff ID người đăng ký |
| requester_name | Snapshot họ tên lấy từ tài khoản/Staff khi tạo request |
| requester_email | Snapshot email Google Workspace |
| requester_unit_id | Snapshot đơn vị chính của requester trong Staff, nếu có |
| requested_unit_ids | Các School/Office/Unit requester chọn trên form; multi-select |
| meeting_content | Proposed meeting agenda / Nội dung cuộc họp |
| requested_participants | Proposed meeting participants / Thành phần đề xuất; free text, có thể bao gồm cả tên/chức danh lãnh đạo do requester đề xuất |
| requested_date | Preferred meeting date / Ngày họp đề xuất; chỉ ngày, không có giờ |
| meeting_type_id | Loại cuộc họp nội bộ; default từ MeetingTypes, chỉ Assistant được đổi, Leader được xem, Requester không thấy |
| meeting_date | Ngày họp chính thức |
| meeting_start_time | Giờ bắt đầu chính thức |
| meeting_end_time | Giờ kết thúc chính thức |
| leader_ids | Lãnh đạo chính thức do Assistant chuẩn hóa từ nội dung request/nghiệp vụ; có thể nhiều giá trị; không dùng để giới hạn Leader visibility ở V1 |
| location_id | Địa điểm chính thức |
| participants | Thành phần chính thức do Assistant chuẩn hóa; có thể khác free text requester nhập |
| assistant_id | Trợ lý phụ trách |
| assistant_note | Ghi chú nội bộ |
| priority | Mức độ ưu tiên |
| approval_note | Nội dung trình lãnh đạo |
| leader_decision_note | Ý kiến lãnh đạo |
| approved_by | Người duyệt |
| approved_at | Thời gian duyệt |
| created_at | Ngày tạo |
| created_by | Người tạo |
| updated_at | Lần cập nhật cuối |
| updated_by | Người cập nhật cuối |
| submitted_at | Ngày gửi |
| deleted_at | Soft delete |
| deleted_by | Người loại bỏ |

Requester form V1 không yêu cầu giờ đề xuất, thời lượng đề xuất, địa điểm đề xuất, requester note hoặc meeting type. Các thông tin lịch chính thức do Assistant hoàn thiện sau.

Requester form V1 không có Save Draft/DRAFT và không lưu local/server draft. `requested_participants` có thể ghi cả lãnh đạo; Assistant chịu trách nhiệm chuẩn hóa `leader_ids` và `participants` chính thức.

## Staff

| Column | Mục đích |
|---|---|
| staff_id | ID nhân sự |
| full_name | Họ tên |
| email | Google Workspace email |
| unit_id | Đơn vị chính |
| position | Chức vụ |
| roles | REQUESTER / ASSISTANT / LEADER / ADMIN |
| zalo_user_id | Mapping Zalo nếu có |
| active | Trạng thái |
| created_at | Ngày tạo |
| updated_at | Ngày cập nhật |

## Units

- unit_id
- unit_code
- unit_name_vi
- unit_name_en
- short_name_vi
- short_name_en
- active
- sort_order

UI dùng tên theo ngôn ngữ hiện tại; nếu nhãn của locale đang chọn bị trống thì fallback sang nhãn còn lại.

## MeetingTypes

Danh mục loại cuộc họp do quản trị khai báo trong Google Sheets.

- meeting_type_id
- meeting_type_name_vi
- meeting_type_name_en
- active
- sort_order

Quy tắc:
- Khi tạo request, backend tự gán Meeting Type là item `active` có `sort_order` nhỏ nhất.
- Meeting Type không hiển thị trên form hoặc detail dành cho Requester.
- Chỉ Assistant được thay đổi `meeting_type_id` trong workflow thông thường; thay đổi phải ghi AuditLog.
- Leader được xem Meeting Type nhưng không chỉnh sửa.
- UI hiển thị tên Meeting Type theo locale VI/EN hiện tại.

## Locations

- location_id
- location_name_vi
- location_name_en
- building
- capacity
- description_vi
- description_en
- active
- sort_order

## Attachments

| Column | Mục đích |
|---|---|
| attachment_id | ID attachment |
| request_id | Request sở hữu |
| drive_file_id | Google Drive file ID |
| file_name | Tên gốc của file (tên lưu trên Drive có thể được thêm attachment_id để tránh trùng) |
| mime_type | MIME type |
| file_size | Dung lượng |
| uploaded_by | Người upload |
| uploaded_at | Thời gian |
| status | ACTIVE / REPLACED / DELETED |

File vật lý nằm trong Google Drive; web app lưu metadata ở sheet Attachments và kiểm soát quyền truy cập qua backend.

Drive folder convention: `drive_root_folder_id/YYYY/request_id/`. Một request có một folder riêng. Link thư mục/file để người quản trị bấm mở trực tiếp đang được đề xuất trong Part B; chưa quyết định tạo thêm sheet mapping riêng.

## AuditLog

| Column | Mục đích |
|---|---|
| log_id | ID log |
| request_id | Request liên quan |
| actor_id | Người thao tác |
| action | CREATE / UPDATE / STATUS_CHANGE / SUBMIT / APPROVE / ... |
| field_name | Field bị thay đổi |
| old_value | Giá trị cũ |
| new_value | Giá trị mới |
| created_at | Thời gian |

## ZaloNotifications

- notification_id
- request_id
- recipient_staff_id
- zalo_user_id
- notification_type
- message_template
- status
- attempt_count
- scheduled_at
- sent_at
- error_message
- created_at

Status gợi ý: `PENDING`, `SENDING`, `SENT`, `FAILED`, `CANCELLED`.

## Settings

Dạng key/value:

- school_name_vi
- school_name_en
- app_name_vi
- app_name_en
- timezone
- drive_root_folder_id
- max_upload_mb = 20
- max_upload_files = 10
- allowed_upload_extensions = pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,webp
- default_meeting_duration
- request_edit_until_status
- default_locale

Không lưu API secret/password/token nhạy cảm trong sheet này.
