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
- Hỗ trợ 2 chế độ xem: `Table` và `Card`.
- Có nút chuyển chế độ xem.
- Mặc định ưu tiên `Table` trên PC.

Responsive/mobile:
- Hiển thị compact cards.
- Chạm card để mở phần chi tiết/full-screen detail sheet.

Filter thời gian:
- Tất cả
- Hôm nay
- Ngày mai
- Tuần này
- Tháng này

Filter trạng thái:
- Dropdown multi-select có checkbox.
- Các nhóm hiển thị cho requester: Đã gửi, Đang xử lý, Điều chỉnh, Đã duyệt, Không được duyệt, Đã hủy, Hoàn thành.

Default list:
- Ưu tiên hiển thị các request chưa hoàn tất bất kể ngày đăng ký đã qua.
- Hiển thị request đã duyệt nếu cuộc họp vẫn còn hiệu lực/sắp tới.
- Ẩn lịch sử cũ như `REJECTED`, `CANCELLED`, `COMPLETED` và các cuộc họp đã qua khỏi màn hình mặc định; user vẫn có thể filter để xem lại.

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
- Dùng `Table` làm chế độ chính.
- Không đưa toàn bộ field của request thành cột; chỉ hiện các field cần quét nhanh.
- Có thể bổ sung Card view nếu cần đồng bộ trải nghiệm.
- Click row mở detail drawer bên phải để xem/xử lý nhanh mà không mất vị trí trong danh sách.

Responsive/mobile:
- Compact cards.
- Chạm card mở detail sheet/full-screen detail.

Filter đề xuất:
- Trạng thái nội bộ
- Thời gian
- Đơn vị
- Lãnh đạo
- Trợ lý phụ trách
- Search theo mã request / nội dung / người đăng ký

Trợ lý nhìn thấy status chi tiết hơn requester, ví dụ:
- `SUBMITTED` → Mới
- `ASSISTANT_REVIEW` → Đang xử lý
- `PENDING_APPROVAL` → Chờ lãnh đạo duyệt
- `NEEDS_REVISION` → Lãnh đạo yêu cầu chỉnh
- `ADJUSTED` → Chờ đơn vị bổ sung
- `APPROVED` → Đã duyệt
- `REJECTED` → Không được duyệt
- `CANCELLED` → Đã hủy
- `COMPLETED` → Hoàn thành

Các cột desktop cụ thể sẽ chốt ở bước riêng.

### REQUESTER — nghiệp vụ
- Tạo đăng ký họp.
- Xem yêu cầu của mình.
- Theo dõi trạng thái.
- Chỉnh/hủy khi workflow còn cho phép.

### ASSISTANT — nghiệp vụ
- Tiếp nhận request.
- Chuẩn hóa/chỉnh thông tin.
- Gắn lãnh đạo, ngày giờ, địa điểm, thành phần.
- Trình lãnh đạo.
- Có thể trả lại request cho requester bổ sung/chỉnh sửa (`ADJUSTED`).

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
