<script>
export let selectionValues;
export let selected;
</script>

<style>
select {
  cursor: pointer;
  border: none;
  border-radius: 0.5rem;
  margin-bottom: 1em;
  padding: 0 0.5em;
  height: 3em;
  background-color: var(--white);
  opacity: 0.8;
}

select:hover {
  background-color: var(--light-blue);
  opacity: 1;
}
</style>

<select selected={selected} bind:value={selected}>
	{#each selectionValues as option}
		<option value={option.value}>
			{option.text}
		</option>
	{/each}
</select>
