// todo
// todo
import "./style.css";

// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

const message = "You clicked the button!";
const Button1 = document.createElement("button");
Button1.textContent = "Click";
document.body.append(Button1);

Button1.addEventListener("click", () => {
  alert(message);
});


const playerLocation = leaflet.latLng(36.98949379578401, -122.06277128548504);

const map = leaflet.map("map", {
  center: playerLocation,
  zoom: 13,
});
