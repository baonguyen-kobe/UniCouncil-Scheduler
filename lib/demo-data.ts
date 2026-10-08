export type Role = "REQUESTER" | "ASSISTANT" | "LEADER" | "ADMIN";
export type Locale = "vi" | "en";
export type Status =
  | "PROCESSING" | "PENDING_APPROVAL" | "ADJUSTED" | "REVISED"
  | "REVISED_PROCESSING" | "APPROVED" | "CANCELLED" | "COMPLETED";
export type RevisionTarget = "REQUESTER" | "ASSISTANT" | null;

export type MeetingRequest = {
  id: string;
  agenda: string;
  requester: string;
  unit: string;
  participants: string;
  preferredDate: string;
  meetingDate?: string;
  meetingTime?: string;
  location?: string;
  leader?: string;
  status: Status;
  revisionTarget: RevisionTarget;
  instruction?: string;
  note?: string;
  updated: string;
  documents: string[];
};

export const EIU_ASSETS = {
  fullLogo: "https://raw.githubusercontent.com/baonguyen-kobe/eiu-medlabs/main/public/eiu-full-logo.jpg",
  cornerLogo: "https://raw.githubusercontent.com/baonguyen-kobe/eiu-medlabs/main/public/eiu-corner-logo.png"
} as const;

export const MOCK_USER = "Nguyễn Minh Anh";
export const MOCK_EMAIL = "minhanh@eiu.edu.vn";

function dayPlus(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yy + "-" + mm + "-" + dd;
}
export function todayIso() { return dayPlus(0); }

export function createMockRequests(): MeetingRequest[] {
  const base: MeetingRequest[] = [
    {id:"REQ-2026-0018",agenda:"Họp rà soát kế hoạch chiến lược phát triển EIU giai đoạn 2027–2030",requester:"Nguyễn Minh Anh",unit:"Phòng Hành chính – Tổng hợp",participants:"Ban Giám hiệu, Trưởng các đơn vị",preferredDate:dayPlus(1),meetingDate:dayPlus(2),meetingTime:"09:00",location:"Phòng họp A.201",leader:"Ban Giám hiệu",status:"PENDING_APPROVAL",revisionTarget:null,updated:"10 phút trước",documents:["Ke-hoach-chien-luoc.pdf","Tong-hop-y-kien.docx"]},
    {id:"REQ-2026-0017",agenda:"Làm việc về hợp tác đào tạo và nghiên cứu quốc tế",requester:"Trần Thảo Vy",unit:"Phòng Hợp tác quốc tế",participants:"Ban Giám hiệu, Phòng HTQT, đại diện đối tác",preferredDate:dayPlus(3),meetingDate:dayPlus(3),meetingTime:"14:00",location:"Phòng họp B.101",leader:"Hiệu trưởng",status:"APPROVED",revisionTarget:null,updated:"1 giờ trước",documents:["De-xuat-hop-tac.pdf"]},
    {id:"REQ-2026-0016",agenda:"Thống nhất phương án tổ chức lễ tốt nghiệp",requester:"Nguyễn Minh Anh",unit:"Phòng Công tác Sinh viên",participants:"Phó Hiệu trưởng, Trưởng các phòng liên quan",preferredDate:dayPlus(5),status:"ADJUSTED",revisionTarget:"REQUESTER",instruction:"Vui lòng làm rõ thành phần tham dự và bổ sung đề cương chương trình.",updated:"3 giờ trước",documents:["Du-thao-chuong-trinh.docx"]},
    {id:"REQ-2026-0015",agenda:"Báo cáo tiến độ nâng cấp cơ sở vật chất",requester:"Lê Hoàng Phúc",unit:"Phòng Quản trị – Thiết bị",participants:"Ban Giám hiệu, Phòng QTTB, các đơn vị liên quan",preferredDate:dayPlus(4),status:"REVISED",revisionTarget:"ASSISTANT",note:"Cần cân nhắc thêm mốc tiến độ.",updated:"Hôm qua",documents:["Bao-cao-tien-do.pdf"]},
    {id:"REQ-2026-0014",agenda:"Đề xuất triển khai chương trình kỹ năng số",requester:"Nguyễn Minh Anh",unit:"Khoa Công nghệ thông tin",participants:"Phó Hiệu trưởng, Ban Chủ nhiệm Khoa",preferredDate:dayPlus(7),status:"REVISED",revisionTarget:"REQUESTER",instruction:"Bổ sung danh sách người tham gia và kinh phí dự kiến.",updated:"Hôm qua",documents:[]},
    {id:"REQ-2026-0013",agenda:"Họp định kỳ công tác đào tạo tháng 10",requester:"Phạm Ngọc Hà",unit:"Phòng Đào tạo",participants:"Ban Giám hiệu, Phòng Đào tạo",preferredDate:dayPlus(8),status:"PROCESSING",revisionTarget:null,updated:"2 ngày trước",documents:[]},
    {id:"REQ-2026-0012",agenda:"Điều phối lịch sử dụng không gian học tập",requester:"Nguyễn Minh Anh",unit:"Trung tâm Học liệu",participants:"Các đơn vị phụ trách",preferredDate:dayPlus(-3),meetingDate:dayPlus(-2),meetingTime:"08:30",location:"Phòng họp A.201",leader:"Phó Hiệu trưởng",status:"COMPLETED",revisionTarget:null,updated:"3 ngày trước",documents:["Lich-hop.pdf"]},
    {id:"REQ-2026-0011",agenda:"Rà soát kế hoạch tổ chức hội thảo chuyên môn",requester:"Vũ Tuấn Khải",unit:"Khoa Kỹ thuật",participants:"Ban Giám hiệu, các khoa",preferredDate:dayPlus(6),status:"REVISED_PROCESSING",revisionTarget:null,updated:"3 ngày trước",documents:[]},
    {id:"REQ-2026-0010",agenda:"Đề xuất hợp tác chuyên gia theo dự án",requester:"Nguyễn Minh Anh",unit:"Phòng Nghiên cứu khoa học",participants:"Lãnh đạo và nhóm dự án",preferredDate:dayPlus(-6),status:"CANCELLED",revisionTarget:null,updated:"Tuần trước",documents:[]}
  ];
  return base;
}
export function statusLabel(status: Status, role: Role, locale: Locale): string {
  const labels: Record<Role, Record<Status, [string, string]>> = {
    REQUESTER: {
      PROCESSING:["Đang xử lý","Processing"],PENDING_APPROVAL:["Đang xử lý","Processing"],
      ADJUSTED:["Điều chỉnh","Revision needed"],REVISED:["Điều chỉnh","Revision needed"],
      REVISED_PROCESSING:["Đang xử lý","Processing"],APPROVED:["Đã duyệt","Approved"],
      CANCELLED:["Đã hủy","Cancelled"],COMPLETED:["Hoàn thành","Completed"]
    },
    ASSISTANT: {
      PROCESSING:["Mới","New"],PENDING_APPROVAL:["Chờ duyệt","Pending approval"],
      ADJUSTED:["Chờ bổ sung","Awaiting updates"],REVISED:["Điều chỉnh","Revision"],
      REVISED_PROCESSING:["Đang xử lý","Processing"],APPROVED:["Đã duyệt","Approved"],
      CANCELLED:["Đã hủy","Cancelled"],COMPLETED:["Hoàn thành","Completed"]
    },
    LEADER: {
      PROCESSING:["Mới","New"],PENDING_APPROVAL:["Mới","New"],ADJUSTED:["Điều chỉnh","Revision"],
      REVISED:["Điều chỉnh","Revision"],REVISED_PROCESSING:["Điều chỉnh","Revision"],
      APPROVED:["Đã duyệt","Approved"],CANCELLED:["Đã hủy","Cancelled"],COMPLETED:["Hoàn thành","Completed"]
    },
    ADMIN: {
      PROCESSING:["Đang xử lý","Processing"],PENDING_APPROVAL:["Chờ duyệt","Pending approval"],
      ADJUSTED:["Điều chỉnh","Revision"],REVISED:["Điều chỉnh","Revision"],
      REVISED_PROCESSING:["Đang xử lý","Processing"],APPROVED:["Đã duyệt","Approved"],
      CANCELLED:["Đã hủy","Cancelled"],COMPLETED:["Hoàn thành","Completed"]
    }
  };
  return labels[role][status][locale === "vi" ? 0 : 1];
}
export function badgeTone(status: Status, role: Role): string {
  if(status === "APPROVED") return "success";
  if(status === "COMPLETED") return "neutral";
  if(status === "CANCELLED") return "danger";
  if(status === "ADJUSTED" || status === "REVISED") return "warning";
  if(status === "PENDING_APPROVAL" && role === "ASSISTANT") return "warning";
  if(status === "REVISED_PROCESSING" && role === "LEADER") return "warning";
  return "info";
}
export function displayDate(value: string, locale: Locale): string {
  if(!value) return "—";
  const [year,month,day]=value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(year,month-1,day));
}
