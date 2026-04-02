<script>
  let { condition, onclick } = $props();

  const styles = {
    poisoned: { bg: '#7c2d12', color: '#fdba74', label: 'POISONED' },
    drunk: { bg: '#713f12', color: '#fde68a', label: 'DRUNK' },
    dead: { bg: '#991b1b', color: '#fca5a5', label: 'DEAD' },
  };

  const style = $derived(styles[condition] || { bg: '#333', color: '#888', label: condition.toUpperCase() });
</script>

<button
  class="badge"
  style="background:{style.bg}; color:{style.color};"
  onclick={onclick}
>
  {style.label}
</button>

<style>
  .badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
  }
</style>
