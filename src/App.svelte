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
