# BotC Storyteller Tracker — Design Spec

## Problem

As a Blood on the Clocktower storyteller, it's hard to remember everything that happened during a game when explaining it to players at the end. Phone notes get messy and unstructured. We need a purpose-built tool that tracks what the storyteller told each player, phase by phase, so they can give a clear recap at the end.

## Solution

A mobile-first PWA (Progressive Web App) for storytellers to track game events in real time. No backend, no persistence across sessions — just a clean UI for the current game that works offline.

## Tech Stack

- **Svelte** — compiles to small vanilla JS bundle, ideal for mobile
- **PWA** with service worker for offline support
- **No backend** — all state in JS memory, backed by sessionStorage so an accidental page refresh doesn't lose the game. State is cleared when the browser tab is closed (no cross-session persistence).
- **Hosted** on GitHub Pages / Netlify / Vercel (free static hosting)
- **Mobile-first** — optimized for phone touch interaction, usable on desktop

## Editions

Trouble Brewing only for v1. Architecture supports adding Bad Moon Rising and Sects & Violets later — role definitions are data-driven so adding an edition means adding a role config, not changing app logic.

## Data Model

```
Game
├── edition: "trouble-brewing"
├── players: [
│     {
│       name: string,
│       role: string,
│       alive: boolean,
│       conditions: ["poisoned" | "drunk"]
│     }
│   ]
├── phases: [
│     {
│       type: "night" | "day",
│       number: number,
│       notes: string,
│       playerActions: [             // night phases
│         { playerName, role, fields: { ...role-specific } }
│       ],
│       deaths: [playerName],        // day phases
│       nominations: [               // day phases
│         {
│           nominator: playerName,
│           nominated: playerName,
│           outcome: "not-enough" | "executed"
│         }
│       ]
│     }
│   ]
```

- Player status (alive/dead, conditions) lives on the player object and persists across phases until changed.
- Role-specific fields are a flexible key/value map per role, making new editions easy to add.

## Screens

### 1. Setup Screen

- Edition selector (Trouble Brewing active, BMR/S&V greyed out)
- Add player form: name text input + role dropdown (pre-populated from edition)
- Player list showing: name, role, team color (blue=townsfolk, yellow=outsider, red=demon/minion)
- "Start Game" button creates Night 1 and navigates to it

### 2. Night Phase

- **Phase pill bar** at top — horizontally scrollable, active phase highlighted in purple. "+" pill to add the next phase (Day N).
- **Player cards** listed in Trouble Brewing night order. Only roles with a relevant night action for this night (first night vs other nights) are shown.
- Each card is **collapsible** (tap to expand/collapse):
  - Header: player name, role (color-coded), status badges (POISONED, DRUNK, DEAD)
  - Expanded: role-specific input fields (see Role Fields below)
  - Status badges are tappable to toggle conditions
- **Left border color** on each card indicates team alignment
- **Freeform notes** textarea at the bottom of the phase

### 3. Day Phase

- Phase pill highlighted in **amber/gold** (vs purple for night — visual distinction)
- **Deaths section** at top — who died overnight
- **Nomination tracker**: add nominations with nominator → nominated dropdowns, toggle outcome (not enough votes / executed)
- **Player status chips** — tap to toggle alive/dead
- **Freeform notes** textarea at the bottom

### 4. Recap (v1)

Scroll through all phases chronologically via the phase pill bar. Each phase displays its notes and player actions. No dedicated recap mode in v1 — just reviewing the phases in order.

## Trouble Brewing Role Fields

Roles with night actions get structured input fields. All other roles are omitted from the night phase player list.

### Every Night

| Role | Fields |
|------|--------|
| Poisoner | Poisoned: [player dropdown] |
| Imp | Killed: [player dropdown] |
| Spy | Notes: [text field] |
| Fortune Teller | Asked about: [player, player], Shown: [Yes / No toggle] |
| Empath | Shown number: [0 / 1 / 2] |
| Monk | Protected: [player dropdown] |
| Butler | Chose master: [player dropdown] |

### First Night Only

| Role | Fields |
|------|--------|
| Washerwoman | Shown: [player, player], Told role: [role dropdown] |
| Librarian | Shown: [player, player], Told role: [role dropdown] |
| Investigator | Shown: [player, player], Told role: [role dropdown] |
| Chef | Shown number: [0 / 1 / 2+] |

### Conditional

| Role | Condition | Fields |
|------|-----------|--------|
| Undertaker | Night after an execution | Shown role: [role dropdown] |
| Ravenkeeper | Night they die | Chose: [player dropdown], Shown role: [role dropdown] |

### No Night Action

Scarlet Woman, Baron, Drunk, Recluse, Saint, Virgin, Slayer, Soldier, Mayor — these have no structured night fields and don't appear in the night player list.

## UI Design Principles

- **Dark theme** — purple/dark blue palette, easy on eyes in dim game rooms
- **Mobile-first** — all touch targets minimum 44px, designed for one-handed phone use
- **Team color coding** — blue (townsfolk), yellow (outsider), red (demon/minion) used consistently
- **Minimal taps** — dropdowns for player/role selection, toggle buttons for yes/no and conditions
- **Collapsible cards** — keep the screen uncluttered, expand only what you need

## Out of Scope (v1)

- Bad Moon Rising / Sects & Violets editions
- Game persistence / history
- Dedicated recap mode
- Traveller roles
- Fabled roles
- Sharing game recaps
- Desktop-optimized layout
