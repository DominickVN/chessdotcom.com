import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link, useParams } from "react-router-dom";
import axios from 'axios';  
import ChessBoard from "./ChessBoard";
import HomePage from "./HomePage";
import GameSettings from "./GameSettings";
import ChessGame from "./ChessGame";
import StatsPage from "./StatsPage";
import NavBar from "./NavBar";
import './global.css';
import { joinGame, sendMove, onMoveReceived, onPlayerJoined } from './SocketManager';
import ChessAIBoard from './ChessAIBoard';
import StockfishINT from './Stockfish';

function JoinGame() {
  let { gameCode } = useParams();
  
  useEffect(() => {
      axios.get(`http://localhost:5555/games/code/${gameCode}`)
          .then(response => {
              const game = response.data.game;
          })
          .catch(error => {
              console.error("Error joining game:", error);
          });
  }, [gameCode]);

  return <div>Joining game...</div>;
}

function App() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [moves, setMoves] = useState([]);
  const [shareableLink, setShareableLink] = useState('');  

  useEffect(() => {
    axios.get('http://localhost:5555/games')
    .then(response => {
      setGames(response.data.games);
    })
    .catch(error => {
        console.error("Error fetching games:", error);
    });
  }, []);

  const handleGameSelect = (gameId) => {
    axios.get(`http://localhost:5555/games/${gameId}`)
      .then(response => {
        setSelectedGame(response.data.game);
        setMoves(response.data.moves);
        setShareableLink(`${window.location.origin}/join/${response.data.game.code}`);
      });
  }

  const createNewGame = (player1_id, duration) => {
    axios.post('http://localhost:5555/games', { player1_id, duration })
        .then(response => {
            const gameCode = response.data.game.code;
            setShareableLink(`${window.location.origin}/join/${gameCode}`);
        })
        .catch(error => {
            console.error("Error creating new game:", error);
        });
};

  return (
    <Router>
      <div className="App">
        <NavBar />

        <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/settings" component={GameSettings} />
            <Route path="/game/:gameId" component={ChessGame} />
            <Route path="/stats" component={StatsPage} />
            <Route path="/join/:gameCode" component={JoinGame} />
            <Route path="/play-stockfish" component={StockfishINT} />
            <Route path="/test-board" component={ChessAIBoard} />
        </Switch>
      <Route path="/join" component={ChessGame} />
      </div>
    </Router>
  );
}

export default App;