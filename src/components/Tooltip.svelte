<script>
import { select } from "d3-selection";

/*
  Show tooltip, set to mouse location and set tooltip text
*/
export function showTooltip(e) {
  const tooltip = select(".tooltip");
  // Display tooltip and set to mouse location
  tooltip
    .style("left", e.clientX + "px")
    .style("top", (e.clientY - tooltip.style("height").replace("px", "")) + "px")
    .transition()
    .duration(50)
    .style("opacity", 0.95)
}

/*
  Hide tooltip
*/
export function hideTooltip(duration = 200) {
  const tooltip = select(".tooltip")
  .transition()
  .duration(duration)
  .style("opacity", 0);
}

/*
  Set tooltip text
*/
export function setText(text) {
  const tooltip = select(".tooltip").html("")
  if (text.title) tooltip.append("h3").text(text.title)
  if (text.text) tooltip.append("p").text(text.text)
  if (text.table) {
    const table = tooltip.append("div")
    table.attr("class", "table")
    for (let entry of text.table) {
      table.append("span").text(entry[0])
      table.append("span").text(entry[1])
    }
  }
}

// Hide tooltip on scroll to prevent tooltip from staying on screen
window.addEventListener('scroll', () => {
  hideTooltip(0)
});
</script>

<style>
.tooltip {
  position: fixed;
  pointer-events: none;
  max-width: 25rem;
  z-index: 10;
  opacity: 0;
}

:global(.tooltip > *) {
  padding: 1rem;
  margin: 0.2rem;
  background-color: var(--background-color);
}

:global(.tooltip .table) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;
}

:global(.tooltip .table > span) {
  display: flex;
  align-items: center;
}

:global(.tooltip .table > span:nth-child(odd)) {
  justify-content: flex-end;
  text-align: right;
}

:global(.tooltip .table > span:nth-child(even)) {
  font-weight: bold;
}
</style>

<div class="tooltip">
  Placeholder: This should not be visible
</div>
