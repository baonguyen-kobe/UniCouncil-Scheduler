# Workflow & Roles

## Roles

- `REQUESTER`: cán bộ/đơn vị đăng ký họp.
- `ASSISTANT`: tổ trợ lý tiếp nhận và hoàn thiện yêu cầu.
- `LEADER`: lãnh đạo phê duyệt.
- `ADMIN`: quản trị hệ thống.

Một người có thể có nhiều role.

## Workflow V1

```text
SUBMITTED
  |
  v
ASSISTANT_REVIEW
  |---------------------------|
  |                           |
  v                           v
PENDING_APPROVAL           ADJUSTED
  |                           |
  |                           | requester bổ sung + gửi lại
  |                           v
  |                    ASSISTANT_REVIEW
  |
  |---------------------|------------------|
  v                     v                  v
APPROVED          NEEDS_REVISION        REJECTED
  |                     |
  |                     v
  |              ASSISTANT_REVIEW
  |
  v
COMPLETED
```

Ngoài ra có `CANCELLED` khi requester chủ động hủy yêu cầu theo quyền workflow.

## Status và ý nghĩa

- `SUBMITTED` → **Đã gửi**: requester đã gửi request.
- `ASSISTANT_REVIEW` → **Đang xử lý**: trợ lý đã tiếp nhận/chỉnh sửa nội dung.
- `PENDING_APPROVAL` → **Đang xử lý** đối với requester; **Chờ lãnh đạo duyệt** đối với assistant.
- `NEEDS_REVISION` → **Đang xử lý** đối với requester; lãnh đạo yêu cầu trợ lý điều chỉnh.
- `ADJUSTED` → **Điều chỉnh**: trợ lý mở lại request để requester bổ sung/chỉnh sửa và gửi lại.
- `APPROVED` → **Đã duyệt**: lãnh đạo đã duyệt.
- `REJECTED` → **Không được duyệt**: lãnh đạo từ chối.
- `CANCELLED` → **Đã hủy**: requester hủy đề xuất.
- `COMPLETED` → **Hoàn thành**: request đã được duyệt và cuộc họp đã qua thời điểm/ngày hiệu lực.

## Auto-complete

- `APPROVED` tự chuyển sang `COMPLETED` sau khi cuộc họp đã qua ngày/thời điểm hiệu lực.
- Khi có lịch chính thức do trợ lý xác định, nên dùng `meeting_date` + `meeting_end_time` (hoặc `meeting_start_time` nếu chưa có end time) làm mốc.
- Nếu chưa có lịch chính thức, fallback sang `requested_date` + thời gian đề xuất.
- Chỉ `ADMIN` và `ASSISTANT` được quyền điều chỉnh thủ công một request đang `COMPLETED` sang trạng thái khác.
- Mọi thay đổi thủ công trạng thái phải ghi vào `AuditLog`.

## Quy tắc

- Một request có một `request_id` duy nhất trong suốt vòng đời.
- Trợ lý chỉnh chính request hiện tại, không tạo một request thứ hai.
- Khi cần requester bổ sung, trợ lý chuyển request sang `ADJUSTED`; requester được mở lại quyền chỉnh và khi gửi lại request trở về `ASSISTANT_REVIEW`.
- Lãnh đạo chủ yếu thực hiện: Duyệt / Yêu cầu chỉnh sửa / Từ chối.
- Request chưa hoàn tất không bị ẩn chỉ vì ngày đề xuất đã qua.
- Mọi thay đổi quan trọng phải ghi audit.

## Optimistic locking

`Requests` có cột `version`.

Mỗi lần ghi thành công:

```text
version = version + 1
```

Nếu người dùng đang sửa version cũ hơn dữ liệu hiện tại, server từ chối overwrite và yêu cầu reload.
