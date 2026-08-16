const decayFactor = 0.9;
const proximityThreshold = 1.5;
const slowdownFactor = 2.9; // higher number leads to "bouncier" adjustment on the point of diversion
const velocityThreshold = 1.5;

export class Vessel {
    constructor({ position: [x, y], velocity: [dx, dy], id, ...rest }) {
        this.position = { x, y };
        this.velocity = { dx, dy };
        this.id = id;
        this.maxVelocity = rest.maxVelocity || 500;
        this.acceleration = rest.acceleration || 10;
        this.diversionPoint = rest.diversionPoint || null;
    }

    impulse([dx, dy]) {
        this.velocity.dx += dx * this.acceleration;
        this.velocity.dy += dy * this.acceleration;
    }

    divertToPoint(point) {
        const lengthX = point[0] - this.position.x;
        const lengthY = point[1] - this.position.y;

        const length = Math.sqrt(lengthX ** 2 + lengthY ** 2);

        const currentVelocity = Math.sqrt(this.velocity.dx ** 2 + this.velocity.dy ** 2);

        if (length < proximityThreshold && currentVelocity < velocityThreshold) {
            this.velocity.dx = 0;
            this.velocity.dy = 0;
            this.clearDiversionPoint();
            return null;
        }

        const directionX = lengthX / length;
        const directionY = lengthY / length;

        const desiredVelocity = Math.min(this.maxVelocity, length * slowdownFactor);

        const desiredVelocityX = directionX * desiredVelocity;
        const desiredVelocityY = directionY * desiredVelocity;

        const dvX = desiredVelocityX - this.velocity.dx;
        const dvY = desiredVelocityY - this.velocity.dy;

        const dvLength = Math.sqrt(dvX ** 2 + dvY ** 2);

        if (dvLength > this.acceleration) {
            this.velocity.dx += (dvX / dvLength) * this.acceleration;
            this.velocity.dy += (dvY / dvLength) * this.acceleration;
        } else {
            this.velocity.dx = desiredVelocityX;
            this.velocity.dy = desiredVelocityY;
        }

        return point;
    }

    clearDiversionPoint() {
        this.diversionPoint = null;
    }

    update(deltaTime, collisionBoundaries) {
        this.velocity.dx *= decayFactor ** deltaTime;
        this.velocity.dy *= decayFactor ** deltaTime;
        this.position.x += this.velocity.dx * deltaTime;
        this.position.y += this.velocity.dy * deltaTime;
        if (collisionBoundaries) {
            this.checkCollisions(collisionBoundaries);
        }
        if (this.diversionPoint) {
            this.divertToPoint(this.diversionPoint) || (this.diversionPoint = null);
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
