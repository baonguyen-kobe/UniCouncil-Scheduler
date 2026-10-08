"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowUpTrayIcon,
  PaperClipIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui";
import {
  MeetingRequest,
  Attachment,
  units as catalogUnits,
  meetingTypes,
  todayISO,
  canEdit,
  catalogLabel,
} from "@/lib/model";
import styles from "./request-form.module.css";

const MAX_ATTACHMENTS = 10;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "webp",
];

type FormField =
  "units" | "agenda" | "participants" | "requestedDate" | "attachments";
type FormErrorCode =
  | "UNITS_REQUIRED"
  | "AGENDA_REQUIRED"
  | "AGENDA_MAX_LENGTH"
  | "PARTICIPANTS_REQUIRED"
  | "PARTICIPANTS_MAX_LENGTH"
  | "DATE_REQUIRED"
  | "DATE_PAST"
  | "ATTACHMENTS_UPLOADING"
  | "ATTACHMENTS_FAILED";

type AttachmentErrorCode = "TOO_LARGE" | "INVALID_TYPE" | "NETWORK_ERROR";

interface StagedAttachment {
  id: string;
  name: string;
  size: number;
  status: "uploaded" | "pending" | "uploading" | "error";
  errorCode?: AttachmentErrorCode;
  file?: File;
  url?: string;
  isExisting?: boolean;
}

interface RequestFormProps {
  request?: MeetingRequest;
  onComplete?: () => void;
}

function getFormErrorText(
  code: FormErrorCode | undefined,
  t: (vi: string, en: string) => string,
): string {
  if (!code) return "";
  switch (code) {
    case "UNITS_REQUIRED":
      return t(
        "Vui lòng chọn ít nhất một đơn vị đề xuất.",
        "Please select at least one proposed unit.",
      );
    case "AGENDA_REQUIRED":
      return t(
        "Vui lòng nhập nội dung cuộc họp đề xuất.",
        "Please enter the proposed meeting agenda.",
      );
    case "AGENDA_MAX_LENGTH":
      return t(
        "Nội dung không được vượt quá 3.000 ký tự.",
        "Agenda must not exceed 3,000 characters.",
      );
    case "PARTICIPANTS_REQUIRED":
      return t(
        "Vui lòng nhập thành phần tham dự đề xuất.",
        "Please enter proposed meeting participants.",
      );
    case "PARTICIPANTS_MAX_LENGTH":
      return t(
        "Thành phần không được vượt quá 3.000 ký tự.",
        "Participants must not exceed 3,000 characters.",
      );
    case "DATE_REQUIRED":
      return t(
        "Vui lòng chọn ngày họp mong muốn.",
        "Please select a preferred meeting date.",
      );
    case "DATE_PAST":
      return t(
        "Ngày họp không được trước ngày hôm nay.",
        "Meeting date cannot be in the past.",
      );
    case "ATTACHMENTS_UPLOADING":
      return t(
        "Đang tải tệp lên. Vui lòng đợi quá trình tải hoàn tất trước khi gửi.",
        "Files are uploading. Please wait for upload to complete before submitting.",
      );
    case "ATTACHMENTS_FAILED":
      return t(
        "Có tệp bị lỗi. Vui lòng Thử lại (Retry), Thay tệp (Replace) hoặc Xóa (Remove) tệp lỗi trước khi gửi.",
        "Some files failed. Please Retry, Replace, or Remove failed files before submitting.",
      );
  }
}

function getAttachmentErrorText(
  code: AttachmentErrorCode | undefined,
  t: (vi: string, en: string) => string,
): string {
  if (!code) return "";
  switch (code) {
    case "TOO_LARGE":
      return t(
        "Dung lượng vượt quá 4 MB (giới hạn tối đa).",
        "File exceeds 4 MB limit.",
      );
    case "INVALID_TYPE":
      return t(
        "Định dạng không hỗ trợ. Cho phép: PDF, Word, Excel, PowerPoint, Ảnh.",
        "Unsupported format. Allowed: PDF, Word, Excel, PowerPoint, Images.",
      );
    case "NETWORK_ERROR":
      return t(
        "Lỗi mô phỏng kết nối tải tệp (Demo).",
        "Simulated upload connection error (Demo).",
      );
  }
}

export default function RequestForm({ request, onComplete }: RequestFormProps) {
  const router = useRouter();
  const {
    locale,
    t,
    role,
    account,
    addRequest,
    updateRequest,
    dirty,
    setDirty,
    notify,
  } = useDemo();

  const isEdit = Boolean(request);

  // Authorization guards:
  // Edit mode: canEdit(request, account.id, role)
  // New mode: role === 'REQUESTER' && account.roles.includes('REQUESTER')
  const isEditAuthorized =
    isEdit && request ? canEdit(request, account.id, role) : false;
  const isNewAuthorized =
    !isEdit && role === "REQUESTER" && account.roles.includes("REQUESTER");
  const isAuthorized = isEdit ? isEditAuthorized : isNewAuthorized;

  // Form State
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    isEdit && request ? request.units : [],
  );
  const [agenda, setAgenda] = useState<string>(
    isEdit && request ? request.agenda : "",
  );
  const [participants, setParticipants] = useState<string>(
    isEdit && request ? request.participants : "",
  );
  const [requestedDate, setRequestedDate] = useState<string>(
    isEdit && request ? request.requestedDate : todayISO(),
  );

  // Attachments State
  const [attachments, setAttachments] = useState<StagedAttachment[]>(() => {
    if (isEdit && request?.attachments) {
      return request.attachments.map((att) => ({
        id: att.id,
        name: att.name,
        size: att.size,
        url: att.url,
        status: "uploaded",
        isExisting: true,
      }));
    }
    return [];
  });

  // Simulated upload failure toggle (clearly labeled Demo)
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Validation errors using typed error codes
  const [errors, setErrors] = useState<
    Partial<Record<FormField, FormErrorCode>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replacingFileIdRef = useRef<string | null>(null);

  // Guard unauthorized attempts
  if (!isAuthorized) {
    return (
      <div className={styles.container}>
        <div className={styles.unauthorizedCard} role="alert">
          <ShieldExclamationIcon className={styles.unauthorizedIcon} />
          <h2 className={styles.unauthorizedTitle}>
            {t("Không có quyền thao tác", "Permission Denied")}
          </h2>
          <p className={styles.unauthorizedText}>
            {isEdit
              ? t(
                  "Bạn chỉ có thể chỉnh sửa yêu cầu do chính mình đăng ký khi ở trạng thái Điều chỉnh (ADJUSTED hoặc REVISED) và đang được giao cho Người đăng ký.",
                  "You can only edit your own requests when they are in revision states (ADJUSTED or REVISED) assigned to Requester.",
                )
              : t(
                  "Chỉ người dùng trong không gian làm việc Người đăng ký (REQUESTER) mới có quyền tạo yêu cầu đăng ký họp mới.",
                  "Only users in the Requester (REQUESTER) workspace are authorized to create new meeting requests.",
                )}
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              if (onComplete) onComplete();
              else router.push("/requests");
            }}
          >
            {t("Quay lại danh sách yêu cầu", "Back to Requests")}
          </Button>
        </div>
      </div>
    );
  }

  // Handle unit toggle
  const toggleUnit = (unitId: string) => {
    setDirty(true);
    setSelectedUnits((prev) => {
      const next = prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId];
      if (errors.units && next.length > 0) {
        setErrors((e) => ({ ...e, units: undefined }));
      }
      return next;
    });
  };

  // Helper to validate single file
  const validateFile = (
    file: File,
  ): { valid: boolean; errorCode?: AttachmentErrorCode } => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, errorCode: "INVALID_TYPE" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, errorCode: "TOO_LARGE" };
    }
    return { valid: true };
  };

  // Simulate file upload with delay - only for valid files
  const simulateUpload = (id: string, shouldFail = simulateFailure) => {
    setAttachments((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        // Never convert size/type validation errors to uploading
        if (
          item.errorCode === "TOO_LARGE" ||
          item.errorCode === "INVALID_TYPE"
        ) {
          return item;
        }
        return { ...item, status: "uploading", errorCode: undefined };
      }),
    );

    setTimeout(() => {
      setAttachments((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          // Safeguard: recheck if file itself is invalid
          if (item.file) {
            const check = validateFile(item.file);
            if (!check.valid) {
              return {
                ...item,
                status: "error",
                errorCode: check.errorCode,
              };
            }
          }

          if (shouldFail) {
            return {
              ...item,
              status: "error",
              errorCode: "NETWORK_ERROR",
            };
          }

          // Create object URL for actual in-memory browser preview if file exists
          const objectUrl = item.file
            ? URL.createObjectURL(item.file)
            : item.url;
          return {
            ...item,
            status: "uploaded",
            url: objectUrl,
            errorCode: undefined,
          };
        }),
      );
    }, 450);
  };

  // Handle new files chosen
  const handleFilesAdded = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setDirty(true);
    const availableSlots = MAX_ATTACHMENTS - attachments.length;
    if (availableSlots <= 0) {
      notify(
        `Đã đạt giới hạn tối đa ${MAX_ATTACHMENTS} tệp đính kèm.`,
        `Reached maximum limit of ${MAX_ATTACHMENTS} attachments.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      notify(
        `Chỉ có thể thêm tối đa ${availableSlots} tệp nữa.`,
        `Can only add ${availableSlots} more file(s).`,
      );
    }

    const newStagedList: StagedAttachment[] = [];

    filesToProcess.forEach((file) => {
      const id = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const { valid, errorCode } = validateFile(file);

      if (!valid) {
        newStagedList.push({
          id,
          name: file.name,
          size: file.size,
          status: "error",
          errorCode,
          file,
        });
      } else {
        newStagedList.push({
          id,
          name: file.name,
          size: file.size,
          status: "pending",
          file,
        });
      }
    });

    setAttachments((prev) => [...prev, ...newStagedList]);

    // Trigger upload simulation only for valid pending files
    newStagedList.forEach((item) => {
      if (item.status === "pending") {
        simulateUpload(item.id, simulateFailure);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle file replacement
  const handleReplaceClick = (fileId: string) => {
    replacingFileIdRef.current = fileId;
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const handleFileReplaced = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const targetId = replacingFileIdRef.current;
    if (!files || files.length === 0 || !targetId) return;

    setDirty(true);
    const newFile = files[0];
    const { valid, errorCode } = validateFile(newFile);

    if (!valid) {
      setAttachments((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                name: newFile.name,
                size: newFile.size,
                status: "error",
                errorCode,
                file: newFile,
                url: undefined,
              }
            : item,
        ),
      );
    } else {
      setAttachments((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                name: newFile.name,
                size: newFile.size,
                status: "pending",
                errorCode: undefined,
                file: newFile,
                url: undefined,
              }
            : item,
        ),
      );
      simulateUpload(targetId, simulateFailure);
    }

    replacingFileIdRef.current = null;
    if (replaceInputRef.current) replaceInputRef.current.value = "";
  };

  // Handle file retry - ONLY allowed for NETWORK_ERROR
  const handleRetryUpload = (id: string) => {
    const item = attachments.find((a) => a.id === id);
    if (!item) return;
    // Disallow retrying invalid files (size or type)
    if (item.errorCode === "TOO_LARGE" || item.errorCode === "INVALID_TYPE") {
      return;
    }
    setDirty(true);
    simulateUpload(id, simulateFailure);
  };

  // Handle file remove
  const handleRemoveFile = (id: string) => {
    setDirty(true);
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  // Form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<FormField, FormErrorCode>> = {};

    // Validate Units
    if (selectedUnits.length === 0) {
      newErrors.units = "UNITS_REQUIRED";
    }

    // Validate Agenda
    const trimmedAgenda = agenda.trim();
    if (!trimmedAgenda) {
      newErrors.agenda = "AGENDA_REQUIRED";
    } else if (agenda.length > 3000) {
      newErrors.agenda = "AGENDA_MAX_LENGTH";
    }

    // Validate Participants
    const trimmedParticipants = participants.trim();
    if (!trimmedParticipants) {
      newErrors.participants = "PARTICIPANTS_REQUIRED";
    } else if (participants.length > 3000) {
      newErrors.participants = "PARTICIPANTS_MAX_LENGTH";
    }

    // Validate Date
    if (!requestedDate) {
      newErrors.requestedDate = "DATE_REQUIRED";
    } else if (requestedDate < todayISO()) {
      newErrors.requestedDate = "DATE_PAST";
    }

    // Validate Attachments: block if pending, uploading or failed
    const hasUploading = attachments.some((f) => f.status === "uploading");
    const hasPending = attachments.some((f) => f.status === "pending");
    const hasErrors = attachments.some((f) => f.status === "error");

    if (hasUploading || hasPending) {
      newErrors.attachments = "ATTACHMENTS_UPLOADING";
    } else if (hasErrors) {
      newErrors.attachments = "ATTACHMENTS_FAILED";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Filter uploaded attachments. Never invent fake dead URLs.
    const finalAttachments: Attachment[] = attachments
      .filter((att) => att.status === "uploaded")
      .map((att) => ({
        id: att.id,
        name: att.name,
        size: att.size,
        url: att.url || undefined,
      }));

    if (isEdit && request) {
      // Resubmit Workflow rules:
      // ADJUSTED -> PROCESSING (revisionTarget = null)
      // REVISED -> REVISED_PROCESSING (revisionTarget = null)
      const nextStatus =
        request.status === "ADJUSTED" ? "PROCESSING" : "REVISED_PROCESSING";

      const patch: Partial<MeetingRequest> = {
        units: selectedUnits,
        agenda: trimmedAgenda,
        participants: trimmedParticipants,
        requestedDate,
        status: nextStatus,
        revisionTarget: null,
        attachments: finalAttachments,
      };

      updateRequest(request.id, patch, {
        vi: "Người đăng ký đã cập nhật & gửi lại yêu cầu (Demo)",
        en: "Requester updated and resubmitted meeting request (Demo)",
      });

      setDirty(false);
      setIsSubmitting(false);
      notify(
        "Đã gửi lại yêu cầu họp thành công (Demo).",
        "Meeting request resubmitted successfully (Demo).",
      );
      if (onComplete) onComplete();
      else router.push("/requests");
    } else {
      // New Request creation
      const currentYear = new Date().getFullYear();
      const randomNum = String(Math.floor(Math.random() * 900000 + 100000));
      const newId = `REQ-${currentYear}-${randomNum}`;

      const newRequest: MeetingRequest = {
        id: newId,
        requesterId: account.id,
        requesterName: account.name,
        units: selectedUnits,
        agenda: trimmedAgenda,
        participants: trimmedParticipants,
        requestedDate,
        status: "PROCESSING",
        revisionTarget: null,
        assistantId: "assistant-1",
        leaderIds: [],
        meetingTypeId: meetingTypes[0].id, // Requester has NO selector; defaults in background
        version: 1,
        updatedAt: new Date().toISOString(),
        attachments: finalAttachments,
        history: [
          {
            id: `evt-${Date.now()}`,
            at: new Date().toISOString(),
            actor: account.name,
            label: {
              vi: "Đã gửi yêu cầu đăng ký họp (Demo)",
              en: "Submitted meeting request (Demo)",
            },
          },
        ],
      };

      addRequest(newRequest);
      setDirty(false);
      setIsSubmitting(false);
      notify(
        "Đã gửi yêu cầu đăng ký họp thành công (Demo).",
        "Meeting request submitted successfully (Demo).",
      );
      if (onComplete) onComplete();
      else router.push("/requests");
    }
  };

  // Cancel / Back handling with explicit confirmation only if dirty
  const handleCancel = () => {
    if (dirty) {
      const confirmed = window.confirm(
        t(
          "Nội dung chưa gửi sẽ bị mất. Bạn muốn rời trang?",
          "Unsaved changes will be lost. Leave this page?",
        ),
      );
      if (!confirmed) return;
      setDirty(false);
    }
    if (onComplete) onComplete();
    else router.push("/requests");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          {isEdit
            ? t("CHỈNH SỬA & GỬI LẠI", "EDIT & RESUBMIT")
            : t("ĐĂNG KÝ HỌP MỚI", "NEW MEETING REQUEST")}
        </div>
        <h1 className={styles.title}>
          {isEdit
            ? `${t("Chỉnh sửa yêu cầu", "Edit Request")} · ${request?.id}`
            : t("Tạo yêu cầu đăng ký họp", "Create Meeting Request")}
        </h1>
        <p className={styles.subtitle}>
          {t(
            "Điền thông tin đề xuất cuộc họp. Trợ lý sẽ chuẩn hóa lịch và trình Lãnh đạo phê duyệt.",
            "Provide meeting details. The Assistant will standardize schedule and submit to Leadership.",
          )}
        </p>
      </div>

      {/* Demo Banner */}
      <div className={styles.demoNotice} role="note">
        <InformationCircleIcon className={styles.demoNoticeIcon} />
        <div>
          <strong>{t("Chế độ Demo:", "Demo Mode:")}</strong>{" "}
          {t(
            "Biểu mẫu thử nghiệm UI. Tệp lưu trong bộ nhớ trình duyệt, không đồng bộ Google Drive thực tế.",
            "UI preview form. Files are stored in browser session, not synchronized to real Google Drive.",
          )}
        </div>
      </div>

      {/* Revision Instruction Banner if present */}
      {isEdit && request?.revisionInstruction && (
        <div className={styles.revisionBanner} role="alert">
          <div className={styles.revisionHeader}>
            <ExclamationTriangleIcon className={styles.revisionIcon} />
            <span>
              {t(
                "Hướng dẫn điều chỉnh từ Trợ lý:",
                "Revision instructions from Assistant:",
              )}
            </span>
          </div>
          <div className={styles.revisionBody}>
            {request.revisionInstruction}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* 1. Read-only Requester Identity */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>
              {t("Họ và tên", "Full name")}
            </label>
            <span className={styles.readOnlyBadge}>
              <LockClosedIcon className={styles.readOnlyIcon} />
              {t("Chỉ đọc từ tài khoản", "Read-only from account")}
            </span>
          </div>
          <div className={styles.readOnlyBox}>
            <div className={styles.identityInfo}>
              <div className={styles.identityAvatar}>
                {isEdit && request
                  ? request.requesterName.substring(0, 2).toUpperCase()
                  : account.initials}
              </div>
              <div className={styles.identityText}>
                <span className={styles.identityName}>
                  {isEdit && request ? request.requesterName : account.name}
                </span>
                <span className={styles.identityMeta}>
                  {t("Danh tính demo:", "Demo identity:")}{" "}
                  {isEdit && request ? request.requesterId : account.id}
                </span>
              </div>
            </div>
            <UserIcon
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "var(--brand-accent)",
              }}
            />
          </div>
        </div>

        {/* 2. School/Office/Unit Multi-select */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>
              {t("Trường / Văn phòng / Đơn vị", "School / Office / Unit")}
              <span className={styles.requiredAsterisk}>*</span>
            </label>
            <span className={styles.charCount}>
              {t(
                `Đã chọn: ${selectedUnits.length} đơn vị`,
                `Selected: ${selectedUnits.length} unit(s)`,
              )}
            </span>
          </div>
          <p className={styles.helperText}>
            {t(
              "Chọn một hoặc nhiều đơn vị chủ trì/tham gia đề xuất cuộc họp.",
              "Select one or multiple units hosting or participating in the meeting.",
            )}
          </p>
          <details className={styles.unitsDropdown}>
            <summary>
              <span>
                {selectedUnits.length
                  ? selectedUnits
                      .map((id) => catalogLabel(catalogUnits, id, locale))
                      .join(" · ")
                  : t("Chọn một hoặc nhiều đơn vị", "Select one or more units")}
              </span>
              <ChevronDownIcon />
            </summary>
            <div
              className={styles.unitsGrid}
              role="group"
              aria-label={t("Đơn vị đề xuất", "Proposed units")}
            >
              {catalogUnits.map((u) => (
                <label key={u.id} className={styles.unitChip}>
                  <input
                    type="checkbox"
                    checked={selectedUnits.includes(u.id)}
                    onChange={() => toggleUnit(u.id)}
                  />
                  <span>{catalogLabel(catalogUnits, u.id, locale)}</span>
                </label>
              ))}
            </div>
          </details>
          {errors.units && (
            <div className={styles.errorMessage} role="alert">
              <ExclamationCircleIcon className={styles.errorIcon} />
              <span>{getFormErrorText(errors.units, t)}</span>
            </div>
          )}
        </div>

        {/* 3. Proposed Meeting Agenda */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="agenda-input" className={styles.label}>
              {t("Nội dung cuộc họp đề xuất", "Proposed Meeting Agenda")}
              <span className={styles.requiredAsterisk}>*</span>
            </label>
            <span
              className={`${styles.charCount} ${
                agenda.length > 3000 ? styles.charCountOver : ""
              }`}
            >
              {agenda.length} / 3.000
            </span>
          </div>
          <p className={styles.helperText}>
            {t(
              "Mục tiêu, nội dung chính và các vấn đề cần thảo luận/quyết định.",
              "Main objectives, core content, and topics for discussion/decision.",
            )}
          </p>
          <textarea
            id="agenda-input"
            rows={4}
            value={agenda}
            maxLength={3200}
            onChange={(e) => {
              setDirty(true);
              setAgenda(e.target.value);
              if (errors.agenda)
                setErrors((err) => ({ ...err, agenda: undefined }));
            }}
            placeholder={t(
              "Nhập tóm tắt nội dung cuộc họp...",
              "Enter summary of meeting agenda...",
            )}
            className={`${styles.textarea} ${
              errors.agenda ? styles.textareaError : ""
            }`}
          />
          {errors.agenda && (
            <div className={styles.errorMessage} role="alert">
              <ExclamationCircleIcon className={styles.errorIcon} />
              <span>{getFormErrorText(errors.agenda, t)}</span>
            </div>
          )}
        </div>

        {/* 4. Proposed Meeting Participants */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="participants-input" className={styles.label}>
              {t("Thành phần tham dự đề xuất", "Proposed Meeting Participants")}
              <span className={styles.requiredAsterisk}>*</span>
            </label>
            <span
              className={`${styles.charCount} ${
                participants.length > 3000 ? styles.charCountOver : ""
              }`}
            >
              {participants.length} / 3.000
            </span>
          </div>
          <p className={styles.helperText}>
            {t(
              "Ghi rõ các phòng ban, cá nhân hoặc lãnh đạo dự kiến tham gia.",
              "Specify departments, individuals, or leaders expected to attend.",
            )}
          </p>
          <textarea
            id="participants-input"
            rows={3}
            value={participants}
            maxLength={3200}
            onChange={(e) => {
              setDirty(true);
              setParticipants(e.target.value);
              if (errors.participants)
                setErrors((err) => ({ ...err, participants: undefined }));
            }}
            placeholder={t(
              "Ví dụ: Ban Giám hiệu, Phòng Đào tạo, Trưởng khoa và nhóm phụ trách...",
              "E.g., Board of Management, Academic Office, Deans and project team...",
            )}
            className={`${styles.textarea} ${
              errors.participants ? styles.textareaError : ""
            }`}
          />
          {errors.participants && (
            <div className={styles.errorMessage} role="alert">
              <ExclamationCircleIcon className={styles.errorIcon} />
              <span>{getFormErrorText(errors.participants, t)}</span>
            </div>
          )}
        </div>

        {/* 5. Preferred Meeting Date */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="date-input" className={styles.label}>
              {t("Ngày họp mong muốn", "Preferred Meeting Date")}
              <span className={styles.requiredAsterisk}>*</span>
            </label>
          </div>
          <p className={styles.helperText}>
            {t(
              "Chọn ngày dự kiến. Lưu ý: Lịch chính thức sẽ do Trợ lý điều phối theo thời gian của Lãnh đạo.",
              "Select preferred date. Note: Official schedule will be finalized by Assistant based on Leadership availability.",
            )}
          </p>
          <div style={{ position: "relative", maxWidth: "280px" }}>
            <input
              id="date-input"
              type="date"
              min={todayISO()}
              value={requestedDate}
              onChange={(e) => {
                setDirty(true);
                setRequestedDate(e.target.value);
                if (errors.requestedDate)
                  setErrors((err) => ({ ...err, requestedDate: undefined }));
              }}
              className={`${styles.input} ${
                errors.requestedDate ? styles.inputError : ""
              }`}
            />
          </div>
          {errors.requestedDate && (
            <div className={styles.errorMessage} role="alert">
              <ExclamationCircleIcon className={styles.errorIcon} />
              <span>{getFormErrorText(errors.requestedDate, t)}</span>
            </div>
          )}
        </div>

        {/* 6. Documents & Attachments */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>
              <PaperClipIcon
                style={{ width: "1.125rem", height: "1.125rem" }}
              />
              {t(
                "Tài liệu, báo cáo phục vụ xem xét (tùy chọn)",
                "Meeting Documents & Reports (Optional)",
              )}
            </label>
            <span className={styles.charCount}>
              {attachments.length} / {MAX_ATTACHMENTS} {t("tệp", "files")}
            </span>
          </div>

          <div className={styles.attachmentSection}>
            {/* Hidden inputs */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className={styles.hiddenFileInput}
              onChange={handleFilesAdded}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
            />
            <input
              type="file"
              ref={replaceInputRef}
              className={styles.hiddenFileInput}
              onChange={handleFileReplaced}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
            />

            {/* Dropzone trigger button */}
            {attachments.length < MAX_ATTACHMENTS && (
              <div
                className={styles.uploadTriggerArea}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <ArrowUpTrayIcon className={styles.uploadIcon} />
                <span className={styles.uploadPrompt}>
                  {t(
                    "Nhấn để chọn tệp tài liệu từ thiết bị",
                    "Click to select document files from device",
                  )}
                </span>
                <span className={styles.uploadLimits}>
                  {t(
                    "Hỗ trợ PDF, Word, Excel, PowerPoint, Ảnh · Tối đa 4 MB mỗi tệp · Tối đa 10 tệp",
                    "Supports PDF, Word, Excel, PowerPoint, Images · Max 4 MB per file · Up to 10 files",
                  )}
                </span>
              </div>
            )}

            {/* Deterministic Simulated Failure Control clearly labeled Demo */}
            <div className={styles.simFailureControl}>
              <input
                id="sim-failure-toggle"
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className={styles.simCheckbox}
              />
              <label htmlFor="sim-failure-toggle" className={styles.simLabel}>
                <span className={styles.simLabelTitle}>
                  <span>
                    {t(
                      "Mô phỏng lỗi tải tệp (Demo)",
                      "Simulate File Upload Failure (Demo)",
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.125rem 0.375rem",
                      backgroundColor: "var(--eiu-yellow)",
                      color: "var(--brand-primary)",
                      borderRadius: "4px",
                      fontWeight: 700,
                    }}
                  >
                    DEMO
                  </span>
                </span>
                <span className={styles.simLabelDesc}>
                  {t(
                    "Khi bật, các tệp hợp lệ sẽ mô phỏng lỗi kết nối máy chủ để kiểm thử nút Thử lại (Retry), Thay tệp (Replace) và Xóa (Remove).",
                    "When enabled, valid files will simulate a network/server failure to test Retry, Replace, and Remove.",
                  )}
                </span>
              </label>
            </div>

            {/* Staged Files List */}
            {attachments.length > 0 && (
              <div className={styles.fileList}>
                {attachments.map((item) => {
                  // Only allow retry for simulated network/server errors; not for size/type violations!
                  const canRetry =
                    item.status === "error" &&
                    item.errorCode === "NETWORK_ERROR";

                  return (
                    <div
                      key={item.id}
                      className={`${styles.fileCard} ${
                        item.status === "uploading"
                          ? styles.fileCardUploading
                          : item.status === "error"
                            ? styles.fileCardError
                            : ""
                      }`}
                    >
                      <div className={styles.fileCardLeft}>
                        <DocumentIcon
                          className={`${styles.fileIcon} ${
                            item.status === "error" ? styles.fileIconError : ""
                          }`}
                        />
                        <div className={styles.fileMeta}>
                          <span className={styles.fileName} title={item.name}>
                            {item.name}
                          </span>
                          <div className={styles.fileSizeAndStatus}>
                            <span>{(item.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            {item.status === "uploaded" && (
                              <span
                                style={{
                                  color: "var(--success)",
                                  fontWeight: 500,
                                }}
                              >
                                {t(
                                  "Đã tải lên (phiên demo)",
                                  "Uploaded (demo session)",
                                )}
                              </span>
                            )}
                            {item.status === "uploading" && (
                              <span
                                style={{
                                  color: "var(--brand-primary)",
                                  fontWeight: 500,
                                }}
                              >
                                {t("Đang tải lên...", "Uploading...")}
                              </span>
                            )}
                            {item.status === "pending" && (
                              <span style={{ color: "var(--muted)" }}>
                                {t("Chờ tải", "Pending")}
                              </span>
                            )}
                            {item.status === "error" && (
                              <span className={styles.fileErrorMsg}>
                                <ExclamationCircleIcon
                                  style={{
                                    width: "0.875rem",
                                    height: "0.875rem",
                                  }}
                                />
                                {getAttachmentErrorText(item.errorCode, t)}
                              </span>
                            )}
                          </div>
                          {item.status === "uploading" && (
                            <div className={styles.progressBarTrack}>
                              <div className={styles.progressBarFill} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions per file */}
                      <div className={styles.fileActions}>
                        {canRetry && (
                          <button
                            type="button"
                            onClick={() => handleRetryUpload(item.id)}
                            className={`${styles.fileActionBtn} ${styles.fileActionBtnRetry}`}
                            title={t(
                              "Thử tải lại tệp này",
                              "Retry uploading this file",
                            )}
                          >
                            <ArrowPathIcon
                              style={{ width: "0.875rem", height: "0.875rem" }}
                            />
                            <span>{t("Thử lại", "Retry")}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleReplaceClick(item.id)}
                          className={styles.fileActionBtn}
                          title={t(
                            "Thay thế bằng tệp khác",
                            "Replace with another file",
                          )}
                        >
                          <span>{t("Thay tệp", "Replace")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.id)}
                          className={`${styles.fileActionBtn} ${styles.fileActionBtnDanger}`}
                          title={t(
                            "Xóa tệp khỏi danh sách",
                            "Remove file from list",
                          )}
                        >
                          <TrashIcon
                            style={{ width: "0.875rem", height: "0.875rem" }}
                          />
                          <span>{t("Xóa", "Remove")}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {errors.attachments &&
            attachments.some((item) => item.status !== "uploaded") && (
              <div className={styles.errorMessage} role="alert">
                <ExclamationCircleIcon className={styles.errorIcon} />
                <span>{getFormErrorText(errors.attachments, t)}</span>
              </div>
            )}
        </div>

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
          <Button type="button" variant="ghost" onClick={handleCancel}>
            {t("Hủy bỏ", "Cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              isSubmitting || attachments.some((f) => f.status === "uploading")
            }
          >
            {isEdit
              ? t("Gửi lại yêu cầu (Demo)", "Resubmit Request (Demo)")
              : t(
                  "Gửi yêu cầu đăng ký (Demo)",
                  "Submit Meeting Request (Demo)",
                )}
          </Button>
        </div>
      </form>
    </div>
  );
}
