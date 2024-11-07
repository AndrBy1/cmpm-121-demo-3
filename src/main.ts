// deno-lint-ignore-file
// todo
// todo
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

let totalCoin = 0;

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
  let coinValue = 1;

  const cacheLocation = leaflet.latLng(x, y);
  const popupText = "Cache at " + x + ", " + y + ".\n Coin value is " +
    coinValue;
  const cacheMarker = leaflet.marker(cacheLocation);
  cacheMarker.bindPopup(() => {
    const popupContent = document.createElement("div");
    popupContent.innerHTML = `<div> "${popupText}".</div> 
      <button id="collect">collect</button>
      <button id="deposit">deposit</button>`;

    popupContent.querySelector<HTMLButtonElement>("#collect")!
      .addEventListener("click", () => {
        console.log("collect clicked");
        totalCoin += coinValue;
        coinValue = 0;
      });

    popupContent.querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        console.log("deposit clicked");
        coinValue += totalCoin;
        totalCoin = 0;
      });

    return popupContent;
  });
  cacheMarker.addTo(map);

  /*
  const bounds = leaflet.latLngBounds([
    [playerLocation.lat + cellDegrees, playerLocation.lng + cellDegrees],
    [playerLocation.lat + cellDegrees, playerLocation.lng + cellDegrees],
  ]);
  const rect = leaflet.rectangle(bounds);
  rect.addTo(map);*/
}
