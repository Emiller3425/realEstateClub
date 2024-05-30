import React, { useState, useEffect } from 'react';

const Calendar = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const iframe = document.querySelector('iframe');
    const handleLoad = () => {
      setIsLoaded(true);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <div>
      {!isLoaded && <div>Loading...</div>}
      <iframe
        src="https://calendar.google.com/calendar/embed?src=emiller3425%40gmail.com&ctz=America%2FDetroit"
        style={{ border: 4, width: '800px', height: '600px' }}
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default Calendar;