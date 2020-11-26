import { select } from "d3-selection";

/*
  Convert size in px to new size in px relative to 1 rem
*/
export function relativeSize(size) {
  // Calculate rem size for calculating responsive sizes
  const remSize = select("html").style("font-size").replace("px", "");
  return size / 16 * remSize;
}
