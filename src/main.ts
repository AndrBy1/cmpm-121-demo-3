//got help from https://leafletjs.com/reference.html
// deno-lint-ignore-file
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

import { B, type Cache, type Cell, type Coin } from "./board.ts";

let randomNum: number;
let coinPurse: Coin[] = [];
const directions: string[] = ["⬆️", "⬇️", "⬅️", "➡️"];
const localSize = 8;
let playerLocation = leaflet.latLng(
  B.calibrCell(B.playerLocation[0], true),
  B.calibrCell(B.playerLocation[1], true),
);
const cellDegrees = 0.0001;
B.setCellDegrees(cellDegrees);

const coinDisplay = document.querySelector<HTMLDivElement>("#statusPanel")!;
coinDisplay.innerHTML = "Coins: " + coinPurse.length;

const map = leaflet.map("map", {
  center: playerLocation,
  zoom: 19,
});

let playerMarker = leaflet.marker(playerLocation);
playerMarker.bindPopup("Player Location").openPopup();
playerMarker.addTo(map);

const directionButtons = Array.from(
  { length: 4 },
  () => document.createElement("button"),
);

directionButtons.forEach((button, i) => {
  button.innerHTML = `${directions[i]}`;
  button.addEventListener("click", () => {
    if (i == 0) {
      B.playerLocation[0] += B.calibrCell(B.cellDegrees, false);
    } else if (i == 1) {
      B.playerLocation[0] -= B.calibrCell(B.cellDegrees, false);
    } else if (i == 2) {
      B.playerLocation[1] -= B.calibrCell(B.cellDegrees, false);
    } else if (i == 3) {
      B.playerLocation[1] += B.calibrCell(B.cellDegrees, false);
    }
    console.log(B.playerLocation);
    playerLocation = leaflet.latLng(
      B.calibrCell(B.playerLocation[0], true),
      B.calibrCell(B.playerLocation[1], true),
    );
    playerMarker.setLatLng(playerLocation);
    genMapCells();
  });
  document.body.append(button);
});

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

genMapCells();
function genMapCells() {
  for (
    let x = playerLocation.lat - B.calibrCell(localSize, true);
    x < playerLocation.lat + B.calibrCell(localSize, true);
    x += cellDegrees
  ) {
    for (
      let y = playerLocation.lng - B.calibrCell(localSize, true);
      y < playerLocation.lng + B.calibrCell(localSize, true);
      y += cellDegrees
    ) {
      generateCells(x, y);
    }
  }
  console.log(B.knownCells);
}

function generateCells(x: number, y: number) {
  let generate = true;
  const newCell: Cell = {
    i: B.calibrCell(x, false),
    j: B.calibrCell(y, false),
  };
  B.knownCells.forEach((cell) => { //prevent creating new cells when cell already exists
    if (newCell.i == cell.i && newCell.j == cell.j) {
      console.log("found A Cell");
      generate = false;
    }
  });
  if (generate) {
    B.knownCells.push(newCell);
    randomNum = genRandom(1, 101); //but only 10% of them has a cache
    if (randomNum < 5) {
      console.log("generating cache at " + x + " and " + y);
      generateCache(newCell);
    }
  }
}

function generateCache(cell: Cell) {
  const popupText = "Cache at " + cell.i + ", " + cell.j + ".\n Coin value is ";
  const cacheMarker = leaflet.marker(
    B.getLatLngOfCell(B.knownCells[B.knownCells.length - 1]),
  );
  let localCache: Cache = {
    coins: [],
  };
  let coinCount: number;
  for (coinCount = genRandom(0, 6); coinCount > 0; coinCount--) {
    localCache.coins.push(createCoin(cell, coinCount));
  }
  cacheMarker.bindPopup(() => {
    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
      <div> "${popupText}<span id="count">${localCache.coins.length}</span>\n".</div> 
      <button id="collect">collect</button>
      <button id="deposit">deposit</button>`;

    popupContent.querySelector<HTMLButtonElement>("#collect")!
      .addEventListener("click", () => {
        popupButtonClick(true, localCache.coins, popupContent);
      });

    popupContent.querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        popupButtonClick(false, localCache.coins, popupContent);
      });

    return popupContent;
  });
  cacheMarker.addTo(map);
  B.knownCache.push(localCache);
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
}
