import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StockfishBoard = () => {
    const [board, setBoard] = useState();
    const [fen, setFen] = useState();

    const handlePlayerMove = (move) => {
    };

    const getStockfishMove = async () => {
        try {
            const response = await axios.post('http://localhost:5555/best_move', { fen });
            const bestMove = response.data.best_move;
        } catch (error) {
            console.error('Error getting Stockfish move:', error);
        }
    };

    useEffect(() => {
        if ({}) {
            getStockfishMove();
        }
    }, []);

    return (
        {}
    );
};

export default StockfishBoard;