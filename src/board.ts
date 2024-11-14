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

export interface Cache {
  cell: Cell;
  coins: Coin[]; //store the different coins generated from each cache
}

interface Momento<T> {
  toMomento(cache: Cache): T;
  fromMomento(momento: T): void;
}

interface board extends Momento<string> {
  readonly tileVisibilityRadius: number;
  cellDegrees: number;
  playerLocation: number[];
  knownCache: Cache[];
  MomentoCache: string[];
  knownCells: Cell[];
  playerHistory: Cell[];
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
  knownCache: [],
  MomentoCache: [],
  playerLocation: [369894, -1220627],
  playerHistory: [{ i: 369894, j: -1220627 }],
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

  calibrCell(num: number, shrink: boolean): number {
    if (shrink) {
      return Math.floor(num) * B.cellDegrees;
    } else {
      return Math.floor(num / B.cellDegrees);
    }
  },

  toMomento(cache: Cache): string {
    let str: string = JSON.stringify(cache);
    this.MomentoCache.push(str);
    this.knownCache.splice(this.knownCache.indexOf(cache), 1);
    return str;
  },

  fromMomento(momento: string): void {
    const cache: Cache = JSON.parse(momento);
    this.knownCache.push(cache);
  },
};
