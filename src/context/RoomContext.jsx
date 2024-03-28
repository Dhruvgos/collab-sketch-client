// context/RoomContext.js
'use client'
import React, { createContext, useContext, useState } from 'react';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [roomName, setRoomName] = useState('');
  const [name, setName] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);

  return (
    <RoomContext.Provider value={{ roomName, setRoomName, name, setName, roomCreated, setRoomCreated, roomJoined, setRoomJoined }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => useContext(RoomContext);
