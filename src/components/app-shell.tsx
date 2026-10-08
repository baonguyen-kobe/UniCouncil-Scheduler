"use client";
import { useState, ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowPathIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import { useDemo } from "./demo-provider";
import { Modal } from "./ui";
import { accounts, roleLabels } from "@/lib/model";
export function LanguageSwitch() {
  const { locale, setLocale, t } = useDemo();
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={t("Ngôn ngữ", "Language")}
    >
      {(["vi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={locale === l ? "selected" : ""}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
export default function AppShell({ children }: { children: ReactNode }) {
  const { t, role, switchRole, account, switchAccount, navigate, reset } =
    useDemo();
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [demo, setDemo] = useState(false);
  const requestTitle =
    role === "REQUESTER"
      ? t("Yêu cầu của tôi", "My requests")
      : role === "LEADER"
        ? t("Phê duyệt yêu cầu", "Review requests")
        : t("Xử lý yêu cầu", "Process requests");
  function sidebar(mobile = false) {
    const items =
      role === "ADMIN"
        ? [
            {
              path: "/admin",
              label: t("Nhân sự & cấu hình", "Staff & settings"),
              icon: AdjustmentsHorizontalIcon,
            },
          ]
        : [
            { path: "/requests", label: requestTitle, icon: DocumentTextIcon },
            ...(role === "REQUESTER"
              ? [
                  {
                    path: "/requests/new",
                    label: t("Tạo yêu cầu", "New request"),
                    icon: PlusIcon,
                  },
                ]
              : []),
            {
              path: "/calendar",
              label: t("Lịch họp", "Meeting calendar"),
              icon: CalendarDaysIcon,
            },
          ];
    return (
      <>
        <div className="logo-panel">
          <Image
            src="/eiu-full-logo.jpg"
            alt="Eastern International University"
            width={210}
            height={50}
            priority
          />
        </div>
        <div className="sidebar-brand">
          UniCouncil <span>Scheduler</span>
        </div>
        <div className="workspace-control">
          <label htmlFor={mobile ? "mobile-workspace" : "workspace"}>
            {t("KHÔNG GIAN LÀM VIỆC", "WORKSPACE")}
          </label>
          {account.roles.length > 1 ? (
            <div className="workspace-select">
              <UserGroupIcon />
              <select
                id={mobile ? "mobile-workspace" : "workspace"}
                aria-label={t("Không gian làm việc", "Workspace")}
                value={role}
                onChange={(e) => {
                  switchRole(e.target.value as typeof role);
                  setMenu(false);
                }}
              >
                {account.roles.map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r][t("vi", "en") as "vi" | "en"]}
                  </option>
                ))}
              </select>
              <ChevronDownIcon />
            </div>
          ) : (
            <strong>{roleLabels[role][t("vi", "en") as "vi" | "en"]}</strong>
          )}
        </div>
        <div className="nav-group-label">
          {t("ĐIỀU PHỐI CUỘC HỌP", "MEETING COORDINATION")}
        </div>
        <nav aria-label={t("Điều hướng chính", "Main navigation")}>
          {items.map((item) => (
            <button
              key={item.path}
              className={"nav-item " + (path === item.path ? "active" : "")}
              aria-current={path === item.path ? "page" : undefined}
              onClick={() => {
                navigate(item.path);
                setMenu(false);
              }}
            >
              <item.icon />
              {item.label}
              {path === item.path && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-sidebar">
            <BeakerIcon />
            <strong>{t("Không gian thử nghiệm", "A space to explore")}</strong>
            <p>
              {t(
                "Thử quy trình, đổi vai trò. Không có dữ liệu thực được gửi.",
                "Try the workflow, switch roles. No real data is submitted.",
              )}
            </p>
            <button
              onClick={() => {
                setDemo(true);
                setMenu(false);
              }}
            >
              {t("Tùy chỉnh demo", "Demo controls")}
              <ChevronDownIcon />
            </button>
          </div>
          <button className="sidebar-account" onClick={() => setDemo(true)}>
            <span className="avatar">{account.initials}</span>
            <span>
              <strong>{account.name}</strong>
              <small>{t("Tài khoản demo", "Demo account")}</small>
            </span>
            <ChevronDownIcon />
          </button>
          <button className="sign-out" onClick={() => navigate("/login")}>
            <ArrowRightStartOnRectangleIcon />
            {t("Về trang chào mừng", "Back to welcome")}
          </button>
        </div>
      </>
    );
  }
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        {t("Đến nội dung chính", "Skip to content")}
      </a>
      <aside className="sidebar">{sidebar()}</aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label={t("Mở điều hướng", "Open navigation")}
              onClick={() => setMenu(true)}
            >
              <Bars3Icon />
            </button>
            <span className="topbar-product">UniCouncil</span>
            <span className="breadcrumb-slash">/</span>
            <span>{roleLabels[role][t("vi", "en") as "vi" | "en"]}</span>
          </div>
          <div className="topbar-actions">
            <button className="demo-chip" onClick={() => setDemo(true)}>
              <span />
              {t("Chế độ Demo", "Demo Mode")}
            </button>
            <LanguageSwitch />
            <span className="avatar topbar-avatar">{account.initials}</span>
          </div>
        </header>
        <div className="demo-banner">
          <BeakerIcon />
          <span>
            {t(
              "Bản xem trước · Dữ liệu mẫu và thay đổi chỉ lưu trong phiên này.",
              "Preview · Sample data and changes are kept only in this session.",
            )}
          </span>
          <button onClick={() => setDemo(true)}>
            {t("Đổi tài khoản", "Switch account")}
          </button>
        </div>
        <main id="main-content" className="page-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>Eastern International University</span>
          <span>UniCouncil Scheduler · {t("Bản xem trước", "UI preview")}</span>
        </footer>
      </div>
      <Modal
        open={menu}
        onOpenChange={setMenu}
        title={t("Điều hướng", "Navigation")}
        drawer
        closeLabel={t("Đóng", "Close")}
      >
        <div className="mobile-sidebar">{sidebar(true)}</div>
      </Modal>
      <Modal
        open={demo}
        onOpenChange={setDemo}
        title={t("Chế độ Demo", "Demo Mode")}
        description={t(
          "Mô phỏng vai trò, không thay đổi quyền thực. Dữ liệu sẽ được đặt lại khi tải lại trang.",
          "Simulated roles, not real permissions. Reloading the page resets demo data.",
        )}
        closeLabel={t("Đóng", "Close")}
      >
        <div className="demo-controls">
          <label className="field-label" htmlFor="demo-account">
            {t("Tài khoản mẫu", "Demo account")}
          </label>
          <select
            className="field"
            id="demo-account"
            value={account.id}
            onChange={(e) => {
              switchAccount(e.target.value);
              setDemo(false);
            }}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ·{" "}
                {a.roles
                  .map((r) => roleLabels[r][t("vi", "en") as "vi" | "en"])
                  .join(" / ")}
              </option>
            ))}
          </select>
          <p className="muted">
            {t(
              "Tất cả tài khoản Lãnh đạo dùng chung một danh sách phê duyệt. Tài khoản Quản trị mới thấy không gian Quản trị.",
              "All Leader accounts share the same review queue. Only the Admin demo account sees the Admin workspace.",
            )}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              reset();
              setDemo(false);
            }}
          >
            <ArrowPathIcon />
            {t("Đặt lại dữ liệu mẫu", "Reset demo data")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
