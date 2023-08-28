import React from 'react';

const ChatBox = ({ messages, messageInput, setMessageInput, handleSendMessage }) => {
  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index}>{message.from}: {message.text}</div>
        ))}
      </div>
      <div className="input-box">
        <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
        <button onClick={() => handleSendMessage(messageInput)}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;