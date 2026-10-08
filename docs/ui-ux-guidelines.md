# Part C — UI/UX Guidelines V1 — UniCouncil Scheduler

> Status: **EIU branding, sidebar, logo assets, typography roles approved in principle by user (2026-10-08)**. Remaining open: exact Crimson family variant; EIU Cream value in the supplied palette image; role workspace navigation choice.
>
> Scope: design/implementation baseline, **not** a deployed UI. Business permissions, status logic, and data workflow remain authoritative in `workflow-and-roles.md`, `pages.md`, and `schema.md`.

## 1. References and precedence

Brand source of truth for UniCouncil:

1. User-supplied EIU **Primary Colour** and **Secondary Colour** images (2026-10-08) — primary authority for brand palette.
2. User's explicit overrides: sidebar resembles MedLabs, EIU Full Logo on white, EIU Corner Logo on login, **Crimson main / Be Vietnam Pro secondary**.
3. Source UI baseline: [EIU MedLabs UI Design System V2 Master](https://github.com/baonguyen-kobe/eiu-medlabs/blob/main/docs/UI_DESIGN_SYSTEM_V2_MASTER.md) (approved master), then MedLabs production implementation when compatible with that master.
4. UniCouncil-specific page/workflow/permission rules take priority over copied MedLabs components.

Do not copy MedLabs business logic, navigation items, database/auth stack, branding text "MedLabs Calendar", or domain-specific pages. In case MedLabs' old `app/globals.css` disagrees with its approved V2 Master, use **the V2 Master**, not legacy styling.

## 2. Approved EIU color palette

These are **brand colors**, not arbitrary semantic colors; design tokens should map role/context through semantic aliases.

| Token | HEX | Intended use |
|---|---|---|
| EIU Blue | `#144069` | Main brand; sidebar/nav, headings and primary actions |
| EIU Gold | `#A78656` | Premium/accent; active menu marker, restrained emphasis |
| EIU Gray | `#4E4F50` | Gray as stated in HEX line of user-supplied palette |
| EIU Cream | **Pending confirmation**; temporary `#F6F1E8` | Neutral warm surface (temporary value taken from MedLabs master) |
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

**Palette input discrepancy to resolve before final implementation:**
- EIU Cream entry in the screenshot reuses EIU Gold's printed numbers and HEX `#A78656`, although its color swatch is distinctly light cream. Do **not** render Cream as Gold. Use `#F6F1E8` provisionally from MedLabs master until corrected EIU hex is supplied.
- EIU Gray printed RGB values do not match its printed HEX. For current spec prefer the user's printed HEX `#4E4F50`; confirm when exporting final design tokens.

Use CSS semantic tokens (`--brand-primary`, `--brand-accent`, `--surface`, `--text`, `--success`, `--danger`, etc.). Do not hardcode literal HEX repeatedly in per-page CSS. Status meaning must be conveyed by text/icons as well as color. Check visual contrast for functional states.

## 3. Typography — user override

- **Primary brand/display family: Crimson** (exact family still to confirm: e.g. `Crimson Pro` versus `Crimson Text`; do **not** assume the correct package/font file).
- **Secondary UI family: Be Vietnam Pro**.
- Proposed application: Crimson as brand name, page titles, section/hero headings and restrained editorial emphasis; Be Vietnam Pro for UI labels, menu, table/data rows, forms, buttons, validation, long text, dates/numbers and bilingual content.
- This mapping is a **UX implementation proposal**, subject to reviewer feedback; the user-approved requirement is Crimson primary / Be Vietnam Pro secondary.
- Validate Vietnamese diacritics, glyph metrics, line height and `font-display` once exact Crimson family is confirmed. Both VI and EN must render correctly; do not replace fonts with font files copied from another repo without reviewing source/license.

MedLabs V2 uses Be Vietnam Pro alone; UniCouncil's typography overrides that MedLabs rule explicitly.

Baseline type scale for functional UI can inherit MedLabs V2 until page-level review: body 14px, table header 13px, table text 14px, field label 13px, button 14px, metadata 13px. Title scale must be visually verified with Crimson's metrics rather than mechanically copying Be Vietnam Pro weights.

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
- Below logo: product title **UniCouncil Scheduler**, not MedLabs Calendar. Title/brand font = Crimson after selecting exact family.
- Group headings: 14px, bold, uppercase, gold-tinted `#D9C49E` inherited from approved MedLabs V2.
- Menu items: 12px; active height 42px, radius 11px, white background, EIU Blue text, `inset 4px 0 0 #A78656` left accent and restrained shadow.
- Preserve three distinct vertical regions for logo, title, first nav group. No absolute positioning/negative margins that create overlap.
- Navigation is based on UniCouncil roles (REQUESTER / ASSISTANT / LEADER / ADMIN); content/role-switch strategy still open in Part C.
- Mobile/sidebar-collapse behavior must be responsive and accessible; don't merely shrink desktop sidebar.

Do not copy old CSS from MedLabs blindly: `docs/UI_DESIGN_SYSTEM_V2_MASTER.md` is explicitly higher precedence than legacy `app/globals.css`.

## 5. Login branding

- Use **EIU Corner Logo**, source `eiu-medlabs/public/eiu-corner-logo.png`, on UniCouncil's `/login`.
- Layout is *not* copied 1:1 from MedLabs; will be designed for a centered Google Workspace login flow, bilingual VI/EN copy and responsive screens.
- Use Crimson for the distinctive brand/title portion and Be Vietnam Pro for sign-in instructions, labels, warnings and actionable controls.
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

## 7. Logo asset plan (for implementation)

From [MedLabs / public](https://github.com/baonguyen-kobe/eiu-medlabs/tree/main/public):

| Asset | UniCouncil placement |
|---|---|
| `eiu-full-logo.jpg` | Sidebar on white logo panel |
| `eiu-corner-logo.png` | Login design |
| `eiu-logo.png` | Optional other use only after specific approval |

**This document only references paths in the MedLabs repository.** Binary images have **not yet been copied to UniCouncil**. Copy only the needed logo assets during Phase 1 implementation.

## 8. Remaining Part C decisions

1. Exact font family: which "Crimson" variant and where to use it in dense pages (test Vietnamese).
2. Confirm the EIU Cream hex and the Gray HEX/RGB discrepancy in the supplied image.
3. Role-based navigation: one workspace switcher per active role vs one permission-aware shared navigation.
4. Login page information hierarchy and VI/EN toggle placement.
5. Form states, feedback patterns and final table/filter layout per UniCouncil business requirements.

After remaining decisions, move into implementation; avoid redesigning previously approved EIU branding.
