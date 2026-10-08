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

## Review checklist
1. View /login; demo enters role workspace.
2. Switch Requester -> Assistant -> Leader.
3. Change VI/EN and observe badges/labels.
4. Filter list and open a request detail.
5. Test form field validation and per-file feedback with 4 MB max.
6. View /calendar and mobile viewport.
7. Check the differences against feat/ui-preview-omp before merging anything.
