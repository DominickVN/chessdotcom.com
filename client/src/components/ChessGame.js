import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import ChessBoard from './ChessBoard';
import { Chess } from 'chess.js';
import ChatBox from './ChatBox';
import './CommonChessStyles.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5555');

function ChessGame({ match }) {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const timerDuration = parseInt(searchParams.get('timerDuration')) * 60 || 300;

    const [game, setGame] = useState(null);
    const gameId = match.params.gameId;
    const [currentTurn, setCurrentTurn] = useState('white');
    const [whiteTime, setWhiteTime] = useState(timerDuration);
    const [blackTime, setBlackTime] = useState(timerDuration);
    const [shareableLink, setShareableLink] = useState('');
    const urlParams = new URLSearchParams(window.location.search);
    const gameCode = urlParams.get('game_code');
    const [playerColor, setPlayerColor] = useState('white');
    const [fen, setFen] = useState("start");
    const [isCreator, setIsCreator] = useState(false);
    const [chess] = useState(() => new Chess());
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [aiTurn, setAiTurn] = useState(false);

    const makeMove = (from, to) => {
        const move = {
            from,
            to,
            promotion: "q"
        };
    
        const result = chess.move(move);
    
        if (result) {
            socket.emit('move_made', { game_code: game.code, from_position: from, to_position: to });
            setFen(chess.fen());
        }
    };

    const handleOpponentMove = (from, to) => {
        const move = { from, to, promotion: "q" };
        const result = chess.move(move);

        if (result) {
            setFen(chess.fen());
        }
        setAiTurn(true);
    };

    const sendMessage = (message) => {
        socket.emit('send_message', message);
      };
    
    const onMessageReceived = (callback) => {
    socket.on('receive_message', message => {
        callback(message);
    });
    };

    useEffect(() => {
        console.log("Current actual player color in ChessGame:", actualPlayerColor);

        let playerId = localStorage.getItem('playerId') || generatePlayerId();
        localStorage.setItem('playerId', playerId);

        onMessageReceived((message) => {
            setMessages(prevMessages => [...prevMessages, message]);
          });
    
        if (gameCode) {
            setIsCreator(false);
            socket.emit('join_game', { game_code: gameCode, player_id: playerId });
    
            axios.get(`http://localhost:5555/games/code/${gameCode}`)
            .then(response => {
                setGame(response.data.game);
                const creatorColor = response.data.game.creatorColor;
                setPlayerColor(creatorColor === 'white' ? 'black' : 'white');
                setShareableLink(`${window.location.origin}/join?game_code=${response.data.game.code}`);
            })
            .catch(err => {
                console.error("Error fetching game:", err);
            });
        } else if (gameId) {
            setIsCreator(true);
            axios.get(`http://localhost:5555/games/${gameId}`)
            .then(response => {
                setGame(response.data.game);
                const creatorColor = response.data.game.creatorColor;
                setPlayerColor(creatorColor);
                setShareableLink(`${window.location.origin}/join?game_code=${response.data.game.code}`);
            })
            .catch(err => {
                console.error("Error fetching game:", err);
            });
        }
    
        socket.on('move_broadcast', function(data) {
            console.log("Received move:", data);
            handleOpponentMove(data.from_position, data.to_position);
        });
    
        return () => {
            socket.off('move_broadcast');
        };
        setAiTurn(false);
    }, [gameId, gameCode, fen]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareableLink)
            .then(() => {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2700);
                setTimeout(() => setLinkCopied(null), 3000);
            })
            .catch(err => {
                console.error('Could not copy link: ', err);
            });
    };

    const handleSendMessage = (newMessage) => {
        sendMessage(newMessage);
        setMessages(prevMessages => [...prevMessages, { text: newMessage, from: 'Me' }]);
      };

    socket.on('player_joined', function(data) {
        console.log("A player has joined", data);
    });

    const actualPlayerColor = isCreator ? playerColor : (playerColor === 'white' ? 'black' : 'white');
    const generatePlayerId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    if (!game) {
        return <p>Loading game...</p>;
    } 

    return (
        <div className="chessgame-page">
          {isCreator ? (
            <h2>You are the creator of this game.</h2>
          ) : (
            <h2>You are the opponent in this game.</h2>
          )}
        
            <ChessBoard 
                playerColor={actualPlayerColor}
                whiteTime={whiteTime}
                setWhiteTime={setWhiteTime}
                blackTime={blackTime}
                setBlackTime={setBlackTime}
                onMove={makeMove}
                gameId={gameId}
                messages={messages}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                handleSendMessage={handleSendMessage}
            />
          <div className="bottom-section">
            {isCreator && shareableLink && (
              <div className="shareable-link-section">
                Share this link to invite your opponent: <a href={shareableLink}>{shareableLink}      </a>
                <button className="button-style" onClick={handleCopyLink}>Copy</button>
              </div>
            )}
            {linkCopied !== null && (
                <div className={`link-copied-popup ${linkCopied ? '' : 'hide'}`}>
                    Link copied to clipboard
                </div>
            )}
          </div>
        </div>
      );
    }
      
    export default ChessGame;