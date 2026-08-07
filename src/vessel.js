const decayFactor = 0.9;

export class Vessel {
    constructor({ position: [x, y], velocity: [dx, dy], id, ...rest }) {
        this.position = { x, y };
        this.velocity = { dx, dy };
        this.id = id;
        this.maxVelocity = rest.maxVelocity || 100;
        this.acceleration = rest.acceleration || 10;
    }

    impulse([dx, dy]) {
        this.velocity.dx += dx * this.acceleration;
        this.velocity.dy += dy * this.acceleration;
    }

    update(deltaTime, collisionBoundaries) {
        this.velocity.dx *= decayFactor ** deltaTime;
        this.velocity.dy *= decayFactor ** deltaTime;
        this.position.x += this.velocity.dx * deltaTime;
        this.position.y += this.velocity.dy * deltaTime;
        if (collisionBoundaries) {
            this.checkCollisions(collisionBoundaries);
        }
    }

    checkCollisions(collisionBoundaries) {
        const { x, y } = this.position;
        const [xMin, yMin, xMax, yMax] = collisionBoundaries;

        if (x < xMin || x > xMax) {
            this.handleCollision("x");
        }
        if (y < yMin || y > yMax) {
            this.handleCollision("y");
        }
    }

    handleCollision(axis) {
        // Reverse velocity on collision
        if (axis === "x") {
            this.velocity.dx *= -1;
        } else if (axis === "y") {
            this.velocity.dy *= -1;
        }
    }

    render() {
        const vesselElement = document.getElementById(this.id);
        if (vesselElement) {
            vesselElement.style.left = `${this.position.x}px`;
            vesselElement.style.top = `${this.position.y}px`;
        }
    }
}
