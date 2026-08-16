export class Game {
    constructor({ boundaries } = {}) {
        this.vessels = [];
        this.running = false;
        this.lastUpdated = performance.now();
        this.boundaries = boundaries || [0, 0, window.innerWidth, window.innerHeight];
        console.log("Game initialized with boundaries:", this.boundaries);
    }

    generateSceneMatrix(params) {
        const size = params?.size ?? [25, 18];
        const [cols, rows] = size;

        const foliageDensity = params?.foliageDensity ?? 0.25;
        const buildingsDensity = params?.buildingsDensity ?? 0.12;

        const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

        const foliageCount = Math.round(rows * cols * foliageDensity);

        let count = 0;
        let attempts = 0;

        while (count < foliageCount && attempts < foliageCount * 20) {
            attempts++;

            const direction = Math.round(Math.random()) ? "h" : "v";

            // set starting cell
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);

            if (grid[y][x] !== null) {
                continue;
            }

            // Determine maximum possible line length.
            const maxLength = direction === "h" ? cols - x : rows - y;

            // Randomly choose end of line.
            const lineLength = 1 + Math.floor(Math.random() * maxLength);

            // Validate the complete proposed line.
            if (!this._isGoodFoliageLine(grid, x, y, direction, lineLength)) {
                continue;
            }

            // Place line.
            for (let i = 0; i < lineLength; i++) {
                const cellX = direction === "h" ? x + i : x;

                const cellY = direction === "v" ? y + i : y;

                grid[cellY][cellX] = "f5";
                count++;

                if (count >= foliageCount) {
                    break;
                }
            }
        }

        // placing buildings
        const buildingsCount = Math.round(rows * cols * buildingsDensity);

        count = 0;

        while (count < buildingsCount) {
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);

            if (grid[y][x] !== null) {
                continue;
            }

            grid[y][x] = "b0";
            count++;
        }

        return grid;
    }

    addVessel(vessel) {
        this.vessels.push(vessel);
    }

    start() {
        this.running = true;
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(time) {
        const deltaTime = (time - this.lastUpdated) / 1000;
        this.lastUpdated = time;

        this.update(deltaTime);
        this.render();

        if (this.running) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    update(deltaTime) {
        for (const vessel of this.vessels) {
            vessel.update(deltaTime, this.boundaries);
        }
    }

    render() {
        for (const vessel of this.vessels) {
            vessel.render();
        }
    }

    _isGoodFoliageLine(grid, x, y, direction, length) {
        const rows = grid.length;
        const cols = grid[0].length;

        const minParallelDistance = 3;

        for (let i = 0; i < length; i++) {
            const cellX = direction === "h" ? x + i : x;
            const cellY = direction === "v" ? y + i : y;

            // Outside matrix.
            if (cellX < 0 || cellX >= cols || cellY < 0 || cellY >= rows) {
                return false;
            }

            // Can't overwrite anything.
            if (grid[cellY][cellX] !== null) {
                return false;
            }

            if (direction === "h") {
                // Check cells above/below this horizontal line.
                for (let d = 1; d <= minParallelDistance; d++) {
                    const y1 = cellY - d;
                    const y2 = cellY + d;

                    if (y1 >= 0 && grid[y1][cellX] === "foliage") {
                        return false;
                    }

                    if (y2 < rows && grid[y2][cellX] === "foliage") {
                        return false;
                    }
                }
            } else {
                // Check cells left/right of this vertical line.
                for (let d = 1; d <= minParallelDistance; d++) {
                    const x1 = cellX - d;
                    const x2 = cellX + d;

                    if (x1 >= 0 && grid[cellY][x1] === "foliage") {
                        return false;
                    }

                    if (x2 < cols && grid[cellY][x2] === "foliage") {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
