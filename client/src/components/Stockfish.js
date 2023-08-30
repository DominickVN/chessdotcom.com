import React, { useEffect, useRef } from "react";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";

const StockfishINT = () => {
  const game = useRef(new Chess());
  const stockfish = useRef(new Worker("client/public/js/StockfishAI.js"));

  useEffect(() => {
    stockfish.current.onmessage = (event) => {
      console.log(event.data);
    };
  }, []);

  const getBestMove = (game) => {
    stockfish.current.postMessage("position fen " + game.fen());
    stockfish.current.postMessage("go depth 15");
  };

  const onDrop = ({ sourceSquare, targetSquare }) => {
    let move = game.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return;

    getBestMove(game.current);
  };

  return (
    <div>
      <Chessboard position={game.current.fen()} onDrop={onDrop} />
    </div>
  );
};

export default StockfishINT;