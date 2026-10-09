import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 820, height: 1180 },
  { width: 390, height: 844 },
]) {
  test(`Google-only login stays readable and reachable at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/login");
    await page.evaluate(() => document.fonts.ready);

    const form = page.locator(".login-form");
    const google = form.getByRole("button", {
      name: "Đăng nhập bằng Google",
      exact: true,
    });
    await expect(form.getByRole("button")).toHaveCount(1);
    await expect(page.locator("input, textarea, select")).toHaveCount(0);
    await expect(form).toContainText("ĐẠI HỌC QUỐC TẾ MIỀN ĐÔNG");
    await expect(form).toContainText(
      "Hệ thống đăng ký và điều phối lịch họp lãnh đạo",
    );
    await expect(form).toContainText(
      "Dành cho nhân sự Trường Đại học Quốc tế Miền Đông",
    );
    await expect(page.locator("#login-google-guidance")).toHaveText(
      "Vui lòng sử dụng tài khoản Google Workspace EIU được cấp quyền.",
    );
    await expect(page.locator("#login-demo-note")).toContainText(
      "chưa kết nối xác thực Google",
    );
    await expect(google).toBeVisible();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await google.scrollIntoViewIfNeeded();
    expect(
      await google.evaluate((button) => {
        const rect = button.getBoundingClientRect();
        const center = document.elementFromPoint(
          rect.x + rect.width / 2,
          rect.y + rect.height / 2,
        );
        return (
          center !== null &&
          button.contains(center) &&
          rect.y >= 0 &&
          rect.bottom <= innerHeight
        );
      }),
    ).toBe(true);
    const logo = page.locator(".login-corner-logo");
    if (viewport.width <= 900) {
      await expect(logo).toBeVisible();
      const logoBox = await logo.boundingBox();
      const headingBox = await form
        .locator(".login-form-heading")
        .boundingBox();
      expect(logoBox!.y + logoBox!.height).toBeLessThanOrEqual(headingBox!.y);
    } else {
      await expect(logo).toBeHidden();
    }

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(form.getByRole("button")).toHaveCount(1);
    await expect(
      form.getByRole("button", { name: "Sign in with Google", exact: true }),
    ).toBeVisible();
    await expect(form).toContainText(
      "Leadership meeting registration and coordination system",
    );
    await expect(page.locator("#login-google-guidance")).toHaveText(
      "Please use an authorized EIU Google Workspace account.",
    );
    await expect(page.locator("#login-demo-note")).toContainText(
      "Google authentication is not connected",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "VI", exact: true }).click();
    await expect(google).toBeVisible();
  });
}

test("Google button opens only the disclosed UI demo without creating authentication state", async ({
  page,
  context,
}) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:3104")
      externalRequests.push(request.url());
  });
  await page.goto("/login");
  const cookiesBefore = await context.cookies();
  const storageBefore = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
  const google = page.getByRole("button", {
    name: "Đăng nhập bằng Google",
    exact: true,
  });
  await google.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/requests$/);
  await expect(page.getByRole("status")).toContainText(
    "chưa xác thực Google Workspace",
  );
  expect(await context.cookies()).toEqual(cookiesBefore);
  expect(
    await page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
    })),
  ).toEqual(storageBefore);
  expect(externalRequests).toEqual([]);
});
