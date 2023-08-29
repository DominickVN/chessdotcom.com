import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './CommonChessStyles.css';
import './GameSettings.css';

function GameSettings() {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [playerColor, setPlayerColor] = useState('white');

    const generateGame = (duration) => {
        setLoading(true);
        const player1_id = "someUniqueId";
        const playerColorChoice = playerColor;
    
        axios.post('http://localhost:5555/games', { player1_id })
            .then(response => {
                setLoading(false);
                const gameId = response.data.game.id;
                history.push(`/game/${gameId}?timerDuration=${duration}&playerColor=${playerColor}`);
            })
            .catch(err => {
                setLoading(false);
                setError("Error generating game. Please try again.");
                console.error("Error generating game:", err);
            });
    }
    
    const TimerButton = ({ duration, onClick }) => (
        <button 
            className="timer-btn-component"
            onClick={() => onClick(duration)}
        >
            {duration} Minute{duration > 1 ? 's' : ''}
        </button>
    );

    return (
        <div className="settings-container">
            {loading ? 
                <div className="loading-spinner"></div> 
                :
                <>
                <div>
                    <TimerButton duration={1} onClick={generateGame} />
                    <TimerButton duration={5} onClick={generateGame} />
                    <TimerButton duration={10} onClick={generateGame} />
                </div>
                <div className="color-choice">
                    <input 
                        type="radio" 
                        name="playerColor" 
                        id="white" 
                        value="white" 
                        checked={playerColor === 'white'} 
                        onChange={(e) => setPlayerColor(e.target.value)}
                    />
                    <label htmlFor="white">Play as White</label>
                    <input 
                        type="radio" 
                        name="playerColor" 
                        id="black" 
                        value="black" 
                        checked={playerColor === 'black'} 
                        onChange={(e) => setPlayerColor(e.target.value)}
                    />
                    <label htmlFor="black">Play as Black</label>
                </div>
                </>
            }
        </div>
    );    
}

export default GameSettings;