//got help from https://leafletjs.com/reference.html
// deno-lint-ignore-file
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

import { B, type Cell } from "./board.ts";

let totalCoin = 0;

const coinDisplay = document.querySelector<HTMLDivElement>("#statusPanel")!;
coinDisplay.innerHTML = "Coins: " + totalCoin;

const localSize = 8;
const playerLocation = B.getLatLngOfCell(B.playerLocation);

let coinPurse: Cell[] = [];
let trackSerial = 0;

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

let randomNum: number;

for (
  let x = playerLocation.lat - calibCell(localSize, true);
  x < playerLocation.lat + calibCell(localSize, true);
  x += 0.0001
) {
  for (
    let y = playerLocation.lng - calibCell(localSize, true);
    y < playerLocation.lng + calibCell(localSize, true);
    y += 0.0001
  ) {
    generateCells(x, y);
  }
}

function generateCells(x: number, y: number) {
  B.setNewCell(calibCell(x, false), calibCell(y, false)); //every cell is created
  randomNum = genRandom(1, 100); //but only 10% of them has a cache
  if (randomNum <= 10) {
    console.log("generating cache at " + x + " and " + y);
    generateCache(x, y);
  }
}

function generateCache(x: number, y: number) {
  const popupText = "Cache at " + x + ", " + y + ".\n Coin value is ";
  const cacheMarker = leaflet.marker(
    B.getLatLngOfCell(B.knownCells[B.knownCells.length - 1]),
  );
  let coinCount = genRandom(1, 6);
  let localCoins: Cell[];
  for (let i = 0; i < coinCount; i++) {
  }
  cacheMarker.bindPopup(() => {
    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
      <div> "${popupText}<span id="count">${coinCount}</span>\n".</div> 
      <button id="collect">collect</button>
      <button id="deposit">deposit</button>`;

    popupContent.querySelector<HTMLButtonElement>("#collect")!
      .addEventListener("click", () => {
        coinCount = popupButtonClick(true, coinCount, popupContent);
      });

    popupContent.querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        coinCount = popupButtonClick(false, coinCount, popupContent);
      });

    return popupContent;
  });
  cacheMarker.addTo(map);
}

function createCoin(x: number, y: number): Cell {
  return { i: x, j: y, serial: trackSerial };
}

function genRandom(min: number, max: number) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

function popupButtonClick(
  collect: boolean,
  coinNum: number,
  content: HTMLDivElement,
) {
  if (collect && coinNum > 0) { //if the collect button clicked
    totalCoin++;
    coinNum--;
  } else if (!collect && totalCoin > 0) { //if the deposit button clicked
    totalCoin--;
    coinNum++;
  }
  coinDisplay.innerHTML = "Coins: " + totalCoin;
  content.querySelector<HTMLSpanElement>("#count")!.innerHTML = coinNum
    .toString();
  return coinNum;
}

function calibCell(num: number, shrink: boolean): number { //calibrate to cell size
  if (shrink) {
    return num * B.cellDegrees;
  } else {
    return num / B.cellDegrees;
  }
}
