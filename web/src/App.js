import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import './output.css'; // Make sure this path is correct if you have a separate output CSS
import realEstateLogo from './images/realEstateLogo.png'; // Importing the logo image
import linkedIn from './images/linkedIn.png'; // Importing the LinkedIn logo image
import insta from './images/insta.webp'; // Importing the Instagram logo image
import tiktok from './images/tiktok.png'; // Importing the TikTok logo image
import Home from './components/Home';
import Announcements from './components/Announcements';
import Calendar from './components/Calendar';
import About from './components/About'; // Assuming this corresponds to 'Leadership' path
import Login from './components/Login';
import Resources from './components/Resources';
import Syndication from './components/Syndication';

function App() {
  const [adminAccess, setAdminAccess] = useState(false);

  const handleLogout = () => {
    setAdminAccess(false);
    // Consider redirecting to home or login page instead of full reload if preferred
    window.location.reload(); // Reloads the page (simple approach)
  };

  return (
    <Router basename="/">
      {/* Main container using Flexbox for layout and ensuring minimum screen height */}
      <div style={{ fontFamily: 'Gill Sans, sans-serif' }} className="flex flex-col min-h-screen">

        {/* Header Section: Logo and Login/Logout Button */}
        <div className="header-container bg-dark-gray text-white py-4 flex justify-between items-center px-4 md:px-6">
          <div className="flex items-center">
            {/* Logo linked to the Home page */}
            <Link to="/">
              <img src={realEstateLogo} alt="Real Estate Logo" className="h-14 md:h-16 mr-2" />
            </Link>
          </div>
          <div className="mr-4">
            {/* Conditional rendering of Login or Logout button based on adminAccess state */}
            {adminAccess ? (
              <button
                className="bg-white text-navy py-2 px-4 rounded-lg btn hover:bg-gray-200 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link
                className="bg-white text-navy py-2 px-4 rounded-lg btn hover:bg-gray-200 transition-colors"
                to="/login"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Tabs Section */}
        <Tabs />

        {/* Main Content Area: Dynamically renders components based on the route */}
        {/* Removed vertical padding (py-3 md:py-4) to eliminate space below tabs */}
        <div className="flex-grow flex justify-center w-full px-4"> {/* CHANGED: Removed py-3 md:py-4 */}
          <Routes>
            {/* Define routes for each page/component, passing adminAccess where needed */}
            <Route path="/" element={<Home adminAccess={adminAccess} />} />
            <Route path="/announcements" element={<Announcements adminAccess={adminAccess} />} />
            <Route path="/syndication" element={<Syndication adminAccess={adminAccess} />} />
            <Route path="/calendar" element={<Calendar adminAccess={adminAccess} />} />
            <Route path="/leadership" element={<About adminAccess={adminAccess} />} />
            <Route path="/login" element={<Login setAdminAccess={setAdminAccess} />} />
            <Route path="/resources" element={<Resources adminAccess={adminAccess} />} />
          </Routes>
        </div>

        {/* Footer Section: Copyright and Social Media Links */}
        <footer className="w-full bg-dark-gray text-white py-4 text-center mt-auto">
          {/* Copyright information with dynamic year */}
          <h2>&copy;{new Date().getFullYear()} by Real Estate Club GVSU</h2>
          {/* Social media icons with links */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <a href="https://www.instagram.com/gvsurealestate/" target="_blank" rel="noopener noreferrer" className="transition-transform transform hover:scale-110">
              <img src={insta} alt="Instagram Logo" className="h-8 md:h-10" />
            </a>
            <a href="https://www.linkedin.com/company/real-estate-club-at-gvsu" target="_blank" rel="noopener noreferrer" className="transition-transform transform hover:scale-110">
              <img src={linkedIn} alt="LinkedIn Logo" className="h-8 md:h-10" />
            </a>
            <a href="https://www.tiktok.com/@gvsurealestateclub?lang=en" target="_blank" rel="noopener noreferrer" className="transition-transform transform hover:scale-110">
              <img src={tiktok} alt="TikTok Logo" className="h-8 md:h-10" />
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

//
// Tabs Component: Renders the navigation links
function Tabs() {
  // Get the current location object to determine the active path
  const location = useLocation();

  // Define base CSS classes applied to all tabs for consistency
  // RE-ADDED flex-1: Allows tabs in each row to grow and fill the available width for that row.
  // Increased border thickness to 4px (border-b-4)
  const baseTabClasses = 'flex-1 px-4 py-2 md:py-4 text-center bg-dark-gray text-white border-b-4 transition-colors duration-200 ease-in-out whitespace-nowrap'; // Kept border-b-4

  // Function to determine the border color class based on whether the tab is active
  const getActiveBorderClass = (path) => {
    // Check if the current URL pathname matches the tab's path
    return location.pathname === path
      ? 'border-navy' // Active tab gets a navy underline
      : 'border-transparent hover:border-gray-500'; // Inactive tabs get a transparent underline (for spacing) and a gray underline on hover
  };

  return (
    // Container for the tabs:
    // Uses flex-wrap to allow wrapping onto multiple lines.
    <div className="flex flex-wrap w-full">
       {/* Navigation links for each section */}
       {/* Each Link combines base classes (including flex-1) with the dynamic active border class */}
      <Link to="/" className={`${baseTabClasses} ${getActiveBorderClass('/')}`}>Home</Link>
      <Link to="/announcements" className={`${baseTabClasses} ${getActiveBorderClass('/announcements')}`}>Announcements</Link>
      <Link to="/syndication" className={`${baseTabClasses} ${getActiveBorderClass('/syndication')}`}>Syndication Project</Link>
      <Link to="/calendar" className={`${baseTabClasses} ${getActiveBorderClass('/calendar')}`}>Calendar</Link>
      <Link to="/leadership" className={`${baseTabClasses} ${getActiveBorderClass('/leadership')}`}>Leadership</Link>
      <Link to="/resources" className={`${baseTabClasses} ${getActiveBorderClass('/resources')}`}>Resources</Link>
    </div>
  );
}

// Export the main App component
export default App;