<script>
	import Select from "./Select.svelte";
	import { onMount } from "svelte";
  import { select, selectAll } from "d3-selection";
  import { descending, ascending, max, min } from "d3-array";
  import { diefstalrisico, diefstalrisicoTypes, diefstalrisicoHeaders } from "../data/diefstalrisico.js";

  export let selectionValues;
  export let options;
  export let titleVar;

  const datasets = [diefstalrisico, diefstalrisicoTypes];
  const headers = diefstalrisicoHeaders;

  let el;

  // Get selection from Select component
  let selected = selectionValues[0].value;
  let selectedList = selected.split(" ");

  // Get variable used to scale the bar chart from selection
  let scaleVar = selectedList[1];
  if (selectedList[0] === "type") {
    data = datasets[1]
  };

  // Get which dataset to use
  let data = datasets[0];

  onMount(async () => {
    const container = select(el);
    // Set bar color
    const color = "var(--main-color)";
    // Set backgroundColor
    const backgroundColor = "var(--background-color)";
    // Get bar width, default 50
    const barWidth = relativeSize(options.barWidth) || relativeSize(50);
    // Get bar gap, default 5
    const barGap = relativeSize(options.barGap) || relativeSize(6);
    // Get sort function
    const sort = options.sort || headers[scaleVar].order;
    // Get max display amount
    const displayAmount = options.displayAmount || undefined;

    // Sort data
    switch (sort) {
      case "descending":
        data.sort((x, y) => {
          return descending(x[scaleVar], y[scaleVar])
        })
        break
      case "ascending":
        data.sort((x, y) => {
          return ascending(x[scaleVar], y[scaleVar])
        })
        break
    }

    // Cut off data past max display amount
    if (displayAmount) {
      data = data.slice(0, displayAmount)
    }

    // Calculate total height
    const height = data.length * (barWidth + barGap) - barGap;

    // Get highest Number
    const highestNumber = max(data, item => item[scaleVar]);

    // Get lowest Number
    const lowestNumber = min(data, item => item[scaleVar]);

    // Create svg "canvas" to draw on
    const svg = container.append("svg")
      .attr("width", "100%")
      .attr("height", height)

    // https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
    // Append tooltip
    const tooltip = container.append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)

    // Get total svg width
    const width = svg.style("width").replace("px", "");

    // Create group for every bar
    const bar = svg.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        return `translate(0,${i * (barWidth + barGap)})`
      })

    // Draw bar rectangles in bar group
    const rect = bar.append("rect")
      .attr("height", barWidth)
      .style("fill", color)
      .attr("width", (d, i) => calcBarLength(d, i))

    // Draw title text in bar
    const titleText = bar.append("text")
      .attr("class", "titleText")
      .attr("x", (d, i) => calcBarLength(d, i) - relativeSize(15))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "central")
      .attr("y", barWidth / 2)
      .style("fill", backgroundColor)
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(d => d[titleVar])

    // Draw number text next to bar
    const numberText = bar.append("text")
      .attr("x", (d, i) => calcBarLength(d, i) + relativeSize(12))
      .attr("alignment-baseline", "central")
      .attr("y", barWidth / 2)
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(d => d[scaleVar])

    // Calculate bar length according to highest number
    function calcBarLength(d, i) {
      if (d[scaleVar] <= 0) {
        return 0;
      }
      // Normal scaling
      let scaling = d[scaleVar] / highestNumber
      // Inverted scaling
      if (headers[scaleVar].inverted) {
        scaling = lowestNumber / d[scaleVar]
      }
      return (width - relativeSize(55)) * scaling;
    }

    // Convert size in px to new size in px relative to 1 rem
    function relativeSize(size) {
      // Calculate rem size for calculating responsive sizes
      const remSize = select("html").style("font-size").replace("px", "");
      return size / 16 * remSize;
    }
  });
</script>

<section bind:this={el}>
  <slot/>
  <Select selectionValues={selectionValues} bind:selected/>
</section>
