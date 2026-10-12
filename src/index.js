import "./styles.css";
import { Game } from "./game";
import { Vessel } from "./vessel";
import {
    createRandomGenerator,
    randomNormal,
    randomPreferHigher,
    randomPreferLower,
    testDistribution,
} from "./helpers/math";

const game = new Game({ boundaries: [0, 0, window.innerWidth - 50, window.innerHeight - 50] });

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            game.vessels[0]?.impulse([0, -1]);
            break;
        case "ArrowDown":
            game.vessels[0]?.impulse([0, 1]);
            break;
        case "ArrowLeft":
            game.vessels[0]?.impulse([-1, 0]);
            break;
        case "ArrowRight":
            game.vessels[0]?.impulse([1, 0]);
            break;
        case "Escape":
            game.pause();
            break;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    game.initializeNewGame();
    game.run();

    const upButton = document.getElementById("upButton");
    const downButton = document.getElementById("downButton");
    const leftButton = document.getElementById("leftButton");
    const rightButton = document.getElementById("rightButton");

    upButton.addEventListener("click", () => game.vessels[0]?.impulse([0, -1]));
    downButton.addEventListener("click", () => game.vessels[0]?.impulse([0, 1]));
    leftButton.addEventListener("click", () => game.vessels[0]?.impulse([-1, 0]));
    rightButton.addEventListener("click", () => game.vessels[0]?.impulse([1, 0]));
});

//-------------------------
console.log("Testing distributions:");
console.log("Uniform distribution:");
testDistribution(() => Math.random());
console.log("Normal distribution:");
testDistribution(randomNormal);
console.log("Prefer lower distribution:");
testDistribution(randomPreferLower);
console.log("Prefer higher distribution:");
testDistribution(randomPreferHigher);
console.log("Custom distribution (sin):");
testDistribution(createRandomGenerator((x) => Math.sin(x * Math.PI * 2) + 1));
