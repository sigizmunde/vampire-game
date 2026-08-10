export function randomNormal() {
    let u = 0;
    let v = 0;

    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    const normal = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);

    return Math.max(0, Math.min(1, 0.5 + normal / 6));
}
