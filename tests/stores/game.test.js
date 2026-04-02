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
