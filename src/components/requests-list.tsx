"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useDemo } from "@/components/demo-provider";
import { StatusBadge } from "@/components/ui";
import {
  MeetingRequest,
  Status,
  statusLabel,
  formatDate,
  todayISO,
  offsetDate,
  catalogLabel,
  units,
  leaders,
  assistants,
  meetingTypes,
} from "@/lib/model";
import styles from "./requests-list.module.css";

type DatePreset = "all" | "today" | "tomorrow" | "week" | "month";
type SortOption = "priority" | "date_asc" | "date_desc" | "updated_desc";
type DemoSimState = "normal" | "loading" | "error" | "empty";

function RequestsListContent() {
  const { locale, t, role, visible, openRequest, navigate } = useDemo();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedLeader, setSelectedLeader] = useState<string>("all");
  const [selectedAssistant, setSelectedAssistant] = useState<string>("all");
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");

  // Role-dependent default tab
  const [activeTab, setActiveTab] = useState<string>(
    role === "LEADER" ? "pending" : "active",
  );

  // Dropdown open states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination State (declared before any filter watcher)
  const [pageSize, setPageSize] = useState<number>(8);
  const [page, setPage] = useState<number>(1);

  // Demo Simulation State
  const [simState, setSimState] = useState<DemoSimState>("normal");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      const trigger =
        statusDropdownRef.current?.querySelector<HTMLButtonElement>(
          'button[aria-expanded="true"]',
        );
      if (e.key === "Escape" && trigger) {
        setStatusDropdownOpen(false);
        trigger.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Reset page when filters change (React-recommended pattern without effect)
  const filterKey = `${searchQuery}_${datePreset}_${selectedStatuses.join(",")}_${selectedUnit}_${selectedLeader}_${selectedAssistant}_${selectedMeetingType}_${sortBy}_${activeTab}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  // 1. Definition of status groups per role
  const requesterStatusGroups = useMemo(
    () => [
      {
        id: "processing_grp",
        label: statusLabel("PROCESSING", "REQUESTER", locale),
        statuses: [
          "PROCESSING",
          "PENDING_APPROVAL",
          "REVISED_PROCESSING",
        ] as Status[],
      },
      {
        id: "revised_grp",
        label: statusLabel("REVISED", "REQUESTER", locale),
        statuses: ["ADJUSTED", "REVISED"] as Status[],
      },
      {
        id: "approved_grp",
        label: statusLabel("APPROVED", "REQUESTER", locale),
        statuses: ["APPROVED"] as Status[],
      },
      {
        id: "completed_grp",
        label: statusLabel("COMPLETED", "REQUESTER", locale),
        statuses: ["COMPLETED"] as Status[],
      },
      {
        id: "cancelled_grp",
        label: statusLabel("CANCELLED", "REQUESTER", locale),
        statuses: ["CANCELLED"] as Status[],
      },
    ],
    [locale],
  );

  const assistantStatuses = useMemo(() => {
    const list: Status[] = [
      "PROCESSING",
      "PENDING_APPROVAL",
      "ADJUSTED",
      "REVISED",
      "REVISED_PROCESSING",
      "APPROVED",
      "COMPLETED",
      "CANCELLED",
    ];
    return list.map((status) => ({
      status,
      label: statusLabel(status, "ASSISTANT", locale),
    }));
  }, [locale]);

  const leaderStatusGroups = useMemo(
    () => [
      {
        id: "leader_new",
        label: statusLabel("PENDING_APPROVAL", "LEADER", locale),
        statuses: ["PENDING_APPROVAL"] as Status[],
      },
      {
        id: "leader_revising",
        label: statusLabel("REVISED", "LEADER", locale),
        statuses: ["REVISED", "REVISED_PROCESSING"] as Status[],
      },
      {
        id: "leader_approved",
        label: statusLabel("APPROVED", "LEADER", locale),
        statuses: ["APPROVED"] as Status[],
      },
      {
        id: "leader_completed",
        label: statusLabel("COMPLETED", "LEADER", locale),
        statuses: ["COMPLETED"] as Status[],
      },
    ],
    [locale],
  );

  // Tab definitions
  const tabs = useMemo(() => {
    if (role === "LEADER") {
      const pendingCount = visible.filter(
        (r) => r.status === "PENDING_APPROVAL",
      ).length;
      const followupCount = visible.filter((r) =>
        ["REVISED", "REVISED_PROCESSING"].includes(r.status),
      ).length;
      const archiveCount = visible.filter((r) =>
        ["APPROVED", "COMPLETED"].includes(r.status),
      ).length;
      return [
        {
          id: "pending",
          label: statusLabel("PENDING_APPROVAL", "LEADER", locale),
          count: pendingCount,
        },
        {
          id: "followup",
          label: statusLabel("REVISED", "LEADER", locale),
          count: followupCount,
        },
        {
          id: "archive",
          label: t("Lưu trữ & Đã duyệt", "Archive & Approved"),
          count: archiveCount,
        },
        {
          id: "all",
          label: t("Tất cả được phép xem", "All accessible"),
          count: visible.length,
        },
      ];
    }

    if (role === "REQUESTER") {
      const activeCount = visible.filter(
        (r) => !["COMPLETED", "CANCELLED"].includes(r.status),
      ).length;
      const needsActionCount = visible.filter(
        (r) =>
          ["ADJUSTED", "REVISED"].includes(r.status) &&
          r.revisionTarget === "REQUESTER",
      ).length;
      const approvedCount = visible.filter(
        (r) => r.status === "APPROVED",
      ).length;
      return [
        {
          id: "active",
          label: t("Chưa hoàn tất & Sắp tới", "Active & Upcoming"),
          count: activeCount,
        },
        {
          id: "needs_action",
          label: t("Cần chỉnh sửa", "Action required"),
          count: needsActionCount,
        },
        {
          id: "approved",
          label: t("Đã duyệt", "Approved"),
          count: approvedCount,
        },
        {
          id: "all",
          label: t("Tất cả yêu cầu", "All requests"),
          count: visible.length,
        },
        {
          id: "history",
          label: t("Lịch sử / Đã đóng", "History / Closed"),
          count: visible.filter((r) =>
            ["COMPLETED", "CANCELLED"].includes(r.status),
          ).length,
        },
      ];
    }

    // Assistant / Admin
    const activeCount = visible.filter(
      (r) => !["COMPLETED", "CANCELLED"].includes(r.status),
    ).length;
    const processingCount = visible.filter(
      (r) => r.status === "PROCESSING",
    ).length;
    const pendingCount = visible.filter(
      (r) => r.status === "PENDING_APPROVAL",
    ).length;
    const revisingCount = visible.filter((r) =>
      ["ADJUSTED", "REVISED", "REVISED_PROCESSING"].includes(r.status),
    ).length;
    const approvedCount = visible.filter((r) => r.status === "APPROVED").length;

    return [
      {
        id: "active",
        label: t("Hàng đợi cần xử lý", "Active queue"),
        count: activeCount,
      },
      {
        id: "processing",
        label: t("Mới tiếp nhận", "New requests"),
        count: processingCount,
      },
      {
        id: "pending",
        label: t("Chờ lãnh đạo duyệt", "Pending approval"),
        count: pendingCount,
      },
      {
        id: "revising",
        label: t("Đang điều chỉnh", "In revision"),
        count: revisingCount,
      },
      {
        id: "approved",
        label: t("Đã duyệt lịch", "Approved"),
        count: approvedCount,
      },
      { id: "all", label: t("Tất cả", "All requests"), count: visible.length },
    ];
  }, [role, visible, t, locale]);

  // Tasteful Information Counts
  const infoCounts = useMemo(() => {
    if (role === "LEADER") {
      return [
        {
          label: t("Tổng hồ sơ xem được", "Total accessible"),
          value: visible.length,
        },
        {
          label: statusLabel("PENDING_APPROVAL", "LEADER", locale),
          value: visible.filter((r) => r.status === "PENDING_APPROVAL").length,
        },
        {
          label: statusLabel("REVISED", "LEADER", locale),
          value: visible.filter((r) =>
            ["REVISED", "REVISED_PROCESSING"].includes(r.status),
          ).length,
        },
        {
          label: statusLabel("APPROVED", "LEADER", locale),
          value: visible.filter((r) => r.status === "APPROVED").length,
        },
      ];
    }
    if (role === "REQUESTER") {
      const processing = visible.filter((r) =>
        ["PROCESSING", "PENDING_APPROVAL", "REVISED_PROCESSING"].includes(
          r.status,
        ),
      ).length;
      const needsAction = visible.filter(
        (r) =>
          ["ADJUSTED", "REVISED"].includes(r.status) &&
          r.revisionTarget === "REQUESTER",
      ).length;
      const approved = visible.filter((r) => r.status === "APPROVED").length;
      return [
        {
          label: t("Tổng yêu cầu cá nhân", "Total my requests"),
          value: visible.length,
        },
        { label: t("Đang xử lý", "In processing"), value: processing },
        {
          label: t("Cần bạn điều chỉnh", "Action required"),
          value: needsAction,
        },
        { label: t("Đã duyệt lịch", "Approved"), value: approved },
      ];
    }
    // Assistant / Admin
    return [
      {
        label: t("Tổng hồ sơ quản lý", "Total managed"),
        value: visible.length,
      },
      {
        label: t("Tiếp nhận mới", "New incoming"),
        value: visible.filter((r) => r.status === "PROCESSING").length,
      },
      {
        label: t("Trình lãnh đạo", "Pending approval"),
        value: visible.filter((r) => r.status === "PENDING_APPROVAL").length,
      },
      {
        label: t("Đã chốt lịch", "Confirmed scheduled"),
        value: visible.filter((r) => r.status === "APPROVED").length,
      },
    ];
  }, [role, visible, t, locale]);

  // Date preset helper
  function checkDatePreset(r: MeetingRequest, preset: DatePreset): boolean {
    if (preset === "all") return true;
    const effDate = r.meetingDate || r.requestedDate;
    if (!effDate) return false;
    const today = todayISO();

    if (preset === "today") {
      return effDate === today;
    }
    if (preset === "tomorrow") {
      return effDate === offsetDate(1);
    }
    if (preset === "week") {
      const now = new Date(today + "T12:00:00");
      const target = new Date(
        effDate.length === 10 ? effDate + "T12:00:00" : effDate,
      );
      const day = now.getDay();
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      mon.setHours(0, 0, 0, 0);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      sun.setHours(23, 59, 59, 999);
      return target >= mon && target <= sun;
    }
    if (preset === "month") {
      return effDate.slice(0, 7) === today.slice(0, 7);
    }
    return true;
  }

  // Filter Pipeline
  const filteredRequests = useMemo(() => {
    if (simState === "empty") return [];

    let list = [...visible];

    // 1. Role Tabs
    if (role === "LEADER") {
      if (activeTab === "pending") {
        list = list.filter((r) => r.status === "PENDING_APPROVAL");
      } else if (activeTab === "followup") {
        list = list.filter((r) =>
          ["REVISED", "REVISED_PROCESSING"].includes(r.status),
        );
      } else if (activeTab === "archive") {
        list = list.filter((r) => ["APPROVED", "COMPLETED"].includes(r.status));
      }
    } else if (role === "REQUESTER") {
      if (activeTab === "active") {
        list = list.filter(
          (r) => !["COMPLETED", "CANCELLED"].includes(r.status),
        );
      } else if (activeTab === "needs_action") {
        list = list.filter(
          (r) =>
            ["ADJUSTED", "REVISED"].includes(r.status) &&
            r.revisionTarget === "REQUESTER",
        );
      } else if (activeTab === "approved") {
        list = list.filter((r) => r.status === "APPROVED");
      } else if (activeTab === "history") {
        list = list.filter((r) =>
          ["COMPLETED", "CANCELLED"].includes(r.status),
        );
      }
    } else {
      // Assistant / Admin
      if (activeTab === "active") {
        list = list.filter(
          (r) => !["COMPLETED", "CANCELLED"].includes(r.status),
        );
      } else if (activeTab === "processing") {
        list = list.filter((r) => r.status === "PROCESSING");
      } else if (activeTab === "pending") {
        list = list.filter((r) => r.status === "PENDING_APPROVAL");
      } else if (activeTab === "revising") {
        list = list.filter((r) =>
          ["ADJUSTED", "REVISED", "REVISED_PROCESSING"].includes(r.status),
        );
      } else if (activeTab === "approved") {
        list = list.filter((r) => r.status === "APPROVED");
      }
    }

    // 2. Status Checkbox Dropdown Filter
    if (selectedStatuses.length > 0) {
      list = list.filter((r) => selectedStatuses.includes(r.status));
    }

    // 3. Date Presets
    if (datePreset !== "all") {
      list = list.filter((r) => checkDatePreset(r, datePreset));
    }

    // 4. Search Query (id, agenda, requesterName)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.agenda.toLowerCase().includes(q) ||
          r.requesterName.toLowerCase().includes(q),
      );
    }

    // 5. Assistant & Admin Filters
    if (role === "ASSISTANT" || role === "ADMIN") {
      if (selectedUnit !== "all") {
        list = list.filter((r) => r.units.includes(selectedUnit));
      }
      if (selectedLeader !== "all") {
        list = list.filter((r) => r.leaderIds.includes(selectedLeader));
      }
      if (selectedAssistant !== "all") {
        list = list.filter((r) => r.assistantId === selectedAssistant);
      }
      if (selectedMeetingType !== "all") {
        list = list.filter((r) => r.meetingTypeId === selectedMeetingType);
      }
    }

    // 6. Sorting
    list.sort((a, b) => {
      if (sortBy === "priority") {
        // Priority rank: incomplete & upcoming first
        const getRank = (r: MeetingRequest) => {
          if (role === "LEADER") {
            if (r.status === "PENDING_APPROVAL") return 1;
            if (["REVISED", "REVISED_PROCESSING"].includes(r.status)) return 2;
            if (r.status === "APPROVED") return 3;
            return 4; // COMPLETED
          }
          if (role === "REQUESTER") {
            if (
              ["ADJUSTED", "REVISED"].includes(r.status) &&
              r.revisionTarget === "REQUESTER"
            )
              return 1;
            if (
              ["PROCESSING", "PENDING_APPROVAL", "REVISED_PROCESSING"].includes(
                r.status,
              )
            )
              return 2;
            if (r.status === "APPROVED") return 3;
            if (r.status === "COMPLETED") return 4;
            return 5;
          }
          // Assistant / Admin
          if (r.status === "PROCESSING") return 1;
          if (r.status === "REVISED_PROCESSING") return 2;
          if (r.status === "PENDING_APPROVAL") return 3;
          if (["ADJUSTED", "REVISED"].includes(r.status)) return 4;
          if (r.status === "APPROVED") return 5;
          if (r.status === "COMPLETED") return 6;
          return 7;
        };

        const rankA = getRank(a);
        const rankB = getRank(b);
        if (rankA !== rankB) return rankA - rankB;

        // Within same rank, sort by effective date ascending
        const dateA = a.meetingDate || a.requestedDate || "";
        const dateB = b.meetingDate || b.requestedDate || "";
        return dateA.localeCompare(dateB);
      }

      if (sortBy === "date_asc") {
        const dateA = a.meetingDate || a.requestedDate || "";
        const dateB = b.meetingDate || b.requestedDate || "";
        return dateA.localeCompare(dateB);
      }

      if (sortBy === "date_desc") {
        const dateA = a.meetingDate || a.requestedDate || "";
        const dateB = b.meetingDate || b.requestedDate || "";
        return dateB.localeCompare(dateA);
      }

      if (sortBy === "updated_desc") {
        return (b.updatedAt || "").localeCompare(a.updatedAt || "");
      }

      return 0;
    });

    return list;
  }, [
    visible,
    simState,
    role,
    activeTab,
    selectedStatuses,
    datePreset,
    searchQuery,
    selectedUnit,
    selectedLeader,
    selectedAssistant,
    selectedMeetingType,
    sortBy,
  ]);

  // Paginated requests
  const totalItems = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Status checkbox toggling without Set
  const handleToggleStatus = (statusList: Status[]) => {
    const isAllSelected = statusList.every((s) => selectedStatuses.includes(s));
    if (isAllSelected) {
      setSelectedStatuses((prev) =>
        prev.filter((s) => !statusList.includes(s)),
      );
    } else {
      setSelectedStatuses((prev) => [
        ...prev,
        ...statusList.filter((s) => !prev.includes(s)),
      ]);
    }
  };

  const handleSelectAllStatuses = () => {
    if (role === "LEADER") {
      setSelectedStatuses([
        "PENDING_APPROVAL",
        "REVISED",
        "REVISED_PROCESSING",
        "APPROVED",
        "COMPLETED",
      ]);
    } else {
      setSelectedStatuses([
        "PROCESSING",
        "PENDING_APPROVAL",
        "ADJUSTED",
        "REVISED",
        "REVISED_PROCESSING",
        "APPROVED",
        "COMPLETED",
        "CANCELLED",
      ]);
    }
  };

  // Reset all filters
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    datePreset !== "all" ||
    selectedStatuses.length > 0 ||
    selectedUnit !== "all" ||
    selectedLeader !== "all" ||
    selectedAssistant !== "all" ||
    selectedMeetingType !== "all";

  const resetAllFilters = () => {
    setSearchQuery("");
    setDatePreset("all");
    setSelectedStatuses([]);
    setSelectedUnit("all");
    setSelectedLeader("all");
    setSelectedAssistant("all");
    setSelectedMeetingType("all");
    setSortBy("priority");
  };

  return (
    <div className={styles.container}>
      {/* 1. Header & Identity */}
      <section className={styles.headerSection}>
        <div className={styles.headerTop}>
          <div className={styles.headerTitles}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              {role === "REQUESTER" &&
                t(
                  "NGƯỜI ĐĂNG KÝ · YÊU CẦU CÁ NHÂN",
                  "REQUESTER · MY SUBMISSIONS",
                )}
              {role === "ASSISTANT" &&
                t(
                  "BAN THƯ KÝ · ĐIỀU PHỐI YÊU CẦU",
                  "SECRETARIAT · DISPATCH QUEUE",
                )}
              {role === "LEADER" &&
                t(
                  "BAN GIÁM HIỆU · PHÊ DUYỆT LỊCH HỌP",
                  "LEADERSHIP · APPROVAL QUEUE",
                )}
              {role === "ADMIN" &&
                t(
                  "QUẢN TRỊ VIÊN · TỔNG HỢP HỆ THỐNG",
                  "ADMIN · SYSTEM REQUESTS",
                )}
            </div>
            <h1 className={styles.title}>
              {role === "REQUESTER" && t("Yêu cầu của tôi", "My requests")}
              {role === "ASSISTANT" &&
                t("Xử lý & Điều phối yêu cầu", "Process & Coordinate requests")}
              {role === "LEADER" &&
                t("Phê duyệt yêu cầu họp", "Review & approve meeting requests")}
              {role === "ADMIN" &&
                t("Tất cả yêu cầu cuộc họp", "All meeting requests")}
            </h1>
            <p className={styles.description}>
              {role === "REQUESTER" &&
                t(
                  "Theo dõi tiến độ duyệt, bổ sung nội dung khi được yêu cầu và xem lịch chính thức.",
                  "Track approval status, revise details when requested, and view official meeting schedules.",
                )}
              {role === "ASSISTANT" &&
                t(
                  "Tiếp nhận hồ sơ, chuẩn hóa lịch họp, gắn lãnh đạo và trình lãnh đạo phê duyệt.",
                  "Receive submissions, standardize meeting schedules, assign leaders, and submit for approval.",
                )}
              {role === "LEADER" &&
                t(
                  "Xem xét hồ sơ cuộc họp, yêu cầu điều chỉnh nội dung hoặc xác nhận phê duyệt.",
                  "Review meeting agenda materials, request adjustments, or approve schedules.",
                )}
              {role === "ADMIN" &&
                t(
                  "Tra cứu toàn diện các hồ sơ cuộc họp và lịch sử xử lý trong hệ thống.",
                  "Comprehensive query across all meeting requests and operational audit trails.",
                )}
            </p>
          </div>

          <div className={styles.headerActions}>
            {role === "REQUESTER" && (
              <button
                type="button"
                className="button primary"
                onClick={() => navigate("/requests/new")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <PlusIcon style={{ width: "1.125rem", height: "1.125rem" }} />
                <span>{t("Tạo yêu cầu mới", "New request")}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Compact Tasteful Counts Bar */}
        <div className={styles.countsBar}>
          {infoCounts.map((c, i) => (
            <div key={i} className={styles.countCard}>
              <span className={styles.countLabel}>{c.label}</span>
              <span className={styles.countValue}>{c.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Demo Simulation Controls (Scoped, Realistic, Not Confusing) */}
      <div
        className={styles.demoToolbar}
        role="region"
        aria-label={t("Điều khiển xem thử demo", "Demo preview controls")}
      >
        <div className={styles.demoToolbarLeft}>
          <SparklesIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: "var(--brand-accent)",
            }}
          />
          <span className={styles.demoToolbarTitle}>
            {t("Chế độ xem thử UI:", "UI Preview States:")}
          </span>
          <span>
            {t(
              "Chuyển đổi trạng thái giao diện mẫu",
              "Toggle demo interface states",
            )}
          </span>
        </div>
        <div className={styles.demoToolbarButtons}>
          <button
            type="button"
            className={`${styles.demoBtn} ${simState === "normal" ? styles.demoBtnActive : ""}`}
            onClick={() => setSimState("normal")}
          >
            {t("Bình thường", "Normal")}
          </button>
          <button
            type="button"
            className={`${styles.demoBtn} ${simState === "loading" ? styles.demoBtnActive : ""}`}
            onClick={() => setSimState("loading")}
          >
            {t("Đang tải", "Loading")}
          </button>
          <button
            type="button"
            className={`${styles.demoBtn} ${simState === "error" ? styles.demoBtnActive : ""}`}
            onClick={() => setSimState("error")}
          >
            {t("Mô phỏng lỗi", "Simulate Error")}
          </button>
          <button
            type="button"
            className={`${styles.demoBtn} ${simState === "empty" ? styles.demoBtnActive : ""}`}
            onClick={() => setSimState("empty")}
          >
            {t("Trống rỗng", "Simulate Empty")}
          </button>
        </div>
      </div>

      {/* 4. Role Navigation Tabs */}
      <div
        className={styles.tabsContainer}
        role="tablist"
        aria-label={t("Danh sách yêu cầu", "Request queues")}
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
            return;
          const buttons = Array.from(
            e.currentTarget.querySelectorAll<HTMLButtonElement>(
              'button[role="tab"]',
            ),
          );
          const index = buttons.indexOf(e.target as HTMLButtonElement);
          const next =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? buttons.length - 1
                : (index + (e.key === "ArrowRight" ? 1 : -1) + buttons.length) %
                  buttons.length;
          e.preventDefault();
          buttons[next]?.focus();
          buttons[next]?.click();
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <span className={styles.tabBadge}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* 5. Filter Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                "Tìm mã REQ, nội dung hoặc người đăng ký...",
                "Search REQ ID, agenda, or requester...",
              )}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={styles.searchClear}
                aria-label={t("Xóa tìm kiếm", "Clear search")}
              >
                <XMarkIcon style={{ width: "1rem", height: "1rem" }} />
              </button>
            )}
          </div>

          <div className={styles.filterControls}>
            {/* Date Presets */}
            <div
              className={styles.presetGroup}
              role="group"
              aria-label={t("Lọc thời gian", "Date filter")}
            >
              {(
                ["all", "today", "tomorrow", "week", "month"] as DatePreset[]
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.presetBtn} ${datePreset === p ? styles.presetBtnActive : ""}`}
                  onClick={() => setDatePreset(p)}
                >
                  {p === "all" && t("Tất cả ngày", "All dates")}
                  {p === "today" && t("Hôm nay", "Today")}
                  {p === "tomorrow" && t("Ngày mai", "Tomorrow")}
                  {p === "week" && t("Tuần này", "This week")}
                  {p === "month" && t("Tháng này", "This month")}
                </button>
              ))}
            </div>

            {/* Checkbox Status Dropdown */}
            <div className={styles.dropdownWrapper} ref={statusDropdownRef}>
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${selectedStatuses.length > 0 ? styles.dropdownTriggerActive : ""}`}
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                aria-expanded={statusDropdownOpen}
              >
                <FunnelIcon style={{ width: "1rem", height: "1rem" }} />
                <span>
                  {t("Trạng thái", "Status")}
                  {selectedStatuses.length > 0 &&
                    ` (${selectedStatuses.length})`}
                </span>
                <ChevronDownIcon
                  style={{ width: "0.875rem", height: "0.875rem" }}
                />
              </button>

              {statusDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownActions}>
                    <button
                      type="button"
                      className={styles.dropdownActionBtn}
                      onClick={handleSelectAllStatuses}
                    >
                      {t("Chọn tất cả", "Select all")}
                    </button>
                    <button
                      type="button"
                      className={styles.dropdownActionBtn}
                      onClick={() => setSelectedStatuses([])}
                    >
                      {t("Bỏ chọn", "Clear")}
                    </button>
                  </div>

                  {/* Role Specific Status Options */}
                  {role === "REQUESTER" && (
                    <>
                      {requesterStatusGroups.map((grp) => {
                        const isChecked = grp.statuses.every((s) =>
                          selectedStatuses.includes(s),
                        );
                        return (
                          <label key={grp.id} className={styles.checkboxItem}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleStatus(grp.statuses)}
                            />
                            <span>{grp.label}</span>
                          </label>
                        );
                      })}
                    </>
                  )}

                  {role === "LEADER" && (
                    <>
                      {leaderStatusGroups.map((grp) => {
                        const isChecked = grp.statuses.every((s) =>
                          selectedStatuses.includes(s),
                        );
                        return (
                          <label key={grp.id} className={styles.checkboxItem}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleStatus(grp.statuses)}
                            />
                            <span>{grp.label}</span>
                          </label>
                        );
                      })}
                    </>
                  )}

                  {(role === "ASSISTANT" || role === "ADMIN") && (
                    <>
                      {assistantStatuses.map((item) => {
                        const isChecked = selectedStatuses.includes(
                          item.status,
                        );
                        return (
                          <label
                            key={item.status}
                            className={styles.checkboxItem}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleStatus([item.status])}
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={styles.filterSelect}
              style={{ minWidth: "150px" }}
              aria-label={t("Sắp xếp", "Sort")}
            >
              <option value="priority">
                {t(
                  "Ưu tiên cần xử lý & sắp tới",
                  "Priority: Action & upcoming",
                )}
              </option>
              <option value="date_asc">
                {t("Ngày họp: Gần nhất trước", "Date: Soonest first")}
              </option>
              <option value="date_desc">
                {t("Ngày họp: Xa nhất trước", "Date: Latest first")}
              </option>
              <option value="updated_desc">
                {t("Cập nhật mới nhất", "Recently updated")}
              </option>
            </select>
          </div>
        </div>

        {/* 6. Assistant & Admin Specific Catalog Filters */}
        {(role === "ASSISTANT" || role === "ADMIN") && (
          <>
            <button
              type="button"
              className={`button secondary ${styles.mobileFilterToggle}`}
              aria-expanded={advancedFiltersOpen}
              aria-controls="operational-filters"
              onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            >
              {t("Bộ lọc mở rộng", "More filters")}
              <ChevronDownIcon
                style={{
                  width: "1rem",
                  height: "1rem",
                  transform: advancedFiltersOpen ? "rotate(180deg)" : undefined,
                }}
              />
            </button>
            <div
              id="operational-filters"
              className={`${styles.secondaryFilters} ${!advancedFiltersOpen ? styles.filtersCollapsed : ""}`}
            >
              <div className={styles.filterSelectGroup}>
                <label
                  htmlFor="requests-unit"
                  className={styles.filterSelectLabel}
                >
                  {t("Đơn vị", "Unit")}
                </label>
                <select
                  id="requests-unit"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">{t("Tất cả đơn vị", "All units")}</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u[locale]}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterSelectGroup}>
                <label
                  htmlFor="requests-leader"
                  className={styles.filterSelectLabel}
                >
                  {t("Lãnh đạo", "Leader")}
                </label>
                <select
                  id="requests-leader"
                  value={selectedLeader}
                  onChange={(e) => setSelectedLeader(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">
                    {t("Tất cả lãnh đạo", "All leaders")}
                  </option>
                  {leaders.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l[locale]}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterSelectGroup}>
                <label
                  htmlFor="requests-assistant"
                  className={styles.filterSelectLabel}
                >
                  {t("Trợ lý", "Assistant")}
                </label>
                <select
                  id="requests-assistant"
                  value={selectedAssistant}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">
                    {t("Tất cả trợ lý", "All assistants")}
                  </option>
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a[locale]}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterSelectGroup}>
                <label
                  htmlFor="requests-meetingtype"
                  className={styles.filterSelectLabel}
                >
                  {t("Loại cuộc họp", "Meeting Type")}
                </label>
                <select
                  id="requests-meetingtype"
                  value={selectedMeetingType}
                  onChange={(e) => setSelectedMeetingType(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">
                    {t("Tất cả loại họp", "All meeting types")}
                  </option>
                  {meetingTypes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m[locale]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Active filters and quick reset */}
        {hasActiveFilters && (
          <div className={styles.activeFiltersBar}>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--muted)",
                fontWeight: 600,
              }}
            >
              {t("Đang lọc theo:", "Filtered by:")}
            </span>
            {searchQuery.trim() && (
              <span className={styles.activeFilterTag}>
                <span>&ldquo;{searchQuery.trim()}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={t("Xóa lọc tìm kiếm", "Clear search filter")}
                  className={styles.tagRemoveBtn}
                >
                  <XMarkIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                </button>
              </span>
            )}
            {datePreset !== "all" && (
              <span className={styles.activeFilterTag}>
                <span>
                  {datePreset === "today" && t("Hôm nay", "Today")}
                  {datePreset === "tomorrow" && t("Ngày mai", "Tomorrow")}
                  {datePreset === "week" && t("Tuần này", "This week")}
                  {datePreset === "month" && t("Tháng này", "This month")}
                </span>
                <button
                  type="button"
                  onClick={() => setDatePreset("all")}
                  aria-label={t("Xóa lọc ngày", "Clear date filter")}
                  className={styles.tagRemoveBtn}
                >
                  <XMarkIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                </button>
              </span>
            )}
            {selectedStatuses.length > 0 && (
              <span className={styles.activeFilterTag}>
                <span>
                  {t(
                    `${selectedStatuses.length} trạng thái`,
                    `${selectedStatuses.length} statuses`,
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStatuses([])}
                  aria-label={t("Xóa lọc trạng thái", "Clear status filters")}
                  className={styles.tagRemoveBtn}
                >
                  <XMarkIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                </button>
              </span>
            )}
            {selectedUnit !== "all" && (
              <span className={styles.activeFilterTag}>
                <span>{catalogLabel(units, selectedUnit, locale)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedUnit("all")}
                  aria-label={t("Xóa lọc đơn vị", "Clear unit filter")}
                  className={styles.tagRemoveBtn}
                >
                  <XMarkIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                </button>
              </span>
            )}
            {selectedLeader !== "all" && (
              <span className={styles.activeFilterTag}>
                <span>{catalogLabel(leaders, selectedLeader, locale)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedLeader("all")}
                  aria-label={t("Xóa lọc lãnh đạo", "Clear leader filter")}
                  className={styles.tagRemoveBtn}
                >
                  <XMarkIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                </button>
              </span>
            )}
            {selectedAssistant !== "all" && (
              <span className={styles.activeFilterTag}>
                <span>
                  {catalogLabel(assistants, selectedAssistant, locale)}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAssistant("all")}
                  aria-label={t("Xóa lọc trợ lý", "Clear assistant filter")}
                  className={styles.tagRemoveBtn}
                >
                  <XMarkIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                </button>
              </span>
            )}
            {selectedMeetingType !== "all" && (
              <span className={styles.activeFilterTag}>
                <span>
                  {catalogLabel(meetingTypes, selectedMeetingType, locale)}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMeetingType("all")}
                  aria-label={t(
                    "Xóa lọc loại cuộc họp",
                    "Clear meeting type filter",
                  )}
                  className={styles.tagRemoveBtn}
                >
                  <XMarkIcon style={{ width: "0.75rem", height: "0.75rem" }} />
                </button>
              </span>
            )}
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={resetAllFilters}
            >
              {t("Đặt lại tất cả", "Reset all")}
            </button>
          </div>
        )}
      </div>

      {/* 8. Data States Rendering */}
      {simState === "loading" ? (
        <div
          className={styles.tableContainer}
          style={{ padding: "1rem", display: "block" }}
        >
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
        </div>
      ) : simState === "error" ? (
        <div className={`${styles.stateBox} ${styles.errorState}`}>
          <ExclamationTriangleIcon className={styles.stateIcon} />
          <h2 className={styles.stateTitle}>
            {t(
              "Không thể tải danh sách yêu cầu",
              "Unable to load meeting requests",
            )}
          </h2>
          <p className={styles.stateText}>
            {t(
              "Tình huống lỗi mô phỏng. Không có dữ liệu thực được tải. Thử lại để khôi phục giao diện demo.",
              "Simulated error scenario. No live data was fetched. Retry to restore the demo view.",
            )}
          </p>
          <div className={styles.stateAction}>
            <button
              type="button"
              className="button primary"
              onClick={() => setSimState("normal")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <ArrowPathIcon style={{ width: "1rem", height: "1rem" }} />
              <span>{t("Thử lại ngay", "Retry now")}</span>
            </button>
          </div>
        </div>
      ) : visible.length === 0 ? (
        /* Empty State */
        <div className={styles.stateBox}>
          <CalendarDaysIcon className={styles.stateIcon} />
          <h2 className={styles.stateTitle}>
            {t("Chưa có yêu cầu nào", "No meeting requests yet")}
          </h2>
          <p className={styles.stateText}>
            {role === "REQUESTER"
              ? t(
                  "Bạn chưa đăng ký cuộc họp nào. Hãy tạo yêu cầu đầu tiên để gửi ban thư ký xử lý.",
                  "You have not submitted any meeting requests. Create your first request to get started.",
                )
              : t(
                  "Hiện tại không có yêu cầu nào trong danh sách hiển thị của vai trò này.",
                  "There are currently no requests in the visible scope for this role.",
                )}
          </p>
          {role === "REQUESTER" && (
            <div className={styles.stateAction}>
              <button
                type="button"
                className="button primary"
                onClick={() => navigate("/requests/new")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <PlusIcon style={{ width: "1rem", height: "1rem" }} />
                <span>{t("Tạo yêu cầu mới", "New request")}</span>
              </button>
            </div>
          )}
        </div>
      ) : filteredRequests.length === 0 ? (
        /* Filtered Empty State */
        <div className={styles.stateBox}>
          <FunnelIcon className={styles.stateIcon} />
          <h2 className={styles.stateTitle}>
            {t("Không tìm thấy yêu cầu phù hợp", "No matching requests found")}
          </h2>
          <p className={styles.stateText}>
            {t(
              "Không có yêu cầu nào khớp với từ khóa tìm kiếm hoặc các tiêu chí lọc đang chọn.",
              "No meeting requests match your current search keywords or applied filter criteria.",
            )}
          </p>
          <div className={styles.stateAction}>
            <button
              type="button"
              className="button secondary"
              onClick={resetAllFilters}
            >
              {t("Xóa bộ lọc & Xem lại", "Clear filters & view all")}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className={styles.tableContainer}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>
                      {t("Mã yêu cầu", "Request ID")}
                    </th>
                    <th className={styles.th}>
                      {t("Nội dung cuộc họp & Đơn vị", "Agenda & Units")}
                    </th>
                    {role !== "REQUESTER" && (
                      <th className={styles.th}>
                        {t("Người đăng ký", "Requester")}
                      </th>
                    )}
                    <th className={styles.th}>
                      {t("Thời gian", "Date & Time")}
                    </th>
                    <th className={styles.th}>
                      {t("Địa điểm & Lãnh đạo", "Location & Leader")}
                    </th>
                    <th className={styles.th}>{t("Trạng thái", "Status")}</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>
                      {t("Chi tiết", "Action")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.map((r) => {
                    const effDate = r.meetingDate || r.requestedDate;
                    const isOfficial = !!r.meetingDate;
                    const leaderNames = r.leaderIds
                      .map((id) => catalogLabel(leaders, id, locale))
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <tr
                        key={r.id}
                        className={styles.tr}
                        onClick={() => openRequest(r.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openRequest(r.id);
                          }
                        }}
                      >
                        {/* ID */}
                        <td className={styles.td}>
                          <span className={styles.reqId}>{r.id}</span>
                        </td>

                        {/* Agenda & Units */}
                        <td className={styles.td}>
                          <div className={styles.agendaCell}>
                            <span
                              className={styles.agendaText}
                              title={r.agenda}
                            >
                              {r.agenda}
                            </span>
                            <div className={styles.unitBadges}>
                              {r.units.map((uId) => (
                                <span key={uId} className={styles.unitBadge}>
                                  {catalogLabel(units, uId, locale)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Requester (For Assistant / Leader / Admin) */}
                        {role !== "REQUESTER" && (
                          <td className={styles.td}>
                            <div className={styles.requesterInfo}>
                              <UserIcon
                                style={{
                                  width: "0.9375rem",
                                  height: "0.9375rem",
                                  color: "var(--brand-accent)",
                                }}
                              />
                              <span>{r.requesterName}</span>
                            </div>
                          </td>
                        )}

                        {/* Date & Time */}
                        <td className={styles.td}>
                          <div className={styles.dateCell}>
                            <span
                              className={
                                isOfficial
                                  ? styles.dateBadgeOfficial
                                  : styles.dateBadgeProposed
                              }
                            >
                              {isOfficial
                                ? t("Lịch chính thức", "Official schedule")
                                : t("Ngày đề xuất", "Preferred date")}
                            </span>
                            <span
                              style={{ fontWeight: 600, fontSize: "0.8125rem" }}
                            >
                              {effDate ? formatDate(effDate, locale) : "—"}
                            </span>
                            <span className={styles.dateTime}>
                              {r.startTime && r.endTime
                                ? `${r.startTime} – ${r.endTime}`
                                : t("Chưa xếp giờ", "Time not set")}
                            </span>
                          </div>
                        </td>

                        {/* Location & Leader */}
                        <td className={styles.td}>
                          <div className={styles.locationLeaderCell}>
                            <div className={styles.locationText}>
                              <MapPinIcon
                                style={{
                                  width: "0.875rem",
                                  height: "0.875rem",
                                  color: "var(--muted)",
                                  flexShrink: 0,
                                }}
                              />
                              <span>
                                {r.locationId
                                  ? catalogLabel(
                                      [
                                        {
                                          id: "council",
                                          vi: "Phòng Hội đồng · B1",
                                          en: "Council Room · B1",
                                        },
                                        {
                                          id: "conference",
                                          vi: "Phòng Hội thảo · B3",
                                          en: "Conference Room · B3",
                                        },
                                        {
                                          id: "online",
                                          vi: "Trực tuyến",
                                          en: "Online",
                                        },
                                      ],
                                      r.locationId,
                                      locale,
                                    )
                                  : t("Chưa xếp phòng", "Room not set")}
                              </span>
                            </div>
                            <div className={styles.leaderText}>
                              <UserGroupIcon
                                style={{
                                  width: "0.875rem",
                                  height: "0.875rem",
                                  color: "var(--brand-accent)",
                                  flexShrink: 0,
                                }}
                              />
                              <span>
                                {leaderNames ||
                                  t("Chưa gán lãnh đạo", "Leader unassigned")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className={styles.td}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                              alignItems: "flex-start",
                            }}
                          >
                            <StatusBadge
                              status={r.status}
                              role={role}
                              locale={locale}
                            />
                            {role === "REQUESTER" &&
                              ["ADJUSTED", "REVISED"].includes(r.status) &&
                              r.revisionTarget === "REQUESTER" && (
                                <span
                                  style={{
                                    fontSize: "0.6875rem",
                                    color: "var(--danger)",
                                    fontWeight: 600,
                                  }}
                                >
                                  {t("Cần bạn sửa lại", "Needs your edit")}
                                </span>
                              )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className={`${styles.td} ${styles.actionCell}`}>
                          <button
                            type="button"
                            className={styles.viewBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              openRequest(r.id);
                            }}
                            aria-label={t(
                              `Xem chi tiết yêu cầu ${r.id}`,
                              `View details for ${r.id}`,
                            )}
                          >
                            <EyeIcon
                              style={{ width: "0.875rem", height: "0.875rem" }}
                            />
                            <span>{t("Chi tiết", "Details")}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Compact Cards */}
          <div className={styles.mobileCards}>
            {currentRequests.map((r) => {
              const effDate = r.meetingDate || r.requestedDate;
              const isOfficial = !!r.meetingDate;
              const leaderNames = r.leaderIds
                .map((id) => catalogLabel(leaders, id, locale))
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={r.id}
                  className={styles.card}
                  role="button"
                  aria-label={t(
                    `Xem chi tiết yêu cầu ${r.id}: ${r.agenda}`,
                    `View details for request ${r.id}: ${r.agenda}`,
                  )}
                  onClick={() => openRequest(r.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openRequest(r.id);
                    }
                  }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardId}>{r.id}</span>
                    <StatusBadge
                      status={r.status}
                      role={role}
                      locale={locale}
                    />
                  </div>

                  <div className={styles.cardAgenda}>{r.agenda}</div>

                  <div className={styles.cardMetaGrid}>
                    {/* Date */}
                    <div className={styles.cardMetaRow}>
                      <CalendarDaysIcon className={styles.cardMetaIcon} />
                      <span style={{ fontWeight: 600 }}>
                        {effDate ? formatDate(effDate, locale) : "—"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: isOfficial ? "#3D642B" : "#765A0D",
                        }}
                      >
                        (
                        {isOfficial
                          ? t("Chính thức", "Official")
                          : t("Đề xuất", "Proposed")}
                        )
                      </span>
                    </div>

                    {/* Time */}
                    {r.startTime && (
                      <div className={styles.cardMetaRow}>
                        <ClockIcon className={styles.cardMetaIcon} />
                        <span>
                          {r.startTime} – {r.endTime}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    {r.locationId && (
                      <div className={styles.cardMetaRow}>
                        <MapPinIcon className={styles.cardMetaIcon} />
                        <span>
                          {catalogLabel(
                            [
                              {
                                id: "council",
                                vi: "Phòng Hội đồng · B1",
                                en: "Council Room · B1",
                              },
                              {
                                id: "conference",
                                vi: "Phòng Hội thảo · B3",
                                en: "Conference Room · B3",
                              },
                              { id: "online", vi: "Trực tuyến", en: "Online" },
                            ],
                            r.locationId,
                            locale,
                          )}
                        </span>
                      </div>
                    )}

                    {/* Leader */}
                    {leaderNames && (
                      <div className={styles.cardMetaRow}>
                        <UserGroupIcon className={styles.cardMetaIcon} />
                        <span>{leaderNames}</span>
                      </div>
                    )}

                    {/* Requester if not requester */}
                    {role !== "REQUESTER" && (
                      <div className={styles.cardMetaRow}>
                        <UserIcon className={styles.cardMetaIcon} />
                        <span>{r.requesterName}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.unitBadges}>
                      {r.units.map((uId) => (
                        <span key={uId} className={styles.unitBadge}>
                          {catalogLabel(units, uId, locale)}
                        </span>
                      ))}
                    </div>

                    <span className={styles.cardFooterLink}>
                      <span>{t("Xem chi tiết", "View details")}</span>
                      <ChevronRightIcon
                        style={{ width: "0.875rem", height: "0.875rem" }}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 9. Pagination */}
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              {t(
                `Hiển thị ${startIndex + 1}–${endIndex} trên tổng số ${totalItems} yêu cầu`,
                `Showing ${startIndex + 1}–${endIndex} of ${totalItems} requests`,
              )}
            </div>

            <div className={styles.paginationControls}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  marginRight: "0.5rem",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {t("Trang:", "Size:")}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className={styles.filterSelect}
                  aria-label={t("Số yêu cầu mỗi trang", "Requests per page")}
                  style={{
                    height: "2rem",
                    padding: "0 0.25rem",
                    fontSize: "0.75rem",
                  }}
                >
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                </select>
              </div>

              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label={t("Trang trước", "Previous page")}
              >
                <ChevronLeftIcon />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ""}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNum}
                        style={{ padding: "0 0.25rem", color: "var(--muted)" }}
                      >
                        …
                      </span>
                    );
                  }
                  return null;
                },
              )}

              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label={t("Trang tiếp theo", "Next page")}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RequestsList() {
  const { role, account } = useDemo();
  return <RequestsListContent key={`${role}-${account.id}`} />;
}
