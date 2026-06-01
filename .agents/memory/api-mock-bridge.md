---
name: API-mock bridge pattern
description: Pattern for wiring React Query API hooks alongside mock fallback data in EduCard Pro pages
---

## Rule
Build a unified display model inside each principal-view component: call both the API hook and keep mock as fallback. Derive a single flat array (`learnerList`, `sectionList`) from whichever source has data, then use that array throughout the render.

**Why:** The codebase has mock data with a nested shape (`l.learner.gpa`, `s.section.id`) while the API returns flat objects (`l.gpa`, `s.id`). Pages must stay functional in demo mode (no backend) and in live mode.

**How to apply:**
```tsx
const hasApiData = apiSections.length > 0;
const sectionList = hasApiData
  ? apiSections.map(s => ({ id: s.id, label: s.label, ... }))
  : allSections.map(s => ({ id: s.section.id as unknown as number, label: s.label, ... }));
```
Use `sectionList` / `learnerList` everywhere in JSX — never mix `apiSections` and `allSections` in the same render path.
