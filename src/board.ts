// deno-lint-ignore-file

import leaflet from "leaflet";

interface Cell {
  readonly i: number;
  readonly j: number;
}

interface board {
  readonly map: leaflet.Map;
  readonly knownCells: Map<string, Cell>;
  readonly cellDegrees: number;
  readonly tileVisibilityRadius: number;
  generateCache(x: number, y: number): void;
  genRandom(min: number, max: number): number;
  popupButtonClick(
    collect: boolean,
    coinNum: number,
    content: HTMLDivElement,
  ): number;
}
