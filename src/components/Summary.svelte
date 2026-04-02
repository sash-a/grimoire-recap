<script>
  import { ROLES, getRoleConfig, FIRST_NIGHT_ORDER, OTHER_NIGHT_ORDER } from '../data/troubleBrewing.js';

  let { phases, players } = $props();

  function playerRole(name) {
    const p = players.find((pl) => pl.name === name);
    return p ? ROLES[p.role]?.name || p.role : name;
  }

  function playerTeam(name) {
    const p = players.find((pl) => pl.name === name);
    return p ? ROLES[p.role]?.team || 'townsfolk' : 'townsfolk';
  }

  function describeAction(playerName, role, fields, isFirstNight) {
    const config = getRoleConfig(role);
    if (!config) return null;

    const fieldDefs = isFirstNight ? config.fields.firstNight : config.fields.otherNights;
    if (!fieldDefs || !fields || Object.keys(fields).length === 0) return null;

    const parts = [];
    const roleName = config.name;

    switch (role) {
      case 'poisoner':
        if (fields.poisoned) parts.push(`poisoned ${fields.poisoned}`);
        break;
      case 'imp':
        if (fields.killed) parts.push(`killed ${fields.killed}`);
        break;
      case 'fortuneTeller':
        if (fields.player1 && fields.player2) {
          parts.push(`asked about ${fields.player1} and ${fields.player2}`);
          if (fields.shown) parts.push(`shown: ${fields.shown.toUpperCase()}`);
        }
        break;
      case 'empath':
        if (fields.number !== undefined) parts.push(`shown number: ${fields.number}`);
        break;
      case 'monk':
        if (fields.protected) parts.push(`protected ${fields.protected}`);
        break;
      case 'washerwoman':
      case 'librarian':
      case 'investigator':
        if (fields.player1 && fields.player2) {
          parts.push(`shown ${fields.player1} and ${fields.player2}`);
          if (fields.toldRole) parts.push(`told: ${fields.toldRole}`);
        }
        break;
      case 'chef':
        if (fields.number !== undefined) parts.push(`shown number: ${fields.number}`);
        break;
      case 'undertaker':
        if (fields.shownRole) parts.push(`shown executed player was: ${fields.shownRole}`);
        break;
      case 'ravenkeeper':
        if (fields.chose) {
          parts.push(`chose ${fields.chose}`);
          if (fields.shownRole) parts.push(`shown: ${fields.shownRole}`);
        }
        break;
      case 'butler':
        if (fields.master) parts.push(`chose master: ${fields.master}`);
        break;
      case 'spy':
        if (fields.notes) parts.push(fields.notes);
        break;
      default: {
        const entries = Object.entries(fields).filter(([, v]) => v);
        if (entries.length > 0) {
          parts.push(entries.map(([k, v]) => `${k}: ${v}`).join(', '));
        }
      }
    }

    if (parts.length === 0) return null;
    return { playerName, roleName, text: parts.join(', ') };
  }

  function getNightActions(phase) {
    const isFirstNight = phase.number === 1;
    const order = isFirstNight ? FIRST_NIGHT_ORDER : OTHER_NIGHT_ORDER;
    const actions = [];

    for (const roleId of order) {
      const player = players.find((p) => p.role === roleId);
      if (!player) continue;

      const fields = phase.playerActions[player.name];
      const action = describeAction(player.name, roleId, fields, isFirstNight);
      if (action) actions.push(action);
    }

    return actions;
  }
</script>

<div class="summary">
  <h2>Game Summary</h2>

  <div class="player-roster">
    <div class="label">Players</div>
    <div class="roster-list">
      {#each players as player}
        <span class="roster-item team-{ROLES[player.role]?.team}">
          {player.name} ({ROLES[player.role]?.name})
        </span>
      {/each}
    </div>
  </div>

  {#each phases as phase, i}
    <div class="phase-block" class:night={phase.type === 'night'} class:day={phase.type === 'day'}>
      <h3 class="phase-title">
        {phase.type === 'night' ? '🌙' : '☀️'}
        {phase.type === 'night' ? 'Night' : 'Day'} {phase.number}
      </h3>

      {#if phase.type === 'night'}
        {@const actions = getNightActions(phase)}
        {#if actions.length > 0}
          <div class="actions-list">
            {#each actions as action}
              <div class="action-item">
                <span class="action-player">{action.playerName}</span>
                <span class="action-role">({action.roleName})</span>
                — {action.text}
              </div>
            {/each}
          </div>
        {:else}
          <p class="empty">No actions recorded</p>
        {/if}
      {/if}

      {#if phase.type === 'day'}
        {#if phase.deaths.length > 0}
          <div class="deaths-list">
            <strong>Deaths:</strong>
            {#each phase.deaths as name}
              <span class="death-item">{name} ({playerRole(name)})</span>
            {/each}
          </div>
        {/if}

        {#if phase.nominations.length > 0}
          <div class="nominations-list">
            <strong>Nominations:</strong>
            {#each phase.nominations as nom}
              <div class="nom-item">
                {nom.nominator} → {nom.nominated}:
                <span class="nom-outcome" class:executed={nom.outcome === 'executed'}>
                  {nom.outcome === 'executed' ? 'EXECUTED' : 'not enough votes'}
                </span>
              </div>
            {/each}
          </div>
        {/if}
      {/if}

      {#if phase.notes}
        <div class="phase-notes">
          <strong>Notes:</strong> {phase.notes}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .summary {
    padding: 16px;
  }

  h2 {
    font-size: 20px;
    color: #c4b5fd;
    text-align: center;
    margin-bottom: 20px;
  }

  .player-roster {
    margin-bottom: 20px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
  }

  .roster-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
  }

  .roster-item {
    font-size: 13px;
    padding: 2px 8px;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
  }

  .phase-block {
    margin-bottom: 16px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--accent-purple);
  }

  .phase-block.day {
    border-left-color: var(--accent-amber);
  }

  .phase-title {
    font-size: 15px;
    margin-bottom: 10px;
  }

  .actions-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  .action-item {
    font-size: 13px;
    padding: 6px 8px;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    line-height: 1.4;
  }

  .action-player {
    font-weight: 600;
  }

  .action-role {
    color: var(--text-secondary);
    font-size: 12px;
  }

  .deaths-list {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .death-item {
    color: var(--color-demon);
    margin-left: 4px;
  }

  .nominations-list {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .nom-item {
    padding: 4px 0;
  }

  .nom-outcome {
    color: var(--text-secondary);
  }

  .nom-outcome.executed {
    color: var(--accent-purple);
    font-weight: 600;
  }

  .phase-notes {
    font-size: 13px;
    padding: 8px;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    line-height: 1.4;
    margin-top: 8px;
  }

  .empty {
    color: var(--text-secondary);
    font-size: 13px;
    font-style: italic;
  }
</style>
