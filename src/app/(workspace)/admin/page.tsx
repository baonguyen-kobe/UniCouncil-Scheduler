"use client";
import { useState } from "react";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui";
import {
  accounts,
  roleLabels,
  formatDate,
  units,
  locations,
  meetingTypes,
} from "@/lib/model";
export default function AdminPage() {
  const { t, role, locale, requests, notify } = useDemo();
  const [tab, setTab] = useState("staff");
  const [inactive, setInactive] = useState<string[]>([]);
  if (role !== "ADMIN")
    return (
      <div className="panel not-found">
        <h1>{t("Không gian Quản trị", "Admin workspace")}</h1>
        <p>
          {t(
            "Chọn tài khoản Quản trị trong Chế độ Demo để xem trang này.",
            "Choose the Admin account in Demo Mode to view this page.",
          )}
        </p>
      </div>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {t("QUẢN TRỊ · DỮ LIỆU MẪU", "ADMINISTRATION · DEMO DATA")}
          </div>
          <h1>{t("Nhân sự & cấu hình", "Staff & settings")}</h1>
          <p>
            {t(
              "Khám phá danh mục và nhật ký của phiên demo.",
              "Explore catalogs and the current demo session audit trail.",
            )}
          </p>
        </div>
      </div>
      <div className="admin-info">
        {t(
          "Chỉ mô phỏng giao diện. Không thay đổi quyền truy cập hoặc cấu hình hệ thống thực.",
          "UI simulation only. Real access permissions and system configuration are not changed.",
        )}
      </div>
      <div className="admin-tabs">
        {[
          ["staff", "Nhân sự", "Staff"],
          ["catalogs", "Danh mục", "Catalogs"],
          ["audit", "Nhật ký", "Audit trail"],
        ].map(([id, vi, en]) => (
          <Button
            key={id}
            variant={tab === id ? "primary" : "secondary"}
            onClick={() => setTab(id)}
          >
            {t(vi, en)}
          </Button>
        ))}
      </div>
      <section className="panel admin-panel">
        {tab === "staff" ? (
          <div className="admin-list">
            {accounts.map((a) => (
              <div className="admin-row" key={a.id}>
                <span className="avatar">{a.initials}</span>
                <div>
                  <strong>{a.name}</strong>
                  <p>{a.roles.map((r) => roleLabels[r][locale]).join(" · ")}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setInactive((prev) =>
                      prev.includes(a.id)
                        ? prev.filter((id) => id !== a.id)
                        : [...prev, a.id],
                    );
                    notify(
                      "Đã đổi chỉ báo trạng thái mẫu. Tài khoản demo vẫn sử dụng được.",
                      "Demo status indicator changed. The demo account remains available.",
                    );
                  }}
                >
                  {inactive.includes(a.id)
                    ? t("Không hoạt động · Mẫu", "Inactive · Demo")
                    : t("Hoạt động · Mẫu", "Active · Demo")}
                </Button>
              </div>
            ))}
          </div>
        ) : tab === "catalogs" ? (
          <>
            {[
              { title: t("Đơn vị", "Units"), items: units },
              { title: t("Địa điểm", "Locations"), items: locations },
              {
                title: t("Loại cuộc họp", "Meeting types"),
                items: meetingTypes,
              },
            ].map((group) => (
              <section key={group.title}>
                <h2>{group.title}</h2>
                {group.items.map((i) => (
                  <div className="admin-row" key={i.id}>
                    <strong>{i[locale]}</strong>
                    <span className="badge gray">{i.id}</span>
                  </div>
                ))}
              </section>
            ))}
            <p className="muted">
              {t(
                "Múi giờ: Asia/Ho_Chi_Minh · Tệp: tối đa 10, 4 MB/tệp",
                "Timezone: Asia/Ho_Chi_Minh · Files: up to 10, 4 MB/file",
              )}
            </p>
          </>
        ) : (
          requests
            .flatMap((r) => r.history.map((h) => ({ ...h, requestId: r.id })))
            .sort((a, b) => b.at.localeCompare(a.at))
            .map((h) => (
              <div className="audit-row" key={h.id}>
                <strong>
                  {h.requestId} · {h.label[locale]}
                </strong>
                {h.note && <p>{h.note}</p>}
                <small>
                  {h.actor} · {formatDate(h.at, locale)}
                </small>
              </div>
            ))
        )}
      </section>
    </>
  );
}
