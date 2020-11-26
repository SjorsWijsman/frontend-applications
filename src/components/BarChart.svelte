<script>
import Select from "./Select.svelte";
import Tooltip from "./Tooltip.svelte";
import { relativeSize } from "../scripts/utils.js"
import { afterUpdate } from "svelte";
import { select, selectAll } from "d3-selection";
import { descending, ascending, max, min } from "d3-array";
import { scaleLinear, scaleBand } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { transition } from "d3-transition";
import { diefstalrisico, diefstalrisicoTypes, diefstalrisicoHeaders } from "../data/diefstalrisico.js";

export let tooltip;
export let selectionValues;
export let options;
export let titleVar;

const datasets = [diefstalrisico, diefstalrisicoTypes];
const headers = diefstalrisicoHeaders;

let el;
let selected;

/*
  Run Function on afterUpdate (also runs after selection update)
*/
afterUpdate(async () => {
  getDataFromSelection();
})

window.addEventListener("resize", () => getDataFromSelection(true));

/*
  Get Data from Selection and draw Chart
*/
function getDataFromSelection(redraw = false) {
  // Get selection from Select component
  let selectedList = selected.split(" ");

  // Get variable used to scale the bar chart from selection
  const scaleVar = selectedList[1];

  let data = datasets[0];
  if (selectedList[0] === "merk") {
    data = datasets[0];
  } else {
    data = datasets[1];
  }

  drawChart(scaleVar, data, redraw)
}

/*
  Draw Bar Chart inside el container using data
*/
function drawChart(scaleVar, data, redraw) {
  // Get container
  const container = select(el);
  // Bar color
  const color = "var(--main-color)";
  // Background & in bar text color
  const backgroundColor = "var(--background-color)";
  // Text color
  const textColor = "var(--text-color)";
  // Bar width
  const barWidth = relativeSize(60);
  // Bar gap
  const barGap = 0.1;
  // Sort function
  const sort = options.sort || headers[scaleVar].order;
  // Max display amount
  let displayAmount = options.displayAmount || data.length;
  // Set display amount to data.length if bigger than data.length
  if (displayAmount > data.length) displayAmount = data.length;

  data = transformData(data);

  // Calculate total height of chart
  const height = relativeSize(displayAmount * (barWidth / (displayAmount * 0.25) + barWidth * 0.35));
  const labelSize = relativeSize(50)

  // Check if it the chart needs to be redrawn; remove every other svg in the container
  if (redraw) {
    container.selectAll("svg").remove();
  }

  // If container is empty, create a new svg to draw the chart on
  if (container.select("svg").empty()) {
    container.append("svg")
      .attr("width", "100%")
      .attr("height", height)
  };

  // Select svg
  const svg = container.select("svg")

  // Get total svg width
  const width = svg.style("width").replace("px", "") - labelSize;
  // Get highest Number
  const highestNumber = max(data, item => item[scaleVar]);
  // Get lowest Number
  const lowestNumber = min(data, item => item[scaleVar]);

  // Create x scale
  let xScale = scaleLinear()
    .range([0, width])
    .domain([0, highestNumber])

  // Invert xScale if scaleVar is inverted
  if (diefstalrisicoHeaders[scaleVar].inverted) {
    xScale = scaleLinear()
      .range([0, width])
      .domain([highestNumber + lowestNumber, lowestNumber])
  }

  // Create y scale
  const yScale = scaleBand()
    .domain(data.map(d => d[titleVar]))
    .range([height, 0])
    .paddingInner(barGap);

  // Add barchart bars (rectangles)
  const bars = svg.selectAll("rect")
    .data(data)

  bars.exit()
    .remove();

  bars.transition()
    .attr("width", (d) => xScale(d[scaleVar]))

  const bar = bars.enter()
    .append("g")

  bar.append("rect")
    .attr("y", (d) => yScale(d[titleVar]))
    .attr("height", yScale.bandwidth())
    .attr("x", 0)
    .attr("width", (d) => xScale(d[scaleVar]))
    .style("fill", color)
    .on("mousemove", (e, d) => {
      tooltip.setText(tooltipText(d))
      tooltip.showTooltip(e)
    })
    .on("mouseout", () => {
      tooltip.hideTooltip()
    })

  // Add text displaying titleVar (on top of the bar)
  const titleVarText = svg.selectAll(".titleVarText")
    .data(data)

  titleVarText.exit()
    .remove();

  titleVarText.transition()
    .attr("x", (d) => xScale(d[scaleVar]) - 12)
    .text((d) => d[titleVar])

  bar.append("text")
    .attr("class", "titleVarText")
    .attr("y", (d) => yScale(d[titleVar]) + yScale.bandwidth() / 2)
    .attr("x", (d) => xScale(d[scaleVar]) - 12)
    .attr("alignment-baseline", "central")
    .attr("text-anchor", "end")
    .style("fill", backgroundColor)
    .style("font-weight", "bold")
    .style("pointer-events", "none")
    .text((d) => d[titleVar])

  // Add text displaying scaleVar (to the right of the bar)
  const scaleVarText = svg.selectAll(".scaleVarText")
    .data(data)

  scaleVarText.exit()
    .remove();

  scaleVarText.transition()
    .attr("x", d => xScale(d[scaleVar]) + relativeSize(12))
    .text((d) => d[scaleVar])

  bar.append("text")
    .attr("class", "scaleVarText")
    .attr("y", (d) => yScale(d[titleVar]) + yScale.bandwidth() / 2)
    .attr("x", (d) => xScale(d[scaleVar]) + relativeSize(12))
    .attr("alignment-baseline", "central")
    .style("fill", textColor)
    .style("font-weight", "bold")
    .style("pointer-events", "none")
    .text((d) => d[scaleVar])

  /*
    Sort, cut and reverse data
  */
  function transformData(data) {
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

    // Reverse data because chart renders in reverse
    data.reverse();

    return data;
  }

  /*
    Create tooltip text displaying information per bar
  */
  function tooltipText(d) {
    let tableContent = [];
    for (const key of Object.keys(d)) {
      if (key !== titleVar) {
        const title = headers[key].title || key;
        const value = d[key].toLocaleString("nl-nl");
        tableContent.push([title, value])
      }
    }
    return {
      title: d[titleVar],
      table: tableContent,
    }
  }
}
</script>

<section bind:this={el}>
  <slot/>
  <Select selectionValues={selectionValues} bind:selected storageKey={87658744}/>
</section>
