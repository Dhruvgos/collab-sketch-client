export const ComputePoints = (e,canvasRef) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX 
    const y = e.clientY 
    return { x, y };
};