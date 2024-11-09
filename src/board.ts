// deno-lint-ignore-file

import leaflet from "leaflet";

interface Cell {
  readonly i: number;
  readonly j: number;
}

interface board {
  readonly cellDegrees: number;
  readonly tileVisibilityRadius: number;
  playerLocation: Cell;
  knownCells: Cell[];
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
};
