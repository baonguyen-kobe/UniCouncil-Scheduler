"use client";

import Image from "next/image";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { useDemo } from "@/components/demo-provider";
import { LanguageSwitch } from "@/components/app-shell";

export default function Login() {
  const { t, navigate, notify } = useDemo();

  function enterPreview() {
    notify(
      "Demo Mode: Chỉ mở giao diện mẫu; chưa xác thực Google Workspace.",
      "Demo Mode: Opening sample UI only; Google Workspace authentication has not occurred.",
    );
    navigate("/requests");
  }

  return (
    <main className="login-page">
      <section
        className="login-brand"
        aria-label="Eastern International University"
      >
        <Image
          className="login-brand-image"
          src="/login-cover-campus-2.jpg"
          alt={t(
            "Khuôn viên Trường Đại học Quốc tế Miền Đông",
            "Eastern International University campus",
          )}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 100vh"
        />
      </section>
      <Image
        className="login-corner-logo"
        src="/eiu-corner-logo.png"
        alt="Eastern International University"
        width={190}
        height={190}
        sizes="(max-width: 520px) 108px, (max-width: 900px) 158px, 1px"
      />
      <div className="login-language">
        <LanguageSwitch />
      </div>
      <section className="login-form-wrap" aria-labelledby="login-title">
        <form
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault();
            enterPreview();
          }}
        >
          <header className="login-form-heading">
            <p className="login-university-title">
              {t(
                "ĐẠI HỌC QUỐC TẾ MIỀN ĐÔNG",
                "EASTERN INTERNATIONAL UNIVERSITY",
              )}
            </p>
            <h1 id="login-title">UniCouncil Scheduler</h1>
            <p className="login-subtitle">
              <strong>
                {t(
                  "Hệ thống đăng ký và điều phối lịch họp lãnh đạo",
                  "Leadership meeting registration and coordination system",
                )}
              </strong>
              <span>
                {t(
                  "Dành cho nhân sự Trường Đại học Quốc tế Miền Đông",
                  "For staff of Eastern International University",
                )}
              </span>
            </p>
          </header>
          <button
            className="login-google-button"
            type="submit"
            aria-describedby="login-google-guidance login-demo-note"
          >
            <ArrowRightEndOnRectangleIcon aria-hidden="true" />
            {t("Đăng nhập bằng Google", "Sign in with Google")}
          </button>
          <small id="login-google-guidance" className="login-google-guidance">
            {t(
              "Vui lòng sử dụng tài khoản Google Workspace EIU được cấp quyền.",
              "Please use an authorized EIU Google Workspace account.",
            )}
          </small>
          <small id="login-demo-note" className="login-demo-note">
            <strong>Demo Mode</strong>
            {t(
              "Bản xem trước chưa kết nối xác thực Google. Nút phía trên chỉ mở giao diện với dữ liệu mẫu.",
              "Google authentication is not connected in this preview. The button above only opens the UI with sample data.",
            )}
          </small>
        </form>
      </section>
    </main>
  );
}
