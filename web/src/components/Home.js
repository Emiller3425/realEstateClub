import React, { useState, useEffect } from 'react';
import seidman from '../images/seidman.jpg';
import eboard1 from '../images/Eboard1.jpeg';
import eboard2 from '../images/Eboard2.jpg';

// Array of images for the slideshow
const images = [seidman, eboard1, eboard2];

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

  useEffect(() => {
    // Fetch content from the server when the component mounts
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5001/home-content');
        const data = await response.json();
        setContent({
          welcomeMessage: data.welcomeMessage,
          nextMeetingTitle: data.nextMeeting.title,
          nextMeeting: data.nextMeeting.content,
          missionTitle: data.mission.title,
          mission: data.mission.content,
        });
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchData();

    // Set an interval to change the image in the slideshow every 4 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // Handle changes to the input fields in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent((prevContent) => ({ ...prevContent, [name]: value }));
  };

  // Handle saving the updated content to the server
  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5001/update-home-content', {
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
      fontFamily: 'Arial, sans-serif', 
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
        {images.map((image, index) => (
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
      
      <div style={{ margin: '40px 0', padding: '20px' }}>
        {/* Next Meeting section */}
        {editMode ? (
          <input
            type="text"
            name="nextMeetingTitle"
            value={content.nextMeetingTitle}
            onChange={handleChange}
            className="text-4xl font-bold w-full p-2 mb-4"
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
            className="w-full p-2"
            rows="4"
            style={{ border: '1px solid #ccc', borderRadius: '4px', width: '60%', margin: '0 auto', textAlign: 'left'}}
          />
        ) : (
          <p style={{ width: '60%', margin: '0 auto', textAlign: 'left' }}>{content.nextMeeting}</p>
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
          <p style={{ width: '60%', margin: '0 auto', textAlign: 'left' }}>{content.mission}</p>
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
