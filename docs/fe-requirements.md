# Frontend Requirements (MVP)

Source: `https://github.com/Shun861/money-student-yeah/issues/3#issue-3366204204`

## Scope
- Client-only MVP (no backend).
- Focus: income input (monthly), bracket select, YTD total, remaining, simple graph.

## Pages
- `/` Dashboard: YTD, selected bracket, remaining, progress bar.
- `/income` Income input form + list.
- `/settings` Select bracket 103/130/150.
- `/report` Printable summary.

## Interactions
- Add income entries (add-only for MVP).
- Change bracket → dashboard updates immediately.
- Progress bar color:
  - green < 70%, yellow 70–90%, red > 90%.

## Calculations
- YTD = sum of entries in current year.
- Brackets: 1,030,000 / 1,300,000 / 1,500,000 JPY.
- Remaining = max(0, bracket - YTD).

## Acceptance
- User can select bracket and input income; dashboard updates instantly.
- Progress bar reflects percent used with thresholds.

## Non-Goals
- Auth, persistence, notifications, CSV, multi-user.
