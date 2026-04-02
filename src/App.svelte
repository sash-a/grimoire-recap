<script>
  import { game, getPlayersAtPhase } from './stores/game.js';
  import Setup from './components/Setup.svelte';
  import PhaseBar from './components/PhaseBar.svelte';
  import NightPhase from './components/NightPhase.svelte';
  import DayPhase from './components/DayPhase.svelte';
  import Summary from './components/Summary.svelte';

  let state = $state({ started: false, phases: [], currentPhaseIndex: -1, players: [] });
  let showSummary = $state(false);

  game.subscribe((s) => {
    state = s;
  });

  const currentPhase = $derived(
    state.currentPhaseIndex >= 0 ? state.phases[state.currentPhaseIndex] : null
  );

  const phasePlayers = $derived(
    state.currentPhaseIndex >= 0
      ? getPlayersAtPhase(state.players, state.phases, state.currentPhaseIndex)
      : state.players
  );
</script>

{#if !state.started}
  <Setup />
{:else if showSummary}
  <div class="summary-header">
    <button class="btn-primary" onclick={() => showSummary = false}>← Back to Game</button>
  </div>
  <main class="phase-content">
    <Summary phases={state.phases} players={state.players} />
  </main>
{:else}
  <PhaseBar />
  <main class="phase-content">
    {#if currentPhase?.type === 'night'}
      <NightPhase
        phase={currentPhase}
        phaseIndex={state.currentPhaseIndex}
        players={phasePlayers}
      />
    {:else if currentPhase?.type === 'day'}
      <DayPhase
        phase={currentPhase}
        phaseIndex={state.currentPhaseIndex}
        players={phasePlayers}
      />
    {/if}
    <div class="summary-btn-container">
      <button class="btn-primary summary-btn" onclick={() => showSummary = true}>
        View Game Summary
      </button>
    </div>
  </main>
{/if}

<style>
  .phase-content {
    max-width: 480px;
    margin: 0 auto;
  }

  .summary-header {
    padding: 12px 16px;
    background: var(--bg-header);
  }

  .summary-btn-container {
    padding: 16px;
  }

  .summary-btn {
    width: 100%;
    padding: 14px;
    font-size: 15px;
    border-radius: var(--radius-lg);
  }
</style>
