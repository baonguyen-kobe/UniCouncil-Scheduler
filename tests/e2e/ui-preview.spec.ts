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
  await page.screenshot({ path: output + "/02-requester-desktop.png", fullPage: true });

  await page.locator(".requests-table tbody tr").first().click();
  await expect(page.getByRole("dialog", { name: "Chi tiết yêu cầu" })).toBeVisible();
  await page.screenshot({ path: output + "/03-request-detail-desktop.png", fullPage: true });
  await page.getByRole("dialog", { name: "Chi tiết yêu cầu" }).getByRole("button", { name: "Đóng" }).click();

  await page.locator(".workspace-trigger").click();
  await page.locator(".workspace-dropdown").getByRole("button", { name: "Lãnh đạo" }).click();
  await expect(page.getByRole("heading", { name: "Phê duyệt yêu cầu" })).toBeVisible();
  await page.screenshot({ path: output + "/04-leader-desktop.png", fullPage: true });

  await page.locator(".workspace-trigger").click();
  await page.locator(".workspace-dropdown").getByRole("button", { name: "Trợ lý lãnh đạo" }).click();
  await expect(page.getByRole("heading", { name: "Xử lý yêu cầu" })).toBeVisible();
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
  await page.screenshot({ path: output + "/08-requester-mobile.png", fullPage: true });
});
