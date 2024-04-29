export const redraw = (data,ctx)=>{
    // const ctx = canvasRef.current?.getContext('2d');
    if(!ctx) return 
    ctx.beginPath()   
    ctx.moveTo(data.prevPoint.prevX,data.prevPoint.prevY)
    ctx.lineTo(data.currentPoint.currentX,data.currentPoint.currentY)
    ctx.lineWidth = data.lineWidth; 
    ctx.strokeStyle = data.color
    ctx.stroke();
    ctx.arc(data.currentPoint.currentX,data.currentPoint.currentY, data.lineWidth/2.5, 0, 2 * Math.PI);
    ctx.fillStyle = data.color;
    ctx.fill();
}