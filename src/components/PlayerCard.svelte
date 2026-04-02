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
