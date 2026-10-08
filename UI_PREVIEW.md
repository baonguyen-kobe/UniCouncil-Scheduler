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

## Review checklist
1. View /login; demo enters role workspace.
2. Switch Requester -> Assistant -> Leader.
3. Change VI/EN and observe badges/labels.
4. Filter list and open a request detail.
5. Test form field validation and per-file feedback with 4 MB max.
6. View /calendar and mobile viewport.
7. Check the differences against feat/ui-preview-omp before merging anything.
