import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import './output.css';
import realEstateLogo from './images/realEstateLogo.png'; // Importing the logo image
import linkedIn from './images/linkedIn.png'; // Importing the logo image
import insta from './images/insta.webp'; // Importing the logo image
import Home from './components/Home';
import Announcements from './components/Announcements';
import Calendar from './components/Calendar';
import About from './components/About';
import Login from './components/Login';
import Resources from './components/Resources';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);

  const handleLogout = () => {
    // Handle logout functionality here
    setLoggedIn(false);
    setAdminAccess(false);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Banner with Logo and Login button */}
        <div className="header-container bg-dark-gray text-white py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src={realEstateLogo} alt="Real Estate Logo" className="h-20 mr-2" />
            <div>
              {/* Welcome Message */}
            </div>
          </div>
          <div className="mr-4">
            {/* Login button */}
            {adminAccess ? (
              <button
                className="bg-white text-navy py-2 px-4 rounded-lg btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link
                className="bg-white text-navy py-2 px-4 rounded-lg btn"
                to="/login"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs />

        {/* Main content */}
        <div className="flex-grow flex justify-center">
          <Routes>
            <Route path="/" element={<Home adminAccess={adminAccess} />} />
            <Route path="/announcements" element={<Announcements adminAccess={adminAccess} />} />
            <Route path="/calendar" element={<Calendar adminAccess={adminAccess} />} />
            <Route path="/about" element={<About adminAccess={adminAccess} />} />
            <Route path="/login" element={<Login setLoggedIn={setLoggedIn} setAdminAccess={setAdminAccess} />} />
            <Route path="/resources" element={<Resources adminAccess={adminAccess} />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer 
          className="w-full bg-dark-gray text-white py-4 text-center mt-auto"
        >
          <h2>@2024 by Real Estate Club GVSU</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <a href="https://www.instagram.com/gvsurealestate/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', transition: 'transform 0.3s' }}>
              <img src={insta} alt="Instagram Logo" className="h-20 hover:transform hover:scale-110" />
            </a>
            <a href="https://www.linkedin.com/company/real-estate-club-at-gvsu" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', transition: 'transform 0.3s' }}>
              <img src={linkedIn} alt="LinkedIn Logo" className="h-20 hover:transform hover:scale-110" />
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function Tabs() {
  const location = useLocation();

  const getTabClass = (path) => {
    return location.pathname === path ? 'bg-navy text-white' : 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="flex justify-between w-full">
      <Link to="/" className={`w-full px-4 py-4 text-center ${getTabClass('/')}`}>Home</Link>
      <Link to="/announcements" className={`w-full px-4 py-4 text-center ${getTabClass('/announcements')}`}>Announcements</Link>
      <Link to="/calendar" className={`w-full px-4 py-4 text-center ${getTabClass('/calendar')}`}>Calendar</Link>
      <Link to="/about" className={`w-full px-4 py-4 text-center ${getTabClass('/about')}`}>About</Link>
      <Link to="/resources" className={`w-full px-4 py-4 text-center ${getTabClass('/resources')}`}>Resources</Link>
    </div>
  );
}

export default App;
