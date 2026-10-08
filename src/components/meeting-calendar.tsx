"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  UserIcon,
  SparklesIcon,
  EyeIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { useDemo } from "@/components/demo-provider";
import { StatusBadge } from "@/components/ui";
import {
  MeetingRequest,
  formatDate,
  todayISO,
  catalogLabel,
  units,
  leaders,
  locations,
  meetingTypes,
} from "@/lib/model";
import styles from "./meeting-calendar.module.css";

type CalendarView = "month" | "week" | "list";
type DemoSimState = "normal" | "loading" | "empty";

interface CalendarDay {
  dateISO: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  meetings: MeetingRequest[];
}

function MeetingCalendarContent() {
  const { locale, t, role, visible, openRequest } = useDemo();

  // Active View
  const [view, setView] = useState<CalendarView>("month");

  // Reference Date for Navigation (defaults to today)
  const today = todayISO();
  const [currentDateStr, setCurrentDateStr] = useState<string>(today);

  // Filters
  const [selectedLeader, setSelectedLeader] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>("all");

  // Mobile selected day in month view (defaults to today)
  const [selectedMobileDate, setSelectedMobileDate] = useState<string>(today);

  // Demo Simulation State
  const [simState, setSimState] = useState<DemoSimState>("normal");

  // Base meeting items: only approved/completed with official schedule
  const scheduledMeetings = useMemo(() => {
    if (simState === "empty") return [];

    return visible.filter((r) => {
      const isOfficialStatus = ["APPROVED", "COMPLETED"].includes(r.status);
      const hasSchedule = Boolean(r.meetingDate && r.startTime);
      if (!isOfficialStatus || !hasSchedule) return false;

      // Filter applications
      if (selectedLeader !== "all" && !r.leaderIds.includes(selectedLeader)) {
        return false;
      }
      if (selectedUnit !== "all" && !r.units.includes(selectedUnit)) {
        return false;
      }
      if (selectedLocation !== "all" && r.locationId !== selectedLocation) {
        return false;
      }
      if (
        role !== "REQUESTER" &&
        selectedMeetingType !== "all" &&
        r.meetingTypeId !== selectedMeetingType
      ) {
        return false;
      }

      return true;
    });
  }, [
    visible,
    simState,
    role,
    selectedLeader,
    selectedUnit,
    selectedLocation,
    selectedMeetingType,
  ]);

  // Current year & month numbers
  const curDate = useMemo(
    () => new Date(currentDateStr + "T12:00:00"),
    [currentDateStr],
  );
  const curYear = curDate.getFullYear();
  const curMonth = curDate.getMonth(); // 0-indexed

  // Navigation handlers
  const handlePrev = () => {
    if (view === "month" || view === "list") {
      const prev = new Date(curYear, curMonth - 1, 1);
      const mStr = String(prev.getMonth() + 1).padStart(2, "0");
      setCurrentDateStr(`${prev.getFullYear()}-${mStr}-01`);
    } else {
      // Week: -7 days
      const d = new Date(currentDateStr + "T12:00:00");
      d.setDate(d.getDate() - 7);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setCurrentDateStr(`${y}-${m}-${day}`);
    }
  };

  const handleNext = () => {
    if (view === "month" || view === "list") {
      const next = new Date(curYear, curMonth + 1, 1);
      const mStr = String(next.getMonth() + 1).padStart(2, "0");
      setCurrentDateStr(`${next.getFullYear()}-${mStr}-01`);
    } else {
      // Week: +7 days
      const d = new Date(currentDateStr + "T12:00:00");
      d.setDate(d.getDate() + 7);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setCurrentDateStr(`${y}-${m}-${day}`);
    }
  };

  // Month View Days Computation
  const monthDays: CalendarDay[] = useMemo(() => {
    const firstDayOfMonth = new Date(curYear, curMonth, 1);
    const lastDayOfMonth = new Date(curYear, curMonth + 1, 0);

    // Monday as start of week (0 for Mon, ..., 6 for Sun)
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // Preceding days from previous month
    const prevMonthLastDate = new Date(curYear, curMonth, 0).getDate();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDate - i;
      const prevMonthIdx = curMonth === 0 ? 11 : curMonth - 1;
      const prevYear = curMonth === 0 ? curYear - 1 : curYear;
      const dateISO = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayMeetings = scheduledMeetings.filter(
        (m) => m.meetingDate === dateISO,
      );
      days.push({
        dateISO,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateISO === today,
        meetings: dayMeetings,
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateISO = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayMeetings = scheduledMeetings.filter(
        (m) => m.meetingDate === dateISO,
      );
      days.push({
        dateISO,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateISO === today,
        meetings: dayMeetings,
      });
    }

    // Trailing days from next month to complete 35 or 42 cells
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonthIdx = curMonth === 11 ? 0 : curMonth + 1;
      const nextYear = curMonth === 11 ? curYear + 1 : curYear;
      const dateISO = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayMeetings = scheduledMeetings.filter(
        (m) => m.meetingDate === dateISO,
      );
      days.push({
        dateISO,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateISO === today,
        meetings: dayMeetings,
      });
    }

    return days;
  }, [curYear, curMonth, scheduledMeetings, today]);

  // Week View Days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDateStr + "T12:00:00");
    const dayOfWeek = (curr.getDay() + 6) % 7; // 0 for Monday
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);

    const days: {
      dateISO: string;
      dayName: string;
      dayNum: number;
      isToday: boolean;
      meetings: MeetingRequest[];
    }[] = [];
    const weekdayLabels =
      locale === "vi"
        ? ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateISO = `${y}-${m}-${day}`;
      const dayMeetings = scheduledMeetings
        .filter((mItem) => mItem.meetingDate === dateISO)
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

      days.push({
        dateISO,
        dayName: weekdayLabels[i],
        dayNum: d.getDate(),
        isToday: dateISO === today,
        meetings: dayMeetings,
      });
    }

    return days;
  }, [currentDateStr, scheduledMeetings, locale, today]);

  // List View: Meetings grouped by date
  const groupedMeetingsByDate = useMemo(() => {
    const groups: Record<string, MeetingRequest[]> = {};
    scheduledMeetings.forEach((m) => {
      const d = m.meetingDate || "";
      if (!groups[d]) groups[d] = [];
      groups[d].push(m);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    return sortedDates.map((d) => ({
      dateISO: d,
      meetings: groups[d].sort((a, b) =>
        (a.startTime || "").localeCompare(b.startTime || ""),
      ),
    }));
  }, [scheduledMeetings]);

  // Period Title formatted string
  const periodTitle = useMemo(() => {
    if (view === "month" || view === "list") {
      const monthNamesVi = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ];
      const monthNamesEn = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const mName =
        locale === "vi" ? monthNamesVi[curMonth] : monthNamesEn[curMonth];
      return `${mName}, ${curYear}`;
    }

    // Week view title: Week of DD/MM - DD/MM
    if (weekDays.length > 0) {
      const start = weekDays[0];
      const end = weekDays[6];
      return locale === "vi"
        ? `Tuần ${formatDate(start.dateISO, "vi")} – ${formatDate(end.dateISO, "vi")}`
        : `Week of ${formatDate(start.dateISO, "en")} – ${formatDate(end.dateISO, "en")}`;
    }

    return "";
  }, [view, curMonth, curYear, locale, weekDays]);

  // Information counts
  const monthMeetingsCount = useMemo(() => {
    const curYearMonth = `${curYear}-${String(curMonth + 1).padStart(2, "0")}`;
    return scheduledMeetings.filter((m) =>
      (m.meetingDate || "").startsWith(curYearMonth),
    ).length;
  }, [scheduledMeetings, curYear, curMonth]);

  const approvedCount = useMemo(
    () => scheduledMeetings.filter((m) => m.status === "APPROVED").length,
    [scheduledMeetings],
  );
  const completedCount = useMemo(
    () => scheduledMeetings.filter((m) => m.status === "COMPLETED").length,
    [scheduledMeetings],
  );
  const todayMeetingsCount = useMemo(
    () => scheduledMeetings.filter((m) => m.meetingDate === today).length,
    [scheduledMeetings, today],
  );

  // Mobile selected day meetings
  const mobileSelectedMeetings = useMemo(() => {
    return scheduledMeetings
      .filter((m) => m.meetingDate === selectedMobileDate)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [scheduledMeetings, selectedMobileDate]);

  const weekdayHeaders =
    locale === "vi"
      ? ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={styles.container}>
      {/* 1. Header Section */}
      <section className={styles.headerSection}>
        <div className={styles.headerTop}>
          <div className={styles.headerTitles}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              {t(
                "LỊCH HỌP CHÍNH THỨC · ĐIỀU PHỐI ĐÃ DUYỆT",
                "OFFICIAL SCHEDULE · APPROVED SESSIONS",
              )}
            </div>
            <h1 className={styles.title}>
              {role === "REQUESTER" &&
                t("Lịch họp của tôi", "My meeting schedule")}
              {role === "LEADER" &&
                t(
                  "Lịch họp lãnh đạo & Hội đồng",
                  "Leadership & council schedule",
                )}
              {(role === "ASSISTANT" || role === "ADMIN") &&
                t("Lịch họp trường & Hội đồng", "University meeting calendar")}
            </h1>
            <p className={styles.description}>
              {role === "REQUESTER"
                ? t(
                    "Xem các cuộc họp đã được phê duyệt và xếp lịch chính thức của bạn.",
                    "View approved and officially scheduled meetings for your requests.",
                  )
                : t(
                    "Theo dõi các cuộc họp đã chốt lịch, phòng họp và thành phần tham dự chính thức.",
                    "Monitor confirmed meeting schedules, assigned rooms, and official attendees.",
                  )}
            </p>
          </div>
        </div>

        {/* 2. Compact Tasteful Counts Bar */}
        <div className={styles.countsBar}>
          <div className={styles.countCard}>
            <span className={styles.countLabel}>
              {t("Họp trong tháng", "Month meetings")}
            </span>
            <span className={styles.countValue}>{monthMeetingsCount}</span>
          </div>
          <div className={styles.countCard}>
            <span className={styles.countLabel}>
              {t("Họp hôm nay", "Meetings today")}
            </span>
            <span className={styles.countValue}>{todayMeetingsCount}</span>
          </div>
          <div className={styles.countCard}>
            <span className={styles.countLabel}>
              {t("Đã duyệt sắp tới", "Upcoming approved")}
            </span>
            <span className={styles.countValue}>{approvedCount}</span>
          </div>
          <div className={styles.countCard}>
            <span className={styles.countLabel}>
              {t("Đã hoàn thành", "Completed")}
            </span>
            <span className={styles.countValue}>{completedCount}</span>
          </div>
        </div>
      </section>

      {/* 3. Demo Preview Controls */}
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
              "Chuyển đổi trạng thái giao diện lịch",
              "Toggle calendar interface preview",
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
            className={`${styles.demoBtn} ${simState === "empty" ? styles.demoBtnActive : ""}`}
            onClick={() => setSimState("empty")}
          >
            {t("Trống rỗng", "Simulate Empty")}
          </button>
        </div>
      </div>

      {/* 4. Calendar Navigation & View Selector */}
      <div className={styles.controlBar}>
        <div className={styles.navGroup}>
          <button
            type="button"
            className={styles.todayBtn}
            onClick={() => {
              setCurrentDateStr(today);
              setSelectedMobileDate(today);
            }}
          >
            {t("Hôm nay", "Today")}
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrev}
            aria-label={t("Thời gian trước", "Previous period")}
          >
            <ChevronLeftIcon
              style={{ width: "1.125rem", height: "1.125rem" }}
            />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handleNext}
            aria-label={t("Thời gian tiếp theo", "Next period")}
          >
            <ChevronRightIcon
              style={{ width: "1.125rem", height: "1.125rem" }}
            />
          </button>
          <span className={styles.periodTitle}>{periodTitle}</span>
        </div>

        <div
          className={styles.viewGroup}
          role="group"
          aria-label={t("Chọn chế độ xem", "View switcher")}
        >
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "month" ? styles.viewBtnActive : ""}`}
            onClick={() => setView("month")}
          >
            {t("Tháng", "Month")}
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "week" ? styles.viewBtnActive : ""}`}
            onClick={() => setView("week")}
          >
            {t("Tuần", "Week")}
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
            onClick={() => setView("list")}
          >
            {t("Nghị trình", "Agenda List")}
          </button>
        </div>
      </div>

      {/* 5. Filters Bar */}
      <div className={styles.filterBar}>
        {/* Leader Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="calendar-leader" className={styles.filterLabel}>
            {t("Lãnh đạo", "Leader")}
          </label>
          <select
            id="calendar-leader"
            value={selectedLeader}
            onChange={(e) => setSelectedLeader(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">{t("Tất cả lãnh đạo", "All leaders")}</option>
            {leaders.map((l) => (
              <option key={l.id} value={l.id}>
                {l[locale]}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="calendar-unit" className={styles.filterLabel}>
            {t("Đơn vị", "Unit")}
          </label>
          <select
            id="calendar-unit"
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

        {/* Location Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="calendar-location" className={styles.filterLabel}>
            {t("Địa điểm / Phòng", "Location")}
          </label>
          <select
            id="calendar-location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">{t("Tất cả địa điểm", "All locations")}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc[locale]}
              </option>
            ))}
          </select>
        </div>

        {/* Meeting Type Filter (HIDDEN for Requester) */}
        {role !== "REQUESTER" && (
          <div className={styles.filterGroup}>
            <label
              htmlFor="calendar-meetingtype"
              className={styles.filterLabel}
            >
              {t("Loại cuộc họp", "Meeting Type")}
            </label>
            <select
              id="calendar-meetingtype"
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
        )}
      </div>

      {/* 6. Calendar Views Rendering */}
      {simState === "loading" ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className={styles.skeletonCell} />
          ))}
        </div>
      ) : scheduledMeetings.length === 0 ? (
        /* Empty State */
        <div className={styles.stateBox}>
          <CalendarDaysIcon className={styles.stateIcon} />
          <h2 className={styles.stateTitle}>
            {t("Không có lịch họp nào", "No meetings scheduled")}
          </h2>
          <p className={styles.stateText}>
            {t(
              "Không tìm thấy cuộc họp chính thức nào trong khoảng thời gian hoặc theo bộ lọc đang chọn.",
              "No official meetings match the selected period or applied filter criteria.",
            )}
          </p>
          {(selectedLeader !== "all" ||
            selectedUnit !== "all" ||
            selectedLocation !== "all" ||
            selectedMeetingType !== "all") && (
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setSelectedLeader("all");
                setSelectedUnit("all");
                setSelectedLocation("all");
                setSelectedMeetingType("all");
              }}
            >
              {t("Đặt lại bộ lọc", "Reset filters")}
            </button>
          )}
        </div>
      ) : view === "month" ? (
        /* 6A. Month View */
        <>
          <div className={styles.monthContainer}>
            <div className={styles.monthWeekdayHeader}>
              {weekdayHeaders.map((w, idx) => (
                <div key={idx} className={styles.weekdayCell}>
                  {w}
                </div>
              ))}
            </div>

            <div className={styles.monthGrid}>
              {monthDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`${styles.dayCell} ${!day.isCurrentMonth ? styles.dayCellOutside : ""} ${day.isToday ? styles.dayCellToday : ""}`}
                  onClick={() => setSelectedMobileDate(day.dateISO)}
                >
                  <div className={styles.dayHeader}>
                    <button
                      type="button"
                      className={`${styles.dayNumber} ${day.isToday ? styles.dayNumberToday : ""} ${selectedMobileDate === day.dateISO ? styles.dayNumberSelected : ""}`}
                      onClick={() => setSelectedMobileDate(day.dateISO)}
                      aria-pressed={selectedMobileDate === day.dateISO}
                      aria-label={t(
                        `${formatDate(day.dateISO, locale)}: ${day.meetings.length} cuộc họp`,
                        `${formatDate(day.dateISO, locale)}: ${day.meetings.length} meetings`,
                      )}
                    >
                      {day.dayNumber}
                    </button>
                    {day.meetings.length > 0 && (
                      <span
                        style={{
                          fontSize: "0.625rem",
                          color: "var(--brand-primary)",
                          fontWeight: 700,
                        }}
                      >
                        {day.meetings.length}
                      </span>
                    )}
                  </div>

                  <div className={styles.dayMeetingsList}>
                    {day.meetings.map((m) => {
                      const isApproved = m.status === "APPROVED";
                      return (
                        <div
                          key={m.id}
                          className={`${styles.eventPill} ${isApproved ? styles.eventPillApproved : styles.eventPillCompleted}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openRequest(m.id);
                          }}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              openRequest(m.id);
                            }
                          }}
                          title={`${m.startTime} – ${m.agenda}`}
                        >
                          <span className={styles.eventPillTime}>
                            {m.startTime}
                          </span>
                          <span className={styles.eventPillTitle}>
                            {m.agenda}
                          </span>
                          {m.locationId && (
                            <span className={styles.eventPillMeta}>
                              <MapPinIcon
                                style={{
                                  width: "0.625rem",
                                  height: "0.625rem",
                                }}
                              />
                              <span>
                                {catalogLabel(locations, m.locationId, locale)}
                              </span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Day Agenda Expansion */}
          <div className={styles.mobileDayAgenda}>
            <div className={styles.mobileDayAgendaHeader}>
              <span>
                {t("Lịch ngày:", "Day schedule:")}{" "}
                {formatDate(selectedMobileDate, locale)}
              </span>
              <span>
                {t(
                  `${mobileSelectedMeetings.length} cuộc họp`,
                  `${mobileSelectedMeetings.length} meetings`,
                )}
              </span>
            </div>

            {mobileSelectedMeetings.length === 0 ? (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#8C8C8E",
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                {t(
                  "Không có cuộc họp nào trong ngày này.",
                  "No meetings scheduled on this day.",
                )}
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {mobileSelectedMeetings.map((m) => (
                  <div
                    key={m.id}
                    className={styles.weekCard}
                    onClick={() => openRequest(m.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRequest(m.id);
                      }
                    }}
                  >
                    <div className={styles.weekCardTime}>
                      <ClockIcon
                        style={{ width: "0.875rem", height: "0.875rem" }}
                      />
                      <span>
                        {m.startTime} – {m.endTime}
                      </span>
                    </div>
                    <div className={styles.weekCardTitle}>{m.agenda}</div>
                    <div className={styles.weekCardRoom}>
                      <MapPinIcon
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                      <span>
                        {catalogLabel(locations, m.locationId, locale)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : view === "week" ? (
        /* 6B. Week View */
        <div className={styles.weekContainer}>
          <div className={styles.weekGrid}>
            {weekDays.map((col, idx) => (
              <div key={idx} className={styles.weekCol}>
                <div
                  className={`${styles.weekColHeader} ${col.isToday ? styles.weekColHeaderToday : ""}`}
                >
                  <span className={styles.weekColWeekday}>{col.dayName}</span>
                  <span className={styles.weekColDate}>{col.dayNum}</span>
                </div>

                <div className={styles.weekColBody}>
                  {col.meetings.length === 0 ? (
                    <div className={styles.weekColEmpty}>
                      {t("Không có lịch", "No meetings")}
                    </div>
                  ) : (
                    col.meetings.map((m) => {
                      const leaderName = m.leaderIds
                        .map((id) => catalogLabel(leaders, id, locale))
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <div
                          key={m.id}
                          className={styles.weekCard}
                          onClick={() => openRequest(m.id)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openRequest(m.id);
                            }
                          }}
                        >
                          <div className={styles.weekCardTime}>
                            <ClockIcon
                              style={{ width: "0.75rem", height: "0.75rem" }}
                            />
                            <span>
                              {m.startTime} – {m.endTime}
                            </span>
                          </div>
                          <div className={styles.weekCardTitle}>{m.agenda}</div>
                          {m.locationId && (
                            <div className={styles.weekCardRoom}>
                              <MapPinIcon
                                style={{ width: "0.75rem", height: "0.75rem" }}
                              />
                              <span>
                                {catalogLabel(locations, m.locationId, locale)}
                              </span>
                            </div>
                          )}
                          {leaderName && (
                            <div className={styles.weekCardRoom}>
                              <UserGroupIcon
                                style={{
                                  width: "0.75rem",
                                  height: "0.75rem",
                                  color: "var(--brand-accent)",
                                }}
                              />
                              <span>{leaderName}</span>
                            </div>
                          )}
                          <div style={{ marginTop: "0.25rem" }}>
                            <StatusBadge
                              status={m.status}
                              role={role}
                              locale={locale}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 6C. Agenda / List View */
        <div className={styles.agendaContainer}>
          {groupedMeetingsByDate.map((grp) => {
            const isTodayDate = grp.dateISO === today;

            return (
              <div key={grp.dateISO} className={styles.agendaDateGroup}>
                <div className={styles.agendaDateHeader}>
                  <div className={styles.agendaDateTitle}>
                    <CalendarDaysIcon
                      style={{
                        width: "1.125rem",
                        height: "1.125rem",
                        color: "var(--brand-accent)",
                      }}
                    />
                    <span>{formatDate(grp.dateISO, locale)}</span>
                    {isTodayDate && (
                      <span className={styles.agendaDateBadge}>
                        {t("Hôm nay", "Today")}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      fontWeight: 600,
                    }}
                  >
                    {t(
                      `${grp.meetings.length} cuộc họp`,
                      `${grp.meetings.length} meetings`,
                    )}
                  </span>
                </div>

                <div className={styles.agendaListItems}>
                  {grp.meetings.map((m) => {
                    const leaderNames = m.leaderIds
                      .map((id) => catalogLabel(leaders, id, locale))
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <div
                        key={m.id}
                        className={styles.agendaItem}
                        onClick={() => openRequest(m.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openRequest(m.id);
                          }
                        }}
                      >
                        <div className={styles.agendaItemLeft}>
                          <div className={styles.agendaItemHeader}>
                            <span className={styles.agendaTimeBadge}>
                              <ClockIcon
                                style={{
                                  width: "0.875rem",
                                  height: "0.875rem",
                                }}
                              />
                              <span>
                                {m.startTime} – {m.endTime}
                              </span>
                            </span>

                            {m.locationId && (
                              <span className={styles.agendaLocationBadge}>
                                <MapPinIcon
                                  style={{
                                    width: "0.875rem",
                                    height: "0.875rem",
                                  }}
                                />
                                <span>
                                  {catalogLabel(
                                    locations,
                                    m.locationId,
                                    locale,
                                  )}
                                </span>
                              </span>
                            )}

                            <StatusBadge
                              status={m.status}
                              role={role}
                              locale={locale}
                            />
                          </div>

                          <div className={styles.agendaItemAgenda}>
                            {m.agenda}
                          </div>

                          <div className={styles.agendaItemMeta}>
                            {leaderNames && (
                              <div className={styles.agendaMetaItem}>
                                <UserGroupIcon
                                  style={{
                                    width: "0.875rem",
                                    height: "0.875rem",
                                    color: "var(--brand-accent)",
                                  }}
                                />
                                <span>{leaderNames}</span>
                              </div>
                            )}

                            <div className={styles.agendaMetaItem}>
                              <UserIcon
                                style={{
                                  width: "0.875rem",
                                  height: "0.875rem",
                                  color: "var(--muted)",
                                }}
                              />
                              <span>{m.requesterName}</span>
                            </div>

                            {m.attachments.length > 0 && (
                              <div className={styles.agendaMetaItem}>
                                <PaperClipIcon
                                  style={{
                                    width: "0.875rem",
                                    height: "0.875rem",
                                    color: "var(--muted)",
                                  }}
                                />
                                <span>
                                  {t(
                                    `${m.attachments.length} tài liệu`,
                                    `${m.attachments.length} files`,
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={styles.agendaItemRight}>
                          <button
                            type="button"
                            className="button ghost"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.8125rem",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openRequest(m.id);
                            }}
                          >
                            <EyeIcon
                              style={{ width: "1rem", height: "1rem" }}
                            />
                            <span>{t("Xem chi tiết", "Details")}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MeetingCalendar() {
  const { role, account } = useDemo();
  return <MeetingCalendarContent key={`${role}-${account.id}`} />;
}
