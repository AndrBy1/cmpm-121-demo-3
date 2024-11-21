//got help from https://leafletjs.com/reference.html and
//https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt
// deno-lint-ignore-file
// @deno-types="npm:@types/leaflet@^1.9.14"

import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import { B, type Cache, type Cell, type Coin, returnBoard } from "./board.ts";

let randomNum: number;
let lines: leaflet.Polyline<any, any>[] = [];
let cMarkers: leaflet.Marker<any>[] = [];
const buttonText: string[] = [
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
coinDisplay.innerHTML = "Coins: " + B.coinBag.length;

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

const interactButtons = Array.from(
  { length: 8 },
  () => document.createElement("button"),
);

interactButtons.forEach((button, i) => {
  button.innerHTML = `${buttonText[i]}`;
  button.addEventListener("click", () => {
    if (i == 0) {
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
    } else if (i == 5) {
      let answer: string = window.prompt(
        "are you sure you want to erase your game state? \n Type yes to proceed",
      )!;
      if (answer == "yes") {
        resetFunc();
      }
    } else if (i == 6) {
      localStorage.setItem("gameState", B.toMomento(B.knownCache[0], B));
    } else if (i == 7) {
      removeMarkings(true, true);
      returnBoard(localStorage.getItem("gameState")!);
      coinDisplay.innerHTML = "Coins: " + B.coinBag.length;
      makeMarkings();
      B.knownCache.forEach((cache) => {
        const popupText = "Cache at " + cache.cell.i + ", " + cache.cell.j +
          ".\n Coin value is ";
        const cacheMarker = leaflet.marker(
          B.getLatLngOfCell(cache.cell),
        );
        cachePopup(cacheMarker, popupText, cache);
        cMarkers.push(cacheMarker);
      });
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
  B.knownCells.forEach((cell) => {
    if (newCell.i == cell.i && newCell.j == cell.j) {
      generate = false;
    }
  });
  if (generate) {
    B.knownCells.push(newCell);
    randomNum = genRandom(1, 100);
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
  cMarkers.push(cacheMarker);
  B.knownCache.push(localCache);
}

function genRandom(min: number, max: number) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
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

function popupButtonClick(
  collect: boolean,
  localStash: Coin[],
  content: HTMLDivElement,
) {
  if (collect && localStash.length > 0) {
    if (localStash.length > 0) {
      B.coinBag.push(localStash.pop()!);
    }
  } else if (!collect && B.coinBag.length > 0) {
    if (B.coinBag.length > 0) {
      localStash.push(B.coinBag.pop()!);
    }
  }
  coinDisplay.innerHTML = "Coins: " + B.coinBag.length;
  content.querySelector<HTMLSpanElement>("#count")!.innerHTML = localStash
    .length
    .toString();
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
      let momentostr = B.toMomento(B.knownCache[c]);
      c--;
    }
  }
  for (let s = 0; s < B.MomentoCache.length; s++) {
    const cache: Cache = JSON.parse(B.MomentoCache[s]);
    if (
      distance(cache.cell, { i: B.playerLocation[0], j: B.playerLocation[1] }) <
        260
    ) {
      B.fromMomento(B.MomentoCache[s]);
      s--;
    }
  }
}

function makeMove(orientation: number, direction: boolean, move?: Cell) {
  B.movePlayer(orientation, direction, move);
  B.playerHistory.push([B.playerLocation[0], B.playerLocation[1]]);
  makeMarkings();
  genMapCells();
  distMomentos();
}

function makeMarkings() {
  playerLocation = leaflet.latLng(
    B.calibrCell(B.playerLocation[0], true),
    B.calibrCell(B.playerLocation[1], true),
  );
  playerMarker.setLatLng(playerLocation);
  map.panTo(playerLocation);
  playerLine = leaflet.polyline(B.getHistoryLatLng(), { color: "black" });
  lines.push(playerLine);
  playerLine.addTo(map);
}

function removeMarkings(removeLines: boolean, removeMarkers: boolean) {
  if (removeLines) {
    lines.forEach((line) => {
      line.removeFrom(map);
    });
    lines = [];
  }
  if (removeMarkers) {
    cMarkers.forEach((mark) => {
      mark.removeFrom(map);
    });
    cMarkers = [];
  }
}

function resetFunc() {
  B.playerHistory = [];
  removeMarkings(true, false);
  B.MomentoCache.forEach((data) => {
    B.fromMomento(data);
  });
  distMomentos();
  B.knownCache.forEach((cache) => {
    for (let i = 0; i < cache.coins.length; i++) {
      if (
        (cache.coins[i] != undefined) &&
        (cache.coins[i].cell != cache.cell)
      ) {
        B.coinBag.push(cache.coins[i]);
        cache.coins.splice(cache.coins.indexOf(cache.coins[i]), 1);
        i--;
      }
    }
  });
  B.coinBag.forEach((coin) => {
    B.knownCache.forEach((cache) => {
      if (coin.cell == cache.cell) {
        cache.coins.push(coin);
      }
    });
  });
  B.coinBag = [];
  makeMove(0, false, {
    i: startLat,
    j: startLng,
  });
  coinDisplay.innerHTML = "Coins: " + B.coinBag.length;
}
