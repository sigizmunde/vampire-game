const BAYER_4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
];

const COLOR_MAP = { foreground: [224, 224, 224, 255], background: [0, 0, 0, 255] };

export function pixelateImage(context, scale) {
    const { width, height } = context.canvas;
    context.imageSmoothingEnabled = false;

    // Create a temporary canvas to draw the pixelated image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width / scale;
    tempCanvas.height = height / scale;
    const tempContext = tempCanvas.getContext("2d");
    tempContext.imageSmoothingEnabled = false;

    // Draw the original image onto the temporary canvas
    tempContext.drawImage(context.canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    // Scale up the temporary canvas to create the pixelated effect
    context.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, width, height);
}

export function bitmapImage(context, scale = 1) {
    const { width, height } = context.canvas;

    // Create a temporary canvas to draw the pixelated image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width / (scale * 4);
    tempCanvas.height = height / (scale * 4);
    const tempContext = tempCanvas.getContext("2d");

    // // Draw the original image onto the temporary canvas
    tempContext.drawImage(context.canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    // Convert the temporary canvas to a bitmap mesh
    canvasContextToBitmap(tempContext, BAYER_4, COLOR_MAP);

    // Scale up the temporary canvas to create the pixelated effect
    context.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, width, height);
}

function canvasContextToBitmap(ctx, ditherMatrix, colorMap) {
    const { width, height } = ctx.canvas;
    const cellSize = ditherMatrix.length;

    const srcImage = ctx.getImageData(0, 0, width, height);
    const src = srcImage.data;

    const foregroundColor = colorMap?.foreground || [0, 0, 0];
    const backgroundColor = colorMap?.background || [255, 255, 255];

    const outWidth = width * cellSize;
    const outHeight = height * cellSize;

    const outImage = ctx.createImageData(outWidth, outHeight);
    const dst = outImage.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIndex = (y * width + x) * 4;

            const r = src[srcIndex];
            const g = src[srcIndex + 1];
            const b = src[srcIndex + 2];
            const alpha = src[srcIndex + 3];

            const brightness = 0.299 * r + 0.587 * g + 0.114 * b * (alpha / 255);

            // 0..16
            const level = Math.floor((brightness / 256) * 17);

            for (let sy = 0; sy < cellSize; sy++) {
                for (let sx = 0; sx < cellSize; sx++) {
                    const on = ditherMatrix[sy][sx] < level;

                    const color = on ? foregroundColor : backgroundColor;

                    const dstX = x * cellSize + sx;
                    const dstY = y * cellSize + sy;

                    const dstIndex = (dstY * outWidth + dstX) * 4;

                    dst[dstIndex] = color[0];
                    dst[dstIndex + 1] = color[1];
                    dst[dstIndex + 2] = color[2];
                    dst[dstIndex + 3] = color[3] ?? 255;
                }
            }
        }
    }

    ctx.canvas.width = outWidth;
    ctx.canvas.height = outHeight;

    ctx.putImageData(outImage, 0, 0);
}
