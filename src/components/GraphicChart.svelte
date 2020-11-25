<script>
import Car from "./Car.svelte";
import { onMount } from "svelte";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";

const data = [
  {x: 50, y: 50}
]

let el;

onMount(async () => {
  const container = select(el)
  const car = container.select("svg");
  const viewBoxX = car.attr("viewBox").split(" ")[2]
  const viewBoxY = car.attr("viewBox").split(" ")[3]

  // Create x scale
  const xScale = scaleLinear()
    .range([0, viewBoxX])
    .domain([0, 100])

  // Create y scale
  const yScale = scaleLinear()
    .range([0, viewBoxY])
    .domain([0, 100])

  car.append("rect")
    .style("height", 20)
    .style("width", 20)
    .attr("transform", `translate(${xScale(data[0].x)},${yScale(data[0].y)})`)
})
</script>

<section bind:this={el}>
  <slot/>
  <Car/>
</section>
