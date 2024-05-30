const Calendar = () => {
    return (
      <div>
        <h2>My Google Calendar</h2>
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FDetroit&bgcolor=%23ffffff&src=ZW1pbGxlcjM0MjVAZ21haWwuY29t&src=ZTVmNDkxMTQ0YzBkYjg5NDAxODgwODM1Y2FjMGIxZjM4OGM0NjNlNTEzNDhhZjljYTYzMTJjYzRhYTA4ZGJiOEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=YWRkcmVzc2Jvb2sjY29udGFjdHNAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23039BE5&color=%23EF6C00&color=%2333B679&color=%230B8043"
          style={{ border: 4, width: '800px', height: '600px' }}
          frameBorder="0"
        ></iframe>
      </div>
    );
  };
  
  export default Calendar;