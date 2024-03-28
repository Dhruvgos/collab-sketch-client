"use client";
// page.js
import React, { useEffect, useState, useMemo } from "react";
import UseDraw from "../hooks/UseDraw";
import { io } from "socket.io-client";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { redraw } from "@/utils/Redraw";
import { useRoomContext } from "@/context/RoomContext";
import Link from "next/link";
import { ComputePoints } from "@/utils/ComputePoints";
import { drawGrid, drawOrEraseGrid } from "@/utils/GridLines";
import { Scope_One } from "next/font/google";
import { generateRandomString } from "@/utils/RoomnameGenerate";

const Page = () => {
  const [color, setColor] = useColor("#561ecb");
  const [socket, setSocket] = useState(null);
  const [isEraser, setIsEraser] = useState(false);
  const [points, setpoints] = useState({});
  const [lineWidth, setLineWidth] = useState(5);
  const [currentCanvasState, setCurrentCanvasState] = useState(null);
  const [id, setId] = useState("");
  const [isRectangle, setisRectangle] = useState(false);
  const [text, settext] = useState("");
  const [socketsByRoom, setSocketsByRoom] = useState([]);
  const [alreadyDrawed, setalreadyDrawed] = useState(false);
 const [dim, setdim] = useState({})
  const { roomCreated, setRoomCreated, roomName, setRoomName, name, setName } =
    useRoomContext();
  const { canvasRef, clear, isDrawing } = UseDraw({
    color,
    socket,
    isEraser,
    lineWidth,
    text,
    isRectangle,
  });
  const { roomJoined, setRoomJoined } = useRoomContext();

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    const ctx = canvasRef.current?.getContext("2d");
    const gridSize = 20;
    const gridColor = "#dddddd";
    newSocket.on("connect", () => {
      setSocket(newSocket);
    });
    if (ctx) {
      drawGrid(ctx, gridSize, gridColor, false);
    }

    newSocket.emit("client-ready", roomName);
    newSocket.on("sid", (sid) => {
      setId(sid);
      setSocketsByRoom((prevSockets) => [...prevSockets, sid]);
    });


    newSocket.on("draw", (data) => {
      if (!ctx) return;
      redraw(data, ctx);
    });

    newSocket.on("write", (data) => {
      if (!ctx) return;
      ctx.fillText(data.text, data.x, data.y);
    });

    newSocket.on("clear", clear);

    return () => {
      newSocket.disconnect();
      newSocket.off("draw-line");
      newSocket.off("get-canvas-state");

      newSocket.off("draw");
      newSocket.off("clear");
      newSocket.off("write");
    };
  }, [canvasRef]);

  useEffect(() => {
    if (socket) {
      socket.on("get-canvas-state", (rname) => {
        if (!canvasRef.current?.toDataURL()) return;

        console.log(socketsByRoom);
        console.log(rname)
        console.log("ye dekh to", canvasRef.current?.toDataURL()); ///i gues iska url white page se asccaiated hai
        console.log("sahi to hai r");
        socket.emit("canvas-state", {
          roomName: rname,
          url: canvasRef.current.toDataURL(),
          socketsByRoom: socketsByRoom || []
        });
      });
    }

    return () => {
      socket && socket.off("canvas-state");
    };
  }, [ canvasRef, socket,socketsByRoom]);

  useEffect(() => {
    if (socket && roomJoined) {
      socket.emit("join-room", roomName);
      socket.on("sockets-in-room", (socketIds) => {
        setSocketsByRoom(socketIds);
      });
    }
    return () => {
      socket && socket.off("join-room", roomName, socketsByRoom);
    };
  }, [roomJoined, socket, roomName]);

  useEffect(() => {
    if (socket && roomCreated) {
      const randomRoomName = generateRandomString(8); // Adjust the length as needed
      setRoomName(randomRoomName);
      socket.emit("join-room", randomRoomName);
      socket.on("sockets-in-room", (socketIds) => {
        setSocketsByRoom(socketIds);
      });
    }
    return () => {
      socket && socket.off("join-room", roomName);
    };
  }, [roomCreated, socket]);


  useEffect(() => {
    console.log(isDrawing);
    settext("");
  }, [isDrawing]);

  useEffect(() => {
    console.log(
      "Socket and alreadyDrawed in useEffect:",
      socket,
      alreadyDrawed
    );
    if (socket && !alreadyDrawed) {
      socket.on("canvas-state-from-server", (state) => {
        console.log("this one is : ", alreadyDrawed);
        const ctx = canvasRef.current?.getContext("2d");
        console.log("Received canvas state:", state);
        if (!ctx) {
          console.error("Canvas context is null");
          return;
        }
        if (alreadyDrawed) {
          console.log("return honge");
          return;
        }
        const img = new Image();
        setalreadyDrawed(true);
        ctx.clearRect(0, 0, canvasRef.current.
          width, canvasRef.current.height);
        img.src = state;
        img.onload = () => {
          setCurrentCanvasState(state);
          ctx.drawImage(img, 0, 0);
          console.log("Image loaded successfully");
        };
        img.onerror = (error) => {
          console.error("Error loading image:", error);
        };
      });
    }

    return () => {
      socket && socket.off("canvas-state-from-server");
    };
  }, [socket]);

  const handlePoints = (e) => {
    const points = ComputePoints(e, canvasRef);
    setpoints(points);
  };
  const handleClearCanvas = () => {
    socket.emit("clear", roomName);
  };
  const leaveRoom = () => {
    socket.emit("leave-room", roomName);
    socket.disconnect();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <canvas
        tabIndex={0}
        className="border border-black rounded-md"
        ref={canvasRef}
        height={window.innerHeight || 750}
        width={window.innerWidth || 1080}
        style={{ cursor: isEraser ? "crosshair" : "default" }}
        onClick={handlePoints}
      />
      <div className="tools absolute top-4 left-4 flex flex-col gap-3 bg-gray-100 p-4 rounded-md">
        <div className="text-lg font-semibold">{`In room : ${roomName}`}</div>
        <div className="flex flex-col gap-2">
          <label htmlFor="colorPicker" className="text-lg font-semibold">Color Picker:</label>
          <ColorPicker hideInput id="colorPicker" height={200} color={color} onChange={setColor} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="lineWidth" className="text-lg font-semibold">Line Width:</label>
          <input
            type="range"
            id="lineWidth"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
          />
        </div>
        <button className="border border-black rounded-md py-2 px-4 bg-gray-200 hover:bg-gray-300 transition-colors" onClick={handleClearCanvas}>
          Clear Canvas
        </button>
        <Link href="/">
          <button onClick={leaveRoom} className="border border-black rounded-md py-2 px-4 bg-gray-200 hover:bg-gray-300 transition-colors">
            Leave Room
          </button>
        </Link>
        <button
          className={`border border-black rounded-md py-2 px-4 bg-${isEraser ? 'red' : 'green'}-200 hover:bg-${isEraser ? 'red' : 'green'}-300 transition-colors`}
          onClick={() => setIsEraser(!isEraser)}
        >
          {isEraser ? "Disable Eraser" : "Enable Eraser"}
        </button>
        <button
          className={`border border-black rounded-md py-2 px-4 bg-${isRectangle ? 'red' : 'green'}-200 hover:bg-${isRectangle ? 'red' : 'green'}-300 transition-colors`}
          onClick={() => setisRectangle(!isRectangle)}
        >
          {isRectangle ? "Disable Rect" : "Enable Rect"}
        </button>
      </div>
      {isDrawing && (
        <textarea
          onChange={(e) => settext(e.target.value)}
          autoFocus
          value={text}
          className="absolute bg-white p-2 border border-gray-300 rounded-md"
          style={{
            top: points.y,
            left: points.x,
          }}
        />
      )}
    </div>
  );
  
  
};

export default Page;
