// deno-lint-ignore-file

import leaflet from "leaflet";

interface Cell {
  readonly i: number;
  readonly j: number;
}

interface board {
  readonly cellDegrees: number;
  readonly tileVisibilityRadius: number;
  knownCells: Cell[];
  playerLocation: Cell;
  map: leaflet.Map;
  generateCache(x: number, y: number): void;
  genRandom(min: number, max: number): number;
  popupButtonClick(
    collect: boolean,
    coinNum: number,
    content: HTMLDivElement,
  ): number;
  //getCanonicalCell(cell: Cell): Cell;
  getCellForPoint(point: leaflet.LatLng): Cell;
  getCellBounds(cell: Cell): leaflet.LatLngBounds;
  getCellsNearPoint(point: leaflet.LatLng): Cell[];
}

const accessBoard: board = {
  cellDegrees: 0.0001,
  tileVisibilityRadius: 0,
  knownCells: [],
  playerLocation: { i: 369894, j: -1220627 },
  map: leaflet.map("map", {
    center: { i: 369894, j: -1220627 },
    zoom: 19,
  }),
  /*
  getCanonicalCell(cell: Cell): Cell {
    const { i, j } = cell;
    const key = [i, j].toString();
    // ...
    return this.knownCells.get(key)!;
  },*/

  getCellForPoint(point: leaflet.LatLng): Cell {
    return this.knownCells[
      this.knownCells.indexOf({
        i: point.lat,
        j: point.lng,
      })
    ];
  },

  getCellBounds(cell: Cell): leaflet.LatLngBounds {
    // ...
  },

  getCellsNearPoint(point: leaflet.LatLng): Cell[] {
    const resultCells: Cell[] = [];
    const originCell = this.getCellForPoint(point);
    // ...
    return resultCells;
  },

  generateCache: function (x: number, y: number): void {
    throw new Error("Function not implemented.");
  },
  genRandom: function (min: number, max: number): number {
    throw new Error("Function not implemented.");
  },
  popupButtonClick: function (
    collect: boolean,
    coinNum: number,
    content: HTMLDivElement,
  ): number {
    throw new Error("Function not implemented.");
  },
};
