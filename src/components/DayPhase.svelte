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
