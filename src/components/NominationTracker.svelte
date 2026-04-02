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
