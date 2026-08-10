import { randomNormal } from "./helpers/math";
import { houseAscii1 } from "./helpers/mockData/scene";

const colorMap = {
    foliage: "#cccccc",
    building: "#888888",
    signature: "#ffffff",
    background: "#000000",
};

export class Render {
    constructor(nodeId) {
        this.nodeId = nodeId;
        this.objects = [];
        this.matrixSize = [10, 10]; // Default size, can be adjusted
    }

    convertMatrixToObjects(matrix) {
        const objects = [];
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                const code = matrix[y][x];
                if (code) {
                    const type =
                        code[0] === "f" ? "foliage" : code[0] === "b" ? "building" : "unknown";
                    const variation = parseInt(code.slice(1), 10);
                    objects.push({ type, variation, cell: [x, y] });
                }
            }
        }
        this.matrixSize = [matrix[0].length, matrix.length];
        this.objects = objects;
    }

    _constructObject({ type, variation, position, size, id }) {
        const [x, y] = position;
        const [width, height] = size;
        const objNode = document.createElement("div");
        objNode.id = id || `${type}-${variation}-${x}-${y}`;
        objNode.style.position = "absolute";
        objNode.style.left = `${x}px`;
        objNode.style.top = `${y}px`;
        objNode.style.width = `${width}px`;
        objNode.style.height = `${height}px`;
        objNode.style.transform = "translate(-50%, -50%)";

        if (type === "foliage") {
            const color = colorMap.foliage;
            if (variation <= 2) {
                this._generateDitherSymbols(
                    objNode,
                    size,
                    ["_", ".", ","],
                    25 * (variation + 1),
                    color,
                    0.8,
                );
            } else {
                this._generateDitherSymbols(
                    objNode,
                    size,
                    ["|", "\\", "/", "!", ":", "-"],
                    75 * variation,
                    color,
                    0.8,
                );
            }
        }

        if (type === "building") {
            const color = colorMap.building;
            this._generateBuilding(objNode, size, variation);
        }

        return objNode;
    }

    _generateDitherSymbols(containerNode, size, symbols, count, color, fluctuation) {
        for (let i = 0; i < count; i++) {
            const symbolNode = document.createElement("div");
            symbolNode.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            symbolNode.style.position = "absolute";
            symbolNode.style.color = color;
            symbolNode.style.opacity = `${Math.random() * fluctuation * 0.5 + 0.5}`;
            symbolNode.style.fontSize = `${size[0] / 5}px`;
            symbolNode.style.left = `${randomNormal() * size[0] * 2.5}px`;
            symbolNode.style.top = `${randomNormal() * size[1] * 2.5}px`;
            containerNode.appendChild(symbolNode);
        }
    }

    _generateBuilding(containerNode, size, variation) {
        const buildingNode = document.createElement("div");
        buildingNode.style.position = "absolute";
        buildingNode.style.width = `${size[0] * 0.8}px`;
        buildingNode.style.height = `${size[1] * 0.8}px`;
        buildingNode.style.left = `${size[0] * 0.1}px`;
        buildingNode.style.top = `${size[1] * 0.1}px`;
        buildingNode.style.color = colorMap.building;
        buildingNode.style.fontSize = `${size[0] / 18}px`;
        buildingNode.style.whiteSpace = "pre";
        buildingNode.textContent = houseAscii1;
        containerNode.appendChild(buildingNode);
    }

    renderScene() {
        const container = document.getElementById(this.nodeId);
        const sceneSize = container.getBoundingClientRect();
        const sizePerCell = [
            sceneSize.width / this.matrixSize[0],
            sceneSize.height / this.matrixSize[1],
        ];
        // container.innerHTML = "";
        this.objects.forEach((obj) => {
            const objNode = this._constructObject({
                ...obj,
                position: [obj.cell[0] * sizePerCell[0], obj.cell[1] * sizePerCell[1]],
                size: sizePerCell,
            });
            container.prepend(objNode);
        });
        container.style.position = "relative";
        container.style.overflow = "hidden";
        container.style.backgroundColor = colorMap.background;
    }
}
