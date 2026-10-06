# Pages V1

## 0. Login `/login`

- Logo trường.
- Tên hệ thống.
- Nút `Đăng nhập bằng Google`.
- Chỉ user hợp lệ trong Google Workspace + `Staff` được vào.

## 1. Requests `/requests`

Page nghiệp vụ trung tâm, hiển thị khác nhau theo role.

### 1A. Danh sách yêu cầu — đã chốt

#### REQUESTER

Quyền xem:
- Chỉ xem được request do chính tài khoản đó tạo.
- Backend bắt buộc filter theo `requester_id = current_user.staff_id`; không chỉ dựa vào UI.

Desktop:
- Chỉ dùng `Table`.
- Click từng request mở `detail drawer`.

Responsive/mobile:
- Hiển thị compact cards.
- Chạm card để mở `detail Card`.

Filter thời gian:
- Tất cả
- Hôm nay
- Ngày mai
- Tuần này
- Tháng này

Filter trạng thái:
- Dropdown multi-select có checkbox.
- Nhóm **Đang xử lý** = `PROCESSING` + `PENDING_APPROVAL` + `ADJUSTED`.
- Nhóm **Điều chỉnh** = `REVISED`.
- Các trạng thái requester thấy trong danh sách/filter: `PROCESSING`, `REVISED`, `APPROVED`, `COMPLETED`, `CANCELLED`.

Default list:
- Ưu tiên các request chưa hoàn tất.
- Ưu tiên tiếp các cuộc họp sắp tới.
- Các request lịch sử vẫn có thể xem qua filter trạng thái/thời gian.

Requester card/row nên ưu tiên các dữ liệu phục vụ đọc nhanh:
- request_id
- trạng thái thân thiện với requester
- meeting_title
- effective date/time
- lãnh đạo liên quan
- địa điểm nếu đã xác định
- thời gian cập nhật gần nhất

#### ASSISTANT

Desktop:
- Dùng `Table` làm chế độ duy nhất ở V1.
- Click từng request mở `detail drawer`.

Responsive/mobile:
- Hiển thị compact cards.
- Chạm card để mở `detail Card`.

Filter đề xuất:
- Trạng thái nội bộ
- Thời gian
- Đơn vị
- Lãnh đạo
- Trợ lý phụ trách
- Search theo mã request / nội dung / người đăng ký

Assistant nhìn thấy status nội bộ cụ thể:
- `PROCESSING` → hiển thị **Mới**.
- `PENDING_APPROVAL` → **Chờ lãnh đạo duyệt**.
- `REVISED` → **Chờ requester bổ sung/chỉnh sửa**.
- `APPROVED` → **Đã duyệt**.
- `COMPLETED` → **Hoàn thành**.
- `CANCELLED` → **Đã hủy**.
- `ADJUSTED` vẫn là trạng thái workflow bắt buộc để assistant xử lý sau khi leader yêu cầu chỉnh; assistant có thể xử lý và gửi thẳng `PENDING_APPROVAL` hoặc chuyển `REVISED` khi cần requester bổ sung.

#### LEADER

Desktop:
- Dùng `Table`.
- Click từng request mở `detail drawer`.

Responsive/mobile:
- Hiển thị compact cards.
- Chạm card để mở `detail Card`.

Leader nhìn thấy các trạng thái:
- `PENDING_APPROVAL` → hiển thị **Mới**; đây là trạng thái có thao tác duyệt/yêu cầu chỉnh sửa.
- `REVISED` → có thể xem để theo dõi.
- `APPROVED` → **Đã duyệt**.
- `COMPLETED` → **Hoàn thành**.

### REQUESTER — nghiệp vụ
- Tạo đăng ký họp.
- Xem yêu cầu của mình.
- Theo dõi trạng thái theo cách hiển thị dành cho requester.
- Chỉnh/hủy khi workflow còn cho phép.

### ASSISTANT — nghiệp vụ
- Tiếp nhận request.
- Chuẩn hóa/chỉnh thông tin.
- Gắn lãnh đạo, ngày giờ, địa điểm, thành phần.
- Trình lãnh đạo bằng cách chuyển `PENDING_APPROVAL`.
- Khi lãnh đạo yêu cầu chỉnh sửa, request chuyển `ADJUSTED`.
- Từ `ADJUSTED`, trợ lý có thể sửa xong và trình lại thẳng `PENDING_APPROVAL`.
- Nếu cần requester bổ sung/chỉnh sửa, chuyển `REVISED`; khi requester gửi lại, request trở về `PROCESSING`.

### LEADER
- Mặc định xem các request `PENDING_APPROVAL` liên quan đến mình.
- Có thể xem thêm `REVISED`, `APPROVED`, `COMPLETED` để theo dõi.
- Xem chi tiết và file.
- Với `PENDING_APPROVAL`: Duyệt / Yêu cầu chỉnh sửa.
- Không có thao tác từ chối trong V1.

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

Các field cụ thể sẽ được chốt ở phần thiết kế Form request.

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
