<script>
import { select } from "d3-selection";

/*
  Show tooltip, set to mouse location and set tooltip text
*/
export function showTooltip(e, d, tooltipText) {
  const tooltip = select(".tooltip");
  // Display tooltip and set to mouse location
  tooltip
    .style("left", e.clientX + "px")
    .style("top", (e.clientY - tooltip.style("height").replace("px", "")) + "px")
    .transition()
    .duration(50)
    .style("opacity", 0.95)

  // Add information to tooltip
  tooltip.html(tooltipText);
}

/*
  Hide tooltip
*/
export function hideTooltip() {
  const tooltip = select(".tooltip");
  .style("opacity", 0);
}

// Hide tooltip on scroll to prevent tooltip from staying on screen
window.addEventListener('scroll', () => {
  hideTooltip()
});
</script>

<style>
:global(.tooltip) {
  padding: 1rem;
  position: fixed;
  background-color: var(--background-color);
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;
  pointer-events: none;
  font-weight: 300;
  opacity: 0;
}

:global(.tooltip > *) {
  display: flex;
  align-items: center;
}

:global(.tooltip > *:nth-child(odd)) {
  justify-content: flex-end;
  text-align: right;
}

:global(.tooltip > *:nth-child(even)) {
  font-weight: bold;
}
</style>

<div class="tooltip">
  <div>Placeholder: This should not be visible</div>
</div>
