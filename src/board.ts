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
  //map: leaflet.Map;
  //getCanonicalCell(cell: Cell): Cell;

  getCellForPoint(point: leaflet.LatLng): Cell;
  getCellBounds(cell: Cell): leaflet.LatLngBounds;
  getCellsNearPoint(point: leaflet.LatLng): Cell[];
  getLatLngOfCell(cell: Cell): leaflet.latLng; //convert cell to leaflet.latLng because leaflet doesn't recognize interface coordinates
  getPlayerLatLng(): leaflet.LatLng;
}

export const accessBoard: board = {
  cellDegrees: 0.0001,
  tileVisibilityRadius: 0,
  knownCells: [],
  playerLocation: { i: 369894, j: -1220627 },
  /*
  map: leaflet.map("map", {
    center: this.playerLocation,
    zoom: 19,
  }),

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

  getLatLngOfCell(cell: Cell): leaflet.LatLng {
    return leaflet.latLng(cell.i * this.cellDegrees, cell.j * this.cellDegrees);
  },

  getPlayerLatLng(): leaflet.LatLng {
    return this.getLatLngOfCell(this.playerLocation);
  },
};
