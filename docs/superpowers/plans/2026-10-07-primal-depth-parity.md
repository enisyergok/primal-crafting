# PRIMAL Depth Parity Implementation Plan

> **For agentic workers:** Execute inline with executing-plans; retain the existing task-local checkout and use branch codex/primal-illustrated-ui.

**Goal:** Expand the current illustrated PRIMAL prototype into a complete, testable crafting RPG with Dawn-of-Crafting-class depth and original PRIMAL content.

**Architecture:** Keep the offline WebView as the presentation layer, but move all content into a validated registry and keep all gameplay mutations in the serializable JavaScript model. The Android bridge remains limited to three durable save slots and the UI consumes model metadata instead of hard-coded recipe counts. Java story compatibility remains until the new registry is proven by the same end-to-end scenarios.

**Tech Stack:** Android Java 17, WebView, dependency-free JavaScript, Node built-in tests, Java model tests, Android emulator smoke tests, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-07-primal-depth-parity.md`

## Global Constraints

- Preserve offline operation and minSdk 24 / targetSdk 35.
- Preserve and migrate existing PRIMAL saves; malformed saves are rejected without silent reset.
- Use original PRIMAL content and regenerated art; do not copy Dawn of Crafting assets, characters, dialogue or exact recipe text.
- No production behavior is added without a failing test first.
- No release APK is reported until fresh Node, Java and Android emulator verification passes.

---

### Task 1: Establish the content registry contract

**Files:**
- Create: `app/src/main/assets/content.js`
- Modify: `app/src/main/assets/game.js`
- Modify: `app/src/main/assets/index.html`
- Create: `tests/content.test.cjs`

**Interfaces:**
- `PrimalContent.items`: 343 unique item records `{id, name, category, region, tier, tags}`.
- `PrimalContent.recipes`: 237 recipe records `{id, name, input, tool, output, skill, level, category, region}`.
- `PrimalContent.skills`: 15 skill records.
- `PrimalContent.quests`: 87 quest records.
- `PrimalContent.events`: original event records used by later simulation work.
- `PrimalContent.validateRegistry()`: throws with the first invalid reference.

- [ ] Write failing tests that assert exact counts, unique IDs, valid input/output references, legal tools, no self-consuming recipe and at least one progression path to every output.
- [ ] Run `node --test tests/content.test.cjs`; confirm it fails because the registry does not exist.
- [ ] Add a UMD `content.js` registry. Keep the current 20 item IDs and 12 recipe IDs stable for save migration; generate the remaining original PRIMAL materials, foods, tools, structures, clothing, medicine and keepsakes as explicit records.
- [ ] Add 225 deep recipes whose inputs are earlier outputs plus gathered materials, with deterministic tools, skill gates, regions and categories; add 87 named original quests and 15 skills.
- [ ] Load `content.js` before `game.js` in `index.html`; make Node `game.js` require the same registry.
- [ ] Run the content tests and the existing game tests; commit the registry only after both pass.

### Task 2: Extend the model without breaking old saves

**Files:**
- Modify: `app/src/main/assets/game.js`
- Modify: `tests/game.test.cjs`
- Modify: `tests/GameStateTest.java`

**Interfaces:**
- `Primal.newGame(now)` returns `skills[15]`, `quests[87]`, `events`, `inventory[343]`, `discovered[237]`, `saveSlots` metadata and the existing compatibility fields.
- `Primal.reduce(state, action, now)` supports generic `craft`, `discover`, `gather`, `quest`, `event`, `equip`, `unequip`, `use`, `travel`, `prestige`, `saveSlot` and legacy actions.
- `Primal.validate(state)` validates every new array, object and reference.

- [ ] Write failing tests for crafting recipe 0, recipe 236, a deep chain of five recipes, tool durability, skill gain, recipe discovery and three-slot save metadata.
- [ ] Run the focused tests and record the expected missing-field failures.
- [ ] Update the reducer to use registry IDs instead of fixed 20-item assumptions; preserve current story actions and legacy migration.
- [ ] Implement atomic recipe transactions, output capacity checks, skill progression and deterministic RNG for all 237 recipes.
- [ ] Add migration from version 2 states by padding arrays and deriving discovered recipes without erasing known inventory.
- [ ] Run `node --test tests/game.test.cjs tests/content.test.cjs` and `javac ... && java ...`.

### Task 3: Implement the 15-skill progression and 87-quest engine

**Files:**
- Modify: `app/src/main/assets/game.js`
- Modify: `app/src/main/assets/ui.js`
- Modify: `app/src/main/assets/style.css`
- Modify: `tests/game.test.cjs`
- Create: `tests/progression.test.cjs`

**Interfaces:**
- `Primal.skillCheck(state, skillId, difficulty)` returns `{chance, success}` without mutating state.
- `Primal.questStatus(state, questId)` returns `locked|active|complete|failed`.
- `Primal.applyEvent(state, eventId, choice, now)` applies one event atomically.

- [ ] Write failing tests for skill XP, level caps, quest prerequisites, mutually exclusive choices, event rewards and quest completion after a deep recipe.
- [ ] Implement 15 independent skills with XP thresholds and recipe-specific checks; keep `state.skill` as a compatibility alias to the primary crafting skill.
- [ ] Implement quest prerequisites, progress counters, rewards, failure branches, recurring tasks and story chapter gates for all 87 quests.
- [ ] Implement deterministic random events with choices that affect trust, resources, skills and future availability.
- [ ] Add the journal quest list, skill sheet, event dialog and reward feedback to the UI.
- [ ] Run focused progression tests and the old two-ending test.

### Task 4: Finish inventory, equipment, storage, helper and village systems

**Files:**
- Modify: `app/src/main/assets/game.js`
- Modify: `app/src/main/assets/ui.js`
- Modify: `app/src/main/assets/style.css`
- Modify: `tests/game.test.cjs`
- Create: `tests/systems.test.cjs`

- [ ] Write failing tests for stack limits, multiple storage buildings, each equipment slot, durability, helper loadouts, offline mission completion, building upgrade prerequisites and harvest timers.
- [ ] Implement typed equipment slots, item stack limits, storage containers, village production queues and helper mission tables.
- [ ] Implement map locations, region-specific gathering tables and safe return/failed expedition outcomes.
- [ ] Replace fixed item sprite assumptions with generated glyphs and category styling for items without atlas art.
- [ ] Make every visible equipment, building, helper, harvest and map button dispatch a real action and show a result.
- [ ] Run system tests at fixed timestamps and after JSON round-trip validation.

### Task 5: Add save slots, new-game-plus, achievements and settings

**Files:**
- Modify: `app/src/main/java/com/enisyergok/primalcrafting/MainActivity.java`
- Modify: `app/src/main/assets/ui.js`
- Modify: `app/src/main/assets/game.js`
- Modify: `app/src/main/assets/style.css`
- Modify: `app/src/androidTest/java/com/enisyergok/primalcrafting/SmokeTest.java`
- Modify: `tests/game.test.cjs`

- [ ] Write failing tests for three independent save slots, manual/auto separation, corrupted slot isolation, completed-run prestige transfer and achievement unlocks.
- [ ] Implement slot-specific AndroidStore keys with atomic writes and migration from `auto` / `manual`.
- [ ] Implement new-game-plus carryover rules, achievements and a local-only statistics screen.
- [ ] Add save-slot controls, import-safe load errors, reset confirmation and accessibility labels.
- [ ] Extend Android smoke to save in slot 1, save in slot 2, reload slot 1, complete a deep craft and verify persistence after activity restart.

### Task 6: Recipe book and responsive UX parity pass

**Files:**
- Modify: `app/src/main/assets/ui.js`
- Modify: `app/src/main/assets/style.css`
- Modify: `app/src/main/assets/index.html`
- Modify: `tests/ui.test.cjs`
- Modify: `tests/device-smoke.sh`

- [ ] Write failing browser assertions for search, category filters, locked recipe explanations, recipe input selection, drag-and-drop plus tap fallback, and no horizontal overflow at four viewport sizes.
- [ ] Implement virtualized/sectioned recipe browsing for 237 recipes, item detail/use tabs, recipe discovery history and skill/tool hints.
- [ ] Implement accessible touch targets, landscape split layout, scroll restoration and visible progress counters.
- [ ] Run browser tests where Chromium is available; otherwise rely on Android WebView assertions and record the limitation.
- [ ] Inspect emulator screenshots for every primary tab and representative deep recipe.

### Task 7: Full verification and APK delivery

**Files:**
- Modify: `.github/workflows/android.yml`
- Modify: `README.md`
- Modify: `tests/device-smoke.sh`

- [ ] Add CI checks for registry counts, recipe graph reachability, all quest IDs, all skill IDs, Node tests, Java compatibility tests and Android instrumentation.
- [ ] Run a clean GitHub Actions build on `main`; do not reuse an older artifact.
- [ ] Inspect uploaded APK and screenshots from the same successful run.
- [ ] Update README with the actual implemented scope and known compatibility boundaries.
- [ ] Deliver the APK link only with fresh run ID, test counts and any remaining explicit gaps.
