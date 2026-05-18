## Goal
On the Create New Asset form, render the Category field before the Asset Tag field so users tab into Category first. This lets the Asset Tag lookup use the selected category to find the correct tag number.

## Change
In `src/components/assets/AssetBasicFields.tsx`, swap the render order of `<AssetCategoryField>` and `<AssetTagField>` so Category appears (and tabs) before Asset Tag.

No logic, validation, or styling changes — purely a field order swap in the grid.

## Out of scope
- Auto-populating the tag from category (existing logic auto-populates category from tag). If you want the reverse behavior (category drives tag suggestions), let me know and I'll add it as a follow-up.