<script>
  import { game } from '../stores/game.js';
  import { ROLES } from '../data/troubleBrewing.js';

  let { phaseIndex, playerName, fields, players, values = {} } = $props();

  function updateField(key, value) {
    const updated = { ...values, [key]: value };
    game.setPlayerAction(phaseIndex, playerName, updated);
  }

  const allRoleNames = Object.values(ROLES).map((r) => r.name);
</script>

<div class="role-fields">
  {#each fields as field}
    <div class="field-row">
      <div class="label">{field.label}</div>

      {#if field.type === 'player'}
        <select
          value={values[field.key] || ''}
          onchange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">-- Select player --</option>
          {#each players as p}
            <option value={p.name}>{p.name}</option>
          {/each}
        </select>

      {:else if field.type === 'role'}
        <select
          value={values[field.key] || ''}
          onchange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">-- Select role --</option>
          {#each allRoleNames as roleName}
            <option value={roleName}>{roleName}</option>
          {/each}
        </select>

      {:else if field.type === 'yesno'}
        <div class="yesno-toggle">
          <button
            class="toggle-btn"
            class:active={values[field.key] === 'yes'}
            onclick={() => updateField(field.key, 'yes')}
          >Yes</button>
          <button
            class="toggle-btn"
            class:active={values[field.key] === 'no'}
            onclick={() => updateField(field.key, 'no')}
          >No</button>
        </div>

      {:else if field.type === 'number'}
        <div class="number-options">
          {#each field.options as opt}
            <button
              class="toggle-btn"
              class:active={values[field.key] === String(opt)}
              onclick={() => updateField(field.key, String(opt))}
            >{opt}</button>
          {/each}
        </div>

      {:else if field.type === 'text'}
        <input
          type="text"
          value={values[field.key] || ''}
          placeholder="Notes..."
          oninput={(e) => updateField(field.key, e.target.value)}
        />
      {/if}
    </div>
  {/each}
</div>

<style>
  .role-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-row select, .field-row input {
    width: 100%;
  }

  .yesno-toggle, .number-options {
    display: flex;
    gap: 8px;
  }

  .toggle-btn {
    flex: 1;
    padding: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 13px;
  }

  .toggle-btn.active {
    background: var(--accent-purple);
    color: white;
    font-weight: 600;
    border-color: var(--accent-purple);
  }
</style>
