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
  coins: Coin[]; //store the different coins generated from each cache
}

interface Momento<T> {
  toMomento(): T;
  fromMomento(momento: T): void;
}

interface board extends Momento<string> {
  readonly tileVisibilityRadius: number;
  cellDegrees: number;
  playerLocation: number[];
  knownCache: Cache[];
  MomentoCache: string[];
  knownCells: Cell[];
  setCellDegrees(degree: number): void;
  getCellForPoint(point: leaflet.LatLng): Cell;
  getCellBounds(cell: Cell): leaflet.LatLngBounds;
  getCellsNearPoint(point: leaflet.LatLng): Cell[];
  getLatLngOfCell(cell: Cell): leaflet.latLng; //convert cell to leaflet.latLng because leaflet doesn't recognize interface coordinates
  calibrCell(num: number, shrink: boolean): number;
  cacheToString(cache: Cache): string;
  StringToCache(str: string): Cache;
}

export const B: board = {
  tileVisibilityRadius: 0,
  cellDegrees: 0.0001,
  knownCells: [],
  knownCache: [],
  MomentoCache: [],
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

  calibrCell(num: number, shrink: boolean): number {
    if (shrink) {
      return Math.floor(num) * B.cellDegrees;
    } else {
      return Math.floor(num / B.cellDegrees);
    }
  },

  cacheToString(cache: Cache): string {
    return cache.coins
      .map((coin) =>
        `Coin: { Serial: ${coin.serial}, Cell: { i: ${coin.cell.i}, j: ${coin.cell.j} } }`
      )
      .join("\n");
  },
  StringToCache(str: string): Cache {
    throw new Error("Function not implemented.");
  },

  toMomento(): string {
    let str: string = this.knownCache.toString();
    this.MomentoCache.push(this.knownCache.shift.toString());
    return this.knownCache.shift.toString();
  },
  fromMomento: function (momento: string): void {
    const coins: Coin[] = [];
    const lines = momento.split("/n");
    throw new Error("Function not implemented.");
  },
};
