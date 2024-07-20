import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import './output.css';
import realEstateLogo from './images/realEstateLogo.png'; // Importing the logo image
import linkedIn from './images/linkedIn.png'; // Importing the logo image
import insta from './images/insta.webp'; // Importing the logo image
import tiktok from './images/tiktok.png'; // Importing the logo image
import Home from './components/Home';
import Announcements from './components/Announcements';
import Calendar from './components/Calendar';
import About from './components/About';
import Login from './components/Login';
import Resources from './components/Resources';

function App() {
  const [adminAccess, setAdminAccess] = useState(false);

  return (
    <Router basename="/">
      <div style={{ fontFamily: 'Gill Sans, sans-serif' }} className="flex flex-col min-h-screen">
        {/* Banner with Logo and Login button */}
        <div className="header-container bg-dark-gray text-white py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src={realEstateLogo} alt="Real Estate Logo" className="h-20 mr-2" />
          </div>
          <div className="mr-4">
            {/* Login button */}
            {adminAccess ? (
              <button className="bg-white text-navy py-2 px-4 rounded-lg btn">
                Logout
              </button>
            ) : (
              <Link className="bg-white text-navy py-2 px-4 rounded-lg btn" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs />

        {/* Main content */}
        <div className="flex-grow flex justify-center w-full">
          <Routes>
            <Route path="/" element={<Home adminAccess={adminAccess} />} />
            <Route path="/announcements" element={<Announcements adminAccess={adminAccess} />} />
            <Route path="/calendar" element={<Calendar adminAccess={adminAccess} />} />
            <Route path="/about" element={<About adminAccess={adminAccess} />} />
            <Route path="/login" element={<Login setAdminAccess={setAdminAccess} />} />
            <Route path="/resources" element={<Resources adminAccess={adminAccess} />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="w-full bg-dark-gray text-white py-4 text-center mt-auto">
          <h2>@2024 by Real Estate Club GVSU</h2>
          <div className="flex justify-center items-center gap-4 mt-4">
            <a href="https://www.instagram.com/gvsurealestate/" target="_blank" rel="noopener noreferrer" className="transition-transform transform hover:scale-110">
              <img src={insta} alt="Instagram Logo" className="h-10" />
            </a>
            <a href="https://www.linkedin.com/company/real-estate-club-at-gvsu" target="_blank" rel="noopener noreferrer" className="transition-transform transform hover:scale-110">
              <img src={linkedIn} alt="LinkedIn Logo" className="h-10" />
            </a>
            <a href="https://www.tiktok.com/@gvsurealestateclub?lang=en" target="_blank" rel="noopener noreferrer" className="transition-transform transform hover:scale-110">
              <img src={tiktok} alt="TikTok Logo" className="h-10" />
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
    <div className="flex flex-col md:flex-row w-full">
      <div className="flex w-full overflow-x-auto">
        <Link to="/" className={`w-full px-4 py-2 md:py-4 text-center ${getTabClass('/')}`}>Home</Link>
        <Link to="/announcements" className={`w-full px-4 py-2 md:py-4 text-center ${getTabClass('/announcements')}`}>Announcements</Link>
        <Link to="/calendar" className={`w-full px-4 py-2 md:py-4 text-center ${getTabClass('/calendar')}`}>Calendar</Link>
        <Link to="/about" className={`w-full px-4 py-2 md:py-4 text-center ${getTabClass('/about')}`}>About</Link>
      </div>
      <div className="w-full">
        <Link to="/resources" className={`w-full px-4 py-2 md:py-4 text-center ${getTabClass('/resources')}`}>Resources</Link>
      </div>
    </div>
  );
}

export default App;
