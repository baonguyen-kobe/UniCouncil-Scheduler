# UniCouncil Scheduler — UI Preview

A bilingual, responsive frontend preview of EIU’s meeting-request workflow. This branch is **UI first**: it uses realistic local fixtures and an explicitly labelled **Demo Mode**, not production services.

## Local preview

Use Node.js **22 LTS or newer** and npm. No environment variables or credentials are required.

```bash
npm ci
npm run dev
```

Open **http://localhost:3000/login**, choose VI or EN, and select the single **Sign in with Google / Đăng nhập bằng Google** button. The visible Demo Mode notice explains that this only opens the sample UI: no Google authentication occurs and no authenticated session is created. Opening a workspace route directly also enters the local preview.

Production preview:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

The default port is 3000. To use a different port: `npm run start -- --port 3001`.

Login browser checks (after building):

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright starts the production build on port 3104. It checks Google-only login, VI/EN, readable/reachable controls at 1440 × 900, 820 × 1180 and 390 × 844, keyboard entry to the disclosed demo, and the absence of authentication cookies/storage or external OAuth requests.

## What to review

- **Login:** MedLabs production-style campus cover, cream panel, responsive floating card, original Corner Logo and VI/EN switch. Google is the only sign-in action; the visible Demo Mode disclaimer states that authentication is not connected.
- **App shell:** 244px MedLabs-inspired blue sidebar, white Full Logo panel, gold-accented active navigation and a mobile navigation drawer.
- **Requests:** desktop table/mobile cards, localized role-specific status badges, search, date presets, status and operational filters, sorting, pagination and selectable loading/error/empty preview states. On mobile, Assistant/Admin catalog filters sit behind **More filters** so the queue remains prominent.
- **Details:** desktop right-side drawer/mobile full-screen detail, proposed information, separate official schedule and attendees, documents, processing timeline and role-specific mock actions.
- **New request:** read-only demo identity, required multi-select units, agenda and proposed participants (3,000 characters each), preferred date and optional attachments. No Meeting Type, Leader selector, attendee count, requested time, duration, location or Save Draft is exposed to Requester.
- **Calendar:** approved/completed official meetings in month, week and agenda views, with responsive daily agendas and filters. Select a meeting to open its request.
- **Admin:** a compact illustrative staff/catalog/audit surface, available only on the Admin demo account. It is not a production administration system.

### Demo workspaces and accounts

The default account, **Nguyễn Minh Trang**, can switch among Requester, Assistant and Leader. Open **Demo controls** or the account menu to select the Leader-only **Trần Thị Mai** account or the Requester/Admin **Lê Hoàng An** account. All Leader demo accounts see the same Leader request queue.

Workspace changes affect navigation, visible fixtures and presentation; they do **not** establish backend permissions. Unsaved form and action-panel changes have discard guards. Use **Reset demo data** to restore the fixtures.

### Try the workflow

1. As Requester, create a request with the minimal form. Its mock submission appears in the current session’s request list.
2. As Assistant, open **REQ-2026-000129**. Request an adjustment with a required instruction, or finalize the official date/time, room, meeting type, leaders and official participants before submitting to Leader.
3. As Leader, review **REQ-2026-000130**, or a request submitted by Assistant. Request revision with an **optional** comment, or confirm approval.
4. Leader revision assigns the request to Assistant. Requester cannot edit until Assistant forwards it with instructions and `revision_target=REQUESTER`.
5. Switch to Requester and resubmit an assigned revision. The request keeps its ID: a pre-Leader adjustment returns to `PROCESSING`; a post-Leader revision returns to `REVISED_PROCESSING`.
6. Approved requests appear in the calendar. Internal Leader notes and internal events are not displayed in Requester’s detail timeline.

All eight canonical statuses are preserved: `PROCESSING`, `PENDING_APPROVAL`, `ADJUSTED`, `REVISED`, `REVISED_PROCESSING`, `APPROVED`, `CANCELLED`, `COMPLETED`. Friendly VI/EN labels follow the approved role-specific mapping.

### Attachments

Select up to **10 files**, **4 MB/file**, using the approved document/image types. Files are staged locally in browser memory; no upload occurs. Invalid type/size errors require Replace or Remove. Enable **Simulate File Upload Failure (Demo)** to exercise Retry on a valid file. Successful local files can be downloaded from the detail drawer; seeded requests use the bundled sample PDF.

## Mock-mode limitations

- State lives only in React/browser memory. Reloading the page or resetting the demo discards submissions, edits, attachment references and workflow changes.
- No real Google OAuth, Google Sheets, Google Drive, Zalo, database, migrations, server APIs or production authorization are implemented.
- Mock actions, upload failures and loading/error states are visibly labelled; they do not report production persistence or contact external business services.
- Request versions and timeline entries illustrate the workflow only. They do not implement backend audit guarantees, concurrency control, idempotency or security enforcement.
- Fixtures use date offsets relative to today in `Asia/Ho_Chi_Minh`. User-entered agenda/participant text and personal names are not machine-translated; interface labels, statuses, validation and messages support VI/EN.

## Implementation

- Next.js App Router, TypeScript, React and Tailwind CSS 4.
- Reusable shell, buttons, pastel status badges, accessible Radix dialogs and demo-state provider in `src/components`.
- Workflow types, role visibility, status labels and catalogs in `src/lib/model.ts`; realistic fixtures in `src/lib/fixtures.ts`.
- Self-hosted **Crimson Pro** display and **Be Vietnam Pro** UI fonts through Fontsource. No runtime font CDN is needed.
- **Heroicons v2 exclusively** (`@heroicons/react`).
- The ten approved EIU colors are centralized in `src/app/globals.css`; additional tonal surfaces preserve legible pastel badges.
- EIU Full and Corner Logo assets come from the supplied MedLabs reference. Sidebar styling follows its V2 design authority without copying unrelated business logic or dashboard layouts. The supplied EIU Schedule reference returned 404 during implementation; badges follow the approved light-background/dark-text/thin-border specification in the local baseline.

## Screenshots

Login captures use desktop **1440 × 900**, tablet **820 × 1180** and mobile **390 × 844** CSS-pixel viewports. The earlier workspace captures remain at **1440 × 1000** desktop / **390 × 844** mobile. Full-page files include content below the viewport.

| View      | Desktop                                           | Mobile                                          |
| --------- | ------------------------------------------------- | ----------------------------------------------- |
| Login     | [Desktop](docs/screenshots/login-desktop.png)     | [Mobile](docs/screenshots/login-mobile.png)     |
| Requester | [Desktop](docs/screenshots/requester-desktop.png) | [Mobile](docs/screenshots/requester-mobile.png) |
| Assistant | [Desktop](docs/screenshots/assistant-desktop.png) | [Mobile](docs/screenshots/assistant-mobile.png) |
| Leader    | [Desktop](docs/screenshots/leader-desktop.png)    | [Mobile](docs/screenshots/leader-mobile.png)    |

### Page 01 — Login reference comparison

Login now follows MedLabs `app/login/page.tsx`, `app/login/login-form.tsx`, the Login selectors and responsive overrides in `app/globals.css`, and section 34 **Login Override** of `docs/UI_DESIGN_SYSTEM_V2_MASTER.md`. Source baseline: MedLabs main commit `1e75e4e7325dd0a34a2f3c0700b41593a740e7ec`. The campus cover and Corner Logo are the original assets, verified byte-for-byte. No MedLabs Supabase authentication is included. Production authentication remains future Google Workspace OIDC work.

The reference screenshots below are local static renders of the fetched MedLabs Login source/CSS with its original form content, not captures of a live authenticated deployment. Auth hooks are inert in that throwaway render; Mail/Lock glyphs use local Heroicons adapters. UniCouncil intentionally removes the reference email/password/secondary actions, so its card is shorter. It retains the campus framing, cream panel, card padding, corner radii and responsive placement; system-heading typography uses the approved Crimson Pro.

| Viewport   | MedLabs source reference                                          | UniCouncil                                  |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------- |
| 1440 × 900 | [Reference](docs/screenshots/medlabs-login-reference-desktop.png) | [Login](docs/screenshots/login-desktop.png) |
| 820 × 1180 | [Reference](docs/screenshots/medlabs-login-reference-tablet.png)  | [Login](docs/screenshots/login-tablet.png)  |
| 390 × 844  | [Reference](docs/screenshots/medlabs-login-reference-mobile.png)  | [Login](docs/screenshots/login-mobile.png)  |

## Approved baseline and future production scope

The original approved business baseline remains authoritative. Production Google Workspace login, Sheets storage, Drive attachments, Zalo notifications, backend role/ownership enforcement and Vercel deployment are future implementation work, **not features of this preview**. The approved V1 calendar is in-app, not a Google Calendar integration.

- [Master Plan](docs/master-plan.md)
- [UI/UX & EIU Branding](docs/ui-ux-guidelines.md)
- [Pages](docs/pages.md)
- [Workflow & Roles](docs/workflow-and-roles.md)
- [Schema](docs/schema.md)
- [Technical Decisions](docs/technical-decisions.md)
- [Reviewer Handoff](docs/handoff.md)
- [Architecture](docs/architecture.md)
