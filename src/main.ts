// deno-lint-ignore-file
// todo
// todo
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

let totalCoin = 0;

const coinDisplay = document.querySelector<HTMLDivElement>("#statusPanel")!;
coinDisplay.innerHTML = "Coins: " + totalCoin;

const cellDegrees = 0.0001;
const message = "You clicked the button!";
const Button1 = document.createElement("button");
Button1.textContent = "Click";
document.body.append(Button1);

Button1.addEventListener("click", () => {
  alert(message);
});

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
        if (coinValue > 0) {
          console.log("collect clicked");
          totalCoin++;
          coinValue--;
          coinDisplay.innerHTML = "Coins: " + totalCoin;
          popupContent.querySelector<HTMLSpanElement>("#count")!.innerHTML =
            coinValue.toString();
        }
      });

    popupContent.querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        if (totalCoin > 0) {
          console.log("collect clicked");
          totalCoin--;
          coinValue++;
          coinDisplay.innerHTML = "Coins: " + totalCoin;
          popupContent.querySelector<HTMLSpanElement>("#count")!.innerHTML =
            coinValue.toString();
        }
      });

    return popupContent;
  });
  cacheMarker.addTo(map);
}

function popupButtonClick(C: boolean, coinNum: number) {
  if (C) {
    console.log("collect clicked");
    totalCoin++;
    coinNum--;
    coinDisplay.innerHTML = "Coins: " + totalCoin;
    return coinNum;
  }
}
