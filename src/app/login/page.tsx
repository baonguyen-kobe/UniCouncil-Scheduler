"use client";
import Image from "next/image";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useDemo } from "@/components/demo-provider";
import { LanguageSwitch } from "@/components/app-shell";
import { Button } from "@/components/ui";
export default function Login() {
  const { t, navigate } = useDemo();
  return (
    <main className="login-page">
      <div className="login-top">
        <Image
          src="/eiu-corner-logo.png"
          alt="Eastern International University"
          width={156}
          height={94}
          priority
          className="corner-logo"
        />
        <LanguageSwitch />
      </div>
      <div className="login-layout">
        <section className="login-editorial">
          <div className="eyebrow">
            <span className="gold-line" />
            {t(
              "KẾT NỐI · ĐIỀU PHỐI · ĐỒNG HÀNH",
              "CONNECT · COORDINATE · COLLABORATE",
            )}
          </div>
          <h1>
            {t("Những cuộc họp tốt.", "Better meetings.")}
            <br />
            <em>{t("Những bước tiến mới.", "Meaningful progress.")}</em>
          </h1>
          <p className="login-intro">
            {t(
              "Một không gian chung để đăng ký, điều phối và phê duyệt các cuộc họp với lãnh đạo trường.",
              "A shared space to request, coordinate and approve meetings with university leadership.",
            )}
          </p>
          <div className="workflow-visual" aria-hidden="true">
            <div>
              <DocumentTextIcon />
              <span>{t("Đăng ký", "Request")}</span>
            </div>
            <i />
            <div>
              <CalendarDaysIcon />
              <span>{t("Điều phối", "Coordinate")}</span>
            </div>
            <i />
            <div>
              <CheckBadgeIcon />
              <span>{t("Phê duyệt", "Approve")}</span>
            </div>
          </div>
          <div className="editorial-foot">
            <AcademicCapIcon />
            <span>
              EASTERN INTERNATIONAL UNIVERSITY
              <br />
              <small>
                {t(
                  "Tri thức hôm nay. Giá trị ngày mai.",
                  "Knowledge today. Impact tomorrow.",
                )}
              </small>
            </span>
          </div>
        </section>
        <section className="login-card">
          <div className="login-card-top">
            <span className="badge gold">
              {t("BẢN XEM TRƯỚC GIAO DIỆN", "UI PREVIEW")}
            </span>
            <span className="edition">EIU / 2026</span>
          </div>
          <div className="login-brand">
            UniCouncil<span>Scheduler</span>
          </div>
          <div className="gold-rule" />
          <h2>{t("Chào mừng bạn", "Welcome to your workspace")}</h2>
          <p className="muted">
            {t(
              "Cùng phối hợp để mỗi cuộc họp diễn ra đúng lúc, đúng người.",
              "Bring the right people together, at the right time.",
            )}
          </p>
          <Button className="demo-entry" onClick={() => navigate("/requests")}>
            {t("Khám phá bản demo", "Explore the demo")}
            <ArrowRightIcon />
          </Button>
          <div className="demo-explanation">
            <ShieldCheckIcon />
            <div>
              <strong>{t("Chế độ Demo", "Demo Mode")}</strong>
              <p>
                {t(
                  "Dữ liệu mẫu, không cần tài khoản. Thử vai trò Người đăng ký, Trợ lý và Lãnh đạo.",
                  "Sample data, no account needed. Explore Requester, Assistant and Leader workspaces.",
                )}
              </p>
            </div>
          </div>
          <div className="login-divider" />
          <p className="login-limit">
            {t(
              "Đăng nhập Google Workspace chưa được kết nối trong bản xem trước. Mọi thao tác chỉ có hiệu lực trong phiên demo.",
              "Google Workspace sign-in is not connected in this preview. All actions apply only to the demo session.",
            )}
          </p>
        </section>
      </div>
      <footer className="login-footer">
        <span>© 2026 Eastern International University</span>
        <span>
          {t(
            "Được thiết kế cho sự phối hợp hiệu quả.",
            "Designed for thoughtful collaboration.",
          )}
        </span>
      </footer>
    </main>
  );
}
