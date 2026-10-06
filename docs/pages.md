
# Pages V1

## 0. Login /login

- Logo trường.
- Tên hệ thống.
- Nút **Đăng nhập bằng Google**.
- Chỉ user hợp lệ trong Google Workspace + Staff mới được vào.

## 1. Requests /requests

Page nghiệp vụ trung tâm, hiển thị khác nhau theo role.

### 1A. Danh sách yêu cầu — đã chốt

#### REQUESTER

Quyền xem:
- Chỉ xem được request do chính tài khoản đó tạo.
- Backend bắt buộc filter theo requester_id = current_user.staff_id; không chỉ dựa vào UI.

Desktop:
- Chỉ dùng **Table**.
- Click từng request mở **detail drawer**.

Responsive/mobile:
- Hiển thị **compact cards**.
- Chạm card để mở **detail Card**.

Filter thời gian:
- Tất cả
- Hôm nay
- Ngày mai
- Tuần này
- Tháng này

Filter trạng thái:
- Dropdown multi-select có checkbox.
- Nhóm **Đang xử lý** = PROCESSING + PENDING_APPROVAL + ADJUSTED.
- Nhóm **Điều chỉnh** = REVISED.
- Các trạng thái requester thấy trong danh sách/filter: PROCESSING, REVISED, APPROVED, COMPLETED, CANCELLED.

Default list:
- Ưu tiên các request chưa hoàn tất.
- Ưu tiên tiếp các cuộc họp sắp tới.
- Các request lịch sử vẫn có thể xem qua filter trạng thái/thời gian.

Requester card/row nên ưu tiên:
- request_id
- trạng thái thân thiện với requester
- meeting_title
- effective date/time
- lãnh đạo liên quan
- địa điểm nếu đã xác định
- thời gian cập nhật gần nhất

Requester không cần biết ADJUSTED là trạng thái nội bộ; mọi ADJUSTED hiển thị là **Điều chỉnh**.

#### ASSISTANT

Desktop:
- Dùng **Table** làm chế độ duy nhất ở V1.
- Click từng request mở **detail drawer**.

Responsive/mobile:
- Hiển thị **compact cards**.
- Chạm card để mở **detail Card**.

Filter:
- Trạng thái nội bộ
- Thời gian
- Đơn vị
- Lãnh đạo
- Trợ lý phụ trách
- Search theo mã request / nội dung / người đăng ký

Assistant nhìn thấy status cụ thể:
- PROCESSING → **New / Mới**
- PENDING_APPROVAL → **Pending Approval / Chờ duyệt**
- ADJUSTED → **Adjusted / Chờ bổ sung**
- REVISED → **Revised / Điều chỉnh**
- APPROVED → **Approved / Đã duyệt**
- COMPLETED → **Completed / Hoàn thành**
- CANCELLED → **Cancelled / Đã hủy**

Ý nghĩa ADJUSTED:
- Request chưa từng được trình lãnh đạo.
- Assistant yêu cầu requester bổ sung/chỉnh sửa.
- Leader không thấy request này.
- Requester chỉnh sửa + gửi lại → PROCESSING.

Ý nghĩa REVISED:
- Request đã từng được trình lãnh đạo.
- Leader đã yêu cầu chỉnh sửa.
- Assistant xử lý ở REVISED và sau khi hoàn tất sẽ trình lại → PENDING_APPROVAL.
- Không chuyển REVISED về ADJUSTED.

#### LEADER

Desktop:
- Dùng **Table**.
- Click từng request mở **detail drawer**.

Responsive/mobile:
- Hiển thị **compact cards**.
- Chạm card để mở **detail Card**.

Tập request leader được phép thấy:
- PENDING_APPROVAL → **New / Mới**
- REVISED → **Revising / Điều chỉnh**
- APPROVED → **Approved / Đã duyệt**
- COMPLETED → **Completed / Hoàn thành**

Leader không thấy:
- PROCESSING
- ADJUSTED
- CANCELLED

Đặc biệt:
- Request bị assistant yêu cầu requester bổ sung trước khi từng được trình lãnh đạo (ADJUSTED) không xuất hiện ở leader.
- Request đã từng được trình lãnh đạo và sau đó bị leader yêu cầu chỉnh sửa (REVISED) vẫn xuất hiện ở leader để theo dõi.

Default:
- Ưu tiên PENDING_APPROVAL liên quan đến leader để xử lý.
- REVISED vẫn nằm trong tập theo dõi.
- APPROVED và COMPLETED có thể xem qua list/filter để tra cứu.

Actions:
- PENDING_APPROVAL: **Duyệt** / **Yêu cầu chỉnh sửa**
- REVISED: theo dõi, không tạo một vòng REVISED mới.
- Không có thao tác **Từ chối** trong V1.

### 1B. Chi tiết request

Desktop:
- Mở bằng drawer từ danh sách.
- Có thể chuyển sang chế độ rộng hơn khi nội dung/file nhiều.

Mobile:
- Dùng detail Card/full-page style thay vì cố ép drawer rộng.

Chi tiết nên thể hiện:
- Request ID
- Status theo role
- Nội dung request
- Người đăng ký / đơn vị
- Lãnh đạo liên quan
- Thời gian đề xuất
- Lịch chính thức nếu đã có
- Địa điểm
- Thành phần
- File đính kèm
- Ghi chú phù hợp với role
- Timeline/audit summary khi cần

Banner ngữ cảnh:
- ADJUSTED: requester thấy **Điều chỉnh**; assistant thấy **Chờ bổ sung**.
- REVISED: requester/assistant thấy **Điều chỉnh**; leader thấy **Điều chỉnh** và biết đây là request đang được requester chỉnh sửa sau ý kiến lãnh đạo.

## REQUESTER — nghiệp vụ

- Tạo đăng ký họp.
- Xem yêu cầu của mình.
- Theo dõi trạng thái theo cách hiển thị dành cho requester.
- Chỉnh/hủy khi workflow còn cho phép.
- Không được truy cập request của requester khác; backend phải enforce quyền này.

## ASSISTANT — nghiệp vụ

- Tiếp nhận request PROCESSING.
- Chuẩn hóa/chỉnh thông tin.
- Gắn lãnh đạo, ngày giờ, địa điểm, thành phần.
- Yêu cầu requester bổ sung → ADJUSTED.
- Khi requester gửi lại → PROCESSING.
- Trình lãnh đạo → PENDING_APPROVAL.
- Khi leader yêu cầu chỉnh sửa → REVISED.
- Xử lý request REVISED và trình lại → PENDING_APPROVAL.
- Có thể chỉnh request trực tiếp trong phạm vi quyền.
- Không tạo request mới cho một vòng chỉnh sửa.

## LEADER — nghiệp vụ

- Mặc định xử lý PENDING_APPROVAL liên quan đến mình.
- Theo dõi REVISED của request mình đã tham gia.
- Xem APPROVED và COMPLETED để tra cứu.
- Xem chi tiết và file.
- Với PENDING_APPROVAL: **Duyệt / Yêu cầu chỉnh sửa**.
- Không có **Từ chối** trong V1.
- Không thấy request đang ADJUSTED trước vòng lãnh đạo.

## 2. Request form /requests/new

Form được xây trực tiếp trên web, không dùng Google Form ở V1.

Thông tin người đăng ký:
- requester
- email
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

Các field và validation chi tiết của form sẽ được chốt ở Part B.

## 3. Calendar /calendar

- Lịch tháng / tuần / danh sách.
- Render từ request đã được duyệt.
- Filter theo lãnh đạo, đơn vị, địa điểm, loại họp khi có.
- Click event để xem chi tiết và tài liệu.
- V1 chưa tích hợp Google Calendar.

## 4. Staff /staff

- Quản lý nhân sự.
- Họ tên, email, đơn vị, chức vụ, roles, trạng thái hoạt động, Zalo mapping.
- Chỉ admin hoặc người được phân quyền.

## 5. Settings /settings

Nhóm cấu hình:
- Hệ thống: tên trường, tên app, timezone, logo.
- Request: giới hạn file, thời lượng mặc định, quy tắc đăng ký.
- Workflow: quyền chỉnh sửa, quy tắc duyệt.
- Drive: root folder ID / cấu trúc folder.
- Zalo: cấu hình nghiệp vụ và template không nhạy cảm.

Secret/token để trong Vercel Environment Variables, không lưu trực tiếp trong Sheet.
