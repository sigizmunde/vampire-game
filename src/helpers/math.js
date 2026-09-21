export function randomNormal() {
    let u = 0;
    let v = 0;

    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    const normal = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);

    return Math.max(0, Math.min(1, 0.5 + normal / 6));
}

export function randomPreferLower(power = 2) {
    const r = Math.random();
    return Math.pow(r, power);
}

export function randomPreferHigher(power = 2) {
    const r = Math.random();
    return 1 - Math.pow(r, power);
}

// this function creates a random number generator based on a given probability density function (PDF). It samples the PDF and creates a cumulative distribution function (CDF) to generate random numbers according to the PDF.
export function createRandomGenerator(pdf, min = 0, max = 1, samples = 1000) {
    const cumulative = [];
    let total = 0;

    for (let i = 0; i < samples; i++) {
        const x = min + ((max - min) * i) / (samples - 1);
        total += Math.max(0, pdf(x));
        cumulative.push(total);
    }

    return function () {
        const r = Math.random() * total;

        let low = 0;
        let high = cumulative.length - 1;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);

            if (cumulative[mid] < r) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return min + ((max - min) * low) / (samples - 1);
    };
}

export function testDistribution(
    randomFunction,
    samples = 10000,
    bands = 20,
    lineLength = 25,
    min = 0,
    max = 1,
) {
    const frequencies = new Array(bands).fill(0);

    // Generate samples and put them into bands
    for (let i = 0; i < samples; i++) {
        const value = randomFunction();

        let band = Math.floor(((value - min) / (max - min)) * bands);

        // Handle value === max
        band = Math.min(bands - 1, Math.max(0, band));

        frequencies[band]++;
    }

    const maxFrequency = Math.max(...frequencies);
    const strings = [];

    // Print histogram
    frequencies.forEach((frequency, i) => {
        const length = Math.round((frequency / maxFrequency) * lineLength);

        const bar = "=".repeat(length);

        const from = min + ((max - min) * i) / bands;
        const to = min + ((max - min) * (i + 1)) / bands;

        strings.push(`${from.toFixed(2)}-${to.toFixed(2)} | ${bar} ${frequency}`);
    });

    console.log(strings.join("\n"));
}
