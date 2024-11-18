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
  toMomento(cache: Cache, cell?: Cell): T;
  fromMomento(momento: T): void;
}

interface board extends Momento<string> {
  cellDegrees: number;
  knownCache: Cache[];
  MomentoCache: string[];
  knownCells: Cell[];
  playerLocation: number[];
  playerHistory: number[][];
  setCellDegrees(degree: number): void;
  getLatLngOfCell(cell: Cell): leaflet.latLng; //convert cell to leaflet.latLng because leaflet doesn't recognize interface coordinates
  calibrCell(num: number, shrink: boolean): number;
  movePlayer(orientation: number, direction: boolean, move?: Cell): void;
  getHistoryLatLng(): leaflet.latlng;
}

export const B: board = {
  cellDegrees: 0.0001,
  knownCells: [],
  knownCache: [],
  MomentoCache: [],
  playerLocation: [369894, -1220627],
  playerHistory: [[369894, -1220627]],
  setCellDegrees(degree: number): void {
    this.cellDegrees = degree;
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

  toMomento(cache: Cache, cell?: Cell): string {
    const str: string = JSON.stringify(cache);
    this.MomentoCache.push(str);
    this.knownCache.splice(this.knownCache.indexOf(cache), 1);
    return str;
  },

  fromMomento(momento: string): void {
    const cache: Cache = JSON.parse(momento);
    this.MomentoCache.splice(this.MomentoCache.indexOf(momento));
    this.knownCache.push(cache);
  },

  movePlayer(orientation: number, direction: boolean, move?: Cell): void {
    if (move != undefined) {
      this.playerLocation = [move.i, move.j];
    } else if (direction) {
      this.playerLocation[orientation] += this.calibrCell(
        this.cellDegrees,
        false,
      );
    } else {
      this.playerLocation[orientation] -= this.calibrCell(
        this.cellDegrees,
        false,
      );
    }
  },
  getHistoryLatLng(): leaflet.latlng {
    let history: number[][] = [];
    this.playerHistory.forEach((num) => {
      history.push([
        this.calibrCell(num[0], true),
        this.calibrCell(num[1], true),
      ]);
    });
    return history;
  },
};
