export const downloadImg=(canvas)=>{
    var dataURL = canvas.toDataURL("image/png");

    // Create a dummy link text
    var a = document.createElement('a');
    // Set the link to the image so that when clicked, the image begins downloading
    a.href = dataURL;
    // Specify the image filename
    a.download = 'canvas-download.png';
    // Click on the link to set off download
    a.click();
}