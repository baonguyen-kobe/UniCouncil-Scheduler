import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const output = "artifacts/screenshots";
test("captures EIU preview screens for design comparison", async ({ page }) => {
  mkdirSync(output, { recursive: true });

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "UniCouncil Scheduler" })).toBeVisible();
  await expect(page.locator(".med-login-brand-image")).toBeVisible();
  await expect(page.locator(".med-login-card")).toContainText("ĐẠI HỌC QUỐC TẾ MIỀN ĐÔNG");
  await expect(page.getByRole("button", { name: "Đăng nhập bằng Google" })).toHaveCount(1);
  await expect(page.locator('.med-login-card input')).toHaveCount(0);
  await expect(page.locator(".med-login-card button")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Vào giao diện demo" })).toHaveCount(0);
  const loginPage=page.locator(".med-login-page");
  const photo=page.locator(".med-login-brand");
  const cream=page.locator(".med-login-form-wrap");
  const card=page.locator(".med-login-card");
  const cornerLogo=page.locator(".med-login-corner-logo");

  // The approved Figma desktop design at 1440×900 never overlays the source photo.
  await expect(loginPage).not.toHaveClass(/is-responsive/);
  await expect(cornerLogo).toBeHidden();
  const desktopLayout=await page.evaluate(()=>{
    const img=document.querySelector(".med-login-brand")!.getBoundingClientRect();
    const panel=document.querySelector(".med-login-form-wrap")!.getBoundingClientRect();
    const card=document.querySelector(".med-login-card")!.getBoundingClientRect();
    return {photoEnd:img.right,creamStart:panel.left,cardWidth:card.width,cardHeight:card.height,fit:getComputedStyle(document.querySelector(".med-login-brand-image")!).objectFit};
  });
  expect(desktopLayout.creamStart).toBeGreaterThanOrEqual(desktopLayout.photoEnd-1);
  expect(desktopLayout.fit).toBe("contain");
  expect(desktopLayout.cardWidth).toBe(444);
  expect(desktopLayout.cardHeight).toBe(351);
  await page.screenshot({ path: output + "/01-login-desktop.png", fullPage: true });

  // Responsive switching depends on remaining image+card space, not device category.
  for(const [width,height,expectedResponsive] of [
    [1400,900,false], // exactly 500px left for the cream panel
    [1399,900,true],  // 499px: switch before hiding any photo
    [1366,768,false], // smaller laptop: still enough space
    [1280,720,false], // compact PC: still enough space
    [1280,800,true],  // narrow window at greater height
    [1024,768,true],  // tablet
    [390,844,true]    // mobile
  ] as const){
    await page.setViewportSize({width,height});
    if(expectedResponsive){
      await expect(loginPage).toHaveClass(/is-responsive/);
      await expect(cornerLogo).toBeVisible();
      expect(await page.locator(".med-login-brand-image").evaluate(el=>getComputedStyle(el).objectFit)).toBe("cover");
    }else{
      await expect(loginPage).not.toHaveClass(/is-responsive/);
      await expect(cornerLogo).toBeHidden();
      const positions=await page.evaluate(()=>{
        return {photoRight:document.querySelector(".med-login-brand")!.getBoundingClientRect().right,
                panelLeft:document.querySelector(".med-login-form-wrap")!.getBoundingClientRect().left};
      });
      expect(positions.panelLeft).toBeGreaterThanOrEqual(positions.photoRight-1);
    }
    await expect(page.getByRole("button",{name:"Đăng nhập bằng Google"})).toBeVisible();
  }

  const mobileBox=await card.boundingBox();
  expect(mobileBox).toBeTruthy();
  expect(mobileBox!.width).toBe(362);
  expect(mobileBox!.height).toBe(309);
  expect(Math.abs(mobileBox!.x-14)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: output + "/01b-login-mobile.png", fullPage: true });
  await page.setViewportSize({width:1440,height:900});
  await expect(loginPage).not.toHaveClass(/is-responsive/);

  await page.getByRole("button", { name: "Đăng nhập bằng Google" }).click();
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
