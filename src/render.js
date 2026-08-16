// import of the foliage images
const foliageContext = require.context("./graphics", false, /^\.\/foliage\d+\.png$/);
const foliage = foliageContext.keys().map((key) => foliageContext(key));

// import of the building images
const buildingsContext = require.context("./graphics", false, /^\.\/building\d+\.png$/);
const buildings = buildingsContext.keys().map((key) => buildingsContext(key));

const colorMap = {
    background: "#000000",
};

const FOLIAGE_SCALE = 3;
const BUILDING_SCALE = 2;

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
                case "building":
                    this._renderBuildingCell(ctx, obj.variation, obj.cell, sizePerCell);
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
        const spriteSize = Math.max(...size) * FOLIAGE_SCALE * (Math.random() * 0.1 + 0.9);

        const imageSrc = foliage[variation];

        this._renderSprite(imageSrc, context, x, y, spriteSize, spriteSize);
    }

    _renderBuildingCell(context, variation, cell, size) {
        const x = cell[0] * size[0];
        const y = cell[1] * size[1];
        const spriteSize = Math.max(...size) * BUILDING_SCALE * (Math.random() * 0.1 + 0.9);

        const imageSrc = buildings[variation];

        this._renderSprite(imageSrc, context, x, y, spriteSize, spriteSize);

        // add some foliage nearby
        const decorSrc = foliage[Math.floor(Math.random() * 3)];
        const displacementX = ((Math.random() - 0.5) * Math.max(...size) * BUILDING_SCALE) / 2;
        const displacementY = ((Math.random() - 0.5) * Math.max(...size) * BUILDING_SCALE) / 2;

        this._renderSprite(
            decorSrc,
            context,
            x + displacementX,
            y + displacementY,
            spriteSize,
            spriteSize,
        );
    }

    _renderSprite(imageSrc, context, x, y, sizeX, sizeY) {
        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            context.drawImage(image, x, y, sizeX, sizeY);
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
        explosionNode.style.transform = `scale(${size / 290}) translate(-50%, -75%)`;
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
