# PRIMAL Depth Parity Specification

## Goal

Bring PRIMAL to the same depth class as Dawn of Crafting while keeping original
PRIMAL names, story, art and data. The target is a complete offline Android
crafting RPG, not a screenshot imitation or a shallow list of decorative
recipes.

## Acceptance targets

- 343 unique items, 237 valid recipes, 87 quests and 15 skills in the content registry.
- Every recipe has a valid output, valid inputs, a legal tool requirement and a deterministic success/failure path.
- Every recipe can be reached through the progression graph or explicitly discovered through an event, quest or exploration result.
- Deep recipes consume earlier crafted items; wrong tools, missing inputs, capacity and energy fail atomically.
- Gathering, food, equipment durability, storage, helper missions, village buildings, events, story choices and multiple endings affect one shared save state.
- Three save slots, migration, corruption rejection, offline continuation and new-game-plus are implemented and tested.
- All major screens are real responsive UI controls with no dead buttons; every mutation has a model test and an Android smoke path.
- Android APK is built and uploaded only after Node, Java and emulator tests pass.

## Originality and source boundary

The official Dawn of Crafting feature list is used as a depth benchmark: items,
recipes, quests, skills, resource management, equipment, progression, recipe
book, events, replayability, save slots and achievements. PRIMAL will not copy
their characters, dialogue, item names, art, exact recipes or proprietary text.

## Delivery phases

1. Content registry and recipe graph.
2. Simulation systems and durable saves.
3. Quest/event/skill/equipment progression.
4. Responsive recipe book, inventory, helper, village and map UX.
5. Balance, regression coverage and Android release.
