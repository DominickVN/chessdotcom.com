import React, { useState, useEffect } from 'react';
import './NavBar.css';
import { Link } from 'react-router-dom';
import logo from './images/chessdotcomtransparent (2).png';

const NavBar = () => {

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  const handleThemeChange = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="navbar">
      <Link to="/" className="logo">
        <div className="logo-image-container">
          <img src={logo} alt="Chessdotcom Logo" className="logo-image" />
        </div>
        <span className="logo-text">Chessdotcom.com</span>
      </Link>

      <div className="nav-links">
        <Link to="/settings" className="nav-item">Play</Link>
        
        <div className="nav-item">
          Extra <i className="dropdown-icon"></i>
          <div className="dropdown-content">
            <a href="#">Filler</a>
            <a href="#">Something</a>
            <a href="#">TBD</a>
          </div>
        </div>

        <div className="nav-item">Blog</div>

        <div className="nav-item" onClick={handleThemeChange}>
          {theme === "light" ? "Dark Mode" : "Light Mode"}
          <i className="dropdown-icon"></i>
        </div>
      </div>

      {/* <div className="user-section">
        <button className="sign-in-btn">Sign In</button>
        <button className="sign-up-btn">Sign Up</button>
      </div> */}
    </div>
  );
}

export default NavBar;
