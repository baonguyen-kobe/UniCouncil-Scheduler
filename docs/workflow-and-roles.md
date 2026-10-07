
# Workflow & Roles

## Roles

- **REQUESTER**: cán bộ/đơn vị đăng ký họp.
- **ASSISTANT**: tổ trợ lý tiếp nhận, hoàn thiện và điều phối request.
- **LEADER**: lãnh đạo xem xét/phê duyệt.
- **ADMIN**: quản trị hệ thống.
- Một người có thể có nhiều role.

## Workflow V1 — chốt

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
   | Assistant xử lý xong + trình
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

CANCELLED là nhánh hủy riêng theo quyền workflow.
~~~

## Quy tắc phân biệt ADJUSTED và REVISED

Đây là rule nghiệp vụ quan trọng nhất của V1:

- **ADJUSTED** = trợ lý yêu cầu requester bổ sung/chỉnh sửa **trước khi request từng được trình lãnh đạo**.
  - Requester thấy: **Revised / Điều chỉnh**.
  - Assistant thấy: **Adjusted / Chờ bổ sung**.
  - Leader **không thấy request này**.
- **REVISED** = request **đã từng được trình lãnh đạo** và lãnh đạo yêu cầu chỉnh sửa.
  - Requester thấy: **Revised / Điều chỉnh**.
  - Assistant thấy: **Revised / Điều chỉnh**.
  - Leader thấy: **Revising / Điều chỉnh** để theo dõi.

Một request đã bước vào vòng lãnh đạo thì **không bao giờ quay lại ADJUSTED**. Khi leader yêu cầu chỉnh, request vào **REVISED**. Nếu Assistant trả requester chỉnh và requester gửi lại, request chuyển sang **REVISED_PROCESSING** để Assistant tiếp tục xử lý trước khi trình lại leader.

## Status display matrix

| Status hệ thống | Requester – English | Requester – Tiếng Việt | Assistant – English | Assistant – Tiếng Việt | Leader – English | Leader – Tiếng Việt |
|---|---|---|---|---|---|---|
| PROCESSING | **Processing** | **Đang xử lý** | **New** | **Mới** | — | — |
| PENDING_APPROVAL | **Processing** | **Đang xử lý** | **Pending Approval** | **Chờ duyệt** | **New** | **Mới** |
| ADJUSTED | **Revised** | **Điều chỉnh** | **Adjusted** | **Chờ bổ sung** | — | — |
| REVISED | **Revised** | **Điều chỉnh** | **Revised** | **Điều chỉnh** | **Revising** | **Điều chỉnh** |
| REVISED_PROCESSING | **Processing** | **Đang xử lý** | **Processing** | **Đang xử lý** | **Revising** | **Điều chỉnh** |
| APPROVED | **Approved** | **Đã duyệt** | **Approved** | **Đã duyệt** | **Approved** | **Đã duyệt** |
| CANCELLED | **Cancelled** | **Đã hủy** | **Cancelled** | **Đã hủy** | — | — |
| COMPLETED | **Completed** | **Hoàn thành** | **Completed** | **Hoàn thành** | **Completed** | **Hoàn thành** |

## Quy tắc hiển thị theo role

### REQUESTER

- PROCESSING, PENDING_APPROVAL, REVISED_PROCESSING thuộc nhóm **Đang xử lý** ở danh sách.
- ADJUSTED, REVISED thuộc nhóm **Điều chỉnh**.
- Có thể thấy APPROVED, COMPLETED, CANCELLED.
- Không hiển thị tên trạng thái nội bộ ADJUSTED; chỉ hiển thị nhãn thân thiện **Điều chỉnh**.

### ASSISTANT

Danh sách dùng các nhãn:
- PROCESSING → **Mới**
- PENDING_APPROVAL → **Chờ duyệt**
- ADJUSTED → **Chờ bổ sung**
- REVISED → **Điều chỉnh**
- REVISED_PROCESSING → **Đang xử lý**
- APPROVED → **Đã duyệt**
- CANCELLED → **Đã hủy**
- COMPLETED → **Hoàn thành**

### LEADER

Leader chỉ được đưa request vào tập hiển thị khi request đã từng bước vào vòng lãnh đạo:

- PENDING_APPROVAL → **Mới**
- REVISED → **Điều chỉnh**
- REVISED_PROCESSING → **Điều chỉnh**
- APPROVED → **Đã duyệt**
- COMPLETED → **Hoàn thành**

Leader **không hiển thị**:
- PROCESSING
- ADJUSTED
- CANCELLED

Đặc biệt, request đang ADJUSTED do assistant yêu cầu requester bổ sung phải hoàn toàn nằm ngoài danh sách leader.

Trong V1, tất cả user có role LEADER dùng cùng một leader queue. Không filter danh sách theo `leader_ids` hoặc “leader liên quan”.

## Allowed transitions

### Trước vòng lãnh đạo

~~~text
PROCESSING
   ├── Assistant yêu cầu bổ sung → ADJUSTED
   └── Assistant hoàn tất + trình → PENDING_APPROVAL

ADJUSTED
   ├── Requester chỉnh sửa + gửi lại → PROCESSING
   └── Requester hủy theo quyền workflow → CANCELLED
~~~

ADJUSTED có thể lặp lại nhiều lần nếu assistant tiếp tục phát hiện thông tin chưa đủ; mỗi lần requester gửi lại thì trở về PROCESSING.

### Sau khi đã trình lãnh đạo

~~~text
PENDING_APPROVAL
   ├── Leader duyệt → APPROVED
   └── Leader yêu cầu chỉnh sửa → REVISED

REVISED
   ├── Assistant tự xử lý + trình lại → PENDING_APPROVAL
   ├── Assistant gửi requester chỉnh → vẫn REVISED trong thời gian requester chỉnh
   └── Requester hủy theo quyền workflow → CANCELLED

REVISED
   └── Requester chỉnh sửa + gửi lại → REVISED_PROCESSING

REVISED_PROCESSING
   ├── Assistant xử lý + trình lại → PENDING_APPROVAL
   └── Assistant gửi requester chỉnh tiếp → REVISED
~~~

Trong REVISED, requester có thể chỉnh sửa sau khi Assistant trả request; status vẫn là REVISED cho đến khi requester thực sự gửi lại. Khi requester gửi lại, status chuyển sang REVISED_PROCESSING, không chuyển thẳng sang PENDING_APPROVAL.

### Quy tắc chống sai ngữ nghĩa

- Không chuyển ADJUSTED → REVISED.
- Không dùng REVISED cho việc assistant yêu cầu requester bổ sung trước vòng lãnh đạo.
- Không chuyển request đã từng vào vòng lãnh đạo trở lại ADJUSTED.
- Không dùng PROCESSING cho request đã gửi lại sau yêu cầu chỉnh của leader; dùng REVISED_PROCESSING.
- Không tạo request thứ hai cho một vòng chỉnh sửa; vẫn giữ nguyên request_id.

## Actions theo role

### REQUESTER

- Tạo request.
- Chỉnh sửa request khi được yêu cầu.
- Gửi lại request.
- Hủy request khi workflow cho phép.
- Theo dõi trạng thái.

### ASSISTANT

- Tiếp nhận request PROCESSING.
- Chuẩn hóa/chỉnh thông tin.
- Yêu cầu requester bổ sung → ADJUSTED.
- Hoàn tất và trình lãnh đạo → PENDING_APPROVAL.
- Sau khi leader yêu cầu chỉnh sửa, xử lý request ở REVISED.
- Tại REVISED, Assistant có thể tự xử lý và trình lại → PENDING_APPROVAL, hoặc gửi requester chỉnh.
- Khi requester gửi lại sau yêu cầu chỉnh của leader → REVISED_PROCESSING.
- Xử lý REVISED_PROCESSING và trình lại → PENDING_APPROVAL; nếu cần requester chỉnh tiếp thì → REVISED.
- Có thể chỉnh thông tin nghiệp vụ trong phạm vi quyền.
- Không tự biến một request chưa từng trình lãnh đạo thành REVISED.

### LEADER

- Mọi user có role LEADER nhìn thấy cùng một tập request dành cho Leader; V1 chưa phân tách visibility theo từng leader cụ thể.
- Xem toàn bộ PENDING_APPROVAL trong leader queue.
- Xem toàn bộ REVISED và REVISED_PROCESSING để theo dõi.
- Duyệt PENDING_APPROVAL → APPROVED.
- Yêu cầu chỉnh sửa PENDING_APPROVAL → REVISED.
- Không có thao tác REJECTED trong V1.
- `leader_ids` là metadata cuộc họp do Assistant chuẩn hóa; không dùng để giới hạn Leader visibility ở V1.

### ADMIN

- Có quyền quản trị dữ liệu/cấu hình theo phạm vi được thiết kế.
- Có thể xử lý các trường hợp ngoại lệ workflow.
- Mọi thay đổi trạng thái thủ công phải ghi AuditLog.

## Auto-complete

- APPROVED tự chuyển sang COMPLETED sau khi cuộc họp đã qua ngày/thời điểm hiệu lực.
- Khi trợ lý đã xác định lịch chính thức, ưu tiên dùng meeting_date + meeting_end_time (hoặc meeting_start_time nếu chưa có end time) làm mốc.
- Nếu chưa có lịch chính thức, fallback sang requested_date + thời gian đề xuất.
- Chỉ ADMIN và ASSISTANT được quyền điều chỉnh thủ công một request đang COMPLETED sang trạng thái khác.
- Mọi thay đổi thủ công trạng thái phải ghi AuditLog.

## Các quy tắc nền tảng

- Một request có một request_id duy nhất trong toàn bộ vòng đời.
- Trợ lý chỉnh chính request hiện tại, không tạo request thứ hai.
- Sau khi requester gửi lần đầu, request vào PROCESSING; không sử dụng trạng thái SUBMITTED.
- V1 không có REJECTED; lãnh đạo chỉ duyệt hoặc yêu cầu chỉnh sửa.
- Request chưa hoàn tất không bị ẩn chỉ vì ngày đề xuất đã qua.
- Mọi thay đổi quan trọng phải ghi audit.

## Optimistic locking

Requests có cột version.

Mỗi lần ghi thành công:

~~~text
version = version + 1
~~~

Nếu người dùng đang sửa version cũ hơn dữ liệu hiện tại, server từ chối overwrite và yêu cầu reload.
