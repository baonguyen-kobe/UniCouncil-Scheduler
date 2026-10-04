# Workflow & Roles

## Roles

- `REQUESTER`: cán bộ/đơn vị đăng ký họp.
- `ASSISTANT`: tổ trợ lý tiếp nhận và hoàn thiện yêu cầu.
- `LEADER`: lãnh đạo phê duyệt.
- `ADMIN`: quản trị hệ thống.

Một người có thể có nhiều role.

## Workflow V1

```text
DRAFT
  |
  v
SUBMITTED
  |
  v
ASSISTANT_REVIEW
  |
  v
PENDING_APPROVAL
  |---------------------|------------------|
  v                     v                  v
APPROVED          NEEDS_REVISION        REJECTED
                        |
                        v
                ASSISTANT_REVIEW
```

Ngoài ra có thể có `CANCELLED` cho hồ sơ bị hủy.

## Quy tắc

- Requester tạo một request duy nhất.
- Requester có thể sửa khi hồ sơ chưa được trợ lý tiếp nhận, tùy setting.
- Khi trợ lý tiếp nhận, requester không còn chỉnh trực tiếp các trường nghiệp vụ chính.
- Trợ lý chỉnh chính request hiện tại, không tạo một request thứ hai.
- Lãnh đạo chủ yếu thực hiện: Duyệt / Yêu cầu chỉnh sửa / Từ chối.
- Mọi thay đổi quan trọng phải ghi audit.

## Optimistic locking

`Requests` có cột `version`.

Mỗi lần ghi thành công:

```text
version = version + 1
```

Nếu người dùng đang sửa version cũ hơn dữ liệu hiện tại, server từ chối overwrite và yêu cầu reload.
