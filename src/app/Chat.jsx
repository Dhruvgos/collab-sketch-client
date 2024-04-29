import React, { useState } from 'react';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(['hi', 'hello', 'yahi hai']);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='fixed bottom-20 left-4'>
      {!isOpen && (
        <button onClick={toggleChat} className='btn bg-blue-500 text-white rounded-full px-4 py-2'>
          Open Chat
        </button>
      )}
      {isOpen && (
        <div className='bg-gray-800 text-white rounded-md p-4'>
          {messages.map((m, index) => (
            <p className='text-white' key={index}>{m}</p>
          ))}
          <div className='flex  max-h-svh'>

          <input type="text" className='border border-gray-400 p-1 rounded-md w-full' />
          <button onClick={toggleChat} className='btn bg-red-500 text-white rounded-full px-4 py-2 mt-2'>
            Close Chat
          </button>
          </div>
        </div>
      )}
    </div>
  );
  
};
export default Chat;
