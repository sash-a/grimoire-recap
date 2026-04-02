<script>
  import { game } from './stores/game.js';
  import Setup from './components/Setup.svelte';

  let state = $state({ started: false, phases: [], currentPhaseIndex: -1, players: [] });

  game.subscribe((s) => {
    state = s;
  });
</script>

{#if !state.started}
  <Setup />
{:else}
  <div class="game">
    <p style="padding: 16px; color: var(--text-secondary);">Game started — phase screens coming next.</p>
  </div>
{/if}
