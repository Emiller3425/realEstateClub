const Calendar = () => {
    return (
      <div>
        <h2>My Google Calendar</h2>
        <iframe
          src="https://calendar.google.com/calendar/embed?src=your_calendar_id%40gmail.com&ctz=America/New_York"
          style={{ border: 0, width: '800px', height: '600px' }}
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </div>
    );
  };
  
  export default Calendar;