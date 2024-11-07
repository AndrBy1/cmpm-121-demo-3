//got help from https://leafletjs.com/reference.html
// deno-lint-ignore-file
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

let totalCoin = 0;

const coinDisplay = document.querySelector<HTMLDivElement>("#statusPanel")!;
coinDisplay.innerHTML = "Coins: " + totalCoin;

const cellDegrees = 0.0001;

const localSize = 10;
const playerLat = 36.98949379578401;
const playerLng = -122.06277128548504;
const playerLocation = leaflet.latLng(playerLat, playerLng);

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
  let x = playerLat - localSize * cellDegrees;
  x < playerLat + localSize * cellDegrees;
  x += cellDegrees
) {
  for (
    let y = playerLng - localSize * cellDegrees;
    y < playerLng + localSize * cellDegrees;
    y += cellDegrees
  ) {
    randomNum = (Math.random() * (100 - 1 + 1)) + 1;
    if (randomNum <= 10) {
      generateCache(x, y);
    }
  }
}

function generateCache(x: number, y: number) {
  const cacheLocation = leaflet.latLng(x, y);
  const popupText = "Cache at " + x + ", " + y + ".\n Coin value is ";
  const cacheMarker = leaflet.marker(cacheLocation);
  cacheMarker.bindPopup(() => {
    let coinValue = 3;
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
