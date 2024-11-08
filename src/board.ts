// deno-lint-ignore-file

import leaflet from "leaflet";

interface Cell {
  readonly i: number;
  readonly j: number;
}

interface board {
  readonly knownCells: Map<string, Cell>;
  readonly cellDegrees: number;
  readonly tileVisibilityRadius: number;
  playerLocation: Cell;
  map: leaflet.Map;
  generateCache(x: number, y: number): void;
  genRandom(min: number, max: number): number;
  popupButtonClick(
    collect: boolean,
    coinNum: number,
    content: HTMLDivElement,
  ): number;
  getCanonicalCell(cell: Cell): Cell;
  getCellForPoint(point: leaflet.LatLng): Cell;
  getCellBounds(cell: Cell): leaflet.LatLngBounds;
  getCellsNearPoint(point: leaflet.LatLng): Cell[];
}
