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
