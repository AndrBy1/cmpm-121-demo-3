//got help from https://leafletjs.com/reference.html
// deno-lint-ignore-file
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

import { B, type Cell, type Coin } from "./board.ts";

let coinPurse: Coin[] = [];
const localSize = 8;
const playerLocation = B.getLatLngOfCell(B.playerLocation);
const cellDegrees = 0.0001;
B.setCellDegrees(cellDegrees);

const coinDisplay = document.querySelector<HTMLDivElement>("#statusPanel")!;
coinDisplay.innerHTML = "Coins: " + coinPurse.length;

const map = leaflet.map("map", {
  center: playerLocation,
  zoom: 19,
});

const playerMarker = leaflet.marker(playerLocation);
playerMarker.bindPopup("Player Location").openPopup();
playerMarker.addTo(map);

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

for (
  let x = playerLocation.lat - calibCell(localSize, true);
  x < playerLocation.lat + calibCell(localSize, true);
  x += cellDegrees
) {
  for (
    let y = playerLocation.lng - calibCell(localSize, true);
    y < playerLocation.lng + calibCell(localSize, true);
    y += cellDegrees
  ) {
    generateCells(x, y);
  }
}

let randomNum: number;
function generateCells(x: number, y: number) {
  const newCell: Cell = { i: calibCell(x, false), j: calibCell(y, false) };
  B.knownCells.push(newCell); //every cell is created
  randomNum = genRandom(1, 100); //but only 10% of them has a cache
  if (randomNum <= 10) {
    console.log("generating cache at " + x + " and " + y);
    generateCache(newCell);
  }
}

function generateCache(cell: Cell) {
  const popupText = "Cache at " + cell.i + ", " + cell.j + ".\n Coin value is ";
  const cacheMarker = leaflet.marker(
    B.getLatLngOfCell(B.knownCells[B.knownCells.length - 1]),
  );
  let coinCount = genRandom(1, 6);
  let localCoins: Coin[] = [];
  for (let i = 0; i < coinCount; i++) {
    localCoins.push(createCoin(cell, i));
  }
  cacheMarker.bindPopup(() => {
    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
      <div> "${popupText}<span id="count">${coinCount}</span>\n".</div> 
      <button id="collect">collect</button>
      <button id="deposit">deposit</button>`;

    popupContent.querySelector<HTMLButtonElement>("#collect")!
      .addEventListener("click", () => {
        coinCount = popupButtonClick(true, localCoins, popupContent);
      });

    popupContent.querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        coinCount = popupButtonClick(false, localCoins, popupContent);
      });

    return popupContent;
  });
  cacheMarker.addTo(map);
}

function createCoin(cell: Cell, serialNum: number): Coin {
  return { cell: cell, serial: serialNum };
}

function genRandom(min: number, max: number) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

function popupButtonClick(
  collect: boolean,
  localStash: Coin[],
  content: HTMLDivElement,
) {
  if (collect && localStash.length > 0) { //if the collect button clicked
    if (localStash.length > 0) {
      coinPurse.push(localStash.pop()!);
    }
  } else if (!collect && coinPurse.length > 0) { //if the deposit button clicked
    if (coinPurse.length > 0) {
      localStash.push(coinPurse.pop()!);
    }
  }
  coinDisplay.innerHTML = "Coins: " + coinPurse.length;
  content.querySelector<HTMLSpanElement>("#count")!.innerHTML = localStash
    .length
    .toString();
  return localStash.length;
}

function calibCell(num: number, shrink: boolean): number { //calibrate to cell size
  if (shrink) {
    return num * B.cellDegrees;
  } else {
    return num / B.cellDegrees;
  }
}
