import React, { useState } from 'react';
import './App.css';
import 'tailwindcss/tailwind.css';
import './output.css';
import realEstateLogo from './images/realEstateLogo.png'; // Importing the logo image

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('announcements');

  const handleLogin = () => {
    // Handle login functionality here
    setLoggedIn(true);
  };

  const handleLogout = () => {
    // Handle logout functionality here
    setLoggedIn(false);
  };

  return (
    <div>
      {/* Banner with Logo and Login button */}
      <div className="header-container bg-blue-500 text-white py-8 relative flex justify-center items-center">
        <div className="container mx-auto">
          <div className="flex items-center justify-center">
            <img src={realEstateLogo} alt="Real Estate Logo" className="h-10 mr-2" />
            <h1 className="text-3xl font-bold">Welcome</h1>
          </div>
        </div>
        <div className="absolute right-2">
          {/* Login button */}
          {loggedIn ? (
            <button
              className="bg-white text-blue-500 py-2 px-4 rounded-lg"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className="bg-white text-blue-500 py-2 px-4 rounded-lg"
              onClick={handleLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-4">
        <button
          className={`mx-2 px-4 py-2 rounded-lg ${
            activeTab === 'announcements' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </button>
        <button
          className={`mx-2 px-4 py-2 rounded-lg ${
            activeTab === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`mx-2 px-4 py-2 rounded-lg ${
            activeTab === 'blog' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('blog')}
        >
          Blog
        </button>
        <button
          className={`mx-2 px-4 py-2 rounded-lg ${
            activeTab === 'merch' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('merch')}
        >
          Merch
        </button>
      </div>

      {/* Main content */}
      <div className="flex justify-center mt-4">
        {/* Content based on activeTab */}
        {activeTab === 'announcements' && (
          <div>
            {/* Add content for Announcements tab */}
            <p>Announcements content goes here.</p>
          </div>
        )}
        {activeTab === 'calendar' && (
          <div>
            {/* Add content for Calendar tab */}
            <p>Calendar content goes here.</p>
          </div>
        )}
        {activeTab === 'blog' && (
          <div>
            {/* Add content for Blog tab */}
            <p>Blog content goes here.</p>
          </div>
        )}
        {activeTab === 'merch' && (
          <div>
            {/* Add content for Merch tab */}
            <p>Merch content goes here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
