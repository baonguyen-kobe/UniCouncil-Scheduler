import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const output = "artifacts/screenshots";
test("captures EIU preview screens for design comparison", async ({ page }) => {
  mkdirSync(output, { recursive: true });

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "UniCouncil Scheduler" })).toBeVisible();
  await page.screenshot({ path: output + "/01-login-desktop.png", fullPage: true });

  await page.getByRole("button", { name: "Vào giao diện demo" }).click();
  await expect(page.getByRole("heading", { name: "Yêu cầu của tôi" })).toBeVisible();
  await expect(page.locator(".requests-page .page-title-row")).toHaveCount(0);
  await expect(page.locator(".stats-row .stat-card")).toHaveCount(3);
  await expect(page.locator(".stats-row")).toContainText("Yêu cầu mới");
  await expect(page.locator(".stats-row")).toContainText("Đang điều chỉnh");
  await expect(page.locator(".stats-row")).toContainText("Đã duyệt");
  await expect(page.locator(".side-nav .nav-link").first()).toContainText("Tạo yêu cầu");
  await expect(page.locator(".table-card-heading").getByRole("button", { name: "Tạo yêu cầu" })).toBeVisible();
  await expect(page.locator(".topbar-avatar")).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  const singleLineBrand = await page.locator(".side-product-title").evaluate(element => {
    const style = getComputedStyle(element);
    return style.whiteSpace === "nowrap" && element.scrollWidth <= element.clientWidth;
  });
  expect(singleLineBrand).toBe(true);
  await page.screenshot({ path: output + "/02-requester-desktop.png", fullPage: true });

  await page.locator(".requests-table tbody tr").first().click();
  await expect(page.getByRole("dialog", { name: "Chi tiết yêu cầu" })).toBeVisible();
  await page.screenshot({ path: output + "/03-request-detail-desktop.png", fullPage: true });
  await page.getByRole("dialog", { name: "Chi tiết yêu cầu" }).getByRole("button", { name: "Đóng" }).click();

  await page.locator(".workspace-trigger").click();
  await page.locator(".workspace-dropdown").getByRole("button", { name: "Lãnh đạo", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Phê duyệt yêu cầu" })).toBeVisible();
  await page.screenshot({ path: output + "/04-leader-desktop.png", fullPage: true });

  await page.locator(".workspace-trigger").click();
  await page.locator(".workspace-dropdown").getByRole("button", { name: "Trợ lý lãnh đạo" }).click();
  await expect(page.getByRole("heading", { name: "Xử lý yêu cầu" })).toBeVisible();
  await expect(page.locator(".side-nav .nav-link").first()).toContainText("Tạo yêu cầu");
  await expect(page.locator(".table-card-heading").getByRole("button", { name: "Tạo yêu cầu" })).toBeVisible();
  await page.screenshot({ path: output + "/05-assistant-desktop.png", fullPage: true });

  await page.locator(".workspace-trigger").click();
  await page.locator(".workspace-dropdown").getByRole("button", { name: "Người đăng ký" }).click();
  await page.getByRole("button", { name: "Tạo yêu cầu" }).first().click();
  await expect(page.getByRole("heading", { name: "Đăng ký lịch họp" })).toBeVisible();
  await page.screenshot({ path: output + "/06-request-form-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: output + "/07-request-form-mobile.png", fullPage: true });
  await page.goto("/requests");
  await expect(page.locator(".request-mobile-card").first()).toBeVisible();
  await expect(page.locator(".topbar-avatar")).toBeVisible();
  await page.screenshot({ path: output + "/08-requester-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/calendar");
  await expect(page.locator(".topbar-page-title")).toHaveText("Lịch họp lãnh đạo");
  await expect(page.locator(".calendar-page .page-title-row")).toHaveCount(0);
  await expect(page.locator(".schedule-toolbar")).toBeVisible();
  await expect(page.locator(".schedule-range")).toContainText("–");
  await expect(page.locator(".schedule-layer-options input")).not.toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tuần", exact: true })).toHaveAttribute("aria-pressed","true");
  await page.screenshot({ path: output + "/09-calendar-week.png", fullPage: true });
  await page.getByRole("button", { name: "Tháng", exact: true }).click();
  await expect(page.locator(".calendar-grid:not(.calendar-grid-week) .calendar-day")).toHaveCount(42);
  await page.screenshot({ path: output + "/10-calendar-month.png", fullPage: true });
  await page.getByRole("button", { name: "Danh sách", exact: true }).click();
  await expect(page.locator(".schedule-list-day")).toHaveCount(7);
  await page.screenshot({ path: output + "/11-calendar-list.png", fullPage: true });
  await page.locator(".schedule-layer-options input").first().uncheck();
  await expect(page.locator(".schedule-layer-options input").first()).not.toBeChecked();
  await page.goto("/requests/new");
  await expect(page.locator(".topbar-page-title")).toHaveText("Đăng ký lịch họp");
  await expect(page.locator(".form-page .page-title-row")).toHaveCount(0);
  await expect(page.locator(".form-page .back-link")).toHaveCount(0);
});
