//got help from https://leafletjs.com/reference.html
// deno-lint-ignore-file
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

import { accessBoard } from "./board.ts";

let totalCoin = 0;

const coinDisplay = document.querySelector<HTMLDivElement>("#statusPanel")!;
coinDisplay.innerHTML = "Coins: " + totalCoin;

const cellDegrees = 0.0001;

const localSize = 8;
const playerLat = 369894;
const playerLng = -1220627;
const playerCell = { i: playerLat, j: -1220627 };
const playerLocation = accessBoard.getLatLngOfCell(playerCell);

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
  let x = playerLat - localSize;
  x < playerLat + localSize;
  x++
) {
  for (
    let y = playerLng - localSize;
    y < playerLng + localSize;
    y++
  ) {
    randomNum = genRandom(1, 100);
    if (randomNum <= 10) {
      generateCache(x * cellDegrees, y * cellDegrees);
    }
  }
}

function generateCache(x: number, y: number) {
  const cacheLocation = leaflet.latLng(x, y);
  const popupText = "Cache at " + x + ", " + y + ".\n Coin value is ";
  const cacheMarker = leaflet.marker(cacheLocation);
  cacheMarker.bindPopup(() => {
    let coinValue = genRandom(1, 6);
    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
      <div> "${popupText}<span id="count">${coinValue}</span>\n".</div> 
      <button id="collect">collect</button>
      <button id="deposit">deposit</button>`;

    popupContent.querySelector<HTMLButtonElement>("#collect")!
      .addEventListener("click", () => {
        coinValue = popupButtonClick(true, coinValue, popupContent);
      });

    popupContent.querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        coinValue = popupButtonClick(false, coinValue, popupContent);
      });

    return popupContent;
  });
  cacheMarker.addTo(map);
}

function genRandom(min: number, max: number) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

function popupButtonClick(
  collect: boolean,
  coinNum: number,
  content: HTMLDivElement,
) {
  if (collect && coinNum > 0) {
    totalCoin++;
    coinNum--;
  } else if (!collect && totalCoin > 0) {
    totalCoin--;
    coinNum++;
  }
  coinDisplay.innerHTML = "Coins: " + totalCoin;
  content.querySelector<HTMLSpanElement>("#count")!.innerHTML = coinNum
    .toString();
  return coinNum;
}
