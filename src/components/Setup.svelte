<script>
  import { game } from '../stores/game.js';
  import { ROLES, getRolesForTeam } from '../data/troubleBrewing.js';

  let playerName = $state('');
  let selectedRole = $state('');
  let players = $state([]);

  game.subscribe((s) => {
    players = s.players;
  });

  const allRoles = Object.entries(ROLES).map(([id, r]) => ({ id, ...r }));
  const usedRoles = $derived(new Set(players.map((p) => p.role)));
  const availableRoles = $derived(allRoles.filter((r) => !usedRoles.has(r.id)));

  function addPlayer() {
    const name = playerName.trim();
    if (!name || !selectedRole) return;
    game.addPlayer(name, selectedRole);
    playerName = '';
    selectedRole = '';
  }

  function removePlayer(name) {
    game.removePlayer(name);
  }

  function teamLabel(team) {
    return { townsfolk: 'TF', outsider: 'OS', minion: 'MI', demon: 'DE' }[team];
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') addPlayer();
  }
</script>

<div class="setup">
  <header class="setup-header">
    <h1>Blood on the Clocktower</h1>
    <p>Storyteller Tracker</p>
  </header>

  <section class="setup-section">
    <div class="label">Edition</div>
    <div class="edition-picker">
      <button class="edition-btn active">Trouble Brewing</button>
      <button class="edition-btn" disabled>BMR</button>
      <button class="edition-btn" disabled>S&V</button>
    </div>
  </section>

  <section class="setup-section">
    <div class="label">Add Player</div>
    <div class="add-player-row">
      <input
        type="text"
        placeholder="Player name..."
        bind:value={playerName}
        onkeydown={handleKeydown}
      />
      <select bind:value={selectedRole}>
        <option value="">-- Role --</option>
        {#each availableRoles as role}
          <option value={role.id}>{role.name}</option>
        {/each}
      </select>
      <button class="btn-primary" onclick={addPlayer} disabled={!playerName.trim() || !selectedRole}>+</button>
    </div>
  </section>

  {#if players.length > 0}
    <section class="setup-section">
      <div class="label">Players ({players.length})</div>
      <div class="player-list">
        {#each players as player}
          <div class="player-row">
            <div class="player-dot team-{ROLES[player.role]?.team}">●</div>
            <div class="player-name">{player.name}</div>
            <div class="player-role team-{ROLES[player.role]?.team}">
              {ROLES[player.role]?.name}
            </div>
            <div class="player-team">{teamLabel(ROLES[player.role]?.team)}</div>
            <button class="remove-btn" onclick={() => removePlayer(player.name)}>✕</button>
          </div>
        {/each}
      </div>
    </section>

    <button class="btn-primary start-btn" onclick={() => game.startGame()}>
      Start Game →
    </button>
  {/if}
</div>

<style>
  .setup {
    max-width: 480px;
    margin: 0 auto;
    padding: 16px;
  }

  .setup-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .setup-header h1 {
    font-size: 20px;
    color: #c4b5fd;
  }

  .setup-header p {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .setup-section {
    margin-bottom: 16px;
  }

  .edition-picker {
    display: flex;
    gap: 8px;
  }

  .edition-btn {
    flex: 1;
    padding: 8px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 13px;
  }

  .edition-btn.active {
    background: var(--accent-purple);
    color: white;
    font-weight: 600;
  }

  .edition-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .add-player-row {
    display: flex;
    gap: 8px;
  }

  .add-player-row input {
    flex: 1;
    min-width: 0;
  }

  .add-player-row select {
    width: 140px;
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .player-row {
    display: flex;
    align-items: center;
    background: var(--bg-secondary);
    padding: 10px 12px;
    border-radius: var(--radius-md);
    gap: 10px;
  }

  .player-dot {
    font-size: 10px;
  }

  .player-name {
    flex: 1;
    font-size: 14px;
  }

  .player-role {
    font-size: 12px;
  }

  .player-team {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .remove-btn {
    background: none;
    color: var(--text-secondary);
    font-size: 14px;
    padding: 4px 8px;
  }

  .start-btn {
    width: 100%;
    margin-top: 20px;
    padding: 14px;
    font-size: 16px;
    border-radius: var(--radius-lg);
  }
</style>
