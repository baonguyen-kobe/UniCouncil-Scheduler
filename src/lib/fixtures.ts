import { MeetingRequest, Status, offsetDate } from "./model";
const agendas = [
  "Đề xuất hợp tác nghiên cứu với doanh nghiệp",
  "Rà soát chương trình đào tạo năm học 2026–2027",
  "Kế hoạch phát triển phòng thí nghiệm kỹ thuật",
  "Trao đổi chương trình học bổng sinh viên",
  "Chuẩn bị hội thảo khoa học quốc tế",
  "Đánh giá chương trình thực tập doanh nghiệp",
  "Kế hoạch phát triển đội ngũ giảng viên",
  "Báo cáo hoạt động hợp tác quốc tế",
  "Định hướng nghiên cứu ngành điều dưỡng",
  "Thảo luận kế hoạch tuyển sinh",
  "Tổng kết dự án đổi mới sáng tạo",
  "Đề xuất chương trình đào tạo liên ngành",
  "Kế hoạch hoạt động học thuật tháng tới",
  "Hợp tác đào tạo với đối tác quốc tế",
  "Rà soát báo cáo kiểm định chất lượng",
  "Trao đổi kế hoạch hội nghị đối tác",
];
const states: Status[] = [
  "ADJUSTED",
  "PROCESSING",
  "PENDING_APPROVAL",
  "APPROVED",
  "REVISED",
  "REVISED_PROCESSING",
  "APPROVED",
  "PENDING_APPROVAL",
  "PROCESSING",
  "APPROVED",
  "COMPLETED",
  "CANCELLED",
  "REVISED",
  "APPROVED",
  "PENDING_APPROVAL",
  "COMPLETED",
];
export function createFixtures(): MeetingRequest[] {
  return agendas.map((agenda, i) => {
    const status = states[i];
    const date = offsetDate(status === "COMPLETED" ? -5 : i % 9);
    const scheduled = [
      "APPROVED",
      "COMPLETED",
      "PENDING_APPROVAL",
      "REVISED",
      "REVISED_PROCESSING",
    ].includes(status);
    return {
      id: "REQ-2026-" + String(128 + i).padStart(6, "0"),
      requesterId: i < 12 ? "staff-1" : "staff-2",
      requesterName: i < 12 ? "Nguyễn Minh Trang" : "Trần Hoàng Linh",
      units: [
        ["research", "academic", "engineering", "business", "nursing"][i % 5],
      ],
      agenda,
      participants:
        "Ban Giám hiệu, đại diện đơn vị và nhóm phụ trách chương trình.",
      officialParticipants: scheduled
        ? "Ban Giám hiệu, đại diện đơn vị và nhóm phụ trách chương trình."
        : undefined,
      requestedDate: date,
      status,
      revisionTarget:
        status === "ADJUSTED"
          ? "REQUESTER"
          : status === "REVISED"
            ? i === 12
              ? "REQUESTER"
              : "ASSISTANT"
            : null,
      revisionInstruction:
        status === "ADJUSTED" || i === 12
          ? "Vui lòng bổ sung mục tiêu hợp tác và danh sách đại diện doanh nghiệp tham dự."
          : undefined,
      leaderNote:
        status === "REVISED"
          ? "Cần làm rõ nguồn lực và tiến độ triển khai."
          : undefined,
      meetingDate: scheduled ? date : undefined,
      startTime: scheduled ? "09:00" : undefined,
      endTime: scheduled ? "10:00" : undefined,
      locationId: scheduled ? (i % 2 ? "conference" : "council") : undefined,
      leaderIds: scheduled ? [i % 2 ? "leader-2" : "leader-1"] : [],
      assistantId: i % 2 ? "assistant-2" : "assistant-1",
      meetingTypeId: i % 3 === 0 ? "partnership" : "academic",
      updatedAt: offsetDate(-i % 3) + "T08:30:00+07:00",
      version: 1,
      attachments:
        i % 3 === 1
          ? []
          : [
              {
                id: "doc-" + i,
                name: "Meeting-brief.pdf",
                size: 829,
                url: "/demo-meeting-brief.pdf",
              },
            ],
      history: [
        {
          id: "created-" + i,
          at: offsetDate(-4) + "T09:15:00+07:00",
          actor: i < 12 ? "Nguyễn Minh Trang" : "Trần Hoàng Linh",
          label: { vi: "Đã gửi yêu cầu mẫu", en: "Demo request submitted" },
        },
        {
          id: "review-" + i,
          at: offsetDate(-2) + "T10:30:00+07:00",
          actor: "Lê Minh Anh",
          label: {
            vi: "Trợ lý đã xem xét yêu cầu",
            en: "Assistant reviewed the request",
          },
        },
        ...(status === "REVISED"
          ? [
              {
                id: "revision-" + i,
                at: offsetDate(-1) + "T14:00:00+07:00",
                actor: "Nguyễn Văn Phúc",
                label: {
                  vi: "Lãnh đạo yêu cầu điều chỉnh",
                  en: "Leader requested revision",
                },
                note: "Cần làm rõ nguồn lực và tiến độ triển khai.",
                internal: true,
              },
            ]
          : []),
      ],
    };
  });
}
