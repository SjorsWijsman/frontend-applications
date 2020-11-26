<script>
import BarChart from "./components/BarChart.svelte";
import MapChart from "./components/MapChart.svelte";
import GraphicChart from "./components/GraphicChart.svelte";
import Info from "./components/Info.svelte";
import Tooltip from "./components/Tooltip.svelte";

let tooltip;

const barChartSelectionValues = [
	{value: "merk gestolen", text: "Merken - Aantal Gestolen"},
	{value: "merk diefstalrisico", text: "Merken - Diefstalrisico 1 op..."},
	{value: "type gestolen", text: "Types - Aantal Gestolen"},
	{value: "type diefstalrisico", text: "Types - Diefstalrisico 1 op..."}
]

const barChartOptions = {
  displayAmount: 10,
};

const mapChartSelectionValues = [
	{value: "gestolenPerWagenpark", text: "Auto's Gestolen per 10.000 Auto's"},
	{value: "gestolenPerInwoners", text: "Auto's Gestolen per 10.000 Inwoners"},
	{value: "aantalGestolen", text: "Totaal Aantal Auto's Gestolen"},
	{value: "inwoners", text: "Aantal Inwoners"},
	{value: "wagenpark", text: "Wagenpark"}
]
</script>

<header>
	<h1>Hoe kan je ervoor zorgen dat je auto niet gestolen wordt?</h1>
</header>
<main>
	<Tooltip bind:this={tooltip}/>
	<BarChart tooltip={tooltip} selectionValues={barChartSelectionValues} options={barChartOptions} titleVar={"merk"}>
		<h2>Wat voor auto’s worden het meest gestolen?</h2>
		<p>
			Onderstaande grafiek geeft automerken aan die naar verhouding het meest gestolen worden.
			Er kan ook gefilterd worden op alleen autotypes.
		</p>
		<Info>
			Data van het LIV over voertuigdiefstal in 2019.
		</Info>
	</BarChart>
	<MapChart tooltip={tooltip} selectionValues={mapChartSelectionValues}>
		<h2>Waar worden de meeste auto’s gestolen?</h2>
		<p>
			De kaart hieronder geeft een beeld van de verschillende verhoudingen tussen het aantal gestolen auto's en de inwoners/wagenpark per gemeente.
		</p>
		<Info>
			Data van het LIV, CBS & regioatlas.nl respectievelijk over voertuigdiefstal, wagenpark & inwoners in 2019.
		</Info>
	</MapChart>
	<GraphicChart tooltip={tooltip}>
		<h2>Hoe worden auto’s gestolen?</h2>
		<p>
			Onderstaand overzicht laat zien hoe auto’s gestolen worden en wat je eraan kan doen.
		</p>
		<Info>
			Data komt ergens vandaan wat ik je lekker niet ga vertellen lol
		</Info>
	</GraphicChart>
</main>
<footer>
	<section>
		<p>Gemaakt door Sjors Wijsman</p>
		<a href="https://github.com/SjorsWijsman/frontend-data" target="_blank">Github link</a>
	</section>
</footer>
