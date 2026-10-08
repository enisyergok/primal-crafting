# PRIMAL Premium Design System

## Direction

PRIMAL uses a field-guide visual language: warm paper, dark walnut, aged copper and a small moss/water accent palette. The interface should feel like a crafted survival journal rather than a generic card dashboard.

The premium bar is set by four rules:

1. **One hierarchy per screen.** Every screen has one clear title, one primary action and quiet supporting information.
2. **Tactile surfaces.** Cards, controls and the bottom navigation share the same inset highlight, copper edge and soft depth.
3. **Readable at camp.** Touch targets stay at least 44px, text never depends on color alone, and the inventory has both horizontal browsing and search.
4. **Reward the action.** Crafting, gathering, selection and navigation expose focus, press, success and error feedback through the existing sound, haptic and toast layers.

## Tokens

The live tokens are defined at the end of `app/src/main/assets/style.css`. The compact reference is kept in `design-tokens.json`.

| Group | Primary tokens | Use |
| --- | --- | --- |
| Ink | `--ink`, `--ink-soft` | Text and secondary copy |
| Paper | `--paper`, `--paper-hi`, `--paper-low` | Main play surface and cards |
| Wood | `--espresso`, `--walnut`, `--walnut-hi` | App chrome and navigation |
| Metal | `--copper`, `--copper-hi` | Focus, borders and primary actions |
| World | `--moss`, `--water`, `--danger` | State, environment and destructive actions |

## Interaction contract

- Primary actions use the `.wood` treatment; secondary actions use `.secondary`.
- Active navigation exposes `aria-current="page"`; filters expose `aria-pressed`.
- Icon-only controls have an accessible label.
- Dragging is optional: a short tap selects ingredients, horizontal movement scrolls the shelf, and vertical movement can drop into the workbench.
- Reduced motion can be enabled in settings and is also respected through `prefers-reduced-motion`.
