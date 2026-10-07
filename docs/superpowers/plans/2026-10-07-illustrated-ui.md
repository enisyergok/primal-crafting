# PRIMAL Illustrated UI Implementation Plan

> **For agentic workers:** Execute inline with executing-plans; retain the existing task-local checkout and use branch codex/primal-illustrated-ui.

**Goal:** Implement the approved six-screen board as interactive Android screens, never as whole-screen screenshot crops.

**Architecture:** Local-only WebView renders responsive HTML/CSS components over independently generated art. A dependency-free JavaScript game model owns crafting, discovery, equipment, helper missions, village upgrades and story. Android owns durable save slots and migration from the existing Java save.

**Tech Stack:** Android Java 17, offline WebView, HTML/CSS/JS, Node built-in test runner, Android instrumentation and GitHub Actions.

**Spec:** Approved six-screen PRIMAL board in this conversation; reference copied to docs/design/reference.png. Camp, production, recipes, helper, village, journal; five persistent tabs, settings for saves. Dark wood, parchment, tropical header, illustrated item cards; controls/text are live DOM, not baked art.

## Global Constraints

- minSdk 24, targetSdk 35. Preserve existing saves; never silently overwrite malformed data.
- Offline app: no external navigation, no network dependency, no third-party UI framework.
- Portrait and landscape, safe areas, scroll when needed, at least 44px primary touch targets.
- Generated artwork is separate scenery, portraits and item sprites. Do not crop reference UI.
- No claim of exact pixel identity or full Dawn of Crafting content parity.

### Task 1: Model and durable state

Files: assets/game.js, tests/game.test.cjs, MainActivity.java.
Interfaces: Primal.newGame(now), Primal.reduce(state, action, now), Primal.validate(state), Primal.migrate(old); result {ok,message}; AndroidStore.read(slot), write(slot,json).
- [ ] Write Node assertions: ingredients consumed exactly once, tools retained, wrong tool no mutation, discovery saved, deterministic failure grants skill, helper reward once after deadline/reload, storage cost locks, legacy migration.
- [ ] Run `node --test tests/game.test.cjs`; observe missing model failure.
- [ ] Implement those interfaces using serializable state and guarded transactions. Persist RNG, jobs, equipment, discoveries, chapters and slots. `reduce` rejects dead/exhausted/capacity-invalid transactions without partial changes.
- [ ] Run Node tests and old Java story tests; both must pass.

### Task 2: Illustrated interactive screens

Files: assets/index.html, assets/style.css, assets/ui.js, assets/art/*.png, tests/ui.test.cjs.
Interfaces: UI dispatches model actions, rerenders only after actions; app exposes read-only snapshot for instrumentation. Shared header, stats, panels, sprite icons, footer navigation. Actual pointer drag and accessible tap alternatives add materials; separate tool selection.
- [ ] Add browser integration tests for tabs, craft, inventory changes, helper selection, upgrade, save/load, viewport overflow. Run before UI exists to observe failures.
- [ ] Build camp/production/recipe screens; verify successful craft changes displayed inventory and journal.
- [ ] Build helper/village/journal/settings; verify real state changes, no decorative dead buttons.
- [ ] Inspect screenshots at 360x640, 390x844, 800x1280 and landscape. Compare layout/art direction to board.

### Task 3: Android integration and delivery

Files: MainActivity.java, SmokeTest.java, device-smoke.sh, android.yml, README.md, app/build.gradle.
- [ ] Replace Android menu tests with WebView instrumentation that clicks DOM and checks persisted results; preserve screenshot collection.
- [ ] Package local assets, restrict navigation and expose only a narrow save bridge. Keep original preference data for migration and rollback.
- [ ] Run build + Node tests + Android35 instrumentation in Actions on feature branch. Fix failures; inspect actual device screenshots.
- [ ] Copy successful APK and screenshots into outputs; report actual coverage and remaining gaps. Keep reference and art prompts in repo.
