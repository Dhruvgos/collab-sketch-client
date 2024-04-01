export const redrawRectangle =(ctx,x,y,w,h,image,canvasRef)=>{
    const startX = x; // Starting X coordinate of the rectangle
    const startY = y; // Starting Y coordinate of the rectangle
    console.log(startX,startY)
    const width =currentX - x   // Width of the rectangle
    const height = currentY-y  // Height of the rectangle

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas
    if (image) {
        ctx.putImageData(image, 0, 0); // Restore previous canvas state
    }
    // ctx.beginPath(); // Begin a new path for drawing the rectangle
    ctx.strokeRect(x, y, width, height);
    // setimage(ctx.getImageData(0, 0, canvas.width, canvas.height));
}