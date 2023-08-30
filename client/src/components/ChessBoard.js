import React, { useState, useEffect } from "react";
import { sendMove, onMoveReceived } from './SocketManager';
import { Chess } from 'chess.js';
import Chessboard from "chessboardjsx";
import './CommonChessStyles.css';
import ChatBox from './ChatBox';
import axios from 'axios';

const ChessBoard = ({
    gameId, playerColor, onMove,
    whiteTime, setWhiteTime,
    blackTime, setBlackTime,
    messages, messageInput, setMessageInput, handleSendMessage
}) => {
    const [chess] = useState(() => new Chess());
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(null);
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [endGame, setEndGame] = useState(false);
    const [isPromoting, setIsPromoting] = useState(false);
    const [promotionSquare, setPromotionSquare] = useState(null);
    const [lastMove, setLastMove] = useState(null);
    const [fen, setFen] = useState('initial FEN string');
    const [aiTurn, setAiTurn] = useState(false);
    let gameCode = (0);

    useEffect(() => {
        if (timer) {
            clearInterval(timer);
        }

        const newTimer = setInterval(() => {
            if (chess.turn() === 'w') {
                setWhiteTime(prevTime => {
                    if (prevTime === 0) {
                        clearInterval(newTimer);
                        setError("Time's up! Black wins!");
                        setEndGame(true);
                        return prevTime;
                    }
                    return prevTime - 1;
                });
            } else {
                setBlackTime(prevTime => {
                    if (prevTime === 0) {
                        clearInterval(newTimer);
                        setError("Time's up! White wins!");
                        setEndGame(true);
                        return prevTime;
                    }
                    return prevTime - 1;
                });
            }
        }, 1000);

        setTimer(newTimer);
        const handleOpponentMove = (from, to) => {
            onMoveReceived((data) => {
                handleOpponentMove(data.from, data.to);
        })};
        return () => {
            clearInterval(newTimer);
        };
    }, [fen, chess]);

    const handleMove = (move) => {
        const { from, to } = move;
        const piece = chess.get(from);
        
        const isPromotion = 
          piece && piece.type === 'p' &&
          ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'));
        
        const newMove = {
          from,
          to,
          promotion: isPromotion ? 'q' : undefined
        };
      
        try {
          const result = chess.move(newMove);
          if (result) {
            setFen(chess.fen());
            onMove(move.from, move.to);
            setError(null);
        
            axios.put(`http://localhost:5555/games/${gameId}`, {
              fen: chess.fen(),
              white_time: whiteTime,
              black_time: blackTime
            }).catch(err => {
              console.error("Error updating game state:", err);
            });
        
            if (result.flags.includes("p")) {
              setIsPromoting(true);
              setPromotionSquare(move.to);
            }
      
            if (chess.isCheckmate()) {
              setError("Checkmate!");
            }
        
          } else {
            setError("Invalid move!");
          }
        } catch (error) {
          console.error("An error occurred:", error);
          setError("Invalid move!");
        }

        sendMove(gameCode, from, to);
        
        if (endGame) {
          return;
        }
      };      

    const [colorScheme, setColorScheme] = useState("scheme1");
    const [sourceSquare, setSourceSquare] = useState(null);

    const colorSchemes = {
        scheme1: {
            dark: "#d18b47",
            light: "#ffce9e"
        },
        scheme2: {
            dark: "#769656",
            light: "#eeeed2"
        },
        scheme3: {
            dark: "#8ca2ad",
            light: "#dee3e6"
        },
        scheme4: {
            dark: "#01539D",
            light: "#EEA47F"
        },
        scheme5: {
            dark: "#2F3D7E",
            light: "#FAEAEB"
        },
        scheme6: {
            dark: "#FA6166",
            light: "#FCE77E"
        },
        scheme7: {
            dark: "#317874",
            light: "#E2D2F9"
        },
        scheme8: {
            dark: "#4832D5",
            light: "#CCF281"
        },
        scheme9: {
            dark: "#990012",
            light: "#FCF6F6"
        },
        scheme10: {
            dark: "#8AAAE5",
            light: "#FFFFFF"
        },
        scheme11: {
            dark: "#FF69B3",
            light: "#01FFFF"
        },
        scheme12: {
            dark: "#EE4E34",
            light: "#FCEDDA"
        },
        scheme13: {
            dark: "#FFA252",
            light: "#EED871"
        },
        scheme14: {
            dark: "#8B307F",
            light: "#6882BB"
        },
        scheme15: {
            dark: "#B85043",
            light: "#A7BEAE"
        }

    };

    const getSquareStyling = () => {
        const squareStyles = {};
    
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = `${'abcdefgh'[i]}${8 - j}`;
                squareStyles[square] = { backgroundColor: chess.squareColor(square) === "light" ? colorSchemes[colorScheme].light : colorSchemes[colorScheme].dark };
            }
        }
    
        if (chess.inCheck()) {
            const turn = chess.turn();
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    const square = `${'abcdefgh'[i]}${8 - j}`;
                    const piece = chess.get(square);
                    
                    if (piece && piece.type === 'k' && piece.color === turn) {
                        squareStyles[square] = { ...squareStyles[square], backgroundColor: 'red' };
                    }
                }
            }
        }

        if (selectedSquare) {
            const possibleMoves = getPossibleMoveSquares(selectedSquare);
            for (let move of possibleMoves) {
                squareStyles[move] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
            }
        }
    
        return squareStyles;
    };
    
    const onDragStart = ({ sourceSquare }) => {
        setSourceSquare(sourceSquare);
        setSelectedSquare(null);
    };
    
    const onMouseUp = ({ square }) => {
        if (square === sourceSquare) {
            setFen(chess.fen());
        }
    };

    const handleSquareClick = (square) => {
        if (selectedSquare) {
            const moveObj = {
                from: selectedSquare,
                to: square,
                promotion: "q"
            };

            handleMove(moveObj);
            setSelectedSquare(null);
        } else {
            setSelectedSquare(square);
        }
    };

    const getPossibleMoveSquares = (sourceSquare) => {
        const moves = chess.moves({ square: sourceSquare, verbose: true });
        return moves.map(move => move.to);
    };

    const renderPromotionModal = () => (
        <div className="promotion-modal">
          <h3>Select piece for promotion</h3>
          <button onClick={() => handlePromotion('q')}>Queen</button>
          <button onClick={() => handlePromotion('n')}>Knight</button>
          <button onClick={() => handlePromotion('b')}>Bishop</button>
          <button onClick={() => handlePromotion('r')}>Rook</button>
        </div>
      );
      
      const handlePromotion = (chosenPiece) => {
        console.log("Promotion Square:", promotionSquare);
        console.log("Chosen Piece:", chosenPiece);
        
        const promotionMove = {
            from: lastMove.to,
            to: promotionSquare,
            promotion: chosenPiece
          };

        console.log("Promotion Move Object:", promotionMove);
      
        try {
          const result = chess.move(promotionMove);
          if (result) {
            setFen(chess.fen());
            setIsPromoting(false);
            setPromotionSquare(null);
            setError(null);
          } else {
            setError("Invalid promotion!");
          }
        } catch (error) {
          console.error("An error occurred:", error);
          setError("Invalid promotion!");
        }
      };      

    useEffect(() => {
        console.log("Current player color in ChessBoard:", playerColor);
    }, [playerColor]);    

    return (
        <div className="chessboard-container">
                <div className="timer-container">
                    <div className="timer black">
                        Black: {Math.floor(blackTime / 60)}:{blackTime % 60 < 10 ? '0' : ''}{blackTime % 60}
                    </div>
                    <div className="timer white">
                        White: {Math.floor(whiteTime / 60)}:{whiteTime % 60 < 10 ? '0' : ''}{whiteTime % 60}
                    </div>
                </div>
                {isPromoting && renderPromotionModal()}
                <div className="board-color-dropdown-container">
                    <label htmlFor="colorScheme" className="board-color-label">Select Board Color: </label>
                    <select
                        id="colorScheme"
                        className="board-color-dropdown"
                        value={colorScheme}
                        onChange={(e) => setColorScheme(e.target.value)}
                    >
                        <option value="scheme1">Scheme 1</option>
                        <option value="scheme2">Scheme 2</option>
                        <option value="scheme3">Scheme 3</option>
                        <option value="scheme4">Scheme 4</option>
                        <option value="scheme5">Scheme 5</option>
                        <option value="scheme6">Scheme 6</option>
                        <option value="scheme7">Scheme 7</option>
                        <option value="scheme8">Scheme 8</option>
                        <option value="scheme9">Scheme 9</option>
                        <option value="scheme10">Scheme 10</option>
                        <option value="scheme11">Scheme 11</option>
                        <option value="scheme12">Scheme 12</option>
                        <option value="scheme13">Scheme 13</option>
                        <option value="scheme14">Scheme 14</option>
                        <option value="scheme15">Scheme 15</option>
                    </select>
                </div>

            <Chessboard
                width={400}
                position={fen}
                squareStyles={getSquareStyling(selectedSquare)}
                onDragStart={onDragStart}
                onMouseUp={onMouseUp}
                onDrop={(move) =>
                    handleMove({
                        from: move.sourceSquare,
                        to: move.targetSquare,
                        promotion: "q"
                    })
                }
                onMouseOverSquare={square => setSelectedSquare(square)}
                onMouseOutSquare={() => setSelectedSquare(null)}
                onClickSquare={handleSquareClick}
                orientation={playerColor}
            />
            {error && (
                <div className={`error-popup ${error === "Checkmate!" ? "checkmate" : ""}`}>
                    {error}
                    <button onClick={() => setError(null)}>&times;</button>
                </div>
            )}
            <ChatBox
                messages={messages}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                handleSendMessage={handleSendMessage}
            />
            <div>
            </div>
        </div>
    );
}

export default ChessBoard;