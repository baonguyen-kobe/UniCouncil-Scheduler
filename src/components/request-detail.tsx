"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  UserIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ShieldExclamationIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { useDemo } from "@/components/demo-provider";
import { Modal, Button, StatusBadge } from "@/components/ui";
import RequestForm from "@/components/request-form";
import {
  MeetingRequest,
  Attachment,
  units as catalogUnits,
  leaders as catalogLeaders,
  locations as catalogLocations,
  meetingTypes as catalogMeetingTypes,
  formatDate,
  catalogLabel,
  canEdit,
} from "@/lib/model";
import styles from "./request-detail.module.css";

interface RequestDetailViewProps {
  request: MeetingRequest;
  onClose: () => void;
}

function RequestDetailView({ request, onClose }: RequestDetailViewProps) {
  const { role, account, locale, t, updateRequest, notify, dirty, setDirty } =
    useDemo();

  // View state
  const [isEditing, setIsEditing] = useState(false);

  // Sub-action panel states
  const [showAssistantFinalize, setShowAssistantFinalize] = useState(false);
  const [showAssistantReturn, setShowAssistantReturn] = useState(false);
  const [showLeaderApproveConfirm, setShowLeaderApproveConfirm] =
    useState(false);
  const [showLeaderRevisionForm, setShowLeaderRevisionForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Assistant form states
  const [assistantMeetingTypeId, setAssistantMeetingTypeId] = useState<string>(
    request.meetingTypeId || catalogMeetingTypes[0].id,
  );
  const [assistantLeaderIds, setAssistantLeaderIds] = useState<string[]>(
    request.leaderIds || [],
  );
  const [assistantDate, setAssistantDate] = useState<string>(
    request.meetingDate || request.requestedDate,
  );
  const [assistantStartTime, setAssistantStartTime] = useState<string>(
    request.startTime || "09:00",
  );
  const [assistantEndTime, setAssistantEndTime] = useState<string>(
    request.endTime || "10:00",
  );
  const [assistantLocationId, setAssistantLocationId] = useState<string>(
    request.locationId || catalogLocations[0].id,
  );
  const [assistantOfficialParticipants, setAssistantOfficialParticipants] =
    useState<string>(request.officialParticipants ?? request.participants);

  // Assistant return instruction state
  const [returnInstruction, setReturnInstruction] = useState<string>("");
  const [returnError, setReturnError] = useState(false);

  // Leader revision note state
  const [leaderComment, setLeaderComment] = useState<string>("");
  function dismissActions() {
    if (
      dirty &&
      !window.confirm(
        t(
          "Nội dung chưa gửi sẽ bị mất. Tiếp tục?",
          "Unsaved changes will be lost. Continue?",
        ),
      )
    )
      return false;
    setDirty(false);
    setAssistantMeetingTypeId(request.meetingTypeId);
    setAssistantLeaderIds(request.leaderIds);
    setAssistantDate(request.meetingDate || request.requestedDate);
    setAssistantStartTime(request.startTime || "09:00");
    setAssistantEndTime(request.endTime || "10:00");
    setAssistantLocationId(request.locationId || catalogLocations[0].id);
    setAssistantOfficialParticipants(
      request.officialParticipants ?? request.participants,
    );
    setReturnInstruction("");
    setReturnError(false);
    setLeaderComment("");
    setShowAssistantFinalize(false);
    setShowAssistantReturn(false);
    setShowLeaderApproveConfirm(false);
    setShowLeaderRevisionForm(false);
    setShowCancelConfirm(false);
    return true;
  }

  // Sample file download handler
  const handleDownload = (att: Attachment) => {
    if (att.url && (att.url.startsWith("/") || att.url.startsWith("blob:"))) {
      const a = document.createElement("a");
      a.href = att.url;
      a.download = att.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    notify(
      `Đang tải tệp cục bộ "${att.name}" (Demo)...`,
      `Downloading local file "${att.name}" (Demo)...`,
    );
  };

  // 1. Assistant Action: Submit official metadata to Leader -> PENDING_APPROVAL
  const handleAssistantSubmitToLeader = () => {
    if (
      !assistantDate ||
      !assistantStartTime ||
      !assistantEndTime ||
      assistantEndTime <= assistantStartTime ||
      !assistantLeaderIds.length ||
      !assistantOfficialParticipants.trim()
    ) {
      notify(
        "Vui lòng hoàn thiện ngày, giờ, lãnh đạo và thành phần chính thức; giờ kết thúc phải sau giờ bắt đầu.",
        "Complete the official date, times, leaders and participants; end time must be after start time.",
      );
      return;
    }
    setDirty(false);
    updateRequest(
      request.id,
      {
        status: "PENDING_APPROVAL",
        revisionTarget: null,
        meetingTypeId: assistantMeetingTypeId,
        leaderIds: assistantLeaderIds,
        meetingDate: assistantDate,
        startTime: assistantStartTime,
        endTime: assistantEndTime,
        locationId: assistantLocationId,
        officialParticipants: assistantOfficialParticipants.trim(),
      },
      {
        vi: "Trợ lý đã hoàn thiện thông tin và trình Lãnh đạo phê duyệt (Demo)",
        en: "Assistant finalized schedule and submitted for Leader approval (Demo)",
      },
    );
    setShowAssistantFinalize(false);
    notify(
      "Đã trình Lãnh đạo phê duyệt thành công (Demo).",
      "Submitted for Leader approval successfully (Demo).",
    );
  };

  // 2. Assistant Action: Return to Requester with required instruction
  const handleAssistantReturnToRequester = () => {
    const trimmed = returnInstruction.trim();
    if (!trimmed) {
      setReturnError(true);
      return;
    }

    setDirty(false);
    const nextStatus = request.status === "PROCESSING" ? "ADJUSTED" : "REVISED";

    updateRequest(
      request.id,
      {
        status: nextStatus,
        revisionTarget: "REQUESTER",
        revisionInstruction: trimmed,
      },
      {
        vi:
          nextStatus === "ADJUSTED"
            ? "Trợ lý yêu cầu người đăng ký bổ sung thông tin (Demo)"
            : "Trợ lý yêu cầu người đăng ký điều chỉnh thông tin (Demo)",
        en:
          nextStatus === "ADJUSTED"
            ? "Assistant requested additional information (Demo)"
            : "Assistant requested revisions (Demo)",
      },
      trimmed,
    );

    setShowAssistantReturn(false);
    setReturnInstruction("");
    setReturnError(false);
    notify(
      "Đã gửi yêu cầu điều chỉnh tới Người đăng ký (Demo).",
      "Revision request sent to Requester (Demo).",
    );
  };

  // 3. Leader Action: Approve -> APPROVED
  const handleLeaderApprove = () => {
    updateRequest(
      request.id,
      {
        status: "APPROVED",
        revisionTarget: null,
      },
      {
        vi: "Lãnh đạo đã phê duyệt yêu cầu cuộc họp (Demo)",
        en: "Leader approved meeting request (Demo)",
      },
    );
    setShowLeaderApproveConfirm(false);
    notify(
      "Đã phê duyệt yêu cầu cuộc họp thành công (Demo).",
      "Meeting request approved successfully (Demo).",
    );
  };

  // 4. Leader Action: Request Revision -> REVISED (revisionTarget = ASSISTANT)
  const handleLeaderRequestRevision = () => {
    const trimmed = leaderComment.trim();
    setDirty(false);
    updateRequest(
      request.id,
      {
        status: "REVISED",
        revisionTarget: "ASSISTANT",
        leaderNote: trimmed || undefined,
      },
      {
        vi: "Lãnh đạo yêu cầu điều chỉnh (Demo)",
        en: "Leader requested revision (Demo)",
      },
      trimmed || undefined,
      true,
    );
    setShowLeaderRevisionForm(false);
    setLeaderComment("");
    notify(
      "Đã gửi yêu cầu điều chỉnh tới Trợ lý (Demo).",
      "Revision request sent to Assistant (Demo).",
    );
  };

  // 5. Requester Action: Cancel Request
  const handleRequesterCancel = () => {
    updateRequest(
      request.id,
      {
        status: "CANCELLED",
        revisionTarget: null,
      },
      {
        vi: "Người đăng ký đã hủy yêu cầu cuộc họp (Demo)",
        en: "Requester cancelled meeting request (Demo)",
      },
    );
    setShowCancelConfirm(false);
    notify(
      "Đã hủy yêu cầu cuộc họp thành công (Demo).",
      "Meeting request cancelled successfully (Demo).",
    );
  };

  // Return back from edit view with dirty check
  const handleBackFromEdit = () => {
    if (dirty) {
      const confirmed = window.confirm(
        t(
          "Nội dung chưa gửi sẽ bị mất. Bạn muốn quay lại?",
          "Unsaved changes will be lost. Do you want to return?",
        ),
      );
      if (!confirmed) return;
      setDirty(false);
    }
    setIsEditing(false);
  };

  // Role permissions
  const requesterCanEdit = canEdit(request, account.id, role);
  const requesterCanCancel =
    role === "REQUESTER" &&
    request.requesterId === account.id &&
    request.revisionTarget === "REQUESTER" &&
    ["ADJUSTED", "REVISED"].includes(request.status);

  const assistantCanAct =
    role === "ASSISTANT" &&
    (request.status === "PROCESSING" ||
      request.status === "REVISED_PROCESSING" ||
      (request.status === "REVISED" && request.revisionTarget === "ASSISTANT"));

  const leaderCanAct =
    role === "LEADER" && request.status === "PENDING_APPROVAL";

  // Privacy filters: Requester never sees internal events or leaderNote
  const visibleHistory =
    role === "REQUESTER"
      ? request.history.filter((h) => !h.internal)
      : request.history;

  if (isEditing && requesterCanEdit) {
    return (
      <div style={{ paddingTop: "0.5rem" }}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={handleBackFromEdit}
        >
          <ArrowLeftIcon style={{ width: "1rem", height: "1rem" }} />
          <span>{t("Quay lại xem chi tiết", "Back to details")}</span>
        </button>
        <RequestForm
          request={request}
          onComplete={() => {
            setDirty(false);
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.drawerBody}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <h2 className={styles.requestId}>{request.id}</h2>
          <div className={styles.badgesRow}>
            <StatusBadge status={request.status} role={role} locale={locale} />
            {request.revisionTarget === "REQUESTER" && (
              <span className={styles.actionOwnerBadge}>
                <UserIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                {t("Cần xử lý: Người đăng ký", "Action: Requester")}
              </span>
            )}
            {request.revisionTarget === "ASSISTANT" && (
              <span className={styles.actionOwnerBadge}>
                <UserGroupIcon
                  style={{ width: "0.75rem", height: "0.75rem" }}
                />
                {t("Cần xử lý: Trợ lý", "Action: Assistant")}
              </span>
            )}
            {!request.revisionTarget &&
              request.status === "PENDING_APPROVAL" && (
                <span className={styles.actionOwnerBadge}>
                  <ShieldExclamationIcon
                    style={{ width: "0.75rem", height: "0.75rem" }}
                  />
                  {t("Cần xử lý: Lãnh đạo", "Action: Leader")}
                </span>
              )}
          </div>
        </div>
        <div className={styles.headerMeta}>
          <span>
            <strong>{t("Người tạo:", "Requester:")}</strong>{" "}
            {request.requesterName}
          </span>
          <span>•</span>
          <span>
            <strong>{t("Cập nhật:", "Updated:")}</strong>{" "}
            {formatDate(request.updatedAt, locale)}
          </span>
          <span>•</span>
          <span>
            <strong>{t("Phiên bản:", "Version:")}</strong> v{request.version}
          </span>
        </div>
      </div>

      {/* Demo Notice */}
      <div className={styles.demoNotice} role="note">
        <InformationCircleIcon className={styles.demoIcon} />
        <span>
          <strong>{t("Giao diện xem trước Demo:", "UI Preview Demo:")}</strong>{" "}
          {t(
            "Mọi thao tác thay đổi chỉ lưu trong bộ nhớ phiên này.",
            "All actions and state transitions persist in this session only.",
          )}
        </span>
      </div>

      {/* Contextual Workflow Banners */}
      {request.status === "ADJUSTED" && (
        <div
          className={`${styles.banner} ${styles.bannerWarning}`}
          role="alert"
        >
          <div className={styles.bannerHeader}>
            <div className={styles.bannerHeaderLeft}>
              <ExclamationTriangleIcon
                className={styles.bannerIcon}
                style={{ color: "var(--eiu-orange)" }}
              />
              <span>
                {role === "REQUESTER"
                  ? t(
                      "Trợ lý yêu cầu bổ sung thông tin",
                      "Assistant requested adjustments",
                    )
                  : t(
                      "Đang chờ người đăng ký bổ sung thông tin",
                      "Awaiting requester adjustments",
                    )}
              </span>
            </div>
            {requesterCanEdit && (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                <PencilSquareIcon
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.25rem",
                  }}
                />
                {t("Chỉnh sửa & Gửi lại (Demo)", "Edit & Resubmit (Demo)")}
              </Button>
            )}
          </div>
          {request.revisionInstruction && (
            <div className={styles.bannerInstructionBox}>
              <strong>{t("Nội dung hướng dẫn:", "Instruction:")}</strong>{" "}
              {request.revisionInstruction}
            </div>
          )}
        </div>
      )}

      {request.status === "REVISED" && (
        <div
          className={`${styles.banner} ${styles.bannerWarning}`}
          role="alert"
        >
          <div className={styles.bannerHeader}>
            <div className={styles.bannerHeaderLeft}>
              <ExclamationTriangleIcon
                className={styles.bannerIcon}
                style={{ color: "var(--eiu-orange)" }}
              />
              <span>
                {request.revisionTarget === "REQUESTER"
                  ? t(
                      "Trợ lý yêu cầu bạn điều chỉnh thông tin",
                      "Assistant requested you to revise information",
                    )
                  : role === "ASSISTANT"
                    ? t(
                        "Lãnh đạo yêu cầu điều chỉnh — Cần xử lý",
                        "Leader requested revision — Action required",
                      )
                    : t("Đang trong quá trình điều chỉnh", "Under revision")}
              </span>
            </div>
            {request.revisionTarget === "REQUESTER" && requesterCanEdit && (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                <PencilSquareIcon
                  style={{
                    width: "1rem",
                    height: "1rem",
                    marginRight: "0.25rem",
                  }}
                />
                {t("Chỉnh sửa & Gửi lại (Demo)", "Edit & Resubmit (Demo)")}
              </Button>
            )}
          </div>
          {request.revisionTarget === "REQUESTER" &&
            request.revisionInstruction && (
              <div className={styles.bannerInstructionBox}>
                <strong>{t("Nội dung hướng dẫn:", "Instruction:")}</strong>{" "}
                {request.revisionInstruction}
              </div>
            )}
          {request.revisionTarget === "ASSISTANT" &&
            role !== "REQUESTER" &&
            request.leaderNote && (
              <div className={styles.bannerInstructionBox}>
                <strong>{t("Góp ý của Lãnh đạo:", "Leader comments:")}</strong>{" "}
                {request.leaderNote}
              </div>
            )}
        </div>
      )}

      {request.status === "REVISED_PROCESSING" && (
        <div className={`${styles.banner} ${styles.bannerInfo}`} role="status">
          <div className={styles.bannerHeader}>
            <div className={styles.bannerHeaderLeft}>
              <InformationCircleIcon
                className={styles.bannerIcon}
                style={{ color: "var(--brand-primary)" }}
              />
              <span>
                {role === "REQUESTER"
                  ? t(
                      "Bạn đã gửi lại yêu cầu. Trợ lý đang chuẩn hóa lịch.",
                      "You resubmitted the request. Assistant is preparing schedule.",
                    )
                  : role === "ASSISTANT"
                    ? t(
                        "Người đăng ký đã cập nhật & gửi lại. Vui lòng hoàn thiện để trình Lãnh đạo.",
                        "Requester updated and resubmitted. Ready to finalize for Leadership.",
                      )
                    : t("Đang trong quá trình điều chỉnh", "Under revision")}
              </span>
            </div>
          </div>
        </div>
      )}

      {request.status === "APPROVED" && (
        <div
          className={`${styles.banner} ${styles.bannerSuccess}`}
          role="status"
        >
          <div className={styles.bannerHeader}>
            <div className={styles.bannerHeaderLeft}>
              <CheckCircleIcon
                className={styles.bannerIcon}
                style={{ color: "var(--success)" }}
              />
              <span>
                {t(
                  "Cuộc họp đã được Lãnh đạo phê duyệt",
                  "Meeting approved by Leadership",
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {request.status === "CANCELLED" && (
        <div
          className={`${styles.banner} ${styles.bannerDanger}`}
          role="status"
        >
          <div className={styles.bannerHeader}>
            <div className={styles.bannerHeaderLeft}>
              <ShieldExclamationIcon
                className={styles.bannerIcon}
                style={{ color: "var(--danger)" }}
              />
              <span>
                {t(
                  "Yêu cầu cuộc họp đã bị hủy",
                  "Meeting request was cancelled",
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Thông tin đề xuất ban đầu */}
      <div className={styles.sectionPanel}>
        <div className={styles.sectionEyebrow}>
          <UserIcon className={styles.sectionEyebrowIcon} />
          <span>{t("THÔNG TIN ĐỀ XUẤT BAN ĐẦU", "PROPOSED INFORMATION")}</span>
        </div>
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("Người đăng ký", "Requester")}
            </span>
            <span className={styles.metaValue}>{request.requesterName}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("Mã nhân sự", "Staff ID")}
            </span>
            <span className={styles.metaValue}>{request.requesterId}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("Đơn vị đề xuất", "Proposed Units")}
            </span>
            <span className={styles.metaValue}>
              {request.units && request.units.length > 0
                ? request.units
                    .map((u) => catalogLabel(catalogUnits, u, locale))
                    .join(", ")
                : "—"}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("Ngày họp mong muốn", "Preferred Date")}
            </span>
            <span className={styles.metaValue}>
              {formatDate(request.requestedDate, locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Nội dung cuộc họp đề xuất */}
      <div className={styles.sectionPanel}>
        <div className={styles.sectionEyebrow}>
          <DocumentIcon className={styles.sectionEyebrowIcon} />
          <span>
            {t("NỘI DUNG CUỘC HỌP ĐỀ XUẤT", "PROPOSED MEETING AGENDA")}
          </span>
        </div>
        <div className={styles.textContentBox}>{request.agenda}</div>
      </div>

      {/* Section 3: Thành phần tham dự đề xuất */}
      <div className={styles.sectionPanel}>
        <div className={styles.sectionEyebrow}>
          <UserGroupIcon className={styles.sectionEyebrowIcon} />
          <span>
            {t("THÀNH PHẦN THAM DỰ ĐỀ XUẤT", "PROPOSED PARTICIPANTS")}
          </span>
        </div>
        <div className={styles.textContentBox}>{request.participants}</div>
      </div>

      {/* Section 4: Lịch & Thông tin chính thức */}
      <div className={styles.sectionPanel}>
        <div className={styles.sectionEyebrow}>
          <CalendarDaysIcon className={styles.sectionEyebrowIcon} />
          <span>
            {t("LỊCH & THÔNG TIN CHÍNH THỨC", "OFFICIAL SCHEDULE & DETAILS")}
          </span>
        </div>
        <div className={styles.metaGrid}>
          {/* Meeting Type is strictly HIDDEN for Requester! */}
          {role !== "REQUESTER" && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>
                {t("Loại cuộc họp", "Meeting Type")}
              </span>
              <span className={styles.metaValue}>
                {catalogLabel(
                  catalogMeetingTypes,
                  request.meetingTypeId,
                  locale,
                )}
              </span>
            </div>
          )}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("Ngày họp chính thức", "Official Date")}
            </span>
            <span className={styles.metaValue}>
              {request.meetingDate
                ? formatDate(request.meetingDate, locale)
                : t("Chưa xếp lịch", "Not scheduled")}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("Khung giờ", "Time Slot")}
            </span>
            <span className={styles.metaValue}>
              {request.startTime && request.endTime
                ? `${request.startTime} – ${request.endTime}`
                : t("Chưa xác định", "TBD")}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <MapPinIcon style={{ width: "0.875rem", height: "0.875rem" }} />
                {t("Địa điểm", "Location")}
              </span>
            </span>
            <span className={styles.metaValue}>
              {catalogLabel(catalogLocations, request.locationId, locale)}
            </span>
          </div>
          <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
            <span className={styles.metaLabel}>
              {t("Lãnh đạo tham dự / chủ trì", "Leaders Attending")}
            </span>
            <span className={styles.metaValue}>
              {request.leaderIds && request.leaderIds.length > 0
                ? request.leaderIds
                    .map((id) => catalogLabel(catalogLeaders, id, locale))
                    .join(", ")
                : t("Chưa phân công", "Not assigned")}
            </span>
          </div>
          <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
            <span className={styles.metaLabel}>
              {t("Thành phần chính thức", "Official Participants")}
            </span>
            <span className={styles.metaValue}>
              {request.officialParticipants ||
                t("Chưa chuẩn hóa", "Not finalized")}
            </span>
          </div>
        </div>
      </div>

      {/* Section 5: Tài liệu, báo cáo (Downloadable actual sample) */}
      <div className={styles.sectionPanel}>
        <div className={styles.sectionEyebrow}>
          <DocumentIcon className={styles.sectionEyebrowIcon} />
          <span>
            {t("TÀI LIỆU, BÁO CÁO PHỤC VỤ XEM XÉT", "ATTACHMENTS & REPORTS")} (
            {request.attachments?.length || 0})
          </span>
        </div>
        {request.attachments && request.attachments.length > 0 ? (
          <div className={styles.attachmentList}>
            {request.attachments.map((att) => (
              <div key={att.id} className={styles.attachmentCard}>
                <div className={styles.attachmentLeft}>
                  <DocumentIcon className={styles.attachmentIcon} />
                  <div className={styles.attachmentMeta}>
                    <span className={styles.attachmentName} title={att.name}>
                      {att.name}
                    </span>
                    <span className={styles.attachmentSize}>
                      {(att.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(att)}
                  disabled={!att.url}
                  className={styles.downloadBtn}
                  title={t(
                    "Tải xuống tài liệu mẫu",
                    "Download sample document",
                  )}
                >
                  <ArrowDownTrayIcon
                    style={{ width: "0.875rem", height: "0.875rem" }}
                  />
                  <span>{t("Tải xuống (Demo)", "Download (Demo)")}</span>
                </button>
              </div>
            ))}
            <div className={styles.attachmentDisclaimer}>
              {t(
                "Lưu ý Demo: Tệp tải về là dữ liệu mô phỏng trong phiên làm việc, không kết nối Google Drive thực tế.",
                "Demo Notice: Downloads are simulated sample files in session memory, not connected to live Google Drive.",
              )}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            {t("Không có tài liệu đính kèm nào.", "No attachments provided.")}
          </div>
        )}
      </div>

      {/* Section 6: Lịch sử xử lý & Ghi chú (Timeline) */}
      <div className={styles.sectionPanel}>
        <div className={styles.sectionEyebrow}>
          <ClockIcon className={styles.sectionEyebrowIcon} />
          <span>
            {t("LỊCH SỬ XỬ LÝ & TIẾN TRÌNH", "PROCESSING HISTORY & TIMELINE")}
          </span>
        </div>

        {/* Leader note display for Assistant / Leader / Admin only */}
        {role !== "REQUESTER" && request.leaderNote && (
          <div className={styles.leaderNoteCard}>
            <div className={styles.leaderNoteTitle}>
              <ChatBubbleBottomCenterTextIcon
                style={{ width: "1rem", height: "1rem" }}
              />
              <span>{t("Góp ý của Lãnh đạo:", "Leader Note / Comments:")}</span>
            </div>
            <div className={styles.leaderNoteText}>{request.leaderNote}</div>
          </div>
        )}

        <div className={styles.timeline}>
          {visibleHistory.map((item) => (
            <div key={item.id} className={styles.timelineItem}>
              <div
                className={`${styles.timelineDot} ${
                  item.internal ? styles.timelineDotInternal : ""
                }`}
              />
              <div className={styles.timelineHeader}>
                <span className={styles.timelineActor}>{item.actor}</span>
                {item.internal && role !== "REQUESTER" && (
                  <span className={styles.internalBadge}>
                    {t("Nội bộ", "Internal")}
                  </span>
                )}
                <span className={styles.timelineDate}>
                  {formatDate(item.at, locale)}
                </span>
              </div>
              <span className={styles.timelineLabel}>{item.label[locale]}</span>
              {item.note && (
                <div className={styles.timelineNote}>{item.note}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Panel: Assistant Finalize Official Metadata Form */}
      {showAssistantFinalize && (
        <div className={styles.actionPanel}>
          <h3 className={styles.actionPanelTitle}>
            <CalendarDaysIcon style={{ width: "1.25rem", height: "1.25rem" }} />
            <span>
              {t(
                "Hoàn thiện thông tin & Trình Lãnh đạo",
                "Finalize Schedule & Submit to Leader",
              )}
            </span>
          </h3>
          <p className={styles.actionPanelDesc}>
            {t(
              "Chuẩn hóa thông tin lịch họp, lãnh đạo chủ trì và địa điểm trước khi trình Lãnh đạo phê duyệt.",
              "Standardize meeting schedule, presiding leaders, and location before presenting to Leadership.",
            )}
          </p>

          <div className={styles.actionFormGrid}>
            {/* Meeting Type */}
            <div className={styles.actionFieldGroup}>
              <label htmlFor="official-type" className={styles.actionLabel}>
                {t("Loại cuộc họp", "Meeting Type")}
              </label>
              <select
                id="official-type"
                value={assistantMeetingTypeId}
                onChange={(e) => {
                  setDirty(true);
                  setAssistantMeetingTypeId(e.target.value);
                }}
                className={styles.actionSelect}
              >
                {catalogMeetingTypes.map((mt) => (
                  <option key={mt.id} value={mt.id}>
                    {mt[locale]}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className={styles.actionFieldGroup}>
              <label htmlFor="official-location" className={styles.actionLabel}>
                {t("Địa điểm", "Location")}
              </label>
              <select
                id="official-location"
                value={assistantLocationId}
                onChange={(e) => {
                  setDirty(true);
                  setAssistantLocationId(e.target.value);
                }}
                className={styles.actionSelect}
              >
                {catalogLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc[locale]}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Date */}
            <div className={styles.actionFieldGroup}>
              <label htmlFor="official-date" className={styles.actionLabel}>
                {t("Ngày họp chính thức", "Official Date")}
              </label>
              <input
                id="official-date"
                type="date"
                value={assistantDate}
                onChange={(e) => {
                  setDirty(true);
                  setAssistantDate(e.target.value);
                }}
                className={styles.actionInput}
              />
            </div>

            {/* Start Time */}
            <div className={styles.actionFieldGroup}>
              <label htmlFor="official-start" className={styles.actionLabel}>
                {t("Giờ bắt đầu", "Start Time")}
              </label>
              <input
                id="official-start"
                type="time"
                value={assistantStartTime}
                onChange={(e) => {
                  setDirty(true);
                  setAssistantStartTime(e.target.value);
                }}
                className={styles.actionInput}
              />
            </div>

            {/* End Time */}
            <div className={styles.actionFieldGroup}>
              <label htmlFor="official-end" className={styles.actionLabel}>
                {t("Giờ kết thúc", "End Time")}
              </label>
              <input
                id="official-end"
                type="time"
                value={assistantEndTime}
                onChange={(e) => {
                  setDirty(true);
                  setAssistantEndTime(e.target.value);
                }}
                className={styles.actionInput}
              />
            </div>

            {/* Leaders Multi-select */}
            <div
              className={styles.actionFieldGroup}
              style={{ gridColumn: "1 / -1" }}
            >
              <label className={styles.actionLabel}>
                {t("Lãnh đạo tham dự / chủ trì", "Leaders Presiding")}
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {catalogLeaders.map((ldr) => {
                  const selected = assistantLeaderIds.includes(ldr.id);
                  return (
                    <button
                      type="button"
                      key={ldr.id}
                      aria-pressed={selected}
                      onClick={() => {
                        setDirty(true);
                        setAssistantLeaderIds((prev) =>
                          selected
                            ? prev.filter((id) => id !== ldr.id)
                            : [...prev, ldr.id],
                        );
                      }}
                      className={`${styles.downloadBtn} ${
                        selected ? styles.actionOwnerBadge : ""
                      }`}
                      style={{
                        backgroundColor: selected
                          ? "var(--brand-primary)"
                          : "var(--surface)",
                        color: selected ? "var(--surface)" : "var(--text)",
                        borderColor: selected
                          ? "var(--brand-primary)"
                          : "#d1d5db",
                      }}
                    >
                      {ldr[locale]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Official Participants */}
            <div
              className={styles.actionFieldGroup}
              style={{ gridColumn: "1 / -1" }}
            >
              <label
                htmlFor="official-participants"
                className={styles.actionLabel}
              >
                {t("Thành phần tham dự chính thức", "Official Participants")}
              </label>
              <textarea
                id="official-participants"
                rows={2}
                value={assistantOfficialParticipants}
                onChange={(e) => {
                  setDirty(true);
                  setAssistantOfficialParticipants(e.target.value);
                }}
                className={styles.actionTextarea}
              />
            </div>
          </div>

          <div className={styles.actionButtonsRow}>
            <Button type="button" variant="ghost" onClick={dismissActions}>
              {t("Hủy bỏ", "Cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAssistantSubmitToLeader}
            >
              {t("Xác nhận trình duyệt (Demo)", "Confirm & Submit (Demo)")}
            </Button>
          </div>
        </div>
      )}

      {/* Sub-Panel: Assistant Return Instruction Form */}
      {showAssistantReturn && (
        <div className={`${styles.actionPanel} ${styles.actionPanelWarning}`}>
          <h3 className={styles.actionPanelTitle} style={{ color: "#765a0d" }}>
            <ExclamationTriangleIcon
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "var(--eiu-orange)",
              }}
            />
            <span>
              {t(
                "Yêu cầu người đăng ký điều chỉnh",
                "Request Requester Revision",
              )}
            </span>
          </h3>
          <p className={styles.actionPanelDesc}>
            {t(
              "Nhập nội dung hướng dẫn cụ thể để Người đăng ký hoàn thiện thông tin trước khi gửi lại.",
              "Enter specific revision instructions for the requester to complete before resubmitting.",
            )}
          </p>

          <div className={styles.actionFieldGroup}>
            <label
              htmlFor="revision-instruction"
              className={styles.actionLabel}
            >
              {t(
                "Nội dung hướng dẫn điều chỉnh (bắt buộc)",
                "Revision Instructions (Required)",
              )}
            </label>
            <textarea
              id="revision-instruction"
              rows={3}
              value={returnInstruction}
              onChange={(e) => {
                setDirty(true);
                setReturnInstruction(e.target.value);
                if (returnError) setReturnError(false);
              }}
              placeholder={t(
                "Ví dụ: Vui lòng bổ sung danh sách đại biểu doanh nghiệp và file đề cương...",
                "E.g., Please provide list of corporate delegates and meeting brief...",
              )}
              className={styles.actionTextarea}
            />
            {returnError && (
              <span
                style={{
                  color: "var(--danger)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                {t(
                  "Vui lòng nhập nội dung hướng dẫn điều chỉnh cụ thể cho người đăng ký.",
                  "Please enter specific revision instructions for the requester.",
                )}
              </span>
            )}
          </div>

          <div className={styles.actionButtonsRow}>
            <Button type="button" variant="ghost" onClick={dismissActions}>
              {t("Hủy bỏ", "Cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAssistantReturnToRequester}
            >
              {t(
                "Gửi yêu cầu điều chỉnh (Demo)",
                "Send Revision Request (Demo)",
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Sub-Panel: Leader Approve Confirmation */}
      {showLeaderApproveConfirm && (
        <div className={styles.actionPanel}>
          <h3 className={styles.actionPanelTitle}>
            <CheckCircleIcon
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "var(--success)",
              }}
            />
            <span>
              {t("Xác nhận phê duyệt cuộc họp", "Confirm Meeting Approval")}
            </span>
          </h3>
          <p className={styles.actionPanelDesc}>
            {t(
              `Bạn có chắc chắn muốn phê duyệt yêu cầu "${request.id}"? Cuộc họp sẽ được đưa vào lịch chính thức của Trường.`,
              `Are you sure you want to approve request "${request.id}"? This meeting will be placed on the University official calendar.`,
            )}
          </p>
          <div className={styles.actionButtonsRow}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowLeaderApproveConfirm(false)}
            >
              {t("Quay lại", "Go Back")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleLeaderApprove}
            >
              {t("Đồng ý phê duyệt (Demo)", "Confirm Approve (Demo)")}
            </Button>
          </div>
        </div>
      )}

      {/* Sub-Panel: Leader Request Revision Form */}
      {showLeaderRevisionForm && (
        <div className={`${styles.actionPanel} ${styles.actionPanelWarning}`}>
          <h3 className={styles.actionPanelTitle} style={{ color: "#765a0d" }}>
            <ExclamationTriangleIcon
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "var(--eiu-orange)",
              }}
            />
            <span>
              {t("Yêu cầu điều chỉnh cuộc họp", "Request Meeting Revision")}
            </span>
          </h3>
          <p className={styles.actionPanelDesc}>
            {t(
              "Yêu cầu sẽ được chuyển lại cho Trợ lý xử lý. Bạn có thể nhập góp ý chỉ đạo bên dưới (tùy chọn).",
              "The request will be returned to the Assistant. You can provide leadership guidance comments below (optional).",
            )}
          </p>

          <div className={styles.actionFieldGroup}>
            <label htmlFor="leader-comment" className={styles.actionLabel}>
              {t("Góp ý của Lãnh đạo (Tùy chọn)", "Leader Comments (Optional)")}
            </label>
            <textarea
              id="leader-comment"
              rows={3}
              value={leaderComment}
              onChange={(e) => {
                setDirty(true);
                setLeaderComment(e.target.value);
              }}
              placeholder={t(
                "Nhập ý kiến chỉ đạo hoặc yêu cầu điều chỉnh...",
                "Enter leadership comments or guidance...",
              )}
              className={styles.actionTextarea}
            />
          </div>

          <div className={styles.actionButtonsRow}>
            <Button type="button" variant="ghost" onClick={dismissActions}>
              {t("Hủy bỏ", "Cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleLeaderRequestRevision}
            >
              {t(
                "Gửi yêu cầu điều chỉnh (Demo)",
                "Submit Revision Request (Demo)",
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Sub-Panel: Requester Cancel Confirmation */}
      {showCancelConfirm && (
        <div className={`${styles.actionPanel} ${styles.actionPanelDanger}`}>
          <h3
            className={styles.actionPanelTitle}
            style={{ color: "var(--danger)" }}
          >
            <TrashIcon
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "var(--danger)",
              }}
            />
            <span>
              {t("Xác nhận hủy yêu cầu", "Confirm Request Cancellation")}
            </span>
          </h3>
          <p className={styles.actionPanelDesc}>
            {t(
              "Bạn có chắc chắn muốn hủy yêu cầu cuộc họp này? Thao tác này sẽ chuyển yêu cầu sang trạng thái Đã hủy.",
              "Are you sure you want to cancel this meeting request? This will transition the request to Cancelled status.",
            )}
          </p>
          <div className={styles.actionButtonsRow}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCancelConfirm(false)}
            >
              {t("Quay lại", "Go Back")}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleRequesterCancel}
            >
              {t("Xác nhận hủy yêu cầu (Demo)", "Confirm Cancellation (Demo)")}
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Action Footer */}
      <div className={styles.actionFooter}>
        <div className={styles.actionFooterLeft}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("Đóng", "Close")}
          </Button>
        </div>

        <div className={styles.actionFooterRight}>
          {/* Requester Actions */}
          {requesterCanEdit && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsEditing(true)}
            >
              <PencilSquareIcon
                style={{
                  width: "1rem",
                  height: "1rem",
                  marginRight: "0.25rem",
                }}
              />
              {t("Chỉnh sửa & Gửi lại (Demo)", "Edit & Resubmit (Demo)")}
            </Button>
          )}

          {requesterCanCancel && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (dismissActions()) setShowCancelConfirm(true);
              }}
            >
              <TrashIcon
                style={{
                  width: "1rem",
                  height: "1rem",
                  marginRight: "0.25rem",
                }}
              />
              {t("Hủy yêu cầu (Demo)", "Cancel Request (Demo)")}
            </Button>
          )}

          {/* Assistant Actions */}
          {assistantCanAct && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (dismissActions()) setShowAssistantReturn(true);
                }}
              >
                {t("Yêu cầu bổ sung (Demo)", "Request Adjustment (Demo)")}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (dismissActions()) setShowAssistantFinalize(true);
                }}
              >
                {t(
                  "Hoàn thiện & Trình Lãnh đạo (Demo)",
                  "Finalize & Submit (Demo)",
                )}
              </Button>
            </>
          )}

          {/* Leader Actions */}
          {leaderCanAct && (
            <>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  if (dismissActions()) setShowLeaderRevisionForm(true);
                }}
              >
                {t("Yêu cầu chỉnh sửa (Demo)", "Request Revision (Demo)")}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (dismissActions()) setShowLeaderApproveConfirm(true);
                }}
              >
                {t("Phê duyệt (Demo)", "Approve (Demo)")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestDetail() {
  const { selectedId, closeRequest, requests, dirty, setDirty, t } = useDemo();
  const request = requests.find((r) => r.id === selectedId);

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      if (dirty) {
        const confirmed = window.confirm(
          t(
            "Nội dung chưa gửi sẽ bị mất. Bạn muốn đóng?",
            "Unsaved changes will be lost. Do you want to close?",
          ),
        );
        if (!confirmed) return;
        setDirty(false);
      }
      closeRequest();
    }
  };

  const handleClose = () => {
    if (dirty) {
      const confirmed = window.confirm(
        t(
          "Nội dung chưa gửi sẽ bị mất. Bạn muốn đóng?",
          "Unsaved changes will be lost. Do you want to close?",
        ),
      );
      if (!confirmed) return;
      setDirty(false);
    }
    closeRequest();
  };

  if (!selectedId || !request) return null;

  const modalTitle = `${t("Chi tiết yêu cầu", "Request Details")} · ${request.id}`;
  const modalDesc = t(
    "Thông tin chi tiết và tiến trình xử lý yêu cầu cuộc họp.",
    "Detailed information and processing history of meeting request.",
  );

  return (
    <Modal
      open={Boolean(selectedId && request)}
      onOpenChange={handleModalOpenChange}
      drawer
      title={modalTitle}
      description={modalDesc}
      closeLabel={t("Đóng", "Close")}
    >
      <RequestDetailView
        key={request.id}
        request={request}
        onClose={handleClose}
      />
    </Modal>
  );
}
