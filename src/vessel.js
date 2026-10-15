import { createHtmlElement } from "./helpers/html";

const DECAY_FACTOR = 0.9;
const PROXIMITY_THRESHOLD = 1.5;
const SLOWDOWN_FACTOR = 2.9; // higher number leads to "bouncier" adjustment on the point of diversion
const VELOCITY_THRESHOLD = 1.5;

export class Vessel {
    constructor({ position: [x, y], velocity: [dx, dy], id, energyConsumption, ...rest }) {
        this.destroyed = null;
        this.position = { x, y };
        this.velocity = { dx, dy };
        this.id = id;
        this.maxVelocity = rest.maxVelocity || 500;
        this.acceleration = rest.acceleration || 10;
        this.diversionPoint = rest.diversionPoint || null;
        this.energy = 100; // percentage
        this.energyConsumption = energyConsumption || 5; // percent per second
    }

    setEnergy(percent) {
        this.energy = percent < 0 ? 0 : percent > 100 ? 100 : percent;
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

        if (length < PROXIMITY_THRESHOLD && currentVelocity < VELOCITY_THRESHOLD) {
            this.velocity.dx = 0;
            this.velocity.dy = 0;
            this.clearDiversionPoint();
            return null;
        }

        const directionX = lengthX / length;
        const directionY = lengthY / length;

        const desiredVelocity = Math.min(this.maxVelocity, length * SLOWDOWN_FACTOR);

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

    destroyVessel(cause) {
        this.destroyed = { cause };
    }

    // updates vessel state and return vessel coordinates
    update(deltaTime, collisionBoundaries) {
        if (this.destroyed) {
            return null;
        }

        this.velocity.dx *= DECAY_FACTOR ** deltaTime;
        this.velocity.dy *= DECAY_FACTOR ** deltaTime;
        this.position.x += this.velocity.dx * deltaTime;
        this.position.y += this.velocity.dy * deltaTime;
        if (collisionBoundaries) {
            this.checkCollisions(collisionBoundaries);
        }
        if (this.diversionPoint) {
            this.divertToPoint(this.diversionPoint) || (this.diversionPoint = null);
        }

        this.energy = this.energy - this.energyConsumption * deltaTime;
        if (this.energy <= 0) {
            this.destroyVessel("discharge");
        }

        return [this.position.x, this.position.y];
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
            if (this.destroyed) {
                this.renderWreckage(vesselElement);
                return null;
            }

            vesselElement.style.left = `${this.position.x}px`;
            vesselElement.style.top = `${this.position.y}px`;
            vesselElement.style.zIndex = "999";

            let chargeBar = vesselElement.querySelector("#charge-bar");
            if (!chargeBar) {
                chargeBar = createHtmlElement(vesselElement, "div", {
                    id: "charge-bar",
                    style: {
                        position: "absolute",
                        top: "-20px",
                        left: "0",
                        width: "100%",
                        height: "20px",
                        backgroundColor: "black",
                        display: "flex",
                        padding: "5px",
                        zIndex: "9",
                    },
                });
            }
            chargeBar.innerHTML = `<div style = "background-color: white; height: 10px; width: ${this.energy}%"></div><div style="background-color: black; height: 10px; width: ${100 - this.energy}%; border: 1px solid white"></div>`;
        }
    }

    renderWreckage(element) {
        element.innerHTML = "<div style='color: white; font-size: 36px'> X </>";
    }
}
