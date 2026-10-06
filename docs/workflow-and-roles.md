# Workflow & Roles

## Roles

- `REQUESTER`: cán bộ/đơn vị đăng ký họp.
- `ASSISTANT`: tổ trợ lý tiếp nhận, hoàn thiện và điều phối request.
- `LEADER`: lãnh đạo xem xét/phê duyệt.
- `ADMIN`: quản trị hệ thống.

Một người có thể có nhiều role.

## Workflow V1

NaN``
PROCESSING
   |
   v
PENDING_APPROVAL
   |----------------------|
   |                      |
   v                      v
APPROVED               ADJUSTED
   |                      |
   |                      v
   |                  REVISED
   |                      |
   |                      | requester chỉnh sửa + gửi lại
   |                      v
   |                  PROCESSING
   |
   v
COMPLETED
NaN``

Ngoài ra có `CANCELLED` khi requester chủ động hủy yêu cầu theo quyền workflow.

## Status và ý nghĩa

- `PROCESSING` → **Đang xử lý**: request đã được requester gửi và đang trong quy trình xử lý; bao gồm giai đoạn trợ lý tiếp nhận/chỉnh sửa và sau khi requester gửi lại.
- `PENDING_APPROVAL` → **Đang xử lý** đối với requester; **Chờ lãnh đạo duyệt** đối với assistant.
- `ADJUSTED` → **Điều chỉnh**: lãnh đạo yêu cầu chỉnh sửa request.
- `REVISED` → **Điều chỉnh**: trợ lý đã gửi request trở lại cho requester để bổ sung/chỉnh sửa.
- `APPROVED` → **Đã duyệt**: lãnh đạo đã duyệt request.
- `CANCELLED` → **Đã hủy**: requester chủ động hủy đề xuất.
- `COMPLETED` → **Hoàn thành**: request đã được duyệt và cuộc họp đã qua ngày/thời điểm hiệu lực.

Không có trạng thái `REJECTED` trong V1. Nếu lãnh đạo không đồng ý nội dung hiện tại, request đi qua vòng `ADJUSTED → REVISED → PROCESSING` để chỉnh sửa.

## Auto-complete

- `APPROVED` tự chuyển sang `COMPLETED` sau khi cuộc họp đã qua ngày/thời điểm hiệu lực.
- Khi trợ lý đã xác định lịch chính thức, ưu tiên dùng `meeting_date` + `meeting_end_time` (hoặc `meeting_start_time` nếu chưa có end time) làm mốc.
- Nếu chưa có lịch chính thức, fallback sang `requested_date` + thời gian đề xuất.
- Chỉ `ADMIN` và `ASSISTANT` được quyền điều chỉnh thủ công một request đang `COMPLETED` sang trạng thái khác.
- Mọi thay đổi thủ công trạng thái phải ghi vào `AuditLog`.

## Quy tắc

- Một request có một `request_id` duy nhất trong suốt vòng đời.
- Trợ lý chỉnh chính request hiện tại, không tạo một request thứ hai.
- Sau khi requester gửi lần đầu, request vào `PROCESSING`; không sử dụng trạng thái `SUBMITTED`.
- Khi lãnh đạo yêu cầu chỉnh sửa, request chuyển sang `ADJUSTED`.
- Trợ lý gửi request cho requester bổ sung/chỉnh sửa thì chuyển sang `REVISED`.
- Khi requester chỉnh sửa và gửi lại, request trở về `PROCESSING`.
- Requester được quyền hủy theo workflow khi request chưa hoàn tất và chưa bị khóa bởi trạng thái không cho phép hủy.
- Lãnh đạo V1 không có thao tác “Từ chối”; chỉ có duyệt hoặc yêu cầu chỉnh sửa.
- Request chưa hoàn tất không bị ẩn chỉ vì ngày đề xuất đã qua.
- Mọi thay đổi quan trọng phải ghi audit.

## Optimistic locking

`Requests` có cột `version`.

Mỗi lần ghi thành công:

NaN``
version = version + 1
NaN``

Nếu người dùng đang sửa version cũ hơn dữ liệu hiện tại, server từ chối overwrite và yêu cầu reload.