# BotC Storyteller Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first PWA for Blood on the Clocktower storytellers to track game events phase-by-phase for post-game recaps.

**Architecture:** Single-page Svelte app with client-side state only. Game state managed via a Svelte writable store backed by sessionStorage. Role definitions are data-driven — Trouble Brewing roles defined as config objects with field schemas, making future editions easy to add.

**Tech Stack:** Svelte 5, Vite, vitest, vite-plugin-pwa, CSS custom properties for theming.

**Spec:** `docs/superpowers/specs/2026-04-02-botc-storyteller-tracker-design.md`

---

## File Structure

```
botc/
├── package.json
├── vite.config.js
├── svelte.config.js
├── index.html
├── src/
│   ├── main.js
│   ├── App.svelte
│   ├── app.css
│   ├── data/
│   │   └── troubleBrewing.js
│   ├── stores/
│   │   └── game.js
│   └── components/
│       ├── Setup.svelte
│       ├── PhaseBar.svelte
│       ├── NightPhase.svelte
│       ├── DayPhase.svelte
│       ├── PlayerCard.svelte
│       ├── RoleFields.svelte
│       ├── StatusBadge.svelte
│       └── NominationTracker.svelte
├── tests/
│   ├── data/
│   │   └── troubleBrewing.test.js
│   └── stores/
│       └── game.test.js
└── .gitignore
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `svelte.config.js`, `index.html`, `src/main.js`, `src/App.svelte`, `.gitignore`

- [ ] **Step 1: Initialize Svelte project with Vite**

```bash
cd /home/sash/Documents/botc
npm create vite@latest . -- --template svelte
```

If prompted about non-empty directory, proceed (only `docs/` exists).

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install -D vitest vite-plugin-pwa
```

- [ ] **Step 3: Configure vite.config.js**

Replace `vite.config.js`:

```js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BotC Storyteller Tracker',
        short_name: 'BotC Tracker',
        description: 'Track Blood on the Clocktower games for post-game recaps',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 4: Update .gitignore**

Append to `.gitignore`:

```
.superpowers/
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts and Svelte welcome page is accessible. Kill the server after verifying.

- [ ] **Step 6: Add smoke test and verify vitest runs**

Create `tests/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';

describe('smoke test', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

```bash
npx vitest run
```

Expected: 1 test passes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Svelte project with Vite, vitest, and PWA plugin"
```

---

### Task 2: Trouble Brewing Role Data

**Files:**
- Create: `src/data/troubleBrewing.js`, `tests/data/troubleBrewing.test.js`

- [ ] **Step 1: Write failing tests for role data**

Create `tests/data/troubleBrewing.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  ROLES,
  FIRST_NIGHT_ORDER,
  OTHER_NIGHT_ORDER,
  getRoleConfig,
  getRolesForTeam,
} from '../../src/data/troubleBrewing.js';

describe('troubleBrewing role data', () => {
  it('exports all 22 Trouble Brewing roles', () => {
    expect(Object.keys(ROLES)).toHaveLength(22);
  });

  it('every role has name and team', () => {
    for (const [id, role] of Object.entries(ROLES)) {
      expect(role.name, `${id} missing name`).toBeTruthy();
      expect(role.team, `${id} missing team`).toMatch(
        /^(townsfolk|outsider|minion|demon)$/
      );
    }
  });

  it('has correct team counts', () => {
    expect(getRolesForTeam('townsfolk')).toHaveLength(13);
    expect(getRolesForTeam('outsider')).toHaveLength(4);
    expect(getRolesForTeam('minion')).toHaveLength(4);
    expect(getRolesForTeam('demon')).toHaveLength(1);
  });

  it('fortune teller has correct other-night fields', () => {
    const ft = getRoleConfig('fortuneTeller');
    expect(ft.fields.otherNights).toEqual([
      { key: 'player1', label: 'Asked about', type: 'player' },
      { key: 'player2', label: 'And', type: 'player' },
      { key: 'shown', label: 'Shown', type: 'yesno' },
    ]);
  });

  it('washerwoman has first-night-only fields', () => {
    const ww = getRoleConfig('washerwoman');
    expect(ww.fields.firstNight).toBeDefined();
    expect(ww.fields.otherNights).toBeUndefined();
  });

  it('empath has both first and other night fields', () => {
    const em = getRoleConfig('empath');
    expect(em.fields.firstNight).toBeDefined();
    expect(em.fields.otherNights).toBeDefined();
  });

  it('first night order only includes roles with firstNight fields', () => {
    for (const id of FIRST_NIGHT_ORDER) {
      const role = getRoleConfig(id);
      expect(role.fields.firstNight, `${id} in first night order but no firstNight fields`).toBeDefined();
    }
  });

  it('other night order only includes roles with otherNights fields', () => {
    for (const id of OTHER_NIGHT_ORDER) {
      const role = getRoleConfig(id);
      expect(role.fields.otherNights, `${id} in other night order but no otherNights fields`).toBeDefined();
    }
  });

  it('undertaker has afterExecution condition', () => {
    const ut = getRoleConfig('undertaker');
    expect(ut.fields.otherNights).toBeDefined();
    expect(ut.fields.otherNightsCondition).toBe('afterExecution');
  });

  it('ravenkeeper has onDeath condition', () => {
    const rk = getRoleConfig('ravenkeeper');
    expect(rk.fields.otherNights).toBeDefined();
    expect(rk.fields.otherNightsCondition).toBe('onDeath');
  });

  it('getRoleConfig returns undefined for unknown role', () => {
    expect(getRoleConfig('nonexistent')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/data/troubleBrewing.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement role data**

Create `src/data/troubleBrewing.js`:

```js
export const ROLES = {
  // Townsfolk (13)
  washerwoman: {
    name: 'Washerwoman',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'player1', label: 'Shown player', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'toldRole', label: 'Told role', type: 'role' },
      ],
    },
  },
  librarian: {
    name: 'Librarian',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'player1', label: 'Shown player', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'toldRole', label: 'Told role', type: 'role' },
      ],
    },
  },
  investigator: {
    name: 'Investigator',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'player1', label: 'Shown player', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'toldRole', label: 'Told role', type: 'role' },
      ],
    },
  },
  chef: {
    name: 'Chef',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'number', label: 'Shown number', type: 'number', options: [0, 1, 2, 3, 4, 5] },
      ],
    },
  },
  empath: {
    name: 'Empath',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'number', label: 'Shown number', type: 'number', options: [0, 1, 2] },
      ],
      otherNights: [
        { key: 'number', label: 'Shown number', type: 'number', options: [0, 1, 2] },
      ],
    },
  },
  fortuneTeller: {
    name: 'Fortune Teller',
    team: 'townsfolk',
    fields: {
      firstNight: [
        { key: 'player1', label: 'Asked about', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'shown', label: 'Shown', type: 'yesno' },
      ],
      otherNights: [
        { key: 'player1', label: 'Asked about', type: 'player' },
        { key: 'player2', label: 'And', type: 'player' },
        { key: 'shown', label: 'Shown', type: 'yesno' },
      ],
    },
  },
  undertaker: {
    name: 'Undertaker',
    team: 'townsfolk',
    fields: {
      otherNights: [
        { key: 'shownRole', label: 'Shown role', type: 'role' },
      ],
      otherNightsCondition: 'afterExecution',
    },
  },
  monk: {
    name: 'Monk',
    team: 'townsfolk',
    fields: {
      otherNights: [
        { key: 'protected', label: 'Protected', type: 'player' },
      ],
    },
  },
  ravenkeeper: {
    name: 'Ravenkeeper',
    team: 'townsfolk',
    fields: {
      otherNights: [
        { key: 'chose', label: 'Chose', type: 'player' },
        { key: 'shownRole', label: 'Shown role', type: 'role' },
      ],
      otherNightsCondition: 'onDeath',
    },
  },
  virgin: { name: 'Virgin', team: 'townsfolk', fields: {} },
  slayer: { name: 'Slayer', team: 'townsfolk', fields: {} },
  soldier: { name: 'Soldier', team: 'townsfolk', fields: {} },
  mayor: { name: 'Mayor', team: 'townsfolk', fields: {} },

  // Outsiders (4)
  butler: {
    name: 'Butler',
    team: 'outsider',
    fields: {
      firstNight: [
        { key: 'master', label: 'Chose master', type: 'player' },
      ],
      otherNights: [
        { key: 'master', label: 'Chose master', type: 'player' },
      ],
    },
  },
  drunk: { name: 'Drunk', team: 'outsider', fields: {} },
  recluse: { name: 'Recluse', team: 'outsider', fields: {} },
  saint: { name: 'Saint', team: 'outsider', fields: {} },

  // Minions (4)
  poisoner: {
    name: 'Poisoner',
    team: 'minion',
    fields: {
      firstNight: [
        { key: 'poisoned', label: 'Poisoned', type: 'player' },
      ],
      otherNights: [
        { key: 'poisoned', label: 'Poisoned', type: 'player' },
      ],
    },
  },
  spy: {
    name: 'Spy',
    team: 'minion',
    fields: {
      firstNight: [
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
      otherNights: [
        { key: 'notes', label: 'Notes', type: 'text' },
      ],
    },
  },
  scarletWoman: { name: 'Scarlet Woman', team: 'minion', fields: {} },
  baron: { name: 'Baron', team: 'minion', fields: {} },

  // Demon (1)
  imp: {
    name: 'Imp',
    team: 'demon',
    fields: {
      otherNights: [
        { key: 'killed', label: 'Killed', type: 'player' },
      ],
    },
  },
};

export const FIRST_NIGHT_ORDER = [
  'poisoner',
  'washerwoman',
  'librarian',
  'investigator',
  'chef',
  'empath',
  'fortuneTeller',
  'butler',
  'spy',
];

export const OTHER_NIGHT_ORDER = [
  'poisoner',
  'monk',
  'imp',
  'ravenkeeper',
  'fortuneTeller',
  'empath',
  'undertaker',
  'butler',
  'spy',
];

export function getRoleConfig(id) {
  return ROLES[id];
}

export function getRolesForTeam(team) {
  return Object.entries(ROLES)
    .filter(([, role]) => role.team === team)
    .map(([id, role]) => ({ id, ...role }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/data/troubleBrewing.test.js
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/troubleBrewing.js tests/data/troubleBrewing.test.js
git commit -m "feat: add Trouble Brewing role data with night orders and field configs"
```

---

### Task 3: Game Store

**Files:**
- Create: `src/stores/game.js`, `tests/stores/game.test.js`

- [ ] **Step 1: Write failing tests for game store**

Create `tests/stores/game.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { createGameStore } from '../../src/stores/game.js';

describe('game store', () => {
  let store;

  beforeEach(() => {
    sessionStorage.clear();
    store = createGameStore();
  });

  describe('initial state', () => {
    it('starts with empty players and phases', () => {
      const state = get(store);
      expect(state.players).toEqual([]);
      expect(state.phases).toEqual([]);
      expect(state.currentPhaseIndex).toBe(-1);
      expect(state.edition).toBe('trouble-brewing');
      expect(state.started).toBe(false);
    });
  });

  describe('player management', () => {
    it('adds a player', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      const state = get(store);
      expect(state.players).toHaveLength(1);
      expect(state.players[0]).toEqual({
        name: 'Alice',
        role: 'fortuneTeller',
        alive: true,
        conditions: [],
      });
    });

    it('removes a player by name', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.addPlayer('Bob', 'imp');
      store.removePlayer('Alice');
      const state = get(store);
      expect(state.players).toHaveLength(1);
      expect(state.players[0].name).toBe('Bob');
    });

    it('toggles player alive status', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.toggleAlive('Alice');
      expect(get(store).players[0].alive).toBe(false);
      store.toggleAlive('Alice');
      expect(get(store).players[0].alive).toBe(true);
    });

    it('toggles a condition on a player', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.toggleCondition('Alice', 'poisoned');
      expect(get(store).players[0].conditions).toEqual(['poisoned']);
      store.toggleCondition('Alice', 'poisoned');
      expect(get(store).players[0].conditions).toEqual([]);
    });

    it('supports multiple conditions', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.toggleCondition('Alice', 'poisoned');
      store.toggleCondition('Alice', 'drunk');
      expect(get(store).players[0].conditions).toEqual(['poisoned', 'drunk']);
    });
  });

  describe('phase management', () => {
    it('startGame creates Night 1 and sets started', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame();
      const state = get(store);
      expect(state.started).toBe(true);
      expect(state.phases).toHaveLength(1);
      expect(state.phases[0]).toEqual({
        type: 'night',
        number: 1,
        notes: '',
        playerActions: {},
        deaths: [],
        nominations: [],
      });
      expect(state.currentPhaseIndex).toBe(0);
    });

    it('addPhase alternates night/day', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame(); // Night 1
      store.addPhase();  // Day 1
      store.addPhase();  // Night 2
      const state = get(store);
      expect(state.phases).toHaveLength(3);
      expect(state.phases[0].type).toBe('night');
      expect(state.phases[0].number).toBe(1);
      expect(state.phases[1].type).toBe('day');
      expect(state.phases[1].number).toBe(1);
      expect(state.phases[2].type).toBe('night');
      expect(state.phases[2].number).toBe(2);
    });

    it('addPhase navigates to the new phase', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame();
      store.addPhase();
      expect(get(store).currentPhaseIndex).toBe(1);
    });

    it('setCurrentPhase changes the active phase', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame();
      store.addPhase();
      store.setCurrentPhase(0);
      expect(get(store).currentPhaseIndex).toBe(0);
    });
  });

  describe('phase actions', () => {
    it('setPlayerAction stores role-specific field data', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame();
      store.setPlayerAction(0, 'Alice', { player1: 'Bob', player2: 'Charlie', shown: 'yes' });
      const state = get(store);
      expect(state.phases[0].playerActions['Alice']).toEqual({
        player1: 'Bob',
        player2: 'Charlie',
        shown: 'yes',
      });
    });

    it('setPhaseNotes updates notes for a phase', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame();
      store.setPhaseNotes(0, 'Poisoner targeted Alice');
      expect(get(store).phases[0].notes).toBe('Poisoner targeted Alice');
    });

    it('addNomination adds to the phase', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.addPlayer('Bob', 'imp');
      store.startGame();
      store.addPhase(); // Day 1
      store.addNomination(1, 'Alice', 'Bob');
      const state = get(store);
      expect(state.phases[1].nominations).toHaveLength(1);
      expect(state.phases[1].nominations[0]).toEqual({
        nominator: 'Alice',
        nominated: 'Bob',
        outcome: 'not-enough',
      });
    });

    it('setNominationOutcome updates outcome', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.addPlayer('Bob', 'imp');
      store.startGame();
      store.addPhase();
      store.addNomination(1, 'Alice', 'Bob');
      store.setNominationOutcome(1, 0, 'executed');
      expect(get(store).phases[1].nominations[0].outcome).toBe('executed');
    });

    it('addDeath records a death in a phase', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame();
      store.addPhase();
      store.addDeath(1, 'Alice');
      expect(get(store).phases[1].deaths).toEqual(['Alice']);
    });
  });

  describe('sessionStorage backing', () => {
    it('persists state to sessionStorage', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      const stored = JSON.parse(sessionStorage.getItem('botc-game'));
      expect(stored.players).toHaveLength(1);
      expect(stored.players[0].name).toBe('Alice');
    });

    it('restores state from sessionStorage', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame();
      const newStore = createGameStore();
      const state = get(newStore);
      expect(state.players).toHaveLength(1);
      expect(state.started).toBe(true);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      store.addPlayer('Alice', 'fortuneTeller');
      store.startGame();
      store.reset();
      const state = get(store);
      expect(state.players).toEqual([]);
      expect(state.phases).toEqual([]);
      expect(state.started).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/stores/game.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement game store**

Create `src/stores/game.js`:

```js
import { writable } from 'svelte/store';

const STORAGE_KEY = 'botc-game';

const INITIAL_STATE = {
  edition: 'trouble-brewing',
  players: [],
  phases: [],
  currentPhaseIndex: -1,
  started: false,
};

function loadState() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function createGameStore() {
  const initial = loadState() || { ...INITIAL_STATE, players: [], phases: [] };
  const { subscribe, set, update } = writable(initial);

  subscribe((state) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage full or unavailable — silently ignore
    }
  });

  function addPlayer(name, role) {
    update((s) => ({
      ...s,
      players: [...s.players, { name, role, alive: true, conditions: [] }],
    }));
  }

  function removePlayer(name) {
    update((s) => ({
      ...s,
      players: s.players.filter((p) => p.name !== name),
    }));
  }

  function toggleAlive(name) {
    update((s) => ({
      ...s,
      players: s.players.map((p) =>
        p.name === name ? { ...p, alive: !p.alive } : p
      ),
    }));
  }

  function toggleCondition(name, condition) {
    update((s) => ({
      ...s,
      players: s.players.map((p) => {
        if (p.name !== name) return p;
        const has = p.conditions.includes(condition);
        return {
          ...p,
          conditions: has
            ? p.conditions.filter((c) => c !== condition)
            : [...p.conditions, condition],
        };
      }),
    }));
  }

  function startGame() {
    update((s) => ({
      ...s,
      started: true,
      phases: [
        {
          type: 'night',
          number: 1,
          notes: '',
          playerActions: {},
          deaths: [],
          nominations: [],
        },
      ],
      currentPhaseIndex: 0,
    }));
  }

  function addPhase() {
    update((s) => {
      const last = s.phases[s.phases.length - 1];
      const isDay = last.type === 'night';
      const number = isDay ? last.number : last.number + 1;
      const newPhase = {
        type: isDay ? 'day' : 'night',
        number,
        notes: '',
        playerActions: {},
        deaths: [],
        nominations: [],
      };
      const phases = [...s.phases, newPhase];
      return { ...s, phases, currentPhaseIndex: phases.length - 1 };
    });
  }

  function setCurrentPhase(index) {
    update((s) => ({ ...s, currentPhaseIndex: index }));
  }

  function setPlayerAction(phaseIndex, playerName, fields) {
    update((s) => {
      const phases = s.phases.map((phase, i) => {
        if (i !== phaseIndex) return phase;
        return {
          ...phase,
          playerActions: { ...phase.playerActions, [playerName]: fields },
        };
      });
      return { ...s, phases };
    });
  }

  function setPhaseNotes(phaseIndex, notes) {
    update((s) => {
      const phases = s.phases.map((phase, i) =>
        i === phaseIndex ? { ...phase, notes } : phase
      );
      return { ...s, phases };
    });
  }

  function addNomination(phaseIndex, nominator, nominated) {
    update((s) => {
      const phases = s.phases.map((phase, i) => {
        if (i !== phaseIndex) return phase;
        return {
          ...phase,
          nominations: [
            ...phase.nominations,
            { nominator, nominated, outcome: 'not-enough' },
          ],
        };
      });
      return { ...s, phases };
    });
  }

  function setNominationOutcome(phaseIndex, nominationIndex, outcome) {
    update((s) => {
      const phases = s.phases.map((phase, i) => {
        if (i !== phaseIndex) return phase;
        const nominations = phase.nominations.map((nom, j) =>
          j === nominationIndex ? { ...nom, outcome } : nom
        );
        return { ...phase, nominations };
      });
      return { ...s, phases };
    });
  }

  function addDeath(phaseIndex, playerName) {
    update((s) => {
      const phases = s.phases.map((phase, i) => {
        if (i !== phaseIndex) return phase;
        return { ...phase, deaths: [...phase.deaths, playerName] };
      });
      return { ...s, phases };
    });
  }

  function reset() {
    set({ ...INITIAL_STATE, players: [], phases: [] });
  }

  return {
    subscribe,
    addPlayer,
    removePlayer,
    toggleAlive,
    toggleCondition,
    startGame,
    addPhase,
    setCurrentPhase,
    setPlayerAction,
    setPhaseNotes,
    addNomination,
    setNominationOutcome,
    addDeath,
    reset,
  };
}

export const game = createGameStore();
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/stores/game.test.js
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/stores/game.js tests/stores/game.test.js
git commit -m "feat: add game state store with sessionStorage backing"
```

---

### Task 4: App Shell & Dark Theme

**Files:**
- Modify: `src/App.svelte`, `src/main.js`, `index.html`
- Create: `src/app.css`

- [ ] **Step 1: Create global dark theme CSS**

Create `src/app.css`:

```css
:root {
  --bg-primary: #1a1a2e;
  --bg-secondary: #2a2a4a;
  --bg-header: #12122a;
  --text-primary: #e0e0e0;
  --text-secondary: #888;
  --accent-purple: #7c3aed;
  --accent-purple-hover: #6d28d9;
  --accent-amber: #f59e0b;
  --color-townsfolk: #60a5fa;
  --color-outsider: #fbbf24;
  --color-minion: #ef4444;
  --color-demon: #f87171;
  --color-alive: #4ade80;
  --color-dead: #991b1b;
  --border-color: #444;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-pill: 16px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.4;
  min-height: 100dvh;
  -webkit-tap-highlight-color: transparent;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
  font-size: inherit;
}

select, input, textarea {
  font-family: inherit;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px;
}

select:focus, input:focus, textarea:focus {
  outline: 2px solid var(--accent-purple);
  outline-offset: -1px;
}

textarea {
  resize: vertical;
  min-height: 80px;
  width: 100%;
}

.label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.btn-primary {
  background: var(--accent-purple);
  color: white;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.btn-primary:active {
  background: var(--accent-purple-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.team-townsfolk { color: var(--color-townsfolk); }
.team-outsider { color: var(--color-outsider); }
.team-minion { color: var(--color-minion); }
.team-demon { color: var(--color-demon); }

.border-townsfolk { border-left: 3px solid var(--color-townsfolk); }
.border-outsider { border-left: 3px solid var(--color-outsider); }
.border-minion { border-left: 3px solid var(--color-minion); }
.border-demon { border-left: 3px solid var(--color-demon); }
```

- [ ] **Step 2: Update index.html for mobile viewport**

Replace `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#1a1a2e" />
    <title>BotC Tracker</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Update main.js and App.svelte**

Replace `src/main.js`:

```js
import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';

const app = mount(App, { target: document.getElementById('app') });

export default app;
```

Replace `src/App.svelte`:

```svelte
<script>
  import { game } from './stores/game.js';
  import Setup from './components/Setup.svelte';

  let state = $derived.by(() => {
    let s;
    game.subscribe(v => s = v)();
    return s;
  });
</script>

{#if !state.started}
  <Setup />
{:else}
  <div class="game">
    <p style="padding: 16px; color: var(--text-secondary);">Game started — phase screens coming next.</p>
  </div>
{/if}
```

- [ ] **Step 4: Create placeholder Setup component**

Create `src/components/Setup.svelte`:

```svelte
<div class="setup">
  <p>Setup screen placeholder</p>
</div>
```

- [ ] **Step 5: Verify app renders with dark theme**

```bash
npm run dev
```

Expected: Dark background, "Setup screen placeholder" text visible. Kill server after verifying.

- [ ] **Step 6: Commit**

```bash
git add src/app.css src/main.js src/App.svelte src/components/Setup.svelte index.html
git commit -m "feat: add app shell with dark theme and mobile viewport"
```

---

### Task 5: Setup Screen

**Files:**
- Modify: `src/components/Setup.svelte`

- [ ] **Step 1: Implement Setup component**

Replace `src/components/Setup.svelte`:

```svelte
<script>
  import { game } from '../stores/game.js';
  import { ROLES, getRolesForTeam } from '../data/troubleBrewing.js';

  let playerName = $state('');
  let selectedRole = $state('');
  let players = $state([]);

  game.subscribe((s) => {
    players = s.players;
  });

  const allRoles = Object.entries(ROLES).map(([id, r]) => ({ id, ...r }));
  const usedRoles = $derived(new Set(players.map((p) => p.role)));
  const availableRoles = $derived(allRoles.filter((r) => !usedRoles.has(r.id)));

  function addPlayer() {
    const name = playerName.trim();
    if (!name || !selectedRole) return;
    game.addPlayer(name, selectedRole);
    playerName = '';
    selectedRole = '';
  }

  function removePlayer(name) {
    game.removePlayer(name);
  }

  function teamLabel(team) {
    return { townsfolk: 'TF', outsider: 'OS', minion: 'MI', demon: 'DE' }[team];
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') addPlayer();
  }
</script>

<div class="setup">
  <header class="setup-header">
    <h1>Blood on the Clocktower</h1>
    <p>Storyteller Tracker</p>
  </header>

  <section class="setup-section">
    <div class="label">Edition</div>
    <div class="edition-picker">
      <button class="edition-btn active">Trouble Brewing</button>
      <button class="edition-btn" disabled>BMR</button>
      <button class="edition-btn" disabled>S&V</button>
    </div>
  </section>

  <section class="setup-section">
    <div class="label">Add Player</div>
    <div class="add-player-row">
      <input
        type="text"
        placeholder="Player name..."
        bind:value={playerName}
        onkeydown={handleKeydown}
      />
      <select bind:value={selectedRole}>
        <option value="">-- Role --</option>
        {#each availableRoles as role}
          <option value={role.id}>{role.name}</option>
        {/each}
      </select>
      <button class="btn-primary" onclick={addPlayer} disabled={!playerName.trim() || !selectedRole}>+</button>
    </div>
  </section>

  {#if players.length > 0}
    <section class="setup-section">
      <div class="label">Players ({players.length})</div>
      <div class="player-list">
        {#each players as player}
          <div class="player-row">
            <div class="player-dot team-{ROLES[player.role]?.team}">●</div>
            <div class="player-name">{player.name}</div>
            <div class="player-role team-{ROLES[player.role]?.team}">
              {ROLES[player.role]?.name}
            </div>
            <div class="player-team">{teamLabel(ROLES[player.role]?.team)}</div>
            <button class="remove-btn" onclick={() => removePlayer(player.name)}>✕</button>
          </div>
        {/each}
      </div>
    </section>

    <button class="btn-primary start-btn" onclick={() => game.startGame()}>
      Start Game →
    </button>
  {/if}
</div>

<style>
  .setup {
    max-width: 480px;
    margin: 0 auto;
    padding: 16px;
  }

  .setup-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .setup-header h1 {
    font-size: 20px;
    color: #c4b5fd;
  }

  .setup-header p {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .setup-section {
    margin-bottom: 16px;
  }

  .edition-picker {
    display: flex;
    gap: 8px;
  }

  .edition-btn {
    flex: 1;
    padding: 8px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 13px;
  }

  .edition-btn.active {
    background: var(--accent-purple);
    color: white;
    font-weight: 600;
  }

  .edition-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .add-player-row {
    display: flex;
    gap: 8px;
  }

  .add-player-row input {
    flex: 1;
    min-width: 0;
  }

  .add-player-row select {
    width: 140px;
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .player-row {
    display: flex;
    align-items: center;
    background: var(--bg-secondary);
    padding: 10px 12px;
    border-radius: var(--radius-md);
    gap: 10px;
  }

  .player-dot {
    font-size: 10px;
  }

  .player-name {
    flex: 1;
    font-size: 14px;
  }

  .player-role {
    font-size: 12px;
  }

  .player-team {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .remove-btn {
    background: none;
    color: var(--text-secondary);
    font-size: 14px;
    padding: 4px 8px;
  }

  .start-btn {
    width: 100%;
    margin-top: 20px;
    padding: 14px;
    font-size: 16px;
    border-radius: var(--radius-lg);
  }
</style>
```

- [ ] **Step 2: Verify setup screen works**

```bash
npm run dev
```

Expected: Edition selector visible (TB active, others greyed out). Can type a player name, select a role, tap "+" to add. Player appears in list with team color. "Start Game" button appears when at least one player is added. Kill server after verifying.

- [ ] **Step 3: Commit**

```bash
git add src/components/Setup.svelte
git commit -m "feat: implement setup screen with player/role management"
```

---

### Task 6: Phase Navigation Bar

**Files:**
- Create: `src/components/PhaseBar.svelte`
- Modify: `src/App.svelte`

- [ ] **Step 1: Implement PhaseBar component**

Create `src/components/PhaseBar.svelte`:

```svelte
<script>
  import { game } from '../stores/game.js';

  let phases = $state([]);
  let currentPhaseIndex = $state(0);

  game.subscribe((s) => {
    phases = s.phases;
    currentPhaseIndex = s.currentPhaseIndex;
  });

  function nextPhaseLabel() {
    if (phases.length === 0) return '+ Night 1';
    const last = phases[phases.length - 1];
    if (last.type === 'night') return `+ Day ${last.number}`;
    return `+ Night ${last.number + 1}`;
  }
</script>

<nav class="phase-bar">
  <button
    class="phase-pill setup-pill"
    class:active={false}
    onclick={() => {/* setup is a separate screen, no-op */}}
  >
    Setup
  </button>

  {#each phases as phase, i}
    <button
      class="phase-pill"
      class:active={i === currentPhaseIndex}
      class:night={phase.type === 'night'}
      class:day={phase.type === 'day'}
      onclick={() => game.setCurrentPhase(i)}
    >
      {phase.type === 'night' ? 'Night' : 'Day'} {phase.number}
    </button>
  {/each}

  <button class="phase-pill add-pill" onclick={() => game.addPhase()}>
    {nextPhaseLabel()}
  </button>
</nav>

<style>
  .phase-bar {
    display: flex;
    background: var(--bg-header);
    padding: 8px;
    gap: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .phase-bar::-webkit-scrollbar {
    display: none;
  }

  .phase-pill {
    padding: 6px 14px;
    background: var(--bg-secondary);
    border-radius: var(--radius-pill);
    font-size: 12px;
    white-space: nowrap;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .phase-pill.active.night {
    background: var(--accent-purple);
    color: white;
    font-weight: 600;
  }

  .phase-pill.active.day {
    background: var(--accent-amber);
    color: var(--bg-primary);
    font-weight: 600;
  }

  .add-pill {
    border: 1px dashed var(--border-color);
    background: transparent;
  }

  .setup-pill {
    color: var(--text-secondary);
  }
</style>
```

- [ ] **Step 2: Wire PhaseBar into App.svelte**

Replace `src/App.svelte`:

```svelte
<script>
  import { game } from './stores/game.js';
  import Setup from './components/Setup.svelte';
  import PhaseBar from './components/PhaseBar.svelte';

  let state = $state({ started: false, phases: [], currentPhaseIndex: -1 });

  game.subscribe((s) => {
    state = s;
  });

  $derived.by(() => {
    // keep state reactive
    return state;
  });

  function currentPhase() {
    if (state.currentPhaseIndex < 0) return null;
    return state.phases[state.currentPhaseIndex];
  }
</script>

{#if !state.started}
  <Setup />
{:else}
  <PhaseBar />
  <main class="phase-content">
    {#if currentPhase()}
      <p style="padding: 16px; color: var(--text-secondary);">
        {currentPhase().type === 'night' ? 'Night' : 'Day'} {currentPhase().number} — phase content coming next.
      </p>
    {/if}
  </main>
{/if}

<style>
  .phase-content {
    max-width: 480px;
    margin: 0 auto;
  }
</style>
```

- [ ] **Step 3: Verify phase bar works**

```bash
npm run dev
```

Expected: After adding players and clicking "Start Game", phase bar appears with "Night 1" active (purple). "+" pill shows "Day 1". Clicking "+" adds Day 1 (amber). Can click between phases. Kill server after verifying.

- [ ] **Step 4: Commit**

```bash
git add src/components/PhaseBar.svelte src/App.svelte
git commit -m "feat: add phase navigation bar with night/day pill switching"
```

---

### Task 7: Night Phase Screen

**Files:**
- Create: `src/components/NightPhase.svelte`, `src/components/PlayerCard.svelte`, `src/components/RoleFields.svelte`, `src/components/StatusBadge.svelte`
- Modify: `src/App.svelte`

- [ ] **Step 1: Implement StatusBadge component**

Create `src/components/StatusBadge.svelte`:

```svelte
<script>
  let { condition, onclick } = $props();

  const styles = {
    poisoned: { bg: '#7c2d12', color: '#fdba74', label: 'POISONED' },
    drunk: { bg: '#713f12', color: '#fde68a', label: 'DRUNK' },
    dead: { bg: '#991b1b', color: '#fca5a5', label: 'DEAD' },
  };

  const style = $derived(styles[condition] || { bg: '#333', color: '#888', label: condition.toUpperCase() });
</script>

<button
  class="badge"
  style="background:{style.bg}; color:{style.color};"
  onclick={onclick}
>
  {style.label}
</button>

<style>
  .badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 2: Implement RoleFields component**

Create `src/components/RoleFields.svelte`:

```svelte
<script>
  import { game } from '../stores/game.js';
  import { ROLES } from '../data/troubleBrewing.js';

  let { phaseIndex, playerName, fields, players, values = {} } = $props();

  function updateField(key, value) {
    const updated = { ...values, [key]: value };
    game.setPlayerAction(phaseIndex, playerName, updated);
  }

  const allRoleNames = Object.values(ROLES).map((r) => r.name);
</script>

<div class="role-fields">
  {#each fields as field}
    <div class="field-row">
      <div class="label">{field.label}</div>

      {#if field.type === 'player'}
        <select
          value={values[field.key] || ''}
          onchange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">-- Select player --</option>
          {#each players as p}
            <option value={p.name}>{p.name}</option>
          {/each}
        </select>

      {:else if field.type === 'role'}
        <select
          value={values[field.key] || ''}
          onchange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">-- Select role --</option>
          {#each allRoleNames as roleName}
            <option value={roleName}>{roleName}</option>
          {/each}
        </select>

      {:else if field.type === 'yesno'}
        <div class="yesno-toggle">
          <button
            class="toggle-btn"
            class:active={values[field.key] === 'yes'}
            onclick={() => updateField(field.key, 'yes')}
          >Yes</button>
          <button
            class="toggle-btn"
            class:active={values[field.key] === 'no'}
            onclick={() => updateField(field.key, 'no')}
          >No</button>
        </div>

      {:else if field.type === 'number'}
        <div class="number-options">
          {#each field.options as opt}
            <button
              class="toggle-btn"
              class:active={values[field.key] === String(opt)}
              onclick={() => updateField(field.key, String(opt))}
            >{opt}</button>
          {/each}
        </div>

      {:else if field.type === 'text'}
        <input
          type="text"
          value={values[field.key] || ''}
          placeholder="Notes..."
          oninput={(e) => updateField(field.key, e.target.value)}
        />
      {/if}
    </div>
  {/each}
</div>

<style>
  .role-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-row select, .field-row input {
    width: 100%;
  }

  .yesno-toggle, .number-options {
    display: flex;
    gap: 8px;
  }

  .toggle-btn {
    flex: 1;
    padding: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 13px;
  }

  .toggle-btn.active {
    background: var(--accent-purple);
    color: white;
    font-weight: 600;
    border-color: var(--accent-purple);
  }
</style>
```

- [ ] **Step 3: Implement PlayerCard component**

Create `src/components/PlayerCard.svelte`:

```svelte
<script>
  import { game } from '../stores/game.js';
  import { ROLES } from '../data/troubleBrewing.js';
  import RoleFields from './RoleFields.svelte';
  import StatusBadge from './StatusBadge.svelte';

  let { player, phaseIndex, fields, players, values = {} } = $props();

  let expanded = $state(false);

  const role = $derived(ROLES[player.role]);
  const team = $derived(role?.team || 'townsfolk');
</script>

<div class="player-card border-{team}">
  <button class="card-header" onclick={() => expanded = !expanded}>
    <div class="card-info">
      <span class="card-name">{player.name}</span>
      <span class="card-role team-{team}">{role?.name}</span>
    </div>
    <div class="card-badges">
      {#if !player.alive}
        <StatusBadge condition="dead" onclick={(e) => { e.stopPropagation(); game.toggleAlive(player.name); }} />
      {/if}
      {#each player.conditions as cond}
        <StatusBadge condition={cond} onclick={(e) => { e.stopPropagation(); game.toggleCondition(player.name, cond); }} />
      {/each}
    </div>
    <span class="expand-icon">{expanded ? '▾' : '▸'}</span>
  </button>

  {#if expanded}
    <div class="card-body">
      <div class="condition-toggles">
        <div class="label">Status</div>
        <div class="toggle-row">
          <button
            class="condition-btn"
            class:active={player.conditions.includes('poisoned')}
            onclick={() => game.toggleCondition(player.name, 'poisoned')}
          >Poisoned</button>
          <button
            class="condition-btn"
            class:active={player.conditions.includes('drunk')}
            onclick={() => game.toggleCondition(player.name, 'drunk')}
          >Drunk</button>
          <button
            class="condition-btn dead"
            class:active={!player.alive}
            onclick={() => game.toggleAlive(player.name)}
          >Dead</button>
        </div>
      </div>

      {#if fields && fields.length > 0}
        <RoleFields {phaseIndex} playerName={player.name} {fields} {players} {values} />
      {/if}
    </div>
  {/if}
</div>

<style>
  .player-card {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    margin-bottom: 8px;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    gap: 8px;
    width: 100%;
    background: none;
    color: var(--text-primary);
    text-align: left;
  }

  .card-info {
    flex: 1;
    min-width: 0;
  }

  .card-name {
    font-size: 14px;
    font-weight: 600;
    margin-right: 8px;
  }

  .card-role {
    font-size: 12px;
  }

  .card-badges {
    display: flex;
    gap: 4px;
  }

  .expand-icon {
    color: var(--text-secondary);
    font-size: 18px;
  }

  .card-body {
    padding: 0 12px 12px;
    border-top: 1px solid #333;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
  }

  .toggle-row {
    display: flex;
    gap: 6px;
  }

  .condition-btn {
    flex: 1;
    padding: 6px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: 12px;
  }

  .condition-btn.active {
    background: #7c2d12;
    color: #fdba74;
    border-color: #7c2d12;
  }

  .condition-btn.dead.active {
    background: #991b1b;
    color: #fca5a5;
    border-color: #991b1b;
  }
</style>
```

- [ ] **Step 4: Implement NightPhase component**

Create `src/components/NightPhase.svelte`:

```svelte
<script>
  import { game } from '../stores/game.js';
  import { ROLES, FIRST_NIGHT_ORDER, OTHER_NIGHT_ORDER, getRoleConfig } from '../data/troubleBrewing.js';
  import PlayerCard from './PlayerCard.svelte';

  let { phase, phaseIndex, players } = $props();

  const isFirstNight = $derived(phase.number === 1);
  const nightOrder = $derived(isFirstNight ? FIRST_NIGHT_ORDER : OTHER_NIGHT_ORDER);

  const orderedPlayers = $derived(() => {
    const roleToPlayer = {};
    for (const p of players) {
      roleToPlayer[p.role] = p;
    }

    const ordered = [];
    for (const roleId of nightOrder) {
      const player = roleToPlayer[roleId];
      if (!player) continue;

      const config = getRoleConfig(roleId);
      const fields = isFirstNight ? config.fields.firstNight : config.fields.otherNights;
      if (!fields) continue;

      ordered.push({ player, fields });
    }
    return ordered;
  });

  function handleNotes(e) {
    game.setPhaseNotes(phaseIndex, e.target.value);
  }
</script>

<div class="night-phase">
  <div class="label">Players (night order)</div>

  {#each orderedPlayers() as { player, fields }}
    <PlayerCard
      {player}
      {phaseIndex}
      {fields}
      {players}
      values={phase.playerActions[player.name] || {}}
    />
  {/each}

  {#if orderedPlayers().length === 0}
    <p class="empty-msg">No roles with night actions for this night.</p>
  {/if}

  <div class="notes-section">
    <div class="label">Night {phase.number} Notes</div>
    <textarea
      value={phase.notes}
      placeholder="What happened this night..."
      oninput={handleNotes}
    ></textarea>
  </div>
</div>

<style>
  .night-phase {
    padding: 16px;
  }

  .notes-section {
    margin-top: 16px;
  }

  .empty-msg {
    color: var(--text-secondary);
    font-size: 13px;
    padding: 20px;
    text-align: center;
  }
</style>
```

- [ ] **Step 5: Wire NightPhase into App.svelte**

Replace `src/App.svelte`:

```svelte
<script>
  import { game } from './stores/game.js';
  import Setup from './components/Setup.svelte';
  import PhaseBar from './components/PhaseBar.svelte';
  import NightPhase from './components/NightPhase.svelte';

  let state = $state({ started: false, phases: [], currentPhaseIndex: -1, players: [] });

  game.subscribe((s) => {
    state = s;
  });

  const currentPhase = $derived(
    state.currentPhaseIndex >= 0 ? state.phases[state.currentPhaseIndex] : null
  );
</script>

{#if !state.started}
  <Setup />
{:else}
  <PhaseBar />
  <main class="phase-content">
    {#if currentPhase?.type === 'night'}
      <NightPhase
        phase={currentPhase}
        phaseIndex={state.currentPhaseIndex}
        players={state.players}
      />
    {:else if currentPhase?.type === 'day'}
      <p style="padding: 16px; color: var(--text-secondary);">
        Day {currentPhase.number} — day phase coming next.
      </p>
    {/if}
  </main>
{/if}

<style>
  .phase-content {
    max-width: 480px;
    margin: 0 auto;
  }
</style>
```

- [ ] **Step 6: Verify night phase works**

```bash
npm run dev
```

Expected: After setup, Night 1 shows player cards in night order. Only roles with first-night actions appear. Tapping a card expands it showing status toggles and role-specific fields. Fortune Teller shows two player dropdowns and Yes/No toggle. Empath shows number picker. Notes textarea at bottom. Kill server after verifying.

- [ ] **Step 7: Commit**

```bash
git add src/components/StatusBadge.svelte src/components/RoleFields.svelte src/components/PlayerCard.svelte src/components/NightPhase.svelte src/App.svelte
git commit -m "feat: implement night phase with collapsible player cards and role-specific fields"
```

---

### Task 8: Day Phase Screen

**Files:**
- Create: `src/components/DayPhase.svelte`, `src/components/NominationTracker.svelte`
- Modify: `src/App.svelte`

- [ ] **Step 1: Implement NominationTracker component**

Create `src/components/NominationTracker.svelte`:

```svelte
<script>
  import { game } from '../stores/game.js';

  let { phaseIndex, nominations, players } = $props();

  let nominator = $state('');
  let nominated = $state('');

  function addNomination() {
    if (!nominator || !nominated) return;
    game.addNomination(phaseIndex, nominator, nominated);
    nominator = '';
    nominated = '';
  }

  function toggleOutcome(index, current) {
    const next = current === 'not-enough' ? 'executed' : 'not-enough';
    game.setNominationOutcome(phaseIndex, index, next);
  }
</script>

<div class="nominations">
  <div class="label">Nominations</div>

  {#each nominations as nom, i}
    <div class="nom-row">
      <div class="nom-text">
        <strong>{nom.nominator}</strong> nominated <strong>{nom.nominated}</strong>
      </div>
      <button
        class="outcome-btn"
        class:executed={nom.outcome === 'executed'}
        onclick={() => toggleOutcome(i, nom.outcome)}
      >
        {nom.outcome === 'executed' ? 'EXECUTED' : 'Not enough votes'}
      </button>
    </div>
  {/each}

  <div class="add-nom-row">
    <select bind:value={nominator}>
      <option value="">Nominator...</option>
      {#each players as p}
        <option value={p.name}>{p.name}</option>
      {/each}
    </select>
    <span class="arrow">→</span>
    <select bind:value={nominated}>
      <option value="">Nominated...</option>
      {#each players as p}
        <option value={p.name}>{p.name}</option>
      {/each}
    </select>
    <button class="btn-primary" onclick={addNomination} disabled={!nominator || !nominated}>+</button>
  </div>
</div>

<style>
  .nominations {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nom-row {
    display: flex;
    align-items: center;
    background: var(--bg-secondary);
    padding: 10px 12px;
    border-radius: var(--radius-md);
    gap: 8px;
  }

  .nom-text {
    flex: 1;
    font-size: 13px;
  }

  .outcome-btn {
    padding: 2px 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 11px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .outcome-btn.executed {
    background: var(--accent-purple);
    color: white;
    border-color: var(--accent-purple);
  }

  .add-nom-row {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    align-items: center;
  }

  .add-nom-row select {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    padding: 8px;
  }

  .arrow {
    color: var(--text-secondary);
    flex-shrink: 0;
  }
</style>
```

- [ ] **Step 2: Implement DayPhase component**

Create `src/components/DayPhase.svelte`:

```svelte
<script>
  import { game } from '../stores/game.js';
  import { ROLES } from '../data/troubleBrewing.js';
  import NominationTracker from './NominationTracker.svelte';

  let { phase, phaseIndex, players } = $props();

  function handleNotes(e) {
    game.setPhaseNotes(phaseIndex, e.target.value);
  }

  function addDeath(playerName) {
    if (!playerName) return;
    game.addDeath(phaseIndex, playerName);
  }

  const alivePlayers = $derived(players.filter((p) => p.alive));
  const deadNotListed = $derived(
    players.filter((p) => !p.alive && !phase.deaths.includes(p.name))
  );
</script>

<div class="day-phase">
  {#if phase.deaths.length > 0}
    <section>
      <div class="label">Deaths announced</div>
      {#each phase.deaths as name}
        {@const player = players.find((p) => p.name === name)}
        <div class="death-row">
          <span class="death-name">{name}</span>
          {#if player}
            <span class="death-role team-{ROLES[player.role]?.team}">
              {ROLES[player.role]?.name}
            </span>
          {/if}
        </div>
      {/each}
    </section>
  {/if}

  <section>
    <div class="label">Announce death</div>
    <select onchange={(e) => { addDeath(e.target.value); e.target.value = ''; }}>
      <option value="">-- Select player --</option>
      {#each players.filter(p => p.alive) as p}
        <option value={p.name}>{p.name}</option>
      {/each}
    </select>
  </section>

  <section>
    <NominationTracker {phaseIndex} nominations={phase.nominations} {players} />
  </section>

  <section>
    <div class="label">Player Status</div>
    <div class="status-chips">
      {#each players as player}
        <button
          class="status-chip"
          class:dead={!player.alive}
          onclick={() => game.toggleAlive(player.name)}
        >
          {player.name}
          <span class="status-indicator" class:alive={player.alive}>
            {player.alive ? 'ALIVE' : 'DEAD'}
          </span>
        </button>
      {/each}
    </div>
    <p class="hint">Tap to toggle alive/dead</p>
  </section>

  <section>
    <div class="label">Day {phase.number} Notes</div>
    <textarea
      value={phase.notes}
      placeholder="What happened this day..."
      oninput={handleNotes}
    ></textarea>
  </section>
</div>

<style>
  .day-phase {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .death-row {
    display: flex;
    align-items: center;
    background: var(--bg-secondary);
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-dead);
    gap: 10px;
    margin-bottom: 6px;
  }

  .death-name {
    flex: 1;
    font-size: 14px;
  }

  .death-role {
    font-size: 12px;
  }

  .status-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .status-chip {
    display: flex;
    align-items: center;
    background: var(--bg-secondary);
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    gap: 6px;
    font-size: 13px;
    color: var(--text-primary);
  }

  .status-chip.dead {
    opacity: 0.5;
    text-decoration: line-through;
  }

  .status-indicator {
    font-size: 11px;
    color: var(--color-dead);
  }

  .status-indicator.alive {
    color: var(--color-alive);
  }

  .hint {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  section select {
    width: 100%;
  }
</style>
```

- [ ] **Step 3: Wire DayPhase into App.svelte**

In `src/App.svelte`, replace the day placeholder. The full file:

```svelte
<script>
  import { game } from './stores/game.js';
  import Setup from './components/Setup.svelte';
  import PhaseBar from './components/PhaseBar.svelte';
  import NightPhase from './components/NightPhase.svelte';
  import DayPhase from './components/DayPhase.svelte';

  let state = $state({ started: false, phases: [], currentPhaseIndex: -1, players: [] });

  game.subscribe((s) => {
    state = s;
  });

  const currentPhase = $derived(
    state.currentPhaseIndex >= 0 ? state.phases[state.currentPhaseIndex] : null
  );
</script>

{#if !state.started}
  <Setup />
{:else}
  <PhaseBar />
  <main class="phase-content">
    {#if currentPhase?.type === 'night'}
      <NightPhase
        phase={currentPhase}
        phaseIndex={state.currentPhaseIndex}
        players={state.players}
      />
    {:else if currentPhase?.type === 'day'}
      <DayPhase
        phase={currentPhase}
        phaseIndex={state.currentPhaseIndex}
        players={state.players}
      />
    {/if}
  </main>
{/if}

<style>
  .phase-content {
    max-width: 480px;
    margin: 0 auto;
  }
</style>
```

- [ ] **Step 4: Verify day phase works**

```bash
npm run dev
```

Expected: After navigating to Day 1, can announce deaths from a dropdown. Nomination tracker lets you add nominations and toggle outcome. Player status chips show alive/dead (tappable). Notes textarea at bottom. Kill server after verifying.

- [ ] **Step 5: Commit**

```bash
git add src/components/NominationTracker.svelte src/components/DayPhase.svelte src/App.svelte
git commit -m "feat: implement day phase with deaths, nominations, and status toggles"
```

---

### Task 9: PWA Icons & Final Polish

**Files:**
- Create: `public/icon-192.png`, `public/icon-512.png`
- Modify: `vite.config.js` (already configured in Task 1)

- [ ] **Step 1: Generate simple PWA icons**

Create minimal SVG-based icons. We'll generate PNGs using a canvas script, or use simple placeholder icons.

Create a one-off script `scripts/generate-icons.js`:

```js
import { writeFileSync } from 'fs';
import { createCanvas } from 'canvas';

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, size, size);

  // Circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = '#7c3aed';
  ctx.fill();

  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.25}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BotC', size / 2, size / 2);

  writeFileSync(filename, canvas.toBuffer('image/png'));
}

generateIcon(192, 'public/icon-192.png');
generateIcon(512, 'public/icon-512.png');
console.log('Icons generated.');
```

```bash
npm install -D canvas
node scripts/generate-icons.js
```

If the `canvas` package has build issues, alternatively create the icons manually using any image editor or an online tool — a 192x192 and 512x512 PNG with a purple circle and "BotC" text on a dark background. Place them in `public/`.

- [ ] **Step 2: Verify PWA works**

```bash
npm run build
npm run preview
```

Expected: App loads at the preview URL. In Chrome DevTools > Application tab, the manifest and service worker are registered. On Android Chrome, "Add to Home Screen" option is available. Kill server after verifying.

- [ ] **Step 3: Clean up smoke test**

Delete `tests/smoke.test.js` — it was only needed for the scaffold verification.

```bash
rm tests/smoke.test.js
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All tests in `tests/data/` and `tests/stores/` pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add PWA icons and finalize build"
```

---

## Summary

| Task | What it builds | Key files |
|------|---------------|-----------|
| 1 | Project scaffold | `package.json`, `vite.config.js` |
| 2 | Role data | `src/data/troubleBrewing.js` |
| 3 | Game store | `src/stores/game.js` |
| 4 | App shell + theme | `src/app.css`, `src/App.svelte` |
| 5 | Setup screen | `src/components/Setup.svelte` |
| 6 | Phase navigation | `src/components/PhaseBar.svelte` |
| 7 | Night phase | `NightPhase.svelte`, `PlayerCard.svelte`, `RoleFields.svelte`, `StatusBadge.svelte` |
| 8 | Day phase | `DayPhase.svelte`, `NominationTracker.svelte` |
| 9 | PWA & polish | Icons, build verification |

Tasks 1-3 must be done in order. Tasks 4-8 depend on Task 3 (store) but can be done in any order. Task 9 can be done last.
