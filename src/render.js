// import of the foliage images
const foliageContext = require.context("./graphics", false, /^\.\/foliage\d+\.png$/);
const foliage = foliageContext.keys().map((key) => foliageContext(key));

// import of the building images
const buildingsContext = require.context("./graphics", false, /^\.\/building\d+\.png$/);
const buildings = buildingsContext.keys().map((key) => buildingsContext(key));

const generalTexture = require("./graphics/general_texture.png");

const COLOR_MAP = {
    background: "#000000",
};

const FOLIAGE_SCALE = 2;
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

                    // detecting foliage in the nearest bordering cells
                    const nearestFoliage = Array.from({ length: 3 }, () => Array(3).fill(null));
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dy === 0 && dx === 0) continue;
                            const neighbour = matrix[y + dy]?.[x + dx] ?? null;
                            if (neighbour && neighbour[0] === "f") {
                                nearestFoliage[dy + 1][dx + 1] = parseInt(neighbour.slice(1), 10);
                            }
                        }
                    }

                    objects.push({ type, variation, nearestFoliage, cell: [x, y] });
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

        // this is an async function, it starts rendering the canvas decorations and does not block the main thread
        this._renderCanvasDecorations(container, sizePerCell, this.objects);

        container.style.position = "relative";
        container.style.overflow = "hidden";
        container.style.backgroundColor = COLOR_MAP.background;
    }

    async _renderCanvasDecorations(containerNode, sizePerCell, objects) {
        // load images
        const foliageImages = new Array(foliage.length);
        const buildingImages = new Array(buildings.length);
        var generalTextureImage;
        await Promise.all([
            ...foliage.map((src, i) =>
                this._loadSprite(src).then((img) => (foliageImages[i] = img)),
            ),
            ...buildings.map((src, i) =>
                this._loadSprite(src).then((img) => (buildingImages[i] = img)),
            ),
            this._loadSprite(generalTexture).then((img) => (generalTextureImage = img)),
        ]);

        // remove existing canvas
        const obsoleteCanvas = document.getElementById("decorations");
        if (obsoleteCanvas) {
            obsoleteCanvas.remove();
        }

        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.id = "decorations";
        canvas.width = containerNode.clientWidth;
        canvas.height = containerNode.clientHeight;
        canvas.style.pointerEvents = "none";
        // canvas.style.zIndex = "999";

        const ctx = canvas.getContext("2d");

        // render background texture
        this._renderGeneralTexture(
            ctx,
            generalTextureImage,
            [canvas.width, canvas.height],
            [24, 24],
        );

        objects.forEach((obj) => {
            switch (obj.type) {
                case "foliage":
                    this._renderFoliageCell(
                        ctx,
                        foliageImages,
                        obj.variation,
                        obj.nearestFoliage,
                        obj.cell,
                        sizePerCell,
                    );
                    break;
                case "building":
                    this._renderBuildingCell(
                        ctx,
                        buildingImages[obj.variation],
                        foliageImages,
                        obj.cell,
                        sizePerCell,
                    );
                    break;
                default:
                    break;
            }
        });

        containerNode.appendChild(canvas);
    }

    _renderGeneralTexture(context, textureImage, generalSize, textureSize) {
        const textureWidth = textureSize[0];
        const textureHeight = textureSize[1];
        const n = Math.ceil(generalSize[0] / textureWidth);
        const m = Math.ceil(generalSize[1] / textureHeight);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                context.drawImage(
                    textureImage,
                    i * textureWidth,
                    j * textureHeight,
                    textureWidth,
                    textureHeight,
                );
            }
        }
    }

    _renderFoliageCell(context, foliageImages, variation, nearestFoliage, cell, size) {
        const x = cell[0] * size[0];
        const y = cell[1] * size[1];
        const spriteSize = Math.max(...size) * FOLIAGE_SCALE * (Math.random() * 0.3 + 0.6);

        // draw the main foliage sprite
        const foliageImg = foliageImages[variation];
        context.drawImage(foliageImg, x, y, spriteSize, spriteSize);

        // draw neighbouring foliage sprites
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const neighbourVariation = nearestFoliage[dy + 1][dx + 1] ?? 0;
                if (neighbourVariation) {
                    const neighbourSrc =
                        foliageImages[Math.round((variation + neighbourVariation) / 2)];
                    context.drawImage(
                        neighbourSrc,
                        x + dx * size[0] * 0.5,
                        y + dy * size[1] * 0.5,
                        spriteSize,
                        spriteSize,
                    );
                }
            }
        }
    }

    _renderBuildingCell(context, buildingImage, foliageImages, cell, size) {
        const x = cell[0] * size[0];
        const y = cell[1] * size[1];
        const spriteSize = Math.max(...size) * BUILDING_SCALE * (Math.random() * 0.1 + 0.9);

        context.drawImage(buildingImage, x, y, spriteSize, spriteSize);

        // add some foliage nearby
        const decorImg = foliageImages[Math.floor(Math.random() * 3)];
        const displacementX = ((Math.random() - 0.5) * Math.max(...size) * BUILDING_SCALE) / 2;
        const displacementY = ((Math.random() - 0.5) * Math.max(...size) * BUILDING_SCALE) / 2;

        context.drawImage(decorImg, x + displacementX, y + displacementY, spriteSize, spriteSize);
    }

    async _loadSprite(imageSrc) {
        const image = new Image();
        image.src = imageSrc;

        // returns promise
        await image.decode();
        return image;
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
