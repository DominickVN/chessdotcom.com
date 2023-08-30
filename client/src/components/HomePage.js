import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
    const [darkMode, setDarkMode] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
        setDarkMode(currentTheme === 'dark');
    }, []);

    const toggleDarkMode = () => {
        const newTheme = darkMode ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        setDarkMode(!darkMode);
    }

    const playAgainstStockfish = () => {
      history.push('/play-stockfish');
    };

    return (
      <div className="home-page">
        <div className="centered-content"> 
          <h1>Welcome to Chessdotcom.com</h1>
          <Link to="/play-stockfish">
          <button>Play Against Stockfish</button>
          </Link>
          <Link to="/test-board">
          <button>Test</button>
          </Link>
        </div>
      </div>
    );
  }

export default HomePage;