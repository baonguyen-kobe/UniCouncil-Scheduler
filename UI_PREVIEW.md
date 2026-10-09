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

## Signed-off Page 01 — Login, latest Figma revision (2026-10-09)

**Source of truth:** owner's latest edits in [the comparison Figma](https://www.figma.com/design/UNDek7yMuyZMQukeHROhle?node-id=1-2): **ChatGPT Desktop `15:4`**, **ChatGPT Mobile `15:25`**. These replace the earlier split-image/cream-panel design.

- Final Vietnamese text: **TRƯỜNG ĐẠI HỌC QUỐC TẾ MIỀN ĐÔNG**, **UniCouncil Scheduler**, **Hệ thống đăng ký lịch họp Hội đồng trường**, **Đăng nhập bằng Google**, **Vui lòng dùng tài khoản Google Workspace EIU để truy cập**. Do not add a second login method or a demo notice within the card.
- Both campus photos and the desktop EIU horizontal logo were exported from the final Figma frames into `public/login-campus-desktop-figma.jpg`, `public/login-campus-mobile-figma.jpg`, `public/login-eiu-horizontal.png`. The phone retains `public/eiu-corner-logo.png`.
- Desktop / laptop / iPad: **one layout** for viewport widths **over 640px**. The desktop campus photo covers the **entire viewport**, cropping as needed; the approved EIU wide logo is top-left. The cream card **695 × 348px** at 1440×900 uses 38px radius and must be centered **exactly horizontally and vertically** (owner explicitly requested center correction after Figma). Typography: university 32px Be Vietnam Pro bold, app title 32px Crimson Pro semi-bold, subtitle 18px; Google button 318 × 50px. Smaller desktop windows shrink the card and typography as needed without changing layout style.
- Phone: **the only alternate layout** at **640px and below**, with the **different mobile campus photo** covering the viewport, EIU Corner Logo top-left, Figma-positioned cream card **362 × 286px** at 390×844 (x=16, y=158, radius 38); text 16px / 32px / 14px; Google button 318×50px. At narrower widths scale text/card to avoid horizontal overflow.
- CSS media query + a `picture` media source handle the responsive switch; no viewport-based React conditional rendering, so server/client markup remains identical for hydration.
- **Asset update pending:** the original high-resolution Desktop/Mobile images and wide logo were uploaded in chat, not yet committed as binaries to this branch. The UI currently retains the lower-resolution Figma-export asset paths; local replacement assets have been prepared under those same filenames. Do not claim that original-resolution files are already on GitHub until the asset commit is verified.
- This is still only a UI preview. The Google CTA navigates to a demo and is not a real OAuth sign-in; production must implement Google Workspace OIDC and enforce real sessions.

## Login language parity — latest Figma review (2026-10-09)

- The user-approved **VI/EN selector** is the latest Desktop group `26:58`, located at **x1333 y24, 90×35px** on the 1440×900 Login frame. On the 390×844 Phone frame, the `15:28` selector is **x288 y27, 90×35px**. Both are white rounded controls with a 37×27 light-blue selected language pill; VI/EN text is **11px Be Vietnam Pro**, not a pipe-separated text string.
- **English and Vietnamese have identical computed font sizes across the login card**, including school name, UniCouncil title, subtitle, Google CTA and Workspace note. Previous separate `data-locale=en` font shrink rules were removed; allow text wrapping if translated English copy needs more room instead of reducing its type scale.
- Selection remains interactive in both directions. Browser regression tests compare actual VI/EN computed font sizes and exact selector dimensions and positions at Desktop and Mobile.

## Review checklist
1. View /login; demo enters role workspace.
2. Switch Requester -> Assistant -> Leader.
3. Change VI/EN and observe badges/labels.
4. Filter list and open a request detail.
5. Test form field validation and per-file feedback with 4 MB max.
6. View /calendar and mobile viewport.
7. Check the differences against feat/ui-preview-omp before merging anything.
