import React from 'react';

const ChessAIBoard = () => {
  return (
    <div>
      <h1>Chess AI Board</h1>
      <iframe 
        src="https://codesandbox.io/embed/432vylv590?fontsize=14&hidenavigation=1&theme=dark"
        style={{width: "100%", height: "500px", border: "0", borderRadius: "4px", overflow: "hidden"}}
        title="Chessboard.jsx · Stockfish · v2"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default ChessAIBoard;