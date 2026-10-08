# Part C — UI/UX Guidelines V1 — UniCouncil Scheduler

> Status: **EIU branding, sidebar, logos, Crimson Pro / Be Vietnam Pro, EIU Cream `#EAE2D6`, EIU Gray `#58595B`, and Heroicons-only iconography approved by user (2026-10-08)**. Soft/pastel status badges requested based on EIU Schedule; the exact role/status tone mapping remains a UX proposal awaiting review. Remaining open: role workspace navigation and detailed layout choices.
>
> Scope: design/implementation baseline, **not** a deployed UI. Business permissions, status logic, and data workflow remain authoritative in `workflow-and-roles.md`, `pages.md`, and `schema.md`.

## 1. References and precedence

Brand source of truth for UniCouncil:

1. User-supplied EIU **Primary Colour** and **Secondary Colour** images (2026-10-08) — primary authority for brand palette.
2. User's explicit overrides: sidebar resembles MedLabs, EIU Full Logo on white, EIU Corner Logo on login, **Crimson Pro main / Be Vietnam Pro secondary**, **all UI icons from Heroicons**, and pastel status badges inspired by EIU Schedule.
3. Source UI baseline: [EIU MedLabs UI Design System V2 Master](https://github.com/baonguyen-kobe/eiu-medlabs/blob/main/docs/UI_DESIGN_SYSTEM_V2_MASTER.md) (approved master), then MedLabs production implementation when compatible with that master.
4. Pastel badges, filter/async/table patterns reference [EIU Schedule design tokens](https://github.com/nhutbao1314-hub/eiu-schedule/blob/main/docs/design-system/TOKENS.md), [Badge component](https://github.com/nhutbao1314-hub/eiu-schedule/blob/main/components/ui/badge.tsx) and [SOURCE_FACTS](https://github.com/nhutbao1314-hub/eiu-schedule/blob/main/docs/design-system/SOURCE_FACTS.md).
5. UniCouncil-specific page/workflow/permission rules take priority over copied design components from either repo.

Do not copy MedLabs business logic, navigation items, database/auth stack, branding text "MedLabs Calendar", or domain-specific pages. In case MedLabs' old `app/globals.css` disagrees with its approved V2 Master, use **the V2 Master**, not legacy styling.

## 2. Approved EIU color palette

These are **brand colors**, not arbitrary semantic colors; design tokens should map role/context through semantic aliases.

| Token | HEX | Intended use |
|---|---|---|
| EIU Blue | `#144069` | Main brand; sidebar/nav, headings and primary actions |
| EIU Gold | `#A78656` | Premium/accent; active menu marker, restrained emphasis |
| EIU Gray | **`#58595B` — CONFIRMED** | Matches the supplied screenshot RGB `88/89/91`; replaces the inconsistent printed HEX |
| EIU Cream | **`#EAE2D6` — CONFIRMED** | Normalized from EIU Cream swatch; do not confuse with the printed Gold HEX or MedLabs canvas |
| EIU Red | `#B44425` | Error/danger accent |
| EIU Orange | `#D88327` | Warning accent |
| EIU Yellow | `#EFB31D` | Secondary accent (avoid as text against white) |
| EIU Olive | `#9D9133` | Supporting secondary accent |
| EIU Green | `#52813B` | Success accent |
| EIU Purple | `#4B479D` | Supporting secondary accent |

Additional neutral UI values from approved MedLabs baseline (not EIU signature colors):
- Canvas `#F8F6F1`
- Surface `#FFFFFF`
- Ink Primary `#303033`

**Confirmed palette clarification (user-approved 2026-10-08):**
- The user accepted EIU Schedule's normalization: **EIU Cream = `#EAE2D6`** and **EIU Gray = `#58595B`** as final UniCouncil EIU branding values. The supplied screenshot contains mismatched/duplicated printed annotations; those printed values are not the final tokens.
- The earlier temporary Cream UI neutral `#F6F1E8` is **not** the institutional EIU Cream token. It may only be used as a separately named neutral surface if explicitly intended; never alias it to `--eiu-cream`.
- Neutral surfaces such as Canvas/Surface are application tokens, not necessarily exact institutional brand colors.

Use CSS semantic tokens (`--brand-primary`, `--brand-accent`, `--surface`, `--text`, `--success`, `--danger`, etc.). Do not hardcode literal HEX repeatedly in per-page CSS. Status meaning must be conveyed by text/icons as well as color. Check visual contrast for functional states.

## 3. Typography — user override

- **Primary brand/display family: Crimson Pro — CONFIRMED by user (2026-10-08)**. Do not substitute `Crimson Text` used in the EIU Schedule reference.
- **Secondary UI family: Be Vietnam Pro**.
- Proposed application: **Crimson Pro** for brand name, page titles, section/hero headings and restrained editorial emphasis; **Be Vietnam Pro** for UI labels, menu, table/data rows, forms, buttons, validation, long text, dates/numbers and bilingual content.
- This placement is an **implementation recommendation**; the agreed font families themselves are fixed: Crimson Pro primary / Be Vietnam Pro secondary.
- Validate Crimson Pro Vietnamese diacritics, glyph metrics, line height and `font-display` during UI implementation. Both VI and EN must render correctly; choose properly licensed package/hosting, do not transfer font binaries from another repository.

MedLabs V2 uses Be Vietnam Pro alone; UniCouncil's typography overrides that MedLabs rule explicitly.

Baseline type scale for functional UI can inherit MedLabs V2 until page-level review: body 14px, table header 13px, table text 14px, field label 13px, button 14px, metadata 13px. Title scale must be visually verified with Crimson Pro metrics rather than mechanically copying Be Vietnam Pro weights.

## 3A. Iconography — Heroicons-only (CONFIRMED)

The user explicitly corrected their earlier icon choice: **use Heroicons throughout the UniCouncil web app** (2026-10-08). The earlier Lucide instruction is superseded and should not be followed. Both EIU MedLabs and EIU Schedule references already use Heroicons.

- Implementation baseline: use `@heroicons/react` (Heroicons v2) for UI icons across sidebar, topbar, request lists, tables, filters, calendar, attachment/upload states, dialogs, toasts, status cues, admin pages, and mobile navigation.
- Use one canonical icon family for product UI. Do **not** mix Lucide, Material, Font Awesome, emoji iconography or ad-hoc page-specific SVG icon sets.
- Default visual style: **24/outline** imports sized appropriately by shared components; use **24/solid** only for intentionally selected/active contexts where that state distinction is consistently defined.
- Standardize rendered sizes per component family: ~18–20px menu/sidebar, ~18px actions, ~16px compact inline status, ~20–24px section icons. Keep icon weight/geometry consistent.
- Choose semantic Heroicons that match actions (calendar, files, upload, success, warning, pending, etc.) and verify actual exports from the installed version.
- Icons supplement, never replace, localized VI/EN labels for important states and actions. Icon-only controls require accessible names, visible focus and touch-friendly hit targets (~44×44px).
- **Exception:** EIU Full Logo and Corner Logo are brand image assets, not application icons; diagrams/charts may render vector data visualization without introducing an additional general-purpose icon family.
- For third-party widgets, theme or wrap visible action icons to maintain consistency where practical.

## 4. Sidebar — inherit MedLabs V2 approved visual

**Sidebar design itself is approved to match MedLabs**, while the UniCouncil navigation structure and role workspace behavior are separate decisions.

Desktop shell from MedLabs V2 Master:

```css
/* Implementation reference, not runtime code yet */
.sidebar {
  width: 244px;
  padding: 22px 14px 16px;
  background: linear-gradient(
    180deg,
    #173F64 0%,
    #102F4D 62%,
    #0C2944 100%
  );
}
```

- **EIU Full Logo**: `public/eiu-full-logo.jpg` from the MedLabs repository.
- White logo panel: `height: 62px`, `background: #FFFFFF`, `border-radius: 12px`, `padding: 8px 10px`, subtle raised shadow per MedLabs V2 Master. Logo must use `object-fit: contain` (no cropping).
- Below logo: product title **UniCouncil Scheduler**, not MedLabs Calendar. Title/brand font = **Crimson Pro**.
- Group headings: 14px, bold, uppercase, gold-tinted `#D9C49E` inherited from approved MedLabs V2.
- Menu items: 12px; active height 42px, radius 11px, white background, EIU Blue text, `inset 4px 0 0 #A78656` left accent and restrained shadow.
- Preserve three distinct vertical regions for logo, title, first nav group. No absolute positioning/negative margins that create overlap.
- Navigation is based on UniCouncil roles (REQUESTER / ASSISTANT / LEADER / ADMIN); content/role-switch strategy still open in Part C.
- Mobile/sidebar-collapse behavior must be responsive and accessible; don't merely shrink desktop sidebar.

Do not copy old CSS from MedLabs blindly: `docs/UI_DESIGN_SYSTEM_V2_MASTER.md` is explicitly higher precedence than legacy `app/globals.css`.

## 5. Login branding

- Use **EIU Corner Logo**, source `eiu-medlabs/public/eiu-corner-logo.png`, on UniCouncil's `/login`.
- Layout is *not* copied 1:1 from MedLabs; will be designed for a centered Google Workspace login flow, bilingual VI/EN copy and responsive screens.
- Use **Crimson Pro** for the distinctive brand/title portion and Be Vietnam Pro for sign-in instructions, labels, warnings and actionable controls.
- Avoid non-EIU decorative logos or brand colors.

## 6. Shared UI foundation inherited from MedLabs V2

- Page topbar: white, sticky, min-height ~82px; subtle backdrop blur and border if needed.
- Canvas light warm neutral; surface/card white.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px.
- Control radius ~10px; card/table ~15px; dialog/drawer ~16px.
- Shared toolbar filter height ~44px and consistent alignment.
- Data Table: one outer visual shell, no nested borders/right-edge white gutter, text headers left aligned, safe cell inset ~16px, table-local horizontal scrolling rather than page horizontal overflow.
- Accessibility: one visible focus boundary per composite control, keyboard operation, form labels, meaningful validation in selected language, no color-only statuses, respect reduced motion.
- Already-approved UniCouncil responsive UX: desktop table + detail drawer; mobile compact cards + full-page/card detail.
- Upload file UX: per-file feedback with Retry/Replace/Remove, supporting VI/EN; 4 MB per file, at most 10 attachments.

## 6A. Soft pastel status badges — adapted from EIU Schedule (2026-10-08)

**Direction requested by user**: light/pastel background + dark, legible text + delicate tonal border instead of bright solid-color badges. The **exact mapping from status to tone is a UniCouncil proposal** for review, not a new workflow/status definition.

**Reference implementation**:
- [EIU Schedule Badge](https://github.com/nhutbao1314-hub/eiu-schedule/blob/main/components/ui/badge.tsx): `neutral`, `success`, `warning`, `danger`, `info`; full pill, soft fills, semantic foreground, subtle inset ring.
- [EIU Schedule TOKENS](https://github.com/nhutbao1314-hub/eiu-schedule/blob/main/docs/design-system/TOKENS.md): the five foreground/background pairs below.

| Tone | Text / foreground | Pastel background | UniCouncil example |
|---|---|---|---|
| `info` | `#144069` | `#F0F4F8` | Đang xử lý / Processing |
| `warning` | `#765A0D` | `#FFF8E8` | Điều chỉnh / Revision; Chờ duyệt / Awaiting approval |
| `success` | `#3D642B` | `#F2F6EE` | Đã duyệt / Approved |
| `danger` | `#8C301B` | `#FFF1ED` | Đã hủy / Cancelled |
| `neutral` | `#58595B` | `#F7F3ED` | Hoàn thành / Completed |

These exact **foreground/background** pairs come from the EIU Schedule repo. The thin border can be a low-opacity tint of the corresponding brand color; tune its final alpha/contrast in visual QA. A badge never relies on background alone.

**System status → proposed tone** (presentation only; role-specific label mapping remains in workflow docs):

| System status | Suggested tone | Note |
|---|---|---|
| `PROCESSING` | info | Assistant is processing; Requester displays “Đang xử lý” |
| `PENDING_APPROVAL` | warning | Awaiting Leader approval, not an error; Leader may display “Mới” |
| `ADJUSTED` | warning | Requester needs to revise |
| `REVISED` | warning | Leader requested revision; may be Assistant- or Requester-owned based on `revision_target` |
| `REVISED_PROCESSING` | info | Requester resubmitted after Leader revision; Assistant processing |
| `APPROVED` | success | Approved |
| `CANCELLED` | danger | Cancelled |
| `COMPLETED` | neutral | Completed, historical |

### Role-specific badge consistency (V1 proposal)

**Prefer consistent tone for the label actually shown in each workspace**, rather than making the same user-visible text switch between pastel colors:

| Workspace | Display label VI | Typical system statuses | Badge tone |
|---|---|---|---|
| Requester | Đang xử lý | PROCESSING, PENDING_APPROVAL, REVISED_PROCESSING | info |
| Requester | Điều chỉnh | ADJUSTED, REVISED | warning |
| Requester | Đã duyệt / Hoàn thành / Đã hủy | APPROVED / COMPLETED / CANCELLED | success / neutral / danger |
| Assistant | Mới / Đang xử lý | PROCESSING / REVISED_PROCESSING | info |
| Assistant | Chờ duyệt / Chờ bổ sung / Điều chỉnh | PENDING_APPROVAL / ADJUSTED / REVISED | warning |
| Leader | Mới | PENDING_APPROVAL | info |
| Leader | Điều chỉnh | REVISED, REVISED_PROCESSING | warning |
| Assistant / Leader | Đã duyệt / Hoàn thành | APPROVED / COMPLETED | success / neutral |

The earlier system-status table is only a default phase-inspired starting point; this **role-specific visible-label consistency takes precedence** if the two suggestions conflict. Exact English labels inherit the agreed translations from workflow docs.

Rules:
- **Keep eight canonical statuses and role-specific labels exactly as previously approved.** Tone is decorative semantic presentation; do not use it as backend state or filtering key.
- Compact badge with readable text, pill radius, subtle border. Don't repeat status with multiple badges in one row; don't decorate headings with status-badge styling.
- VI/EN text is localized, developer status codes never shown as UI labels. For identical displayed labels (e.g. Requester PROCESSING and PENDING_APPROVAL), prefer consistent tone unless there is a clear user-visible distinction and justification; the table above is a **starting point for review**.
- Compare text/background contrast: token pairs were checked to exceed 4.5:1 for ordinary status text. In final UI verify real font weight/size and the border/focus semantics.
- Palette hue communicates semantics; status text/icon and accessible labels still carry the meaning. A badge that is read-only must not look like a button.

## 6B. Other EIU Schedule patterns worth adapting

1. **Filter presets + visible reset**: dates/statuses can be quick presets; show active filters with removable chips and one clear reset. Scope filters only to the relevant UniCouncil page (Requester/Assistant/Leader queue). Avoid invisible filters.
2. **Latest-response-wins** for fast search/filters: don't allow an older async result to overwrite a newer choice; preserve loading/empty/no-match/error states and keep layout stable.
3. **Honest data states**: show “Chưa phân công / Not assigned” or “Chưa có lịch chính thức / Not scheduled” instead of fake leader, room or meeting time. Keep “ngày đề xuất” distinct from “ngày chính thức”.
4. **Readable tables**: semantic headers, sticky opaque header on long lists, table-local horizontal scrolling and width by column intent. Already-approved UniCouncil mobile compact cards stay in force (do not import EIU Schedule's wide-table-on-mobile choice).
5. **Accessible feedback**: 44px touch targets, visible keyboard focus, predictable dialog focus, no color-only status, reduced motion, inline failures next to the affected field/file.
6. **Avoid copying** Schedule analytics charts, student KPIs, cloud sync freshness semantics, EduHub integrations, public-dashboard shell or its default Montserrat/Crimson Text font pairing. UniCouncil is a private request-approval application, not a student schedule analytics dashboard.

## 7. Logo asset plan (for implementation)

From [MedLabs / public](https://github.com/baonguyen-kobe/eiu-medlabs/tree/main/public):

| Asset | UniCouncil placement |
|---|---|
| `eiu-full-logo.jpg` | Sidebar on white logo panel |
| `eiu-corner-logo.png` | Login design |
| `eiu-logo.png` | Optional other use only after specific approval |

**This document only references paths in the MedLabs repository.** Binary images have **not yet been copied to UniCouncil**. Copy only the needed logo assets during Phase 1 implementation.

## 8. Remaining Part C decisions

1. **Crimson Pro is confirmed**; verify display sizing/diacritics during implementation, not an open font-family decision.
2. **EIU Cream `#EAE2D6`** and **Gray `#58595B`** are confirmed; use these final tokens in implementation.
3. **Heroicons-only icon set confirmed**; check icon consistency and accessibility in implementation. Review the proposed pastel badge **status → tone** table and role-specific consistency.
4. Role-based navigation: one workspace switcher per active role vs one permission-aware shared navigation.
5. Login page information hierarchy and VI/EN toggle placement.
6. Apply the relevant filter/table/error patterns to UniCouncil pages.

After remaining decisions, move into implementation; avoid redesigning previously approved EIU branding.
