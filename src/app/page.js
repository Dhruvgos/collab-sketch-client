'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRoomContext } from '@/context/RoomContext';

const Page = () => {
  const { roomName, setRoomName, name, setName, roomCreated, setRoomCreated, roomJoined, setRoomJoined } = useRoomContext();

  const handleCreate = () => {
    setRoomCreated(true);
  };

  const joinRoom = () => {
    setRoomJoined(true);
  };

  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const welcomeText = "Welcome to CollabSketch";
    const intervalId = setInterval(() => {
      if (currentIndex <= welcomeText.length) {
        setText(welcomeText.substring(0, currentIndex));
        setCurrentIndex(currentIndex + 1);
      } else {
        clearInterval(intervalId);
        // Reset the animation after completion
        setTimeout(() => {
          setCurrentIndex(0);
        }, 1500); // 2 seconds delay before resetting animation
      }
    }, 200); // Adjust the interval for typing speed
    return () => clearInterval(intervalId);
  }, [currentIndex]);

  return (
    <div className='flex flex-col h-screen items-center justify-center bg-gradient-to-r from-left via-centre to-right'>
      <div className='max-w-md w-full mx-auto'>
        <h1 className='text-5xl font-bold mb-8 text-center '>
        <span className='text-transparent bg-gradient-to-r bg-clip-text from-pink-500 via-yellow-300 to-cyan-500'>{text}</span>

        </h1>
        <input
          className='w-full p-3 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500'
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder='Enter your name'
          type='text'
        />
        <div className="flex flex-row items-center mb-4 space-x-4">
          <Link href='/draw'>
            <button onClick={handleCreate} className='flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md focus:outline-none focus:shadow-outline'>
              Create Room
            </button>
          </Link>
          <input
            className='flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500'
            onChange={(e) => setRoomName(e.target.value)}
            value={roomName}
            placeholder='Enter room name'
            type='text'
          />
          <Link href='/draw'>
            <button onClick={joinRoom} className='flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md focus:outline-none focus:shadow-outline'>
              Join Room
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
