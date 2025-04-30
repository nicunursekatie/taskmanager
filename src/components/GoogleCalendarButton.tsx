import { useState } from 'react';
import { fetchGoogleCalendarEvents } from '../services/googleCalendarService';

const CLIENT_ID = '337205432675-oo17078ed2km8pjaoh4beulrpn39dfgq.apps.googleusercontent.com';

export default function GoogleCalendarButton() {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (!window.google?.accounts?.oauth2) {
      setError('Google API not loaded');
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      callback: async (tokenResponse: { access_token?: string; error?: string }) => {
        if (tokenResponse.error) {
          setError(`Token error: ${tokenResponse.error}`);
          return;
        }

        try {
          console.log('✅ Access token:', tokenResponse.access_token);
          const fetchedEvents = await fetchGoogleCalendarEvents(tokenResponse.access_token);
          console.log('✅ Events:', fetchedEvents);
          setEvents(fetchedEvents);
        } catch (err) {
          console.error('Fetch error:', err);
          setError('Failed to fetch events');
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  return (
    <div>
      <button onClick={handleClick} className="btn btn-primary">
        Connect Google Calendar
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {events.length > 0 && (
        <div>
          <h3>Your Upcoming Events:</h3>
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                {event.summary} — {event.start?.dateTime || event.start?.date}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}