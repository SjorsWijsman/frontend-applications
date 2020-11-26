<script>
import { afterUpdate } from "svelte";
import { select } from "d3-selection";

export let selectionValues;
export let selected;
export let storageKey;

// Get selection from session storage
const storage = window.sessionStorage;
const storedSelection = JSON.parse(storage.getItem("data-" + storageKey));
if (storedSelection) selected = storedSelection;

// Update selection to session storage on change
afterUpdate(async () => {
  storage.setItem("data-" + storageKey, JSON.stringify(selected));
})
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
