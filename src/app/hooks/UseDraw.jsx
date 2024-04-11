'use client'
import React, { useEffect, useRef, useState } from 'react';
import { useRoomContext } from '@/context/RoomContext';
import { drawGrid } from '@/utils/GridLines';
import { useDrawContext } from '@/context/DrawContext';
const UseDraw = ({ color, socket, isEraser, lineWidth, text, isRectangle, isCircle }) => {
    const canvasRef = useRef(null);
    const shouldDraw = useRef(false);
    const [isDrawing, setisDrawing] = useState(false)
    const [action, setaction] = useState('')
    const [sp, setsp] = useState({})
    const [isrect, setisrect] = useState(false)
    const [isCirc, setisCirc] = useState(false)
    const [startDrag, setstartDrag] = useState(false)
    const { roomCreated, setRoomCreated, roomName, setRoomName, name, setName, } = useRoomContext()
    const { rectangles, setrectangles, image, setimage ,circles, setcircles} = useDrawContext()
    var width, height,radius;
    const clear = () => {

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return
        // setimage(null)
        setimage(null)
        setrectangles([])
        setcircles([])
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawGrid(ctx, 20, '#dddddd')
    }
    useEffect(() => {
        // console.log(roomName)
        const prevPoints = { x: null, y: null };
        const getStartPoints = (e) => {
            console.log(startDrag)
            if (startDrag) return

            const startPoints = computePointsinCanvas(e);
            // setstartDrag(true)
            setsp(startPoints)
            // return startPoints
        }

        const startDraw = (e) => {
            shouldDraw.current = true;
            const currentPoints = computePointsinCanvas(e);
            prevPoints.x = currentPoints.x;
           
            // setaction('drawing')  //yeh abhi add kiya hai

            // setimage(image)
            prevPoints.y = currentPoints.y;
            const ctx = canvasRef.current?.getContext('2d');
            // if(image){
            //     ctx.putImageData(image,0,0)
            // }
           
        };

        const startWrite = (e) => {

            if (action == 'writing') return;
            setaction('writing');
            setisDrawing(true);
            // console.log("yaha h")
        }


        const stopWrite = (e) => {

            if (action == 'writing') {

                const ctx = canvasRef.current?.getContext('2d');
                const currentPoints = computePointsinCanvas(e);
                ctx.font = "30px Arial"
                // console.log(text)
                // ctx.fillText(text,currentPoints.x,currentPoints.y)
                emitWriteData(text, currentPoints.x, currentPoints.y, socket);
                setaction('');
                setisDrawing(false);
            }
        }
        const emitWriteData = (text, x, y, socket) => {
            if (socket) {
                socket.emit('write', { text, x, y, roomName });
            }
        }



        // console.log(action)
        const draw = (e) => {
            const ctx = canvasRef.current?.getContext('2d');
            if (!shouldDraw.current || !ctx) return;
            const currentPoints = computePointsinCanvas(e);
            const currentX = currentPoints.x;
            const currentY = currentPoints.y;
           
            ctx.beginPath();

            if (isEraser) {
                // Draw eraser
                emitDrawData(socket, { prevX: prevPoints.x, prevY: prevPoints.y }, { currentX, currentY }, '#111827');
                ctx.moveTo(prevPoints.x, prevPoints.y);
                ctx.lineTo(currentX, currentY);
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = '#111827';
                ctx.stroke();
                ctx.arc(currentX, currentY, lineWidth / 2.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#111827';
                ctx.fill();
        }
            else if (isRectangle) {
                const startX = sp.x; // Starting X coordinate of the rectangle
                const startY = sp.y; // Starting Y coordinate of the rectangle
                console.log(startX, startY)
                width = currentX - sp.x   // Width of the rectangle
                height = currentY - sp.y  // Height of the rectangle
                setisrect(true)
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas
                if (image) {
                    // console.log(image)
                    // emitRectData(socket,sp.x,sp.y,currentX,currentY,image)
                    ctx.putImageData(image, 0, 0); // Restore previous canvas state
                }
                // ctx.beginPath(); // Begin a new path for drawing the rectangle
                ctx.strokeStyle = color.hex
                // rectangles.forEach(rect => {
                ctx.strokeRect(sp.x, sp.y, width, height); // Draw each rectangle
                // });
                rectangles.forEach(rect => {
                    ctx.strokeStyle = rect.color.hex;
                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height); // Draw each rectangle
                });
                // setimage(ctx.getImageData(0, 0, canvas.width, canvas.height));
            }
            else if (isCircle) {
                setstartDrag(true)
                 radius = Math.sqrt(Math.pow(currentX - sp.x, 2) + Math.pow(currentY - sp.y, 2));
                 setisCirc(true)
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                
                if (image) {
             
                    ctx.putImageData(image, 0, 0); // Restore previous canvas state
                }
                ctx.arc(sp.x, sp.y, radius, 0, Math.PI * 2); // Full circle
                ctx.strokeStyle = color.hex; // Stroke color
                ctx.stroke(); // Stroke the circle
                circles.forEach(circle=>{
                    ctx.beginPath();
                    ctx.arc(circle.x,circle.y,circle.radius,0,Math.PI*2)
                    ctx.strokeStyle = circle.color.hex;
                    ctx.stroke(); // Stroke the circle
                })
            }
            else {
                // Draw lines
                emitDrawData(socket, { prevX: prevPoints.x, prevY: prevPoints.y }, { currentX, currentY }, color.hex);
                ctx.moveTo(prevPoints.x, prevPoints.y);
                ctx.lineTo(currentX, currentY);
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = color.hex;
                ctx.stroke();
                ctx.arc(currentX, currentY, lineWidth / 2.5, 0, 2 * Math.PI);
                ctx.fillStyle = color.hex;
                ctx.fill();

            }

            prevPoints.x = currentX;
            prevPoints.y = currentY;

        };

        const emitDrawData = (socket, prevPoint, currentPoint, color) => {
            // console.log(socket)
            if (socket) {
                // console.log("line 58" ,roomName)
                socket.emit('draw', { prevPoint, currentPoint, color, roomName, lineWidth });
            }
        };

        const emitRectData = (socket, x, y, width, height) => {
            if (socket) {
                socket.emit('rectangle', { x, y, width, height, roomName, url: canvasRef.current.toDataURL(), color: color });
            }
        }
        const emitcircleData = (socket,x,y,radius)=>{
            if(socket){
                socket.emit('circle',{x,y,radius,color:color,roomName,url: canvasRef.current.toDataURL()})
            }
        }

        const stopDraw = () => {
            shouldDraw.current = false;
            setstartDrag(false)
            setsp({})
            const ctx = canvas.getContext('2d');
            // setimage(ctx.getImageData(0, 0, canvas.width, canvas.height));
            setimage(ctx.getImageData(0, 0, canvas.width, canvas.height));
            setrectangles(prevRectangles => [
                ...prevRectangles,
                { x: sp.x, y: sp.y, width: width, height: height, color: color }
            ]);
            setcircles(prevCircles=>[
                ...prevCircles,{
                    x:sp.x,y:sp.y,radius:radius,color:color
                }
            ])
            isrect && emitRectData(socket, sp.x, sp.y, width, height);
            isCirc && emitcircleData(socket,sp.x,sp.y,radius)
                console.log(" aar he h idha rbhjhi")
            setisrect(false)
            setisCirc(false)
            // setaction('')
        };

        const canvas = canvasRef.current;
        const computePointsinCanvas = (e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            return { x, y };
        };

        if (canvas) {
            canvas.addEventListener('mousedown', getStartPoints)
            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('click', stopWrite);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('click', startWrite)
            canvas.addEventListener('mouseup', stopDraw);
            canvas.addEventListener('mouseout', stopDraw);
            canvas.addEventListener('touchstart', startDraw)
            canvas.addEventListener('touchmove', draw);
            canvas.addEventListener('touchend', stopDraw);
            // canvas.addEventListener('mousedown',startRectangle)
            // canvas.addEventListener('mousemove',drawingRect)

            return () => {
                canvas.removeEventListener('mousedown', getStartPoints)
                canvas.removeEventListener('mousedown', startDraw);
                canvas.removeEventListener('click', stopWrite);
                canvas.removeEventListener('mousemove', draw);
                canvas.removeEventListener('mouseup', stopDraw);
                canvas.removeEventListener('mouseout', stopDraw);
                canvas.removeEventListener('click', startWrite)
                canvas.removeEventListener('touchstart', startDraw)
                canvas.removeEventListener('touchmove', draw);
                canvas.removeEventListener('touchend', stopDraw);
                // socket.off('draw')
                // canvas.removeEventListener('mousedown',startRectangle)
                // canvas.removeEventListener('mousemove',drawingRect)
            };
        }
    }, [color, socket, roomName, isEraser, lineWidth, text, action, isRectangle, isCircle, rectangles,circles,isCirc ,startDrag, image, isrect]); //isDrawing ht erha
       
        
    return {
        canvasRef, clear, isDrawing
    };
};

export default UseDraw;
