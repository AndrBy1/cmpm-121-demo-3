// deno-lint-ignore-file
// todo
// todo
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";

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
    generateCache(x, y);
  }
}

function generateCache(x: number, y: number) {
  const cacheLocation = leaflet.latLng(x, y);
  const cacheMarker = leaflet.marker(cacheLocation);
  cacheMarker.bindPopup("cache here").openPopup();
  cacheMarker.addTo(map);
  /*
  const bounds = leaflet.latLngBounds([
    [playerLocation.lat + cellDegrees, playerLocation.lng + cellDegrees],
    [playerLocation.lat + cellDegrees, playerLocation.lng + cellDegrees],
  ]);
  const rect = leaflet.rectangle(bounds);
  rect.addTo(map);*/
}
