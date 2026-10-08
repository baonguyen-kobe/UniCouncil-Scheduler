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

## Review checklist
1. View /login; demo enters role workspace.
2. Switch Requester -> Assistant -> Leader.
3. Change VI/EN and observe badges/labels.
4. Filter list and open a request detail.
5. Test form field validation and per-file feedback with 4 MB max.
6. View /calendar and mobile viewport.
7. Check the differences against feat/ui-preview-omp before merging anything.
