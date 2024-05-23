import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import './output.css';
import realEstateLogo from './images/realEstateLogo.png'; // Importing the logo image
import { getUsers } from './firebase'; // Importing the firebase module
import Announcements from './components/Announcements';
import Calendar from './components/Calendar';
import Blog from './components/Blog';
import Merchandise from './components/Merchandise';
import UserList from './components/UserList';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userList, setUserList] = useState([]); // Define userList state here

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
    <Router>
      <div>
        {/* Banner with Logo and Login button */}
        <div className="header-container bg-blue-400 text-white py-4 relative flex justify-between items-center">
          <div className="flex items-center">
            <img src={realEstateLogo} alt="Real Estate Logo" className="h-20 mr-2" />
            <div>
              {/* Welcome Message */}
              <h1 className="text-3xl absolute p-4 text-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"> Welcome to Real Estate Club GVSU</h1>
            </div>
          </div>
          <div className="mr-4">
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
        <Tabs />

        {/* Main content */}
        <div className="p-4 flex justify-center">
          <Routes>
            <Route path="/" element={<Announcements />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/merch" element={<Merchandise />} />
            <Route path="/user-list" element={<UserList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function Tabs() {
  const location = useLocation();

  const getTabClass = (path) => {
    return location.pathname === path ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="flex justify-between w-full">
      <Link to="/" className={`w-full px-4 py-4 text-center ${getTabClass('/')}`}>Announcements</Link>
      <Link to="/calendar" className={`w-full px-4 py-4 text-center ${getTabClass('/calendar')}`}>Calendar</Link>
      <Link to="/blog" className={`w-full px-4 py-4 text-center ${getTabClass('/blog')}`}>Blog</Link>
      <Link to="/merch" className={`w-full px-4 py-4 text-center ${getTabClass('/merch')}`}>Merch</Link>
      <Link to="/user-list" className={`w-full px-4 py-4 text-center ${getTabClass('/user-list')}`}>User List</Link>
    </div>
  );
}

export default App;