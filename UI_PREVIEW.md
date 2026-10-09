# UniCouncil Scheduler — ChatGPT UI-first Preview

This is the **ChatGPT design comparison** branch, not a production system.

## Development
- Node.js 22.13+ and npm
- npm install
- npm run dev
- Open http://localhost:3333

Routes use an optional catch-all UI preview page:
- /login
- /requests
- /requests/new
- /calendar
- /settings

## Scope
- EIU branding, Crimson Pro / Be Vietnam Pro, Heroicons and MedLabs-inspired sidebar
- Workspace Switcher: Requester / Assistant / Leader / Admin
- Local realistic sample meeting requests and 8 system statuses
- VI/EN, table/filters, drawer detail, demo actions, request form and file validation
- Responsive layout: desktop table + drawer, mobile cards

**Deliberate limitations:** no actual sign-in, server role enforcement, Sheets, Drive, Zalo or backend writes. Buttons that mimic submission/approval only change temporary browser UI state for review. The approved EIU Full Logo and Corner Logo binaries are copied locally into `public/` from `baonguyen-kobe/eiu-medlabs` for a stable offline preview. This branch is independent of the OMP comparison branch.

## UI review changes — 2026-10-08

- Sidebar brand title: **UniCouncil *Scheduler*** on one line, with no `EIU · MEETING MANAGEMENT` subtitle; preserve the approved MedLabs-style logo panel/blue gradient/gold active marker.
- Workspace switcher remains an application feature, but the *workspace heading* and helper banner marked as Demo are preview-only. `NEXT_PUBLIC_DEMO_MODE=false` hides these supplementary demo labels, the demo flag in the topbar and footer. **This does not turn the UI into production functionality.** A backend/auth implementation and strict permissions are still mandatory before actual deployment.
- Requester navigation: `Tạo yêu cầu` precedes `Yêu cầu của tôi`. Assistant has a `Tạo yêu cầu` entry too. The create action appears at the **right of the request-list panel heading** for Requester and Assistant; the result count appears underneath the heading. Leader has no create action.
- Sticky topbar displays **only the selected page title**, no breadcrumb. Desktop hides the circle initials avatar in the topbar; mobile displays it.
- Requests overview no longer repeats the page title or descriptive subtitle. Three summary cards are **Yêu cầu mới / Đang điều chỉnh / Đã duyệt**, without extra footer captions.
- **KPI counts are display-only demo estimates**, not finalized backend metrics. For the preview, "new" counts PROCESSING for Assistant, PENDING_APPROVAL for Leader, and PROCESSING/PENDING_APPROVAL for Requester/Admin; "under revision" counts ADJUSTED or REVISED; "approved" counts APPROVED. Final metric semantics should be confirmed against role-specific backend queries when implementation begins.

## Running alongside Orca OMP

This branch uses port **3333** (`npm run dev`) and is independent of OMP's folder/branch. After updates, run `git pull origin feat/ui-preview-chatgpt` from the ChatGPT folder. OMP's `feat/ui-preview-omp` branch is untouched.

## Second UI review — fixed header and Skills Lab calendar patterns (2026-10-08)

- Reference source: [MedLabs V2 Master](https://github.com/baonguyen-kobe/eiu-medlabs/blob/main/docs/UI_DESIGN_SYSTEM_V2_MASTER.md), [Skills Lab calendar toolbar](https://github.com/baonguyen-kobe/eiu-medlabs/blob/main/components/dashboard.tsx) and its CSS in app/globals.css.
- Fixed white topbar owns the **only page title**. Font: **Be Vietnam Pro**, clamp(27px, 2vw, 32px), ~750 weight, EIU Blue. Crimson Pro remains the prominent brand/display font underneath the Full Logo.
- Sidebar's **UniCouncil Scheduler** brand follows MedLabs name sizing/rhythm (~21.5px) on one line.
- /requests/new: fixed topbar says **Đăng ký lịch họp / Propose a meeting** instead of "Tạo yêu cầu"; remove back link, eyebrow, duplicate title and subtitle from form body. Requests/Admin/Calendar likewise avoid duplicate large page titles.
- /calendar: toolbar **inside calendar panel**; previous/current/next period, dynamic week/month range, role-specific localized status-layer checkboxes, functioning **Tháng / Tuần / Danh sách** views. User feedback requested this UI matching Skills Lab, not a static illustration.
- Role-dependent statuses remain the canonical 8 statuses with appropriate labels; grouped labels share a toggle in each role. Requester sees own items; Leader sees only the shared Leader queue statuses. At least one layer remains selected.
- **Data semantics:** approved/completed request with an official meeting date uses that date and solid green calendar styling. Other entries are **clearly marked as proposed dates**, with dashed/gold styling, to prevent describing unapproved requests as official meetings.
- Mobile week calendar scrolls *within the calendar panel*, not horizontally across the entire page.
- Browser regression test now covers navigation, date-range toolbar, month/week/list modes, filters and duplicate-header prevention; screenshots for three calendar modes added.

## Page 01 — Login FINAL UI direction (approved 2026-10-09)

The Login layout must be visually very close to the **production login of EIU MedLabs**, not the previous custom ChatGPT/OMP login page:
- Reference: `baonguyen-kobe/eiu-medlabs/app/login/page.tsx`, `app/login/login-form.tsx`, and the `.login-*` rules in `app/globals.css`.
- Copy the original EIU campus cover photo `public/login-cover-campus-2.jpg` to this branch. On desktop it fills the left/behind region; a warm cream-gradient panel on the right centers the white login card. On tablet/mobile, campus image becomes the background and `eiu-corner-logo.png` appears at upper-left, with a softly translucent rounded login card.
- Card copy: **ĐẠI HỌC QUỐC TẾ MIỀN ĐÔNG**; **UniCouncil Scheduler**; **Hệ thống đăng ký và điều phối lịch họp lãnh đạo**; **Dành cho nhân sự Trường Đại học Quốc tế Miền Đông**.
- **Single visible sign-in CTA: Đăng nhập bằng Google / Sign in with Google.** Do not show ID/password fields, remember me, forgot password, normal login submit, `or` divider or extra demo sign-in CTA.
- Existing EIU UI overrides still apply: Crimson Pro (brand/display), Be Vietnam Pro (operational text), primary colors and VI/EN.
- **UI-only preview behavior**: The Google CTA clearly says Google but navigates into an explicitly identified local demo (no Google OAuth/session). Under `NEXT_PUBLIC_DEMO_MODE=false`, the inert CTA is disabled until real Workspace OIDC is implemented. Do not import Supabase auth from MedLabs or misrepresent demo navigation as authentication.
- Automated browser test verifies the original local campus asset, a single Google sign-in button with zero account/password inputs, visible Corner Logo on mobile and unchanged downstream workspace navigation.

## Signed-off Page 01 — Login Figma exact two-layout behavior (2026-10-09)

**Source of truth:** user-modified [Login comparison page in Figma](https://www.figma.com/design/UNDek7yMuyZMQukeHROhle?node-id=1-2); specifically **ChatGPT Desktop node 15:4** and **ChatGPT Mobile node 15:25**, not the other branch's Login frames.

- Final Vietnamese copy from user-edited Figma: **ĐẠI HỌC QUỐC TẾ MIỀN ĐÔNG**; **UniCouncil Scheduler**; **Hệ thống đăng lịch họp Hội đồng trường**; sole **Đăng nhập bằng Google** CTA; footer **Vui lòng dùng tài khoản Google Workspace EIU để truy cập.**
- Desktop canonical 1440×900: source photograph fully visible in a 900×900 square at left, CSS image `object-fit: contain`. Right cream panel must begin **at/after the image boundary** (no overlap). A 444×351 white card (Figma x=938,y=200), university title 26px, product 40px Crimson Pro, description 16px, Google button 350×50.
- Mobile canonical 390×844: photo is background `object-fit: cover`, EIU Corner Logo top-left (108×108), card x=14 y=142 size 362×309 with 38px radius and cream fill, university title 20px, product title 32px, description 14px, Google button 318×50.
- **Only two layout modes**. Do not invent an intermediate tablet design. Determine the mode from *remaining horizontal space*: the uncropped desktop photo occupies `100dvh` width, the cream/right region needs **at least 500px**, so use Desktop while `window.innerWidth - window.innerHeight >= 500`; otherwise switch straight to the signed-off Responsive layout. Example: a short-height 1366×768 laptop can keep Desktop, while a tall/narrow 1280×800 viewport uses Responsive.
- At Desktop widths, cream may narrow toward 500px but may not overlay/crop the image. Responsive uses the entire viewport photograph as `cover` (intentional zoom/crop) and maintains the mobile-style card.
- This phase remains UI-only: the sole Google sign-in button enters a demo without authenticating. No real OAuth has been connected; production requires Workspace OIDC.

## Review checklist
1. View /login; demo enters role workspace.
2. Switch Requester -> Assistant -> Leader.
3. Change VI/EN and observe badges/labels.
4. Filter list and open a request detail.
5. Test form field validation and per-file feedback with 4 MB max.
6. View /calendar and mobile viewport.
7. Check the differences against feat/ui-preview-omp before merging anything.
