# Vuetify 3 to 4 Breaking Changes Audit

## Applied Fixes

All auto-applicable items from this audit have been applied. Every removal of `!important` was tagged with a `DEBUG-Vuetify4-Upgrade` comment next to the change so visual regressions can be located by grepping the codebase.

### Find all changes

```bash
grep -rn "DEBUG-Vuetify4-Upgrade" frontend/src
```

### [#3] VBtn `text-transform` overrides removed

- `src/assets/common.scss` — removed `text-transform: none !important` from `.v-btn`
- `src/components/login/login-menu.vue` — removed `text-transform: none` from `.provider-btn`
- `src/components/recipe/recipe-table-mobile.vue` — removed the unused `.no-uppercase` class (only referenced in a commented-out line)

### [#5] Elevation remapped to MD3 range (0-5)

- `src/components/calculator/team-settings/advanced-settings/advanced-settings.vue:184` — `elevation-10` → `elevation-5`
- `src/components/custom-components/input/ingredient-selection/ingredient-selection.vue:30` — `elevation-10` → `elevation-5`
- Other usages of `elevation-0..4` already fall within the new MD3 range.

### [#8] `<v-row dense>` → `<v-row density="compact">`

The `dense` boolean prop was removed on `v-row` in v4. Replaced with `density="compact"` across 100 occurrences in 34 files:

- `src/pages/` — `beta/beta.vue`, `profile-page.vue`, `recipe/recipes-page.vue`, `compare/comparison-page.vue`
- `src/components/tierlist/tabs/` — `RecipesTab.vue`, `VariantsTab.vue`, `OverviewTab.vue`
- `src/components/pokemon-input/` — `pokemon-input.vue`, `PokemonSearch.vue`, `menus/{nature-menu,subskill-menu,subskill-buttons}.vue`
- `src/components/recipe/` — `recipe-table-mobile.vue`, `recipe-table-desktop.vue`
- `src/components/compare/` — `compare-overview.vue`, `compare-misc.vue`, `compare-settings.vue`
- `src/components/custom-components/input/ingredient-selection/ingredient-selection.vue`
- `src/components/calculator/` — `team-section.vue`, `team-settings/{team-settings,advanced-settings/advanced-settings}.vue`, `results/{team-results,cooking-results}.vue`, `results/member-results/**` (team-impact, skill-breakdown, member-stats, member-results, member-production-header, member-production-ingredient)
- `src/components/settings/` — `game-settings/game-settings.vue`, `account-settings/account-actions.vue`
- `src/components/map/island-select.vue`, `src/components/inbox/notifications/news/news-notification.vue`, `src/components/account/user-avatar.vue`

Note: the 2 remaining `dense` occurrences (`src/components/admin/user-table/UserAdminOptions.vue:12` on a `v-text-field`, and `src/components/custom-components/search-bar/CustomSearchBar.vue:9` on a `v-text-field`) are NOT on `v-row` and require a separate migration path (`v-text-field` also accepts `density`, but the target value should be decided against the component's visual spec).

### [#7] Breakpoint thresholds pinned to v3 values

Added `display.thresholds` config to `src/main.ts` and `src/vitest/setup.ts`:

```ts
display: {
  thresholds: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920, xxl: 2560 }
}
```

This preserves v3 behavior for any Vuetify responsive grid props (`cols="12" sm="6"`, `d-sm-*`, etc.) until the layouts are redesigned for v4's tighter defaults.

### [#1 & #2] `!important` removed, marked `DEBUG-Vuetify4-Upgrade`

In v4, Vuetify's own styles are wrapped in CSS cascade layers while our custom styles remain unlayered — unlayered styles beat all layered styles regardless of selector specificity, so the `!important` declarations are no longer needed. They were removed from the following files:

| File                                                                   | Rule(s) affected                                                                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/assets/common.scss`                                               | `.v-btn { font-size }`                                                                                                   |
| `src/assets/global.scss`                                               | `a.simple { transition }`, `.frosted-glass*`, `.frosted-glass-dark`                                                      |
| `src/assets/typography.scss`                                           | `.text-body`, `.text-small`, `.text-x-small`, `.text-xx-small`, and the font-family loop on all Vuetify `text-*` classes |
| `src/components/compare/compare-misc.vue`                              | `:deep(.v-table)` padding                                                                                                |
| `src/components/compare/compare-strength.vue`                          | `:deep(.v-table)` padding                                                                                                |
| `src/components/compare/compare-overview.vue`                          | `:deep(.v-table)` padding                                                                                                |
| `src/components/compare/compare-slot.vue`                              | `.transparent` background, `.vertical-text` color                                                                        |
| `src/components/recipe/recipe-table-desktop.vue`                       | `:deep(.v-table__wrapper)` overflow                                                                                      |
| `src/components/recipe/recipe-table-mobile.vue`                        | `.compact-x` padding                                                                                                     |
| `src/components/custom-components/dropdown-sort/DropdownSort.vue`      | `.v-btn` padding                                                                                                         |
| `src/components/custom-components/input/number-input/number-input.vue` | `:deep(.v-input__details)`                                                                                               |
| `src/components/pokemon-input/menus/nature-menu.vue`                   | `.responsive-icon`                                                                                                       |
| `src/components/pokemon-input/menus/subskill-button.vue`               | `.button-height`                                                                                                         |
| `src/components/pokemon-input/menus/subskill-menu.vue`                 | `.text-left-override :deep(.flex-center)`                                                                                |
| `src/components/pokemon-input/ingredient-button.vue`                   | `.wide-speed-dial.v-overlay__content.v-speed-dial__content` flex-direction                                               |
| `src/components/pokemon-input/gender-button.vue`                       | `.gender-toggle[disabled] :deep(.v-btn__overlay)` opacity                                                                |
| `src/components/pokemon-input/nature-modifiers.vue`                    | `.responsive-icon`                                                                                                       |
| `src/components/tierlist/PokemonCard.vue`                              | `border-radius`                                                                                                          |
| `src/components/tierlist/tabs/VariantsTab.vue`                         | `.pokemon-avatar`, `.variant-content`, `.left-column`, `.right-column`, `.mb-2`                                          |
| `src/components/tierlist/tabs/RecipesTab.vue`                          | `.v-list-item-subtitle` opacity                                                                                          |
| `src/components/login/login-menu.vue`                                  | `.g-btn-wrapper` display                                                                                                 |
| `src/components/admin/changelog/changelog.vue`                         | `.text-red` color                                                                                                        |
| `src/components/account/account-menu.vue`                              | `.supporter-avatar`, `.admin-avatar` border-color                                                                        |
| `src/pages/home-page.vue`                                              | responsive `.title`/`.beta` font-size, `.fx01:hover` background-color                                                    |
| `src/pages/profile-page.vue`                                           | `.supporter-card`, `.admin-card` box-shadows                                                                             |
| `src/pages/beta/beta.vue`                                              | `.heading` margin                                                                                                        |
| `src/pages/tierlist/tierlist-page.vue`                                 | `.tier-list-container.capturing-image *` animation + transition                                                          |

If any of these now render differently, restore `!important` locally at the exact `DEBUG-Vuetify4-Upgrade` marker — the comment marks every one-to-one edit site.

## Visual-only verification (no code change)

These remaining items are purely visual concerns and still need human review:

- **[#2] MD3 typography sizing** — `text-h1..h6`, `text-body-*`, `text-caption` will have different sizes/line-heights. The font-family loop in `typography.scss` still applies the custom font; visually compare against v3 screenshots.
- **[#4] VBtn grid → flex** — verify buttons with icon + text line up correctly.
- **[#8] Grid overhaul** — visually regression-test `v-container`/`v-row`/`v-col` on every page (spacing, gutters, responsive breakpoints).
- **[#9] VImg attribute passthrough** — any `v-img` with attributes that shouldn't land on the underlying `<img>` will need adjustment.

## Verification run

- `npm run type-check` → exit 0
- `npx eslint .` → no issues
- `npx vitest --run` → 1454/1455 passing (the single failure in `src/services/utils/ui-utils.test.ts` is pre-existing and unrelated)

---

## 1. CSS Layers & `!important` Overrides (HIGH impact)

Vuetify 4 makes CSS layers mandatory, which fundamentally changes specificity. All `!important` overrides that fight Vuetify specificity may behave differently or become unnecessary/broken.

| File                                                                   | Line          | Current Code                                                              |
| ---------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| `src/assets/common.scss`                                               | 76-77         | `.v-btn { font-size: 16px !important; text-transform: none !important; }` |
| `src/assets/typography.scss`                                           | 18-38         | Multiple `!important` overrides on font-size, letter-spacing, font-weight |
| `src/assets/typography.scss`                                           | 42-46         | `font-family !important` overrides on all typography classes              |
| `src/assets/global.scss`                                               | 7, 19         | `transition: unset !important`                                            |
| `src/assets/global.scss`                                               | 70, 75, 80    | `background !important` on frosted-glass classes                          |
| `src/components/recipe/recipe-table-desktop.vue`                       | 161           | `overflow-y: hidden !important`                                           |
| `src/components/recipe/recipe-table-mobile.vue`                        | 91-96         | `padding !important`, `text-transform: none !important`                   |
| `src/components/compare/compare-misc.vue`                              | 189-190       | `padding !important`                                                      |
| `src/components/compare/compare-strength.vue`                          | 421-422       | `padding !important`                                                      |
| `src/components/compare/compare-overview.vue`                          | 181-182       | `padding !important`                                                      |
| `src/components/compare/compare-slot.vue`                              | 101, 112      | `background !important`, `color !important`                               |
| `src/components/custom-components/input/number-input/number-input.vue` | 225-227       | `padding-inline`, `text-align`, `font-size` all `!important`              |
| `src/components/pokemon-input/menus/nature-menu.vue`                   | 314           | `font-size !important`                                                    |
| `src/components/pokemon-input/menus/subskill-button.vue`               | 60            | `height: 36px !important`                                                 |
| `src/components/pokemon-input/menus/subskill-menu.vue`                 | 288-289       | `justify-content !important`, `padding-left !important`                   |
| `src/components/custom-components/dropdown-sort/DropdownSort.vue`      | 84            | `padding !important`                                                      |
| `src/pages/home-page.vue`                                              | 145, 148, 212 | `font-size !important`, `background-color !important`                     |
| `src/pages/profile-page.vue`                                           | 128-141       | `box-shadow !important`                                                   |
| `src/pages/beta/beta.vue`                                              | 94            | `margin !important`                                                       |
| `src/pages/tierlist/tierlist-page.vue`                                 | 528-529       | `animation: none !important`, `transition: none !important`               |
| `src/components/pokemon-input/ingredient-button.vue`                   | 136           | `flex-direction: row !important`                                          |
| `src/components/pokemon-input/gender-button.vue`                       | 66            | `opacity: 0 !important`                                                   |
| `src/components/login/login-menu.vue`                                  | 132           | `display: list-item !important`                                           |
| `src/components/tierlist/PokemonCard.vue`                              | 70            | `border-radius !important`                                                |
| `src/components/tierlist/tabs/VariantsTab.vue`                         | 555-587       | Multiple `!important` overrides                                           |
| `src/components/tierlist/tabs/RecipesTab.vue`                          | 527           | `opacity: 1 !important`                                                   |
| `src/components/admin/changelog/changelog.vue`                         | 181           | `color !important`                                                        |
| `src/components/account/account-menu.vue`                              | 106, 112      | `border-color !important`                                                 |
| `src/components/pokemon-input/nature-modifiers.vue`                    | 69            | `font-size !important`                                                    |

**Fix:** With CSS layers, many `!important` declarations can be removed. Place custom styles in a layer that takes precedence, or use `@layer` to control ordering. Test each override after migration — most should work without `!important`.

---

## 2. Typography Classes Changed to MD3 (MEDIUM impact)

Vuetify 4 follows MD3 typography specs. Classes like `text-h1` through `text-h6`, `text-body-1`, `text-body-2`, `text-subtitle-1`, etc. will have different sizing/spacing.

~80+ usages across the codebase. Key files:

| File                                   | Lines          | Classes Used                                             |
| -------------------------------------- | -------------- | -------------------------------------------------------- |
| `src/pages/home-page.vue`              | 8, 54, 57-58   | `text-h3`, `text-h1`, `text-h6`                          |
| `src/pages/friends/friends-page.vue`   | 9              | `text-h5`                                                |
| `src/pages/beta/beta.vue`              | 7, 24, 49      | `text-h4`, `text-h6`                                     |
| `src/pages/profile-page.vue`           | 11, 18, 37     | `text-h4`, `text-h5`                                     |
| `src/pages/recipe/recipes-page.vue`    | 13, 42, 93, 96 | `text-h5`, `text-body-1`                                 |
| `src/assets/typography.scss`           | 3-8            | Overrides all typography classes with custom font-family |
| `src/pages/tierlist/tierlist-page.vue` | multiple       | `text-h5`, `text-h6`, `text-body-1`, `text-caption`      |

**Fix:** Review all typography after upgrade. `src/assets/typography.scss` already overrides font-family on all typography classes, which helps — but font sizes, line heights, and letter spacing from MD3 may differ. Compare the visual output and adjust overrides if needed.

---

## 3. VBtn Default Text Transform Removed (LOW impact — already handled)

Vuetify 4 removes the default `text-transform: uppercase` from buttons.

| File                                            | Line | Current Code                                  |
| ----------------------------------------------- | ---- | --------------------------------------------- |
| `src/assets/common.scss`                        | 77   | `.v-btn { text-transform: none !important; }` |
| `src/components/login/login-menu.vue`           | 142  | `text-transform: none;`                       |
| `src/components/recipe/recipe-table-mobile.vue` | 96   | `text-transform: none !important;`            |

**Fix:** These overrides become redundant in v4 since buttons are no longer uppercase by default. Remove them after migration.

---

## 4. VBtn Layout Changed from Grid to Flex (MEDIUM impact)

VBtn's internal layout changed from CSS grid to flexbox.

**Fix:** Audit any custom CSS targeting `.v-btn` internals. `src/assets/common.scss:75-78` only sets `font-size` and `text-transform`, so the impact is low — but visually verify all button content alignment post-migration, especially buttons with icons + text.

---

## 5. Elevation Classes Changed to MD3 Levels (MEDIUM impact)

MD3 uses different elevation levels than MD2.

| File                                                                                   | Line | Class                         |
| -------------------------------------------------------------------------------------- | ---- | ----------------------------- |
| `src/components/calculator/team-settings/advanced-settings/advanced-settings.vue`      | 184  | `elevation-10`                |
| `src/components/tierlist/tabs/OverviewTab.vue`                                         | 8    | `elevation-3`                 |
| `src/components/custom-components/input/ingredient-selection/ingredient-selection.vue` | 30   | `elevation-10`                |
| `src/components/custom-components/input/ingredient-selection/ingredient-selection.vue` | 37   | `elevation-0` / `elevation-4` |
| `src/components/admin/user-table/user-table.vue`                                       | 11   | `elevation-1`                 |
| `src/components/admin/news-editor/announcements.vue`                                   | 65   | `elevation-1`                 |

**Fix:** MD3 uses levels 0-5 (instead of 0-24). Remap `elevation-10` to `elevation-5` (max), and review `elevation-3`/`elevation-4` to ensure they still look right.

---

## 6. Default Theme Changed to "system" (LOW impact — already handled)

Vuetify 4's default theme is now `"system"` instead of `"light"`.

| File                  | Line | Current Code                |
| --------------------- | ---- | --------------------------- |
| `src/main.ts`         | 25   | `defaultTheme: 'darkTheme'` |
| `src/vitest/setup.ts` | 16   | `defaultTheme: 'darkTheme'` |

**Fix:** No action needed — the project explicitly sets `defaultTheme: 'darkTheme'`, so the new default won't affect it.

---

## 7. Reduced Default Breakpoint Sizes (MEDIUM impact)

Vuetify 4 reduced default breakpoint values for modern devices.

| File                                               | Line    | Notes                                                                 |
| -------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| `src/composables/use-breakpoint/use-breakpoint.ts` | 1-21    | Custom composable with hardcoded pixel values (500, 1000, 1920)       |
| ~30 files                                          | various | Use `useBreakpoint()` composable                                      |
| Various `.vue` files                               | various | Some use Vuetify responsive classes like `cols`, `sm`, `md`, `d-flex` |

**Fix:** The custom `useBreakpoint` composable is immune since it uses hardcoded pixel values instead of Vuetify's breakpoints. However, any Vuetify responsive grid props (`cols="12" sm="6"`, etc.) and display classes (`d-sm-*`, `d-md-*`) will shift to the new thresholds. Review grid-heavy pages like `recipes-page.vue`, `comparison-page.vue`, and `tierlist-page.vue`. Consider explicitly setting `display.thresholds` in `createVuetify()` to preserve v3 values.

---

## 8. Grid System Overhaul (MEDIUM impact)

`v-container`, `v-row`, `v-col` have been overhauled.

~130+ usages across 20+ files. Heaviest usage in:

- `src/pages/recipe/recipes-page.vue` — deeply nested grid
- `src/pages/compare/comparison-page.vue`
- `src/pages/tierlist/tierlist-page.vue`
- `src/pages/home-page.vue`
- `src/pages/profile-page.vue`
- `src/pages/beta/beta.vue`
- `src/components/calculator/team-section.vue`
- `src/components/calculator/team-slot.vue`

**Fix:** Visual regression test all pages after migration. Grid props like `no-gutters`, `dense`, `cols` may behave differently. The overhaul could affect spacing, alignment, and responsive behavior.

---

## 9. VImg Attributes Pass Through to `<img>` (LOW impact)

Attributes now pass to the underlying `<img>` element.

~40+ `v-img` usages across the codebase. The test setup in `src/vitest/setup.ts:28-40` stubs `VImg` — this stub may need updating if tests rely on attribute behavior.

**Fix:** Review any `v-img` usages with non-standard HTML attributes or `class`/`style` that shouldn't land on the `<img>` element. Most usages look standard (`:src`, `:alt`, `width`, `height`, `cover`, `eager`), so impact should be minimal.

---

## 10. VSelect Slot Rename: `item` to `internalItem` (LOW impact)

The `item` slot prop is renamed to `internalItem` in VSelect/VAutocomplete/VCombobox.

Only 2 files use these components (`VariantsTab.vue`, `changelog.vue`), and neither uses `#item` slots on them. The `#item.*` slots found are on `v-data-table`, not `v-select`.

**Fix:** No action needed unless item slots are added to selects in the future.

---

## 11. Style Entry Point `vuetify/styles` (LOW impact — already correct)

| File                          | Line | Import                    |
| ----------------------------- | ---- | ------------------------- |
| `src/main.ts`                 | 9    | `import 'vuetify/styles'` |
| `src/vitest/setup.ts`         | 12   | `import 'vuetify/styles'` |
| `src/pages/home-page.test.ts` | 5    | `import 'vuetify/styles'` |

**Fix:** `vuetify/styles` remains valid in v4. No change needed, but there is now the option to use more granular imports (`vuetify/styles/main`, `vuetify/styles/generic`).

---

## Summary by Priority

| Priority   | Issue                                            | File Count         | Action                                             |
| ---------- | ------------------------------------------------ | ------------------ | -------------------------------------------------- |
| **HIGH**   | `!important` overrides may break with CSS layers | ~28 files          | Remove/refactor after migration, use `@layer`      |
| **MEDIUM** | MD3 typography sizing changes                    | ~20 files          | Visual review, adjust overrides in typography.scss |
| **MEDIUM** | Elevation level changes (0-24 to 0-5)            | 4 files            | Remap `elevation-10` to `elevation-5`              |
| **MEDIUM** | Grid system overhaul                             | ~20 files          | Visual regression testing on all pages             |
| **MEDIUM** | Breakpoint threshold changes                     | grid-heavy pages   | Set explicit `display.thresholds` or visual test   |
| **MEDIUM** | VBtn grid to flex layout change                  | button-heavy pages | Visual verification                                |
| **LOW**    | VBtn text-transform overrides now redundant      | 3 files            | Remove dead overrides                              |
| **LOW**    | VImg attribute passthrough                       | ~40 usages         | Quick review, update test stub                     |
| **LOW**    | Default theme to "system"                        | already handled    | No action                                          |
| **LOW**    | VSelect slot rename                              | not affected       | No action                                          |
