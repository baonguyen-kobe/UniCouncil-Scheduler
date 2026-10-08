# Pages V1

## 0. Language / i18n

- Web app hỗ trợ chuyển đổi **VI / EN**.
- UI labels, navigation, buttons, validation messages, status labels và system text phải có cả hai ngôn ngữ.
- Dữ liệu free-text do người dùng nhập không tự dịch.
- Danh mục hiển thị cho người dùng như Units, MeetingTypes và Locations dùng nhãn theo locale hiện tại; nếu thiếu nhãn ở locale đang chọn thì fallback sang nhãn còn lại.

## 1. Login /login

- Logo trường.
- Tên hệ thống theo VI/EN.
- Nút đăng nhập Google theo locale hiện tại.
- Chỉ user hợp lệ trong Google Workspace + Staff mới được vào.

## 2. Requests /requests

Page nghiệp vụ trung tâm, hiển thị khác nhau theo role.

### 2A. Danh sách yêu cầu — đã chốt

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
- Tất cả / All
- Hôm nay / Today
- Ngày mai / Tomorrow
- Tuần này / This week
- Tháng này / This month

Filter trạng thái:
- Dropdown multi-select có checkbox.
- Nhóm **Đang xử lý / Processing** = PROCESSING + PENDING_APPROVAL + REVISED_PROCESSING.
- Nhóm **Điều chỉnh / Revised** = ADJUSTED + REVISED.
- Các trạng thái requester thấy trong danh sách/filter theo nhãn hiển thị: Đang xử lý, Điều chỉnh, Đã duyệt, Hoàn thành, Đã hủy và bản EN tương ứng.

Default list:
- Ưu tiên các request chưa hoàn tất.
- Ưu tiên tiếp các cuộc họp sắp tới.
- Các request lịch sử vẫn có thể xem qua filter trạng thái/thời gian.

Requester card/row nên ưu tiên:
- request_id
- trạng thái thân thiện với requester
- nội dung/agenda tóm tắt
- effective date/time
- lãnh đạo liên quan khi đã được Assistant gắn
- địa điểm nếu đã xác định
- thời gian cập nhật gần nhất

Requester không cần biết ADJUSTED là trạng thái nội bộ; mọi ADJUSTED hiển thị là **Điều chỉnh / Revised**.
Requester không thấy Meeting Type.

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
- Meeting Type
- Search theo mã request / nội dung / người đăng ký

Assistant nhìn thấy status cụ thể:
- PROCESSING → **New / Mới**
- PENDING_APPROVAL → **Pending Approval / Chờ duyệt**
- ADJUSTED → **Adjusted / Chờ bổ sung**
- REVISED → **Revised / Điều chỉnh**
- REVISED_PROCESSING → **Processing / Đang xử lý**
- APPROVED → **Approved / Đã duyệt**
- COMPLETED → **Completed / Hoàn thành**
- CANCELLED → **Cancelled / Đã hủy**

Assistant được xem và thay đổi Meeting Type. Mọi thay đổi Meeting Type phải ghi AuditLog.

Ý nghĩa ADJUSTED:
- Request chưa từng được trình lãnh đạo.
- Assistant yêu cầu requester bổ sung/chỉnh sửa.
- Leader không thấy request này.
- Requester chỉnh sửa + gửi lại → PROCESSING.

Ý nghĩa REVISED:
- Request đã từng được trình lãnh đạo.
- Leader đã yêu cầu chỉnh sửa.
- Sau khi Leader yêu cầu chỉnh (textarea góp ý **không bắt buộc**), request vào REVISED với `revision_target=ASSISTANT`; Assistant xem xét trước.
- Assistant có thể tự xử lý và trình lại → PENDING_APPROVAL.
- Hoặc Assistant nhập hướng dẫn cần chỉnh **bắt buộc** rồi chuyển `revision_target=REQUESTER`; trong thời gian requester chỉnh vẫn là REVISED.
- Requester gửi lại → REVISED_PROCESSING.
- Không chuyển REVISED về ADJUSTED.

Ý nghĩa REVISED_PROCESSING:
- Request hậu-leader đã được requester chỉnh sửa và gửi lại.
- Assistant đang xử lý trước khi trình lại leader.
- Assistant hoàn tất + trình lại → PENDING_APPROVAL.
- Nếu cần requester chỉnh tiếp → REVISED.
- Leader vẫn thấy request này với nhãn **Revising / Điều chỉnh**.

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
- REVISED_PROCESSING → **Revising / Điều chỉnh**
- APPROVED → **Approved / Đã duyệt**
- COMPLETED → **Completed / Hoàn thành**

Leader không thấy:
- PROCESSING
- ADJUSTED
- CANCELLED

Leader được **xem Meeting Type** theo locale hiện tại nhưng không được thay đổi.

Đặc biệt:
- Request bị assistant yêu cầu requester bổ sung trước khi từng được trình lãnh đạo (ADJUSTED) không xuất hiện ở leader.
- Request đã từng được trình lãnh đạo và sau đó bị leader yêu cầu chỉnh sửa (REVISED) vẫn xuất hiện ở leader để theo dõi.
- Khi requester gửi lại sau yêu cầu chỉnh, request chuyển sang REVISED_PROCESSING và vẫn xuất hiện ở leader với nhãn **Điều chỉnh**.

Default:
- Ưu tiên PENDING_APPROVAL liên quan đến leader để xử lý.
- REVISED và REVISED_PROCESSING vẫn nằm trong tập theo dõi.
- APPROVED và COMPLETED có thể xem qua list/filter để tra cứu.

Actions:
- PENDING_APPROVAL: **Duyệt / Approve** / **Yêu cầu chỉnh sửa / Request revision**.
- Khi chọn **Yêu cầu chỉnh sửa**, hiển thị textarea **Góp ý của lãnh đạo / Leader comments (optional)**. Có thể bỏ trống và vẫn xác nhận. Server không đòi nhập góp ý.
- Lưu góp ý vào `leader_decision_note` (nếu không nhập thì rỗng) và AuditLog; `revision_target` chuyển thành `ASSISTANT` để Assistant kiểm tra.
- REVISED/REVISED_PROCESSING: theo dõi; leader không thao tác duyệt cho đến khi request được trình lại thành PENDING_APPROVAL.
- Không có thao tác **Từ chối / Reject** trong V1.

### 2B. Chi tiết request

Desktop:
- Mở bằng drawer từ danh sách.
- Có thể chuyển sang chế độ rộng hơn khi nội dung/file nhiều.

Mobile:
- Dùng detail Card/full-page style thay vì cố ép drawer rộng.

Chi tiết nên thể hiện theo quyền:
- Request ID
- Status theo role
- Nội dung/agenda
- Người đăng ký
- School/Office/Unit đã chọn
- Lãnh đạo liên quan khi đã được Assistant gắn
- Ngày đề xuất
- Lịch chính thức nếu đã có
- Địa điểm chính thức nếu đã có
- Thành phần đề xuất/chính thức
- File đính kèm
- Ghi chú phù hợp với role: `revision_instruction` là hướng dẫn Requester được xem khi được giao sửa; `leader_decision_note` là góp ý tùy chọn cho Leader/Assistant, không tự động chia sẻ nguyên văn cho Requester.
- Hiển thị ai đang cần hành động theo `revision_target`, không chỉ theo status.
- Timeline/audit summary khi cần
- Meeting Type: Assistant xem/sửa; Leader chỉ xem; Requester không thấy

Banner ngữ cảnh:
- ADJUSTED (`revision_target=REQUESTER`): requester thấy **Điều chỉnh** cùng hướng dẫn và nút Edit; assistant thấy **Chờ bổ sung**.
- REVISED (`revision_target=ASSISTANT`): requester thấy **Điều chỉnh** nhưng **không có nút Edit**; assistant thấy yêu cầu đang chờ mình xử lý.
- REVISED (`revision_target=REQUESTER`): requester thấy **Điều chỉnh**, hướng dẫn bắt buộc và nút Edit/Resubmit; leader vẫn thấy **Điều chỉnh**.
- REVISED_PROCESSING: requester/assistant thấy **Đang xử lý**; leader vẫn thấy **Điều chỉnh**.

## REQUESTER — nghiệp vụ

- Tạo đăng ký họp.
- Xem yêu cầu của mình.
- Theo dõi trạng thái theo cách hiển thị dành cho requester.
- Chỉ có nút **Chỉnh sửa / Edit** ở ADJUSTED hoặc REVISED khi `revision_target=REQUESTER` và request thuộc chính user; trạng thái khác chỉ xem.
- Gửi lại sau khi chỉnh: ADJUSTED → PROCESSING; REVISED (REQUESTER) → REVISED_PROCESSING; reset `revision_target`.
- Không được truy cập request của requester khác; backend phải enforce quyền này.
- Không xem/chỉnh Meeting Type.

## ASSISTANT — nghiệp vụ

- Tiếp nhận request PROCESSING.
- Chuẩn hóa/chỉnh thông tin.
- Gắn Meeting Type, lãnh đạo, ngày giờ chính thức, địa điểm, thành phần.
- Yêu cầu requester bổ sung → ADJUSTED, **bắt buộc ghi hướng dẫn `revision_instruction`**.
- Khi requester gửi lại → PROCESSING.
- Trình lãnh đạo → PENDING_APPROVAL.
- Khi leader yêu cầu chỉnh sửa → REVISED.
- Ở REVISED (`revision_target=ASSISTANT`), Assistant tự xử lý + trình lại → PENDING_APPROVAL, hoặc bắt buộc ghi `revision_instruction` rồi chuyển `revision_target=REQUESTER` cho Requester chỉnh.
- Requester gửi lại sau yêu cầu chỉnh → REVISED_PROCESSING.
- Xử lý REVISED_PROCESSING và trình lại → PENDING_APPROVAL; nếu cần requester chỉnh tiếp → REVISED (`revision_target=REQUESTER`) với `revision_instruction` bắt buộc.
- Có thể chỉnh request trực tiếp trong phạm vi quyền.
- Không tạo request mới cho một vòng chỉnh sửa.

## LEADER — nghiệp vụ

- Mọi user có role LEADER thấy cùng một leader queue ở V1; chưa phân biệt request theo từng leader cụ thể.
- Mặc định xử lý toàn bộ PENDING_APPROVAL trong leader queue.
- Theo dõi toàn bộ REVISED và REVISED_PROCESSING.
- Xem APPROVED và COMPLETED để tra cứu.
- Xem chi tiết, file và Meeting Type.
- Với PENDING_APPROVAL: **Duyệt / Yêu cầu chỉnh sửa**. Ô góp ý `leader_decision_note` khi yêu cầu chỉnh là tùy chọn; có thể để trống.
- Không có **Từ chối** trong V1.
- Không thấy request đang ADJUSTED trước vòng lãnh đạo.
- Không chỉnh Meeting Type.

## 2C. Requester Edit & Resubmit — Part B đã chốt

### Điều kiện mở quyền chỉnh sửa

- **Chỉ** requester sở hữu request được chỉnh khi: `(status=ADJUSTED AND revision_target=REQUESTER)` hoặc `(status=REVISED AND revision_target=REQUESTER)`. Role guard + ownership + `status` + `revision_target` bắt buộc kiểm tra trên backend ở cả bước đọc form lẫn commit.
- Request mới bị Leader yêu cầu chỉnh: `REVISED` + `revision_target=ASSISTANT`; requester thấy **Điều chỉnh / Revised** nhưng không có nút Edit. Assistant có thể tự sửa hoặc chuyển quyền cho requester kèm hướng dẫn.
- Assistant chuyển cho Requester trong các trường hợp PROCESSING → ADJUSTED, REVISED (ASSISTANT) → REVISED (REQUESTER), REVISED_PROCESSING → REVISED (REQUESTER): textarea **Nội dung cần chỉnh / Revision instructions** là **required** (trim không được rỗng). Nội dung lưu ở `revision_instruction`, hiển thị cho requester.
- Leader bấm **Yêu cầu chỉnh sửa / Request revision** từ PENDING_APPROVAL: textarea **Góp ý của lãnh đạo / Leader comments (optional)** là **optional**. Không nhập vẫn chuyển sang REVISED, `revision_target=ASSISTANT`. Góp ý dành cho Assistant/Leader; không tự động chia sẻ nguyên văn cho requester.

### Form edit và quy tắc gửi lại

- Requester sửa được: các Unit đã chọn, agenda, participants, preferred meeting date; có thể thêm/thay/xóa attachment theo quyền. Tên và email đăng nhập read-only; không chỉnh Meeting Type, leader_ids, lịch chính thức hoặc ghi chú nội bộ.
- Hiển thị `revision_instruction` trên đầu form edit, giữ nguyên các nội dung đã gửi để chỉnh tại chỗ; không tạo request mới.
- Quy tắc validation và giới hạn upload V1 vẫn có hiệu lực (tối đa 10 file/request; 4 MB/file); hiển thị lỗi và Retry riêng từng file. File đã có không bị xóa vật lý ngay khi đánh dấu Remove/Replace: đánh dấu thay đổi và chỉ thực hiện sau commit phù hợp, tránh mất tài liệu nếu gửi lại lỗi. Audit attachment changes.
- **ADJUSTED → PROCESSING** khi requester Resubmit thành công.
- **REVISED (`revision_target=REQUESTER`) → REVISED_PROCESSING** khi requester Resubmit thành công, không đi thẳng PENDING_APPROVAL.
- Cả hai nhánh đều reset `revision_target=null`, giữ nguyên `request_id`, tăng `version`, ghi AuditLog cho thay đổi field, status và action owner. Backend dùng optimistic locking; nếu version cũ, chặn overwrite và yêu cầu reload/đối chiếu thay đổi.
- Submit/Resubmit phải có idempotency/retry an toàn, không nhân đôi file hoặc status transition nếu timeout. Không có Save Draft hay DRAFT status.
- Gửi lại thành công chuyển về request detail/list với nhãn theo role; nếu lỗi giữ nguyên nội dung đang chỉnh trong tab hiện tại để sửa/retry.

## 3. Request form /requests/new — Part B baseline

Form được xây trực tiếp trên web, không dùng Google Form ở V1. Form Requester cố ý tối giản và hỗ trợ VI/EN.

### Field requester nhìn thấy

1. **Full name / Họ và tên**
   - Tự động lấy từ tài khoản Google Workspace/Staff đã đăng nhập.
   - Read-only trên form; requester không tự gõ lại.

2. **School/Office/Unit / Trường-Văn phòng-Đơn vị**
   - Lấy từ sheet `Units`.
   - Dropdown **multi-select**.
   - Hiển thị tên VI/EN theo locale hiện tại.

3. **Proposed meeting agenda / Nội dung cuộc họp đề xuất**
   - Text input/textarea cho nội dung cuộc họp.

4. **Proposed meeting participants / Thành phần tham dự đề xuất**
   - Free-text textarea.
   - Requester tự nhập danh sách/mô tả thành phần; nội dung có thể bao gồm cả lãnh đạo dự kiến.
   - Không bắt buộc chọn Staff/Unit/Leader bằng control riêng ở V1.
   - Assistant sẽ đọc và chuẩn hóa lại thành phần, gồm `leader_ids` và `participants` chính thức khi phù hợp.

5. **Preferred meeting date / Ngày họp mong muốn**
   - Date picker.
   - Chỉ chọn **ngày**, không có giờ đề xuất.
   - Default = ngày hiện tại theo timezone cấu hình hệ thống.
   - UI phải hiển thị cảnh báo rằng lịch chính thức có thể không trùng ngày này.

6. **Meeting documents and reports for review (if any) / Tài liệu, báo cáo phục vụ xem xét (nếu có)**
   - Upload file.
   - File vật lý lưu Google Drive; metadata lưu trong `Attachments`.
   - Attachment là optional trừ khi sau này có rule riêng.

### Validation V1

- **Full name**: bắt buộc phải resolve được từ session/Staff; read-only.
- **School/Office/Unit**: bắt buộc chọn ít nhất 1 item active từ `Units`; cho phép multi-select.
- **Proposed meeting agenda**: bắt buộc, trim whitespace, không được rỗng sau trim, tối đa **3.000 ký tự**.
- **Proposed meeting participants**: bắt buộc, trim whitespace, không được rỗng sau trim, tối đa **3.000 ký tự**.
- **Preferred meeting date**: bắt buộc; default = hôm nay theo timezone hệ thống; không cho chọn ngày trước hôm nay.
- Validation phải chạy cả client và server; server là nguồn quyết định cuối cùng.
- Error message hiển thị theo locale VI/EN hiện tại.

### Attachment constraints V1

- Attachment là optional.
- Cho phép tối đa **10 file/request**.
- Tối đa **4 MB/file** (cap an toàn dưới giới hạn request body 4.5 MB của Vercel Functions).
- Loại file cho phép: PDF, Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`), PowerPoint (`.ppt`, `.pptx`) và ảnh phổ biến (`.jpg`, `.jpeg`, `.png`, `.webp`).
- Backend phải kiểm tra lại extension/MIME type và dung lượng; không chỉ tin validation phía browser.
- Trước khi submit, requester có thể bỏ file khỏi danh sách upload.
- File vật lý lưu Google Drive; metadata và link Drive lưu trong `Attachments`.
- Upload **mỗi file trong một HTTP request riêng** từ browser qua backend Vercel tới Google Drive; không gộp 10 file trong một request và không lưu file lâu dài trên Vercel.
- Hiển thị từng file thành một dòng với `file_name`, kích thước và trạng thái tạm thời: **Chờ tải / Pending**, **Đang tải / Uploading**, **Đã tải lên / Uploaded**, **Lỗi / Failed**. Các trạng thái upload chỉ là UI/staging state, **không phải system status của Request**.
- Khi một file lỗi, hiển thị **đúng tên file và nguyên nhân phù hợp** (quá 4 MB, loại file không hỗ trợ, lỗi kết nối/timeout, lỗi Drive...). Mỗi file lỗi có **Tải lại / Retry**, **Thay file / Replace** và **Xóa / Remove**. Nếu người dùng bỏ file lỗi, các file còn lại vẫn có thể submit.
- Upload đã thành công được giữ trong staging folder Drive; không xóa hoặc upload lại vì một file khác lỗi. Nếu người dùng xóa một file đã upload thành công trước commit, chỉ cleanup đúng file đó.
- Retry **chỉ file lỗi**, không bắt upload lại toàn bộ. Nếu timeout và chưa rõ upload có thành công hay không, kiểm tra trạng thái qua `submission_id` + `upload_item_id` cố định cho mỗi file trước khi retry để tránh tạo file trùng.
- Trong lúc có file còn Pending/Uploading/Failed, không finalize submit; hiển thị tiến độ và các lỗi ngay tại hàng file. Giữ nguyên form và các file đã chọn trong tab hiện tại.

### Meeting Type

- Có Meeting Type nhưng **không hiển thị cho Requester** trên form hoặc requester detail.
- Danh mục nằm trong sheet `MeetingTypes` riêng.
- Khi request được tạo, backend tự gán item `active` đầu tiên theo `sort_order`.
- Chỉ **Assistant** được thay đổi Meeting Type trong workflow thông thường.
- Leader chỉ được **xem** Meeting Type.
- Meeting Type hiển thị VI/EN theo locale hiện tại.
- Mọi thay đổi Meeting Type phải audit.

### Các field không có trên requester form V1

- requested leader
- requested start time
- estimated duration
- requested location
- requester note riêng
- Meeting Type

Các thông tin lãnh đạo, giờ họp chính thức, thời lượng/end time, địa điểm và các metadata nghiệp vụ sẽ do Assistant hoàn thiện sau khi tiếp nhận.

### Submit flow — Part B đã chốt

1. Requester bấm **Submit / Gửi yêu cầu**. Nút chuyển sang **Submitting / Đang gửi** và bị disable để ngăn double-click.
2. Backend kiểm tra session Google Workspace, Staff, quyền REQUESTER; validate lại toàn bộ fields/attachment (VI/EN là UI only).
3. Client tạo `submission_id` duy nhất cho một lần submit; retry phải dùng lại ID này. Backend tra cứu `submission_id` đã commit; nếu có, trả về `request_id` cũ.
4. Tạo `request_id` duy nhất theo cơ chế an toàn với các submit đồng thời (không dùng số dòng Sheet + 1). Chuẩn bị folder Drive theo cấu trúc `root/YYYY/request_id/`; ghi nhận `drive_folder_id`.
5. Upload lần lượt từng file (tối đa **4 MB/file**, **mỗi file một HTTP request** có tổng body dưới 4.5 MB) qua backend Vercel rồi chuyển sang Drive; không lưu file lâu dài trên Vercel. Tên vật lý là `attachment_id__<original_filename>`; `Attachments.file_name` giữ tên gốc. Backend kiểm tra payload size, file type và quyền; không gửi token/secret Google service account cho browser.
6. Chỉ sau khi mọi upload thành công, ghi dữ liệu `Requests` (status `PROCESSING`, `version` khởi tạo, `submission_id`, `drive_folder_id`, `drive_folder_url`), `Attachments` (`drive_file_id`, `drive_file_url`) và `AuditLog` như một logical commit; ưu tiên `spreadsheets.batchUpdate` với các thao tác `UpdateCells/AppendCells` trong **một batch atomic**.
7. Nếu **một file** upload lỗi: không commit request và **không xóa các file đã upload thành công**. UI đánh dấu Failed đúng file, hiển thị thông báo lỗi VI/EN, cho Retry/Replace/Remove riêng file đó. Nếu Retry thành công hoặc người dùng Remove file lỗi, tiếp tục finalize với những file còn lại. Khi upload lỗi giữa chừng, cleanup chỉ bản upload hỏng/không hoàn chỉnh của file đó.
8. Nếu ghi Sheets lỗi: không báo success; thực hiện cleanup Drive theo hướng compensating transaction, đồng thời ghi nhận tình huống cleanup không hoàn tất để đối soát sau.
9. Nếu server/browser mất kết nối hoặc timeout sau khi đã ghi dữ liệu: **không mặc định coi là thất bại**. Retry với cùng `submission_id` phải kiểm tra đã commit hay chưa; tuyệt đối không tự tạo request thứ hai.
10. Chỉ chuyển tới `/requests` và hiển thị success khi backend xác nhận request đã commit.

Quy tắc:
- Drive và Sheets **không có distributed transaction chung**, vì vậy cleanup là best-effort; cần cơ chế retry/reconciliation cho orphan folders/files và commit không rõ kết quả.
- `submission_id` là idempotency key cho lệnh submit, **không phải Save Draft**.
- Mỗi attachment trong submission có `upload_item_id` ổn định để server nhận diện Retry và tránh nhân đôi file khi response bị mất; mapping staging `submission_id + upload_item_id → drive_file_id` phải được backend kiểm tra/khôi phục an toàn, không dựa vào memory Vercel Function.
- File uploaded chỉ được giữ tạm ở folder Drive trước commit. Nếu người dùng bỏ form/đóng tab/không hoàn tất trong thời hạn cấu hình, các staging files/folders mồ côi sẽ được tác vụ reconciliation cleanup sau khi xác minh chưa commit; không tạo Save Draft hay request mới.
- Lỗi commit Google Sheets được phân biệt với lỗi từng file; không tự động retry upload file đã xác nhận thành công. Nếu commit fail/unknown, kiểm tra `submission_id` trước khi cleanup hoặc retry.
- Google Drive là nơi lưu trữ file duy nhất; Vercel chỉ chạy frontend/backend và truyền file tạm thời khi upload.
- **Không tạo sheet DriveMap/DriveIndex riêng**: link folder đặt ở `Requests.drive_folder_url`, link từng file ở `Attachments.drive_file_url`. Drive IDs là khóa chuẩn; link phải kiểm tra quyền khi mở qua web app.
- Backend phải xử lý đồng thời/idempotency bằng cơ chế serialize hoặc khóa phù hợp; chỉ “check xem có submission_id chưa” không đủ chống race condition.
- V1 giữ giới hạn tối đa 10 file / **4 MB mỗi file**; backend kiểm tra tổng HTTP body (bao gồm multipart overhead) luôn dưới 4.5 MB. Không cần Vercel Blob hoặc upload trực tiếp từ browser tới Drive ở V1.

### Save Draft

- V1 **không có Save Draft**.
- Không có status DRAFT, server-side draft hoặc local autosave/persistence cho form.
- Chỉ khi requester bấm gửi thành công mới tạo request ở trạng thái PROCESSING.

## 4. Calendar /calendar

- Lịch tháng / tuần / danh sách.
- Render từ request đã được duyệt.
- Filter theo lãnh đạo, đơn vị, địa điểm, Meeting Type.
- Click event để xem chi tiết và tài liệu.
- V1 chưa tích hợp Google Calendar.
- UI hỗ trợ VI/EN.

## 5. Staff /staff

- Quản lý nhân sự.
- Họ tên, email, đơn vị, chức vụ, roles, trạng thái hoạt động, Zalo mapping.
- Chỉ admin hoặc người được phân quyền.
- UI hỗ trợ VI/EN.

## 6. Settings /settings

Nhóm cấu hình:
- Hệ thống: tên trường VI/EN, tên app VI/EN, timezone, logo, default locale.
- Request: giới hạn file, thời lượng mặc định, quy tắc đăng ký.
- Workflow: quyền chỉnh sửa, quy tắc duyệt.
- Drive: root folder ID / cấu trúc folder.
- Zalo: cấu hình nghiệp vụ và template không nhạy cảm.

Secret/token để trong Vercel Environment Variables, không lưu trực tiếp trong Sheet.
