<script>
import Car from "./Car.svelte";
import { relativeSize } from "../scripts/utils.js"
import { onMount } from "svelte";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { autoInbraak } from "../data/autoInbraak.js";

export let tooltip;

let el;

onMount(async () => {
  drawChart()
});

/*
  Draw Graphic Chart inside el container using data
*/
function drawChart() {
  const container = select(el);
  const car = container.select("svg");
  const viewBoxX = car.attr("viewBox").split(" ")[2];
  const viewBoxY = car.attr("viewBox").split(" ")[3];

  const radius = 30;

  // Create x scale
  const xScale = scaleLinear()
    .range([0, viewBoxX])
    .domain([0, 100])

  // Create y scale
  const yScale = scaleLinear()
    .range([0, viewBoxY])
    .domain([0, 100])

  const point = car.selectAll(".point")
    .data(autoInbraak)
    .enter()
    .append("g")
    .attr("class", "point")
    .on("mousemove", (e, d) => {
      tooltip.setText(tooltipText(d))
      tooltip.showTooltip(e)
    })
    .on("mouseout", () => tooltip.hideTooltip())

  const pointCircle = point.append("circle")
    .attr("r", radius)
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .style("fill", (d) => decideColor(d))
    .style("stroke", (d) => decideColor(d))
    .style("stroke-width", 15)
    .style("fill-opacity", 0.5)
    .on("mouseover", (e, d) => {
      select(e.target).transition()
        .style("fill-opacity", 0.9)
        .attr("r", radius + 5)
    })
    .on("mouseout", (e, d) => {
      select(e.target).transition()
        .style("fill-opacity", 0.5)
        .attr("r", radius)
    })
}

/*
  Decide color based on type
*/
function decideColor(d) {
  switch(d.type) {
    case "advice":
      return "var(--succes-color)"
    case "attack":
      return "var(--error-color)"
  }
}

/*
  Create Tooltip text
*/
function tooltipText(d) {
  return {
    title: d.title,
    text: d.text,
  }
}
</script>

<section bind:this={el}>
  <slot/>
  <Car/>
</section>
