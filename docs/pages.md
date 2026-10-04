# Pages V1

## 0. Login `/login`

- Logo trường.
- Tên hệ thống.
- Nút `Đăng nhập bằng Google`.
- Chỉ user hợp lệ trong Google Workspace + `Staff` được vào.

## 1. Requests `/requests`

Page nghiệp vụ trung tâm, hiển thị khác nhau theo role.

### REQUESTER
- Tạo đăng ký họp.
- Xem yêu cầu của mình.
- Theo dõi trạng thái.
- Chỉnh/hủy khi workflow còn cho phép.

### ASSISTANT
- Tab: Mới, Đang xử lý, Chờ duyệt, Cần chỉnh, Đã duyệt, Từ chối, Hủy.
- Tiếp nhận request.
- Chuẩn hóa/chỉnh thông tin.
- Gắn lãnh đạo, ngày giờ, địa điểm, thành phần.
- Trình lãnh đạo.

### LEADER
- Mặc định xem các request `PENDING_APPROVAL` liên quan đến mình.
- Xem chi tiết và file.
- Duyệt / Yêu cầu chỉnh sửa / Từ chối.

### Form request

Thông tin người đăng ký:
- requester
- unit
- meeting_title
- meeting_content / purpose
- requested_leaders
- requested_date
- requested_start_time
- estimated_duration
- requested_location
- requested_participants
- requester_note
- attachments

Thông tin trợ lý hoàn thiện:
- assigned assistant
- meeting_date
- meeting_start_time
- meeting_end_time
- leader_ids
- location_id
- meeting_title/content đã chuẩn hóa
- participants
- assistant_note
- priority
- approval_note

## 2. Calendar `/calendar`

- Lịch tháng / tuần / danh sách.
- Render từ request đã duyệt.
- Filter theo lãnh đạo, đơn vị, địa điểm, loại họp khi có.
- Click event để xem chi tiết và tài liệu.

## 3. Staff `/staff`

- Quản lý nhân sự.
- Họ tên, email, đơn vị, chức vụ, roles, trạng thái hoạt động, Zalo mapping.
- Chỉ admin hoặc người được phân quyền.

## 4. Settings `/settings`

Nhóm cấu hình:
- Hệ thống: tên trường, tên app, timezone, logo.
- Request: giới hạn file, thời lượng mặc định, quy tắc đăng ký.
- Workflow: quyền chỉnh sửa, quy tắc duyệt.
- Drive: root folder ID / cấu trúc folder.
- Zalo: cấu hình nghiệp vụ và template không nhạy cảm.

Secret/token để trong Vercel Environment Variables, không lưu trực tiếp trong Sheet.
