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
