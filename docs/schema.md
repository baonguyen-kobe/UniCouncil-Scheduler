# Google Sheets Schema V1

Một Google Spreadsheet vận hành gồm các sheet sau.

## Requests

| Column | Mục đích |
|---|---|
| request_id | ID nghiệp vụ, ví dụ `REQ-2026-000001` |
| version | Optimistic locking |
| status | `PROCESSING` / `PENDING_APPROVAL` / `ADJUSTED` / `REVISED` / `REVISED_PROCESSING` / `APPROVED` / `CANCELLED` / `COMPLETED` |
| requester_id | Staff ID người đăng ký |
| requester_name | Snapshot tên |
| requester_email | Snapshot email |
| unit_id | Đơn vị |
| meeting_title | Tiêu đề hiện tại |
| meeting_content | Nội dung hiện tại |
| requested_leader_ids | Lãnh đạo requester đề nghị |
| requested_date | Ngày mong muốn |
| requested_start_time | Giờ mong muốn |
| estimated_duration | Thời lượng dự kiến |
| requested_location | Địa điểm đề nghị |
| requested_participants | Thành phần đề nghị |
| requester_note | Ghi chú người đăng ký |
| meeting_date | Ngày họp chính thức |
| meeting_start_time | Giờ bắt đầu chính thức |
| meeting_end_time | Giờ kết thúc |
| leader_ids | Lãnh đạo chính thức |
| location_id | Địa điểm chính thức |
| participants | Thành phần chính thức |
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

## Staff

| Column | Mục đích |
|---|---|
| staff_id | ID nhân sự |
| full_name | Họ tên |
| email | Google Workspace email |
| unit_id | Đơn vị |
| position | Chức vụ |
| roles | REQUESTER / ASSISTANT / LEADER / ADMIN |
| zalo_user_id | Mapping Zalo nếu có |
| active | Trạng thái |
| created_at | Ngày tạo |
| updated_at | Ngày cập nhật |

## Units

- unit_id
- unit_code
- unit_name
- short_name
- active
- sort_order

## Locations

- location_id
- location_name
- building
- capacity
- description
- active
- sort_order

## Attachments

| Column | Mục đích |
|---|---|
| attachment_id | ID attachment |
| request_id | Request sở hữu |
| drive_file_id | Google Drive file ID |
| file_name | Tên file |
| mime_type | MIME type |
| file_size | Dung lượng |
| uploaded_by | Người upload |
| uploaded_at | Thời gian |
| status | ACTIVE / REPLACED / DELETED |

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

- school_name
- app_name
- timezone
- drive_root_folder_id
- max_upload_mb
- default_meeting_duration
- request_edit_until_status

Không lưu API secret/password/token nhạy cảm trong sheet này.
