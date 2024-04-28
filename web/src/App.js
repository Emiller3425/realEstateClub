import React, { useState, useEffect } from 'react';
import './App.css';
import 'tailwindcss/tailwind.css';
import './output.css';
import ghostButton from './components/ghostButton'; // Importing the ghostbutton component
import realEstateLogo from './images/realEstateLogo.png'; // Importing the logo image
import { getUsers, db, updateUserData, addNewProfile, storage } from'./firebase'; // Importing the firebase module

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [activeTab, setActiveTab] = useState('announcements');
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const users = await getUsers();
      setUserList(users);
    }

    fetchUsers();
  }, []);

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
      <div className="header-container bg-blue-400 text-white py-4 relative flex justify-between items-center">
        <div className="flex items-center">
          <img src={realEstateLogo} alt="Real Estate Logo" className="h-20 mr-2" />
          <div>
          { /* Welcome Message */}
          <h1 className="text-3xl absolute p-4 text-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"> Welcome to Real Estate Club GVSU</h1>
        </div>
        </div>
        <div>
          {/* Login button */}
          {loggedIn ? (
            <button
              className="bg-white text-blue-500 py-2 px-4 rounded-lg btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className="bg-white text-blue-500 py-2 px-4 rounded-lg btn"
              onClick={handleLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-between w-full"> {/* Modified here */}
        <button
          className={`w-full px-4 py-4  ${
            activeTab === 'announcements' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </button>
        <button
          className={`w-full px-4 py-2 ${
            activeTab === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`w-full px-4 py-2  ${
            activeTab === 'blog' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('blog')}
        >
          Blog
        </button>
        <button
          className={`w-full px-4 py-2  ${
            activeTab === 'merch' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('merch')}
        >
          Merch
        </button>
        <button
          className={`w-full px-4 py-2  ${
            activeTab === 'userList' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('userList')}
        >
          userList
        </button>
      </div>
      

      {/* Main content */}
      <div className="p-4 flex justify-center">
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
        {/* Render user list */}
        {activeTab === 'userList' && (
          <div>
            <h2>Accounts Created</h2>
            <ul>
              {userList.map(user => (
                <li key={user.id}>
                  {user.firstName} - {user.email} {/* Assuming you have 'name' and 'email' fields in your user profile */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
