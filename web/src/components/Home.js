import React, { useState, useEffect } from 'react';
import seidman from '../images/seidman.jpg';
import event1 from '../images/event1.jpg';
import event3 from '../images/event3.jpg';
import event4 from '../images/event4.jpg';
import event5 from '../images/event5.jpg';
import event6 from '../images/event6.jpg';
import event7 from '../images/event7.jpeg';
import event8 from '../images/event8.jpeg';
import devTour from '../images/devTour.jpg';
import victory from '../images/victory.jpeg';
import devTour2 from '../images/devTour2.jpg';
import devTourFunny from '../images/devTourFunny.jpg';
import gr from '../images/GR.jpg.webp';

// Function to shuffle the array
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const Home = ({ adminAccess }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // State to track the current image index in the slideshow
  const [editMode, setEditMode] = useState(false); // State to track whether edit mode is enabled
  const [content, setContent] = useState({
    welcomeMessage: '',
    nextMeetingTitle: '',
    nextMeeting: '',
    missionTitle: '',
    mission: '',
  });
  const [shuffledImages, setShuffledImages] = useState([]);

  const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001/api' 
  : (window.location.hostname === 'gvsurealestateclub.com' 
      ? 'https://gvsurealestateclub.com/api' 
      : 'https://real-estate-club.vercel.app/api');

  useEffect(() => {
    // Fetch content from the server when the component mounts
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/home-content`);
        const data = await response.json();
        setContent({
          welcomeMessage: data.welcomeMessage,
          nextMeetingTitle: data.nextMeeting.title,
          nextMeeting: data.nextMeeting.content,
          missionTitle: data.mission.title,
          mission: data.mission.content,
        });
      } catch (error) {
        // Determine the type of error and log specific messages
        if (error.name === 'TypeError') {
          console.error('Network error or the request was aborted:', error);
        } else if (error.message.startsWith('HTTP error! status:')) {
          console.error('Server responded with a status:', error.message);
        } else if (error.message === 'Invalid data structure') {
          console.error('Received data does not match the expected format:', error);
        } else {
          console.error('Error fetching content:', error);
        }
      }
    };

    fetchData();

    // Shuffle the images array and set it to state
    const images = [seidman, victory, devTour, event1, event3, event4, event5, event6, event7, event8, devTour2, devTourFunny, gr];
    setShuffledImages(shuffle([...images]));

    // Set an interval to change the image in the slideshow every 4 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [API_URL]);

  // Handle changes to the input fields in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent((prevContent) => ({ ...prevContent, [name]: value }));
  };

  // Handle saving the updated content to the server
  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/update-home-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          welcomeMessage: content.welcomeMessage,
          nextMeeting: { title: content.nextMeetingTitle, content: content.nextMeeting },
          mission: { title: content.missionTitle, content: content.mission },
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setEditMode(false); // Exit edit mode after saving
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Gill Sans, sans-serif', 
      textAlign: 'center', 
      margin: '0 auto' 
    }}>
      <div 
        style={{ 
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {/* Slideshow images */}
        {shuffledImages.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt={`Slide ${index + 1}`} 
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: '-1',
              opacity: currentImageIndex === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out'
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 43, 128, 0.15)', // navy color with 15% opacity
            zIndex: '0'
          }}
        />
        {/* Welcome message */}
        {editMode ? (
          <input
            type="text"
            name="welcomeMessage"
            value={content.welcomeMessage}
            onChange={handleChange}
            className="text-4xl font-bold"
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', zIndex: '1', textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', border: 'none', outline: 'none' }}
          />
        ) : (
          <h1 className="text-4xl font-bold" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', zIndex: '1' }}>
            {content.welcomeMessage}
          </h1>
        )}
      </div>
      
      <div className="bg-dark-gray text-white py-20">
        {/* Next Meeting section */}
        {editMode ? (
          <input
            type="text"
            name="nextMeetingTitle"
            value={content.nextMeetingTitle}
            onChange={handleChange}
            className="text-4xl font-bold text-black w-full p-2 mb-4"
            style={{ border: '1px solid #ccc', borderRadius: '4px'}}
          />
        ) : (
          <h2 className="text-4xl font-bold" style={{ padding: '20px' }}>{content.nextMeetingTitle}</h2>
        )}
        {editMode ? (
          <textarea
            name="nextMeeting"
            value={content.nextMeeting}
            onChange={handleChange}
            className="w-full p-2 text-black text-2xl"
            rows="4"
            style={{ border: '1px solid #ccc', borderRadius: '4px', width: '60%', margin: '0 auto', textAlign: 'left'}}
          />
        ) : (
          <p className="text-2xl" style={{ width: '60%', margin: '0 auto', textAlign: 'left' }}>{content.nextMeeting}</p>
        )}
      </div>
      
      <section style={{ margin: '40px 0', padding: '20px' }}>
        {/* Mission section */}
        {editMode ? (
          <input
            type="text"
            name="missionTitle"
            value={content.missionTitle}
            onChange={handleChange}
            className="text-4xl font-bold w-full p-2 mb-4"
            style={{ border: '1px solid #ccc', borderRadius: '4px' }}
          />
        ) : (
          <h2 className='text-4xl font-bold text-center' style={{ padding: '20px' }}>{content.missionTitle}</h2>
        )}
        {editMode ? (
          <textarea
            name="mission"
            value={content.mission}
            onChange={handleChange}
            className="w-full p-2"
            rows="4"
            style={{ border: '1px solid #ccc', borderRadius: '4px', width: '60%', margin: '0 auto', textAlign: 'left'}}
          />
        ) : (
          <p className="text-2xl" style={{ width: '60%', margin: '0 auto', textAlign: 'left' }}>{content.mission}</p>
        )}
      </section>
      
      {/* Edit/Save button for admin access */}
      {adminAccess && (
        <button
          onClick={editMode ? handleSave : () => setEditMode(true)}
          className="bg-navy text-white py-2 px-4 rounded-lg mb-4"
        >
          {editMode ? 'Save' : 'Edit'}
        </button>
      )}
      
      {/* Contact Us button */}
      <a 
        href="mailto:reclub@mail.gvsu.edu"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#004B80',
          color: '#fff',
          textDecoration: 'none',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s',
          margin: '40px auto',
          whiteSpace: 'nowrap'
        }}
        className="hover:transform hover:scale-110 text-white font-bold py-2 px-4 mb-4"
      >
        Contact Us
      </a>
    </div>
  );
};

export default Home;
