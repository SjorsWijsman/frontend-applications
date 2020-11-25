<script>
import Select from "./Select.svelte";
import Tooltip from "./Tooltip.svelte";
import { onMount, afterUpdate } from "svelte";
import * as topojson from "topojson";
import { select } from "d3-selection";
import { json } from "d3-fetch";
import { geoMercator, geoPath } from "d3-geo";
import { gestolenPerGemeente } from "../data/gestolenPerGemeente.js";

export let selectionValues;

let selected = selectionValues[0].value;
let el;
let data;
let tooltip;

// Get Map Data from link & store in sessionStorage
onMount(async () => {
  const storage = window.sessionStorage;
  data = JSON.parse(storage.getItem("data-37167725"));
  if (data === null) {
    data = await json("https://cartomap.github.io/nl/wgs84/gemeente_2020.topojson");
    storage.setItem("data-37167725", JSON.stringify(data));
  }
})

// Draw Chart after update
afterUpdate(async () => {
  drawChart()
})

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

  // Remove previous svgs
  const deleteSvgs = container.selectAll("svg").remove()

  // Add svg & add responsiveness with viewbox
  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "80vh")
    .attr("viewBox", "488.9 80 10.4 12.3")

  // Get geojson features from topojson
  const geojson = topojson.feature(data, data.objects.gemeente_2020).features;

  // Set projection function (lat/long > x/y)
  const projection = geoMercator()

  // Add projection to path generator
  const path = geoPath()
    .projection(projection)

  // Create group & append paths
  const g = svg.append("g")
    .selectAll("path")
    .data(geojson)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", color)
    .attr("opacity", (d) => {
      const scale = gestolenPerGemeente[d.properties.statnaam][scaleVar] / highestNumber;
      const intensity = 0.9;
      return scale * intensity + 1-intensity;
    })
    .attr("stroke", strokeColor)
    .attr("stroke-width", "0.01px")
    .on("mousemove", (e, d) => tooltip.showTooltip(e, d, tooltipText(d)))
    .on("mouseout", (e, d) => tooltip.hideTooltip())

  /*
    Create Tooltip text
  */
  function tooltipText(d) {
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
    return `<span>${gemeente}</span><span>${value}</span>`
  }
}
</script>

<section bind:this={el}>
  <slot/>
  <Select selectionValues={selectionValues} bind:selected/>
  <Tooltip bind:this={tooltip}/>
</section>
