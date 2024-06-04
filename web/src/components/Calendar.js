import React, { useState, useEffect, useRef } from 'react';

const Calendar = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const handleLoad = () => {
      setIsLoaded(true);
    };

    if (iframe) {
      iframe.addEventListener('load', handleLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      {!isLoaded && (
        <div style={{ position: 'absolute' }}>Loading...</div>
      )}
      <iframe
        ref={iframeRef}
        src="https://calendar.google.com/calendar/embed?src=emiller3425%40gmail.com&ctz=America%2FDetroit"
        style={{
          width: '100vw',
          height: '100vh',
          filter: 'invert(0.9) saturate(0.5) hue-rotate(145deg)',
          display: isLoaded ? 'block' : 'none'
        }}
      ></iframe>
    </div>
  );
};

export default Calendar;
