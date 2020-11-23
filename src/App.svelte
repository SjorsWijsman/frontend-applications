<script>
	import BarChart from "./components/BarChart.svelte";

	const barChartSelectionValues = [
		{value: "merk gestolen", text: "Merken - Aantal Gestolen"},
		{value: "merk diefstalrisico", text: "Merken - Diefstalrisico 1 op..."},
		{value: "type gestolen", text: "Types - Aantal Gestolen"},
		{value: "type diefstalrisico", text: "Types - Diefstalrisico 1 op..."}
	]

	const barChartOptions = {
    displayAmount: 10,
  };
</script>

<header>
	<h1>Hoe kan je ervoor zorgen dat je auto niet gestolen wordt?</h1>
</header>
<main>
	<BarChart selectionValues={barChartSelectionValues} options={barChartOptions} titleVar={"merk"}>
		<h2>Wat voor auto’s worden het meest gestolen?</h2>
		<p>
			Onderstaande grafiek geeft automerken aan die naar verhouding het meest gestolen worden.
			Er kan ook gefilterd worden op alleen autotypes.
		</p>
		<p class="info">
			Data van het LIV over voertuigdiefstal in 2019.
		</p>
	</BarChart>
</main>
<footer>
	<section>
		<p>Gemaakt door Sjors Wijsman</p>
		<a href="https://github.com/SjorsWijsman/frontend-data" target="_blank">Github link</a>
	</section>
</footer>
