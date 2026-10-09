import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const output = "artifacts/screenshots";
test("captures EIU preview screens for design comparison", async ({ page }) => {
  mkdirSync(output, { recursive: true });

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "UniCouncil Scheduler" })).toBeVisible();
  await expect(page.locator(".med-login-brand-image")).toBeVisible();
  // Exact wording is read from the final user-edited Figma frames 15:4 / 15:25.
  await expect(page.locator(".med-login-university")).toHaveText("TRƯỜNG ĐẠI HỌC QUỐC TẾ MIỀN ĐÔNG");
  await expect(page.locator(".med-login-heading h2")).toHaveText("UniCouncil Scheduler");
  await expect(page.locator(".med-login-subtitle")).toHaveText("Hệ thống đăng ký lịch họp Hội đồng trường");
  await expect(page.locator(".med-login-policy")).toHaveText("Vui lòng dùng tài khoản Google Workspace EIU để truy cập");
  await expect(page.locator(".med-login-demo-notice")).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Đăng nhập bằng Google"})).toHaveCount(1);
  await expect(page.locator(".med-login-card input")).toHaveCount(0);
  await expect(page.locator(".med-login-card button")).toHaveCount(1);

  const card=page.locator(".med-login-card");
  const photo=page.locator(".med-login-brand-image");
  const desktopLogo=page.locator(".med-login-desktop-logo");
  const cornerLogo=page.locator(".med-login-corner-logo");
  const photoSource=()=>photo.evaluate(el=>(el as HTMLImageElement).currentSrc);

  // One desktop composition for PC, compact laptops and iPad: card centered on BOTH axes.
  for(const [width,height] of [[1440,900],[1366,768],[1024,768],[768,1024],[641,900]] as const){
    await page.setViewportSize({width,height});
    await expect(desktopLogo).toBeVisible();
    await expect(cornerLogo).toBeHidden();
    await expect.poll(photoSource).toContain("login-campus-desktop-figma.jpg");
    const dims=await card.boundingBox();
    expect(dims).not.toBeNull();
    expect(Math.abs((dims!.x+dims!.width/2)-width/2)).toBeLessThanOrEqual(1);
    expect(Math.abs((dims!.y+dims!.height/2)-height/2)).toBeLessThanOrEqual(1);
    expect(dims!.height).toBe(348);
    expect(await photo.evaluate(el=>getComputedStyle(el).objectFit)).toBe("cover");
    await expect(page.getByRole("button",{name:"Đăng nhập bằng Google"})).toBeVisible();
    if(width===1440){
      expect(dims!.width).toBe(695);
      await page.screenshot({path:output+"/01-login-desktop.png",fullPage:true});
    }
    if(width===1024){
      await page.screenshot({path:output+"/01c-login-laptop.png",fullPage:true});
    }
  }

  // ONLY second composition: phone background and corner logo, approved 390 × 844 card.
  for(const [width,height] of [[640,900],[430,932],[390,844],[360,740]] as const){
    await page.setViewportSize({width,height});
    await expect(desktopLogo).toBeHidden();
    await expect(cornerLogo).toBeVisible();
    await expect.poll(photoSource).toContain("login-campus-mobile-figma.jpg");
    const dims=await card.boundingBox();
    expect(dims).not.toBeNull();
    expect(Math.abs((dims!.x+dims!.width/2)-width/2)).toBeLessThanOrEqual(3);
    expect(dims!.height).toBe(286);
    expect(dims!.y).toBe(158);
    expect(await photo.evaluate(el=>getComputedStyle(el).objectFit)).toBe("cover");
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    if(width===390){
      expect(dims!.width).toBe(362);
      expect(dims!.x).toBe(16);
      await page.screenshot({path:output+"/01b-login-mobile.png",fullPage:true});
    }
  }
  await page.setViewportSize({width:1440,height:900});
  await expect(desktopLogo).toBeVisible();

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

test("Login is hydration-safe after clean reload at both approved layout sizes", async ({page})=>{
 const hydrationErrors:string[]=[];
 page.on("pageerror",error=>{
   if(/hydration|server rendered HTML didn't match/i.test(error.message))hydrationErrors.push(error.message);
 });
 page.on("console",msg=>{
   if(msg.type()==="error"&&/hydration|server rendered HTML didn't match/i.test(msg.text()))hydrationErrors.push(msg.text());
 });
 for(const [width,height] of [[1440,900],[390,844],[1366,768],[1024,768]] as const){
   await page.setViewportSize({width,height});
   await page.goto("/login", {waitUntil:"networkidle"});
   await expect(page.locator(".med-login-subtitle")).toHaveText("Hệ thống đăng ký lịch họp Hội đồng trường");
   await expect(page.getByRole("button",{name:"Đăng nhập bằng Google"})).toHaveCount(1);
   await page.reload({waitUntil:"networkidle"});
   await expect(page.locator(".med-login-subtitle")).toHaveText("Hệ thống đăng ký lịch họp Hội đồng trường");
   // Allow effects and hydration logging to settle before the next navigation.
   await expect(page.locator(".med-login-page")).toBeVisible();
 }
 expect(hydrationErrors,hydrationErrors.join("\n\n")).toEqual([]);
});

test("Login VI/EN language selector matches approved Figma and preserves typography",async ({page})=>{
  const selectors=[
    ".med-login-university",".med-login-heading h2",
    ".med-login-subtitle",".med-login-google",".med-login-policy"
  ];
  for(const [width,height,x,y] of [[1440,900,1333,24],[390,844,288,27]] as const){
    await page.setViewportSize({width,height});
    await page.goto("/login",{waitUntil:"networkidle"});
    await page.evaluate(()=>document.fonts.ready);
    const toggle=page.locator(".med-login-locale .language-switch");
    const position=await toggle.boundingBox();
    expect(position).not.toBeNull();
    expect(position!.x).toBe(x);
    expect(position!.y).toBe(y);
    expect(position!.width).toBe(90);
    expect(position!.height).toBe(35);
    await expect(page.getByRole("button",{name:"VI",exact:true})).toHaveAttribute("aria-pressed","true");

    const readSizes=async ()=>await page.evaluate((list)=>list.map(s=>{
      const element=document.querySelector(s);
      if(!element)throw Error("Missing login selector "+s);
      return getComputedStyle(element).fontSize;
    }),selectors);
    const vietnamese=await readSizes();
    await page.getByRole("button",{name:"EN",exact:true}).click();
    await expect(page.locator(".med-login-subtitle")).toHaveText("University Council meeting scheduling system");
    await expect(page.getByRole("button",{name:"EN",exact:true})).toHaveAttribute("aria-pressed","true");
    const english=await readSizes();
    expect(english,selectors.map((s,i)=>s+": VI "+vietnamese[i]+", EN "+english[i]).join("; ")).toEqual(vietnamese);
    await page.screenshot({path:output+(width===1440?"/01d-login-desktop-en.png":"/01e-login-mobile-en.png"),fullPage:true});
    await page.getByRole("button",{name:"VI",exact:true}).click();
    await expect(page.locator(".med-login-subtitle")).toHaveText("Hệ thống đăng ký lịch họp Hội đồng trường");
  }
});
