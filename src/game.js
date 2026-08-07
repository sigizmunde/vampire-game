export class Game {
    constructor({ boundaries } = {}) {
        this.vessels = [];
        this.running = false;
        this.lastUpdated = performance.now();
        this.boundaries = boundaries || [0, 0, window.innerWidth, window.innerHeight];
        console.log("Game initialized with boundaries:", this.boundaries);
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
}
