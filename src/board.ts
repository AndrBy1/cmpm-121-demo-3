// deno-lint-ignore-file

import leaflet from "leaflet";

interface Cell {
  readonly i: number;
  readonly j: number;
  generateCache(x: number, y: number): void;
  genRandom(min: number, max: number): number;
  popupButtonClick(
    collect: boolean,
    coinNum: number,
    content: HTMLDivElement,
  ): number;
}
