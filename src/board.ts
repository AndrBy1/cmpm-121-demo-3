// deno-lint-ignore-file

import leaflet from "leaflet";

export interface Cell {
  readonly i: number;
  readonly j: number;
}

export interface Coin {
  readonly cell: Cell;
  readonly serial: number;
}

interface board {
  readonly tileVisibilityRadius: number;
  cellDegrees: number;
  playerLocation: number[];
  knownCells: Cell[];
  setCellDegrees(degree: number): void;
  getCellForPoint(point: leaflet.LatLng): Cell;
  getCellBounds(cell: Cell): leaflet.LatLngBounds;
  getCellsNearPoint(point: leaflet.LatLng): Cell[];
  getLatLngOfCell(cell: Cell): leaflet.latLng; //convert cell to leaflet.latLng because leaflet doesn't recognize interface coordinates
  calibrCell(num: number, shrink: boolean): number;
}

export const B: board = {
  tileVisibilityRadius: 0,
  cellDegrees: 0.0001,
  knownCells: [],
  playerLocation: [369894, -1220627],

  setCellDegrees(degree: number): void {
    this.cellDegrees = degree;
  },
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

  getLatLngOfCell(cell: Cell): leaflet.LatLng {
    return leaflet.latLng(cell.i * this.cellDegrees, cell.j * this.cellDegrees);
  },

  calibrCell(num: number, shrink: boolean): number { //calibrate to cell size
    if (shrink) {
      return num * B.cellDegrees;
    } else {
      return num / B.cellDegrees;
    }
  },
};
