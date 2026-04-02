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
