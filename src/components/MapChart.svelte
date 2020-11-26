<script>
import Select from "./Select.svelte";
import Tooltip from "./Tooltip.svelte";
import { onMount, afterUpdate } from "svelte";
import * as topojson from "topojson";
import { select } from "d3-selection";
import { json } from "d3-fetch";
import { geoMercator, geoPath } from "d3-geo";
import { scaleLinear } from "d3-scale";
import { gestolenPerGemeente } from "../data/gestolenPerGemeente.js";

export let tooltip;
export let selectionValues;

let selected = selectionValues[0].value;
let el;
let data;

// Draw Chart after update
afterUpdate(async () => {
  await getMapData()
  drawChart()
})

/*
  Get Map Data & Store in data variable
*/
async function getMapData() {
  const storage = window.sessionStorage;
  data = JSON.parse(storage.getItem("data-37167725"));
  if (data === null) {
    data = await json("https://cartomap.github.io/nl/wgs84/gemeente_2020.topojson");
    storage.setItem("data-37167725", JSON.stringify(data));
  }
}

/*
  Draw Map Chart inside el container using data
*/
function drawChart() {
  // Set variable used to scale the map chart from selection
  const scaleVar = selected;
  // Select d3 container element
  const container = select(el);
  // Set map chart color
  const color = "var(--main-color)";
  // Set map stroke color
  const strokeColor = "var(--background-color)"

  // Get highest Number
  let highestNumber = 0
  for (const item of Object.keys(gestolenPerGemeente)) {
    if (gestolenPerGemeente[item][scaleVar] > highestNumber) highestNumber = gestolenPerGemeente[item][scaleVar];
  }

  // Add svg & add responsiveness with viewbox
  let svg = container.select("svg")
  if (svg.empty()) {
    svg = container.append("svg")
      .attr("width", "100%")
      .attr("height", "80vh")
      .attr("viewBox", "488.9 80 10.4 12.3")
  }

  // Get geojson features from topojson
  const geojson = topojson.feature(data, data.objects.gemeente_2020).features;

  // Set projection function (lat/long > x/y)
  const projection = geoMercator()

  // Add projection to path generator
  const pathGenerator = geoPath()
    .projection(projection)

  // Scale for scaling opacity
  const opacityScale = scaleLinear()
    .range([0.10, 1.00])
    .domain([0, highestNumber])

  // Create group & append paths
  const gemeentes = svg.selectAll("path")
    .data(geojson)

  gemeentes.exit()
    .remove();

  gemeentes.transition()
    .duration(0)
    .attr("opacity", (d) => opacityScale(gestolenPerGemeente[d.properties.statnaam][scaleVar]))

  const gemeente = gemeentes.enter()
    .append("g")

  gemeente.append("path")
    .on("mousemove", (e, d) => {
      tooltip.setText(tooltipText(d))
      tooltip.showTooltip(e)
    })
    .on("mouseout", () => tooltip.hideTooltip())
    .attr("d", pathGenerator)
    .attr("fill", color)
    .attr("opacity", (d) => opacityScale(gestolenPerGemeente[d.properties.statnaam][scaleVar]))
    .attr("stroke", strokeColor)
    .attr("stroke-width", "0.01px")


  /*
    Create Tooltip text
  */
  function tooltipText(d) {
    const scaleVar = selected;
    const gemeente = d.properties.statnaam;
    let value = gestolenPerGemeente[gemeente][scaleVar];
    if (gestolenPerGemeente[gemeente] !== undefined) {
      if (typeof value === "number") {
        value = value.toLocaleString("nl-nl");
      } else {
        value = value.replace(".", ",");
      }
    }
    else {
      value = "data onbekend";
    }
    return {
        table: [[gemeente, value]],
      }
  }
}
</script>

<section bind:this={el}>
  <slot/>
  <Select selectionValues={selectionValues} bind:selected storageKey={30753491}/>
</section>
