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
import { generateRandomString } from "@/utils/RoomnameGenerate";
import { downloadImg } from "@/utils/DownloadImage";
import { useDrawContext } from "@/context/DrawContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "../Chat";

const Page = () => {
  const [color, setColor] = useColor("#561ecb");
  const [socket, setSocket] = useState(null);
  const [isEraser, setIsEraser] = useState(false);
  const [points, setpoints] = useState({});
  const [lineWidth, setLineWidth] = useState(3);
  const [currentCanvasState, setCurrentCanvasState] = useState(null);
  const [id, setId] = useState("");
  const [isRectangle, setisRectangle] = useState(false);
  const [isCircle, setisCircle] = useState(false);
  const [text, settext] = useState("");
  const [socketsByRoom, setSocketsByRoom] = useState([]);
  const [alreadyDrawed, setalreadyDrawed] = useState(false);
  const [dim, setdim] = useState({});
  const { rectangles, setrectangles, image, setimage, circles, setcircles } =
    useDrawContext();
  const [nowWriting, setnowWriting] = useState(false);

  const { roomCreated, setRoomCreated, roomName, setRoomName, name, setName } =
    useRoomContext();
  const { canvasRef, clear, isDrawing } = UseDraw({
    color,
    socket,
    isEraser,
    lineWidth,
    text,
    isRectangle,
    isCircle,
  });
  const { roomJoined, setRoomJoined } = useRoomContext();

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    // const newSocket = io("https://collab-sketch-server.onrender.com");
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
      setimage(
        ctx.getImageData(
          0,
          0,
          canvasRef.current?.width,
          canvasRef.current?.height
        )
      );
      redraw(data, ctx);
    });

    newSocket.on("write", (data) => {
      if (!ctx) return;
      ctx.fillText(data.text, data.x, data.y);
    });

    newSocket.on("rectangle", (data) => {
      if (!ctx) return;
      if (image) {
        // yaha se
        ctx.putImageData(image, 0, 0);
      }
      setimage(
        ctx.getImageData(
          0,
          0,
          canvasRef.current?.width,
          canvasRef.current?.height
        )
      ); // yaha tk add kiya
      const img = new Image();
      // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      img.src = data.url;
      // img.onload = () => {
      //   ctx.drawImage(img, 0, 0);
      // };
      ctx.strokeStyle = data.color.hex
      ctx.strokeRect(data.x, data.y, data.width, data.height); // added this remove up 3
      setrectangles((prevRectangles) => [
        ...prevRectangles,
        {
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height,
          color: data.color,
        },
      ]);

      rectangles.forEach((rect) => {
        ctx.strokeStyle = rect.color.hex;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height); // Draw each rectangle
      });
      // setimage(ctx.getImageData(0, 0, canvasRef.current?.width, canvasRef.current?.height));  // yaha tk add kiya
    });
    newSocket.on("circle", (data) => {
      if (!ctx) return;
      const img = new Image();
      if (image) {
        ctx.putImageData(image, 0, 0);
      }
      setimage(
        ctx.getImageData(
          0,
          0,
          canvasRef.current?.width,
          canvasRef.current?.height
        )
      );
      // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      // img.src = data.url;
      // img.onload = () => {
        //   ctx.drawImage(img, 0, 0);
        // };
        ctx.beginPath();
      ctx.arc(data.x, data.y, data.radius, 0, Math.PI * 2); // Full circle
      ctx.strokeStyle = data.color.hex; // Stroke color
      ctx.stroke(); // Stroke the circle
      setcircles((prevCircles) => [
        ...prevCircles,
        {
          x: data.x,
          y: data.y,
          radius: data.radius,
          color: data.color,
        },
      ]);

      circles.forEach((prevCircle) => {
        console.log(prevCircle);
        ctx.beginPath();
        ctx.arc(prevCircle.x, prevCircle.y, prevCircle.radius, 0, Math.PI * 2);
        ctx.strokeStyle = prevCircle.color.hex;
        ctx.stroke();
      });
      // setimage(ctx.getImageData(0, 0, canvasRef.current?.width, canvasRef.current?.height));
      // setimage(ctx.getImageData(0, 0, canvasRef.current?.width, canvasRef.current?.height));  // yaha tk add kiya
    });
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();

    newSocket.on("clear", clear);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      newSocket.disconnect();
      newSocket.off("draw-line");
      newSocket.off("get-canvas-state");

      newSocket.off("draw");
      newSocket.off("clear");
      newSocket.off("write");
      newSocket.off("rectangle");
    };
  }, [canvasRef]);

  useEffect(() => {
    if (socket) {
      socket.on("get-canvas-state", (rname) => {
        if (!canvasRef.current?.toDataURL()) return;

        console.log(socketsByRoom);
        console.log(rname);
        console.log("ye dekh to", canvasRef.current?.toDataURL()); ///i gues iska url white page se asccaiated hai
        console.log("sahi to hai r");
        socket.emit("canvas-state", {
          roomName: rname,
          url: canvasRef.current.toDataURL(),
          socketsByRoom: socketsByRoom || [],
        });
      });
    }

    return () => {
      socket && socket.off("canvas-state");
    };
  }, [canvasRef, socket, socketsByRoom]);

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
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-200">
      <div className="relative">
      <div className="absolute bottom-4 left-4">
        <Chat/>
      </div>
        <canvas
          tabIndex={0}
          className="border border-black rounded-md  bg-background"
          ref={canvasRef}
          style={{
            cursor: (isEraser && "crosshair") || (nowWriting && "text"),
          }}
          onClick={handlePoints}
        />
        {nowWriting && isDrawing && (
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
      <div className="tools absolute top-4 left-4 flex flex-col gap-4 bg-toolBg p-4 rounded-md">
        <div className=" text-md text-white font-semibold">{`Room : ${roomName}`}</div>
        <div className="flex flex-col gap-2 w-32">
          <ColorPicker
         
            hideInput
            hideAlpha
            id="colorPicker"
            height={80}
            color={color}
            onChange={setColor}
          />
        </div>
        <div className="flex flex-col text-white gap-2">
          {/* <label htmlFor="lineWidth" className="text-lg font-semibold">
            {/* Line Width: */}
          {/* </label> */} 
          <input
          className="h-8 w-32"
            type="range"
            id="lineWidth"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1">
            <button
              className={`btn text-white btn-clear`}
              onClick={handleClearCanvas}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
              >
                <path d="M440-520h80v-280q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800v280ZM200-360h560v-80H200v80Zm-58 240h98v-80q0-17 11.5-28.5T280-240q17 0 28.5 11.5T320-200v80h120v-80q0-17 11.5-28.5T480-240q17 0 28.5 11.5T520-200v80h120v-80q0-17 11.5-28.5T680-240q17 0 28.5 11.5T720-200v80h98l-40-160H182l-40 160Zm676 80H142q-39 0-63-31t-14-69l55-220v-80q0-33 23.5-56.5T200-520h160v-280q0-50 35-85t85-35q50 0 85 35t35 85v280h160q33 0 56.5 23.5T840-440v80l55 220q13 38-11.5 69T818-40Zm-58-400H200h560Zm-240-80h-80 80Z" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <Link href="/">
              <button
                onClick={leaveRoom}
                className={`btn text-white btn-leave`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e8eaed"
                >
                  <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
  <div className="flex-1">
    <button
      className={`btn text-white btn-eraser bg-${
        isEraser ? "red" : "green"
      }-200 hover:bg-${isEraser ? "red" : "green"}-300 ${
        isEraser ? "border-2 border-gray-500" : ""
      }`}
      onClick={() => setIsEraser(!isEraser)}
    >
      {/* {isEraser ? "Disable Eraser" : "Enable Eraser"} */}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#e8eaed"
      >
        <path d="M690-240h190v80H610l80-80Zm-500 80-85-85q-23-23-23.5-57t22.5-58l440-456q23-24 56.5-24t56.5 23l199 199q23 23 23 57t-23 57L520-160H190Zm296-80 314-322-198-198-442 456 64 64h262Zm-6-240Z" />
      </svg>
    </button>
  </div>
  <div className="flex-1">
    <button
      className={`btn text-white btn-rect bg-${
        isRectangle ? "red" : "green"
      }-200 hover:bg-${isRectangle ? "red" : "green"}-300 ${
        isRectangle ? "border-2 border-gray-500" : ""
      }`}
      onClick={() => setisRectangle(!isRectangle)}
    >
      {/* {isRectangle ? "Disable Rect" : "Enable Rect"} */}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#e8eaed"
      >
        <path d="M80-160v-640h800v640H80Zm80-80h640v-480H160v480Zm0 0v-480 480Z" />
      </svg>
    </button>
  </div>
</div>

        <div className="flex flex-wrap gap-2">
          <div className="flex-1">
            {canvasRef.current && (
              <button
                onClick={() => downloadImg(canvasRef.current)}
                className="btn text-white btn-download"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e8eaed"
                >
                  <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                </svg>
              </button>
            )}
              </div>
            <div className="flex-1">
            <button
              onClick={() => setisCircle((prev) => !prev)}
              className="btn text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
              >
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={() => setnowWriting((prev) => !prev)}
          className="btn text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e8eaed"
          >
            <path d="M420-160v-520H200v-120h560v120H540v520H420Z" />
          </svg>
        </button>
   
      </div>
    
    </div>
  );
};

export default Page;
