import React, { useState, useRef, useEffect } from 'react';
import { useDrawContext } from '@/context/DrawContext';
import { useRoomContext } from '@/context/RoomContext';

const Chat = ({ socket, roomName, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, setMessages } = useDrawContext();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const { name } = useRoomContext();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (text.trim() !== "") {
      const newMessage = { text, id, name }; // Include sender's name
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setText(""); // Clear the input field after sending the message
      emitMessages(newMessage); // Emit the new message
    }
  };

  const emitMessages = (message) => {
    if (socket) {
      socket.emit('message', { message, roomName, id: socket.id ,messages});
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('message', data => {
        console.log(data)
        setMessages(prevMessages => [...prevMessages, data.message]);
      });
      // Listen for chat history from the server
socket.on("get-messages", (data)=> {
  // Update the chat UI with the received chat history
  socket.emit('message-array',{messages,roomname:data.roomname,id});


});


  socket.on('message-state-from-server',data=>{
    console.log(data)
  })

    }
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className='fixed bottom-10 right-10'>
      {!isOpen && (
        <button onClick={toggleChat} className='btn bg-blue-700 text-white rounded-full px-4 py-2'>
          Open Chat
        </button>
      )}
      {isOpen && (
        <div className='bg-gray-800 text-white rounded-md p-4 max-w-sm'>
          <div className='max-h-48 overflow-y-auto'>
            {messages.map((m, index) => (
              <div key={index} className="mb-2">
                <div key={index} className={`flex ${m.id === id ? 'justify-end' : 'justify-start'}`}>
                  <p className='text-white bg-cyan-500 inline-flex flex-row rounded-lg p-2'>
                    <span className="text-sm font-bold mr-1">{m.name}: </span>{m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
          <div className='flex gap-1'>
            <input placeholder='Enter your message' value={text} onChange={(e) => setText(e.target.value)} type="text" className='border text-black border-gray-400 p-0.5 rounded-md w-full' />
            <div className='flex-col'>
              <button onClick={sendMessage} className='btn bg-green-500 text-white rounded-full px-2 py-0.5 mt-2'>
                Send
              </button>
              <button onClick={toggleChat} className='btn bg-red-500 text-white rounded-full px-2 py-0.5 mt-2'>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
