// todo
// todo
import "./style.css";
// @deno-types="npm:@types/leaflet@^1.9.14"


const message = "You clicked the button!";
const Button1 = document.createElement("button");
Button1.textContent = "Click";
document.body.append(Button1);

Button1.addEventListener("click", () => {
  alert(message);
});
