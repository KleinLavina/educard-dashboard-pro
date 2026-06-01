---
name: Section ID type mismatch
description: Mock sections use string IDs, API sections use numeric IDs — must handle when joining learners to sections
---

## Rule
When joining learners to sections by ID, be aware that:
- Mock `Section.id` is a string (e.g. `"7-sampaguita"`)
- API `Section.id` is a number (e.g. `7`)
- API `Learner.section` is a number matching `Section.id`

**Why:** The mock data was written with human-readable string keys for sections, but the Django model uses numeric PKs. A direct `===` comparison between a mock string ID and an API numeric learner.section will always fail.

**How to apply:**
When building the unified `sectionList` from mock data, cast the string ID: `id: s.section.id as unknown as number`. When filtering learners by section in the API path, the IDs are both numbers and compare correctly.
