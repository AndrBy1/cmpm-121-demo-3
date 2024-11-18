//got help from https://leafletjs.com/reference.html and
//https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt
// deno-lint-ignore-file
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./style.css";
import luck from "./luck.ts";

import { B, type Cache, type Cell, type Coin } from "./board.ts";

let randomNum: number;
let coinBag: Coin[] = [];
let lines: leaflet.Polyline<any, any>[] = [];
const directions: string[] = [
  "⬆️",
  "⬇️",
  "⬅️",
  "➡️",
  "🌐",
  "🚮",
  "save game",
  "restore save",
];
const localSize = 8;
const startLat = 369894;
const startLng = -1220627;
B.playerLocation = [startLat, startLng];
let playerLocation = leaflet.latLng(
  B.calibrCell(B.playerLocation[0], true),
  B.calibrCell(B.playerLocation[1], true),
);
const cellDegrees = 0.0001;
B.setCellDegrees(cellDegrees);

const coinDisplay = document.querySelector<HTMLDivElement>("#statusPanel")!;
coinDisplay.innerHTML = "Coins: " + coinBag.length;

const map = leaflet.map("map", {
  center: playerLocation,
  zoom: 19,
});

let playerLine = leaflet.polyline(B.getHistoryLatLng(), { color: "red" });
lines.push(playerLine);
playerLine.addTo(map);

let playerMarker = leaflet.marker(playerLocation);
playerMarker.bindPopup("Player Location").openPopup();
playerMarker.addTo(map);

const directionButtons = Array.from(
  { length: 7 },
  () => document.createElement("button"),
);

directionButtons.forEach((button, i) => {
  button.innerHTML = `${directions[i]}`;
  button.addEventListener("click", () => {
    if (i == 0) {
      //B.playerLocation[0] += B.calibrCell(B.cellDegrees, false);
      makeMove(0, true);
    } else if (i == 1) {
      makeMove(0, false);
    } else if (i == 2) {
      makeMove(1, false);
    } else if (i == 3) {
      makeMove(1, true);
    } else if (i == 4) {
      map.locate({
        watch: false,
        setView: false,
      });
      console.log(
        "player lat lng: " + B.playerLocation[0] + ", " + B.playerLocation[1],
      );
    } else if (i == 5) {
      let answer: string = window.prompt(
        "are you sure you want to erase your game state? \n Type yes to proceed",
      )!;
      if (answer == "yes") {
        console.log("reset hit");
        resetButton();
      }
    } else if (i == 6) {
      localStorage.setItem("gameState", B.toMomento(B.knownCache[0], B));
    } else if (i == 7) {
      B.fromMomento(localStorage.getItem("gameState")!, true);
    }
  });
  document.body.append(button);
});

map.on("locationfound", function (e) {
  makeMove(0, false, {
    i: B.calibrCell(e.latlng.lat, false),
    j: B.calibrCell(e.latlng.lng, false),
  });
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
}

function generateCells(x: number, y: number) {
  let generate = true;
  const newCell: Cell = {
    i: Math.floor(B.calibrCell(x, false)),
    j: Math.floor(B.calibrCell(y, false)),
  };
  B.knownCells.forEach((cell) => { //prevent creating new cells when cell already exists
    if (newCell.i == cell.i && newCell.j == cell.j) {
      generate = false;
    }
  });
  if (generate) {
    B.knownCells.push(newCell);
    randomNum = genRandom(1, 100); //but only 10% of them has a cache
    if (randomNum < 10) {
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
    cell: cell,
    coins: [],
  };

  let coinCount: number;
  for (coinCount = genRandom(1, 6); coinCount > 0; coinCount--) {
    localCache.coins.push({ cell: cell, serial: coinCount });
  }
  cachePopup(cacheMarker, popupText, localCache);
  B.knownCache.push(localCache);
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
      coinBag.push(localStash.pop()!);
      console.log(
        "collected coin: " + JSON.stringify(coinBag[coinBag.length - 1]),
      );
    }
  } else if (!collect && coinBag.length > 0) { //if the deposit button clicked
    if (coinBag.length > 0) {
      localStash.push(coinBag.pop()!);
    }
  }
  coinDisplay.innerHTML = "Coins: " + coinBag.length;
  content.querySelector<HTMLSpanElement>("#count")!.innerHTML = localStash
    .length
    .toString();
}

function distance(cell1: Cell, cell2: Cell) {
  return Math.pow(cell2.i - cell1.i, 2) + Math.pow(cell2.j - cell1.j, 2);
}

function cachePopup(
  marker: leaflet.Marker<any>,
  popupText: string,
  cache: Cache,
) {
  marker.bindPopup(() => {
    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
      <div> "${popupText}<span id="count">${cache.coins.length}</span>\n".</div> 
      <button id="collect">collect</button>
      <button id="deposit">deposit</button>`;

    popupContent.querySelector<HTMLButtonElement>("#collect")!
      .addEventListener("click", () => {
        popupButtonClick(true, cache.coins, popupContent);
      });

    popupContent.querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        popupButtonClick(false, cache.coins, popupContent);
      });

    return popupContent;
  });
  marker.addTo(map);
}

function distMomentos() {
  for (let c = 0; c < B.knownCache.length; c++) {
    if (
      distance(B.knownCache[c].cell, {
        i: B.playerLocation[0],
        j: B.playerLocation[1],
      }) >
        260
    ) {
      console.log("momentos used: " + JSON.stringify(B.knownCache[c]));
      let momentostr = B.toMomento(B.knownCache[c]);
      c--;
    }
  }
  console.log("momento cache: " + B.MomentoCache);
  console.log("momento length: " + B.MomentoCache.length);
  for (let s = 0; s < B.MomentoCache.length; s++) {
    const cache: Cache = JSON.parse(B.MomentoCache[s]);
    if (
      distance(cache.cell, { i: B.playerLocation[0], j: B.playerLocation[1] }) <
        260
    ) {
      console.log("s: " + s + "momentos unused: " + (B.MomentoCache[s]));

      B.fromMomento(B.MomentoCache[s], false);
      s--;
    }
  }
  console.log("momento cache: " + B.MomentoCache);
}

function makeMove(orientation: number, direction: boolean, move?: Cell) {
  B.movePlayer(orientation, direction, move);
  playerLocation = leaflet.latLng(
    B.calibrCell(B.playerLocation[0], true),
    B.calibrCell(B.playerLocation[1], true),
  );
  playerMarker.setLatLng(playerLocation);
  map.panTo(playerLocation);
  genMapCells();
  B.playerHistory.push([B.playerLocation[0], B.playerLocation[1]]);
  playerLine = leaflet.polyline(B.getHistoryLatLng(), { color: "black" });
  lines.push(playerLine);
  playerLine.addTo(map);
  distMomentos();
  console.log("Player pos: " + playerLocation);
}

function resetButton() {
  B.playerHistory = [];
  lines.forEach((line) => {
    line.removeFrom(map);
  });
  B.MomentoCache.forEach((data) => {
    B.fromMomento(data, false);
  });
  distMomentos();
  B.knownCache.forEach((cache) => { //returns coins from other cache to original cache
    for (let i = 0; i < cache.coins.length; i++) {
      if (
        (cache.coins[i] != undefined) &&
        (cache.coins[i].cell != cache.cell)
      ) {
        coinBag.push(cache.coins[i]);
        cache.coins.splice(cache.coins.indexOf(cache.coins[i]), 1);
        i--;
      }
    }
  });
  coinBag.forEach((coin) => { //returns coins from purse to original cache
    B.knownCache.forEach((cache) => {
      if (coin.cell == cache.cell) {
        cache.coins.push(coin);
      }
    });
  });
  coinBag = [];
  console.log("start: " + startLat + ", " + startLng);
  makeMove(0, false, {
    i: startLat,
    j: startLng,
  });
  coinDisplay.innerHTML = "Coins: " + coinBag.length;
}
