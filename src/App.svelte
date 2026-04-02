<script>
  import { game } from './stores/game.js';
  import Setup from './components/Setup.svelte';
  import PhaseBar from './components/PhaseBar.svelte';

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
      <p style="padding: 16px; color: var(--text-secondary);">
        Night {currentPhase.number} — phase content coming next.
      </p>
    {:else if currentPhase?.type === 'day'}
      <p style="padding: 16px; color: var(--text-secondary);">
        Day {currentPhase.number} — phase content coming next.
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
