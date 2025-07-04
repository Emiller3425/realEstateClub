import React, { useState } from 'react';
import { BeatLoader } from 'react-spinners'; // Import BeatLoader from react-spinners

const Calendar = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      {!isLoaded && (
        <div style={{ position: 'absolute', zIndex: 10 }}>
          <BeatLoader color="#008cf0" loading={!isLoaded} size={15} /> {/* Show loader */}
        </div>
      )}
      <iframe
        title="Real Estate Club Calendar"
        src="https://calendar.google.com/calendar/embed?src=gvsurealestateclub%40gmail.com&ctz=America%2FDetroit"
        style={{
          width: '100vw',
          height: '100vh',
          filter: 'invert(0.9) saturate(0.5) hue-rotate(145deg)',
          display: isLoaded ? 'block' : 'none'
        }}
        onLoad={() => setIsLoaded(true)}
      ></iframe>
    </div>
  );
};

export default Calendar;
