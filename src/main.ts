//got help from https://leafletjs.com/reference.html and
//https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt
// deno-lint-ignore-file
// @deno-types="npm:@types/leaflet@^1.9.14"

import leaflet, { Marker, marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import { B, type Cache, type Cell, type Coin, returnBoard } from "./board.ts";
import "leaflet/dist/leaflet.css";
import "./style.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let randomNum: number;
let lines: leaflet.Polyline<any, any>[] = [];
let cMarkers = new Map<string, leaflet.Marker>();
let cellBounds = new Map<string, leaflet.Rectangle>();
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
const playerLat = 369894;
const playerLng = -1220627;
B.playerLocation = [playerLat, playerLng];
let playerLocation = leaflet.latLng(
  B.calibrCell(B.playerLocation[0], true),
  B.calibrCell(B.playerLocation[1], true),
);
const cellDegrees = 0.0001;

const coinDisplay = document.querySelector<HTMLDivElement>("#statusPanel")!;
coinDisplay.innerHTML = "Coins: " + B.coinBag.length;

const map = leaflet.map("map", {
  center: playerLocation,
  zoom: 19,
});

let playerLine = leaflet.polyline(B.getHistoryLatLng(), { color: "red" });
lines.push(playerLine);
playerLine.addTo(map);

let PlayerIcon = leaflet.icon({
  iconUrl: icon,
  iconSize: [32, 38],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

let markerIcon = leaflet.icon({
  iconUrl: icon,
  iconSize: [24, 24],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

let playerMarker = leaflet.marker(playerLocation, { icon: PlayerIcon });
playerMarker.bindPopup("Player Location").openPopup();
playerMarker.addTo(map);

const interactButtons = Array.from(
  { length: 8 },
  () => document.createElement("button"),
);

setupUIControls();
function setupUIControls() { //this sets up the controls for movement and resetting game
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
        confirmReset();
      } else if (i == 6) {
        saveGame();
      } else if (i == 7) {
        restoreSavedGame();
      }
      markerManager();
    });
    document.body.append(button);
  });
}

map.on("locationfound", function (e) { //this is used for finding the players real world location
  makeMove(0, false, {
    i: B.calibrCell(e.latlng.lat, false),
    j: B.calibrCell(e.latlng.lng, false),
  });
  markerManager();
});

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

if (
  localStorage.getItem("stored-Caches") && localStorage.getItem("stored-cells")
) {
  B.knownCache = JSON.parse(localStorage.getItem("stored-Caches")!);
  B.OGCache = JSON.parse(localStorage.getItem("stored-Caches")!);
  makeAllMarkings();
  B.knownCells = JSON.parse(localStorage.getItem("stored-cells")!);
  markerManager();
} else {
  genMapCells();
}

function genMapCells() { //create all the cells of the map
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
  localStorage.setItem("stored-Caches", JSON.stringify(B.OGCache));
  localStorage.setItem("stored-cells", JSON.stringify(B.knownCells));
}

function generateCells(x: number, y: number) { // creates each individual cell
  let generate = true;
  const newCell: Cell = {
    i: Math.floor(B.calibrCell(x, false)),
    j: Math.floor(B.calibrCell(y, false)),
  };
  createBounds(newCell);
  B.knownCells.forEach((cell) => {
    //if statement ensures the cell generated is unique and not duplicate.
    if (newCell.i == cell.i && newCell.j == cell.j) {
      generate = false;
    }
  });
  if (generate) { //the cache is only generated when the cell is new making caches unique
    B.knownCells.push(newCell); //cell is only pushed when it is new making cells unique
    randomNum = genRandom(1, 100); //this makes the cache generate randomly
    if (randomNum < 10) {
      generateCache(newCell);
    }
  }
}
function createBounds(cell: Cell) { //creates the rectangles for each cell
  if (cellBounds.has(JSON.stringify(cell))) { //so it doesn't accidentally duplicate cells
    return;
  }
  const bound = leaflet.latLngBounds([
    B.getLatLngOfCell(cell).lat - B.cellDegrees / 2,
    B.getLatLngOfCell(cell).lng - B.cellDegrees / 2,
  ], [
    B.getLatLngOfCell(cell).lat + B.cellDegrees / 2,
    B.getLatLngOfCell(cell).lng + B.cellDegrees / 2,
  ]);
  const rectbound = leaflet.rectangle(bound);
  rectbound.addTo(map);
  cellBounds.set(JSON.stringify(cell), rectbound);
}

function generateCache(cell: Cell) { //creates each of the caches
  let localCache: Cache = {
    cell: cell,
    coins: [],
  };
  createMarker(localCache);
  let coinCount: number;
  for (coinCount = genRandom(1, 6); coinCount > 0; coinCount--) {
    localCache.coins.push({ cell: cell, serial: coinCount }); //coins generated are unique and random, serial number is from genRandom
  }
  B.knownCache.push(localCache);
  B.OGCache = B.knownCache;
}

function genRandom(min: number, max: number) { //this creates a random number between the min and max
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

function distance(cell1: Cell, cell2: Cell) { //finds the distance between 2 cells
  return Math.pow(cell2.i - cell1.i, 2) + Math.pow(cell2.j - cell1.j, 2);
}

function cachePopup( //creates a popup that binds to a marker
  marker: leaflet.Marker<any>,
  cache: Cache,
) {
  marker.bindPopup(() => {
    const popupContent = document.createElement("div");
    popupContent.innerHTML = popupTxt(cache);
    popupContent.innerHTML += `<button id="collect">collect</button>
                              <button id="deposit">deposit</button>`;

    popupContent.querySelector<HTMLButtonElement>("#collect")!
      .addEventListener("click", () => {
        popupButtonClick(true, cache, popupContent);
      });

    popupContent.querySelector<HTMLButtonElement>("#deposit")!
      .addEventListener("click", () => {
        popupButtonClick(false, cache, popupContent);
      });

    return popupContent;
  });
  marker.addTo(map);
}

function popupButtonClick( //function for each of the buttons in the popup, what it does depends on the parameters
  collect: boolean,
  localCache: Cache,
  content: HTMLDivElement,
) {
  if (collect && localCache.coins.length > 0) {
    if (localCache.coins.length > 0) {
      B.coinBag.push(localCache.coins.pop()!);
    }
  } else if (!collect && B.coinBag.length > 0) {
    if (B.coinBag.length > 0) {
      localCache.coins.push(B.coinBag.pop()!);
    }
  }
  coinDisplay.innerHTML = "Coins: " + B.coinBag.length;
  content.querySelector<HTMLSpanElement>("#count")!.innerHTML = popupTxt(
    localCache,
  );
}

function popupTxt(cache: Cache) {
  let content: string;
  let txt = "Cache at " + cache.cell.i + ", " + cache.cell.j +
    ".\n Coin count is ";
  let serialText = "serial number(s): ";
  for (let i = 0; i < cache.coins.length; i++) {
    serialText += JSON.stringify(cache.coins[i].serial);
    if (i < cache.coins.length - 1) {
      serialText += ", ";
    }
  }
  content = `
    <div> <span id="count">${txt}${cache.coins.length}, \n${serialText}\n.</div> </span>`;

  return content;
}

function markerManager() { //will remove or regenerate cache marker depending on distance to player
  for (let c = 0; c < B.knownCache.length; c++) {
    if (
      distance(B.knownCache[c].cell, {
        i: B.playerLocation[0],
        j: B.playerLocation[1],
      }) > 300
    ) {
      if (cMarkers.has(JSON.stringify(B.knownCache[c].cell))) {
        const cacheMarker = cMarkers.get(JSON.stringify(B.knownCache[c].cell));
        map.removeLayer(cacheMarker!);
        cMarkers.delete(JSON.stringify(B.knownCache[c].cell));
      }
    } else if (!cMarkers.has(JSON.stringify(B.knownCache[c].cell))) {
      createMarker(B.knownCache[c]);
    }
    let haveItem = false;
    for (let i = 0; i < B.knownCache.length; i++) {
      if (B.MomentoCache[i] == JSON.stringify(B.knownCache[c])) {
        haveItem = true;
        break;
      }
    }
    if (haveItem) {
      B.toMomento(B.knownCache[c]);
    }
  }
}

function createMarker(localCache: Cache) { //creates a singular marker
  const cacheMarker = leaflet.marker(
    B.getLatLngOfCell(localCache.cell),
    { icon: markerIcon },
  );
  cachePopup(cacheMarker, localCache);
  cMarkers.set(JSON.stringify(localCache.cell), cacheMarker);
}

function makeMove(orientation: number, direction: boolean, move?: Cell) { //function for when the player moves, directional buttons call this
  B.movePlayer(orientation, direction, move);
  B.playerHistory.push([B.playerLocation[0], B.playerLocation[1]]);
  makeAllMarkings();
  genMapCells();
}

function makeAllMarkings() { //shows all the markings in range of the player
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

function removeAllMarkings(removeLines: boolean, removeMarkers: boolean) { //removes all the marking for if the game gets restored
  if (removeLines) {
    lines.forEach((line) => {
      line.removeFrom(map);
    });
    lines = [];
  }
  if (removeMarkers) {
    B.knownCache.forEach((cache) => {
      if (cMarkers.has(JSON.stringify(cache.cell))) {
        const cacheMarker = cMarkers.get(JSON.stringify(cache.cell));
        map.removeLayer(cacheMarker!);
        cMarkers.delete(JSON.stringify(cache.cell));
      }
    });
    cMarkers.clear();
    leaflet.layerGroup(leaflet.layerGroup().getLayers()).clearLayers();
  }
}

function confirmReset() { //when reset is pressed, makes sure the player wants to reset and resets the game
  let answer: string = window.prompt(
    "are you sure you want to erase your game state? \n Type yes to proceed",
  )!;
  if (answer != "yes") {
    return;
  }
  B.playerHistory = [];
  removeAllMarkings(true, false);
  B.MomentoCache.forEach((data) => {
    B.fromMomento(data);
  });
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
    i: playerLat,
    j: playerLng,
  });
  markerManager();
  coinDisplay.innerHTML = "Coins: " + B.coinBag.length;
}

function saveGame() { //saves game onto local storage
  localStorage.setItem("BoardState", B.toMomento(B.knownCache[0], B));
}

function restoreSavedGame() { //restores game from local to game
  removeAllMarkings(true, true);
  returnBoard(localStorage.getItem("BoardState")!);
  coinDisplay.innerHTML = "Coins: " + B.coinBag.length;
  makeAllMarkings();
  B.knownCache.forEach((cache) => {
    const cacheMarker = leaflet.marker(
      B.getLatLngOfCell(cache.cell),
      { icon: markerIcon },
    );
    cachePopup(cacheMarker, cache);
    cMarkers.set(JSON.stringify(cache.cell), cacheMarker);
  });
}
