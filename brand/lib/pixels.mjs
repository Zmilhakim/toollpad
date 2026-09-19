// Pixel grids, turned into SVG.
//
// The one piece of drawing the launchpad's marks and a token's own mark share: a
// grid of `#` and `.`, painted as rectangles. Runs of set pixels are merged into
// one rect each, so the output stays small, and `shape-rendering="crispEdges"`
// keeps the grid a grid at any size.
//
// A mark drawn this way needs no font, no raster source and no tracing: it is
// the same handful of numbers at 16 pixels and at 1000.

/** Runs of set pixels become one rect each, so the output stays small. */
export function rects(grid, color, offsetX = 0, offsetY = 0) {
  const out = [];
  grid.forEach((row, y) => {
    let run = 0;
    [...row].forEach((cell, x) => {
      if (cell === "#") {
        run += 1;
        return;
      }
      if (run > 0) {
        out.push(`<rect x="${offsetX + x - run}" y="${offsetY + y}" width="${run}" height="1" fill="${color}"/>`);
        run = 0;
      }
    });
    if (run > 0) {
      out.push(
        `<rect x="${offsetX + row.length - run}" y="${offsetY + y}" width="${run}" height="1" fill="${color}"/>`,
      );
    }
  });
  return out.join("");
}

/**
 * A square SVG built from grids painted in order onto a background.
 *
 * `pad` is the margin around the grid, in grid cells: a mark that runs to the
 * edge of its own square has nowhere to breathe once something crops it, and a
 * profile picture is always cropped.
 *
 * @param layers `[grid, colour]` pairs, painted first to last.
 */
export function paint({ layers, background, size, cells = 12, pad = 0 }) {
  const span = cells + pad * 2;
  const body = layers.map(([grid, color]) => rects(grid, color, pad, pad)).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${span} ${span}" width="${size}" height="${size}" shape-rendering="crispEdges">
  ${background ? `<rect width="${span}" height="${span}" fill="${background}"/>` : ""}
  ${body}
</svg>`;
}
