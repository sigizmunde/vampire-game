import "./styles.css";
import { Game } from "./game";
import { Vessel } from "./vessel";

const game = new Game({ boundaries: [0, 0, window.innerWidth - 50, window.innerHeight - 50] });

const vessel = new Vessel({ position: [100, 100], velocity: [50, 0], id: "vesselNode" });
game.addVessel(vessel);

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            vessel.impulse([0, -1]);
            break;
        case "ArrowDown":
            vessel.impulse([0, 1]);
            break;
        case "ArrowLeft":
            vessel.impulse([-1, 0]);
            break;
        case "ArrowRight":
            vessel.impulse([1, 0]);
            break;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const upButton = document.getElementById("upButton");
    const downButton = document.getElementById("downButton");
    const leftButton = document.getElementById("leftButton");
    const rightButton = document.getElementById("rightButton");

    upButton.addEventListener("click", () => vessel.impulse([0, -1]));
    downButton.addEventListener("click", () => vessel.impulse([0, 1]));
    leftButton.addEventListener("click", () => vessel.impulse([-1, 0]));
    rightButton.addEventListener("click", () => vessel.impulse([1, 0]));

    const flightArea = document.getElementById("flightArea");
    flightArea.addEventListener("click", (event) => {
        const rect = flightArea.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        vessel.diversionPoint = [x, y];
    });
});

game.start();
