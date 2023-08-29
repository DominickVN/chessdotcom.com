import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
    const [darkMode, setDarkMode] = useState(false);

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

    return (
      <div className="home-page">
        <div className="centered-content"> 
          <h1>Welcome to Chessdotcom.com</h1>
          <Link to="/settings" className="play-button">Play Chess</Link>
        </div>
      </div>
    );
  }

export default HomePage;