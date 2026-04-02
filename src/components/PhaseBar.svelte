<script>
  import { game } from '../stores/game.js';

  let phases = $state([]);
  let currentPhaseIndex = $state(0);

  game.subscribe((s) => {
    phases = s.phases;
    currentPhaseIndex = s.currentPhaseIndex;
  });

  function nextPhaseLabel() {
    if (phases.length === 0) return '+ Night 1';
    const last = phases[phases.length - 1];
    if (last.type === 'night') return `+ Day ${last.number}`;
    return `+ Night ${last.number + 1}`;
  }
</script>

<nav class="phase-bar">
  <button
    class="phase-pill setup-pill"
    class:active={false}
    onclick={() => {/* setup is a separate screen, no-op */}}
  >
    Setup
  </button>

  {#each phases as phase, i}
    <button
      class="phase-pill"
      class:active={i === currentPhaseIndex}
      class:night={phase.type === 'night'}
      class:day={phase.type === 'day'}
      onclick={() => game.setCurrentPhase(i)}
    >
      {phase.type === 'night' ? 'Night' : 'Day'} {phase.number}
    </button>
  {/each}

  <button class="phase-pill add-pill" onclick={() => game.addPhase()}>
    {nextPhaseLabel()}
  </button>
</nav>

<style>
  .phase-bar {
    display: flex;
    background: var(--bg-header);
    padding: 8px;
    gap: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .phase-bar::-webkit-scrollbar {
    display: none;
  }

  .phase-pill {
    padding: 6px 14px;
    background: var(--bg-secondary);
    border-radius: var(--radius-pill);
    font-size: 12px;
    white-space: nowrap;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .phase-pill.active.night {
    background: var(--accent-purple);
    color: white;
    font-weight: 600;
  }

  .phase-pill.active.day {
    background: var(--accent-amber);
    color: var(--bg-primary);
    font-weight: 600;
  }

  .add-pill {
    border: 1px dashed var(--border-color);
    background: transparent;
  }

  .setup-pill {
    color: var(--text-secondary);
  }
</style>
