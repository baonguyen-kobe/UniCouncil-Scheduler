export type Locale = "vi" | "en";
export type Role = "REQUESTER" | "ASSISTANT" | "LEADER" | "ADMIN";
export type Status =
  | "PROCESSING"
  | "PENDING_APPROVAL"
  | "ADJUSTED"
  | "REVISED"
  | "REVISED_PROCESSING"
  | "APPROVED"
  | "CANCELLED"
  | "COMPLETED";
export type Bilingual = { vi: string; en: string };
export type Attachment = {
  id: string;
  name: string;
  size: number;
  url?: string;
};
export type HistoryEvent = {
  id: string;
  at: string;
  actor: string;
  label: Bilingual;
  note?: string;
  internal?: boolean;
};
export type MeetingRequest = {
  id: string;
  requesterId: string;
  requesterName: string;
  units: string[];
  agenda: string;
  participants: string;
  officialParticipants?: string;
  requestedDate: string;
  status: Status;
  revisionTarget: "REQUESTER" | "ASSISTANT" | null;
  revisionInstruction?: string;
  leaderNote?: string;
  meetingDate?: string;
  startTime?: string;
  endTime?: string;
  locationId?: string;
  leaderIds: string[];
  assistantId: string;
  meetingTypeId: string;
  updatedAt: string;
  version: number;
  attachments: Attachment[];
  history: HistoryEvent[];
};
export const roleLabels: Record<Role, Bilingual> = {
  REQUESTER: { vi: "Người đăng ký", en: "Requester" },
  ASSISTANT: { vi: "Trợ lý", en: "Assistant" },
  LEADER: { vi: "Lãnh đạo", en: "Leader" },
  ADMIN: { vi: "Quản trị", en: "Admin" },
};
export const units = [
  { id: "business", vi: "Trường Kinh doanh", en: "School of Business" },
  { id: "engineering", vi: "Trường Kỹ thuật", en: "School of Engineering" },
  { id: "nursing", vi: "Trường Điều dưỡng", en: "School of Nursing" },
  {
    id: "research",
    vi: "Phòng Khoa học & Hợp tác",
    en: "Research & Partnerships Office",
  },
  { id: "academic", vi: "Phòng Đào tạo", en: "Academic Affairs Office" },
];
export const leaders = [
  { id: "leader-1", vi: "TS. Nguyễn Văn Phúc", en: "Dr. Nguyễn Văn Phúc" },
  { id: "leader-2", vi: "TS. Trần Thị Mai", en: "Dr. Trần Thị Mai" },
];
export const assistants = [
  { id: "assistant-1", vi: "Lê Minh Anh", en: "Lê Minh Anh" },
  { id: "assistant-2", vi: "Phạm Hoàng Nam", en: "Phạm Hoàng Nam" },
];
export const locations = [
  { id: "council", vi: "Phòng Hội đồng · B1", en: "Council Room · B1" },
  { id: "conference", vi: "Phòng Hội thảo · B3", en: "Conference Room · B3" },
  { id: "online", vi: "Trực tuyến", en: "Online" },
];
export const meetingTypes = [
  { id: "general", vi: "Họp công tác", en: "Working meeting" },
  { id: "academic", vi: "Họp chuyên môn", en: "Academic meeting" },
  { id: "partnership", vi: "Hợp tác đối ngoại", en: "Partnership meeting" },
];
export const accounts = [
  {
    id: "staff-1",
    name: "Nguyễn Minh Trang",
    initials: "MT",
    roles: ["REQUESTER", "ASSISTANT", "LEADER"] as Role[],
  },
  {
    id: "leader-2",
    name: "Trần Thị Mai",
    initials: "TM",
    roles: ["LEADER"] as Role[],
  },
  {
    id: "admin-1",
    name: "Lê Hoàng An",
    initials: "HA",
    roles: ["REQUESTER", "ADMIN"] as Role[],
  },
];
export const statuses: Status[] = [
  "PROCESSING",
  "PENDING_APPROVAL",
  "ADJUSTED",
  "REVISED",
  "REVISED_PROCESSING",
  "APPROVED",
  "CANCELLED",
  "COMPLETED",
];
const common: Partial<Record<Status, Bilingual>> = {
  APPROVED: { vi: "Đã duyệt", en: "Approved" },
  CANCELLED: { vi: "Đã hủy", en: "Cancelled" },
  COMPLETED: { vi: "Hoàn thành", en: "Completed" },
};
const processing = { vi: "Đang xử lý", en: "Processing" },
  revised = { vi: "Điều chỉnh", en: "Revised" };
export function statusLabel(
  status: Status,
  role: Role,
  locale: Locale,
): string {
  const maps: Record<Role, Partial<Record<Status, Bilingual>>> = {
    REQUESTER: {
      ...common,
      PROCESSING: processing,
      PENDING_APPROVAL: processing,
      REVISED_PROCESSING: processing,
      ADJUSTED: revised,
      REVISED: revised,
    },
    ASSISTANT: {
      ...common,
      PROCESSING: { vi: "Mới", en: "New" },
      PENDING_APPROVAL: { vi: "Chờ duyệt", en: "Pending Approval" },
      ADJUSTED: { vi: "Chờ bổ sung", en: "Adjusted" },
      REVISED: revised,
      REVISED_PROCESSING: processing,
    },
    LEADER: {
      APPROVED: common.APPROVED,
      COMPLETED: common.COMPLETED,
      PENDING_APPROVAL: { vi: "Mới", en: "New" },
      REVISED: { vi: "Điều chỉnh", en: "Revising" },
      REVISED_PROCESSING: { vi: "Điều chỉnh", en: "Revising" },
    },
    ADMIN: {
      ...common,
      PROCESSING: { vi: "Mới", en: "New" },
      PENDING_APPROVAL: { vi: "Chờ duyệt", en: "Pending Approval" },
      ADJUSTED: { vi: "Chờ bổ sung", en: "Adjusted" },
      REVISED: revised,
      REVISED_PROCESSING: processing,
    },
  };
  return maps[role][status]?.[locale] ?? "—";
}
export function canEdit(r: MeetingRequest, accountId: string, role: Role) {
  return (
    role === "REQUESTER" &&
    r.requesterId === accountId &&
    r.revisionTarget === "REQUESTER" &&
    ["ADJUSTED", "REVISED"].includes(r.status)
  );
}
export function visibleRequests(
  requests: MeetingRequest[],
  role: Role,
  accountId: string,
) {
  return requests.filter((r) =>
    role === "REQUESTER"
      ? r.requesterId === accountId
      : role === "LEADER"
        ? [
            "PENDING_APPROVAL",
            "REVISED",
            "REVISED_PROCESSING",
            "APPROVED",
            "COMPLETED",
          ].includes(r.status)
        : true,
  );
}
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function offsetDate(offset: number) {
  const d = new Date(todayISO() + "T12:00:00");
  d.setDate(d.getDate() + offset);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date.length === 10 ? date + "T12:00:00" : date));
}
export function catalogLabel(
  items: { id: string; vi: string; en: string }[],
  id: string | undefined,
  locale: Locale,
) {
  return items.find((i) => i.id === id)?.[locale] ?? "—";
}
