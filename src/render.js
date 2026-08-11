import { randomNormal } from "./helpers/math";
import { houseAscii1 } from "./helpers/mockData/scene";

// import of the foliage images
const foliageContext = require.context("./graphics", false, /^\.\/foliage\d+\.png$/);
const foliage = foliageContext.keys().map((key) => foliageContext(key));

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

    renderScene() {
        const container = document.getElementById(this.nodeId);
        const sceneSize = container.getBoundingClientRect();
        const sizePerCell = [
            sceneSize.width / this.matrixSize[0],
            sceneSize.height / this.matrixSize[1],
        ];

        this._renderCanvasDecorations(container, sizePerCell, this.objects);

        container.style.position = "relative";
        container.style.overflow = "hidden";
        container.style.backgroundColor = colorMap.background;
    }

    _renderCanvasDecorations(containerNode, sizePerCell, objects) {
        const obsoleteCanvas = document.getElementById("decorations");
        if (obsoleteCanvas) {
            obsoleteCanvas.remove();
        }

        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.id = "decorations";
        canvas.width = containerNode.clientWidth;
        canvas.height = containerNode.clientHeight;
        console.log("width", canvas.width);
        canvas.style.pointerEvents = "none";
        // canvas.style.zIndex = "999";

        const ctx = canvas.getContext("2d");

        objects.forEach((obj) => {
            switch (obj.type) {
                case "foliage":
                    this._renderFoliageCell(ctx, obj.variation, obj.cell, sizePerCell);
                    break;
                default:
                    break;
            }
        });

        containerNode.appendChild(canvas);
    }

    // note for future optimization - make it draw similar sprites in one pass
    _renderFoliageCell(context, variation, cell, size) {
        const x = cell[0] * size[0];
        const y = cell[1] * size[1];
        const spriteSize = Math.max(...size) * 3 * (Math.random() * 0.1 + 0.9);

        let image = new Image();
        image.src = foliage[variation];

        image.onload = () => {
            context.drawImage(image, x, y, spriteSize, spriteSize);
        };
    }

    renderExplosion(position, size = 290) {
        const explosionNode = document.createElement("div");
        explosionNode.classList.add("explode-animation");
        explosionNode.style.position = "absolute";
        explosionNode.style.left = `${position[0]}px`;
        explosionNode.style.top = `${position[1]}px`;
        explosionNode.style.width = "290px";
        explosionNode.style.height = "290px";
        explosionNode.style.transform = `scale(${size / 290}) translate(-50%, -50%)`;
        explosionNode.style.pointerEvents = "none";
        explosionNode.style.zIndex = "99";
        document.getElementById(this.nodeId).appendChild(explosionNode);

        setTimeout(() => {
            if (explosionNode) {
                explosionNode.remove();
            }
        }, 1500);
    }
}
