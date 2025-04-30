// src/components/CalendarView.tsx
import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { fetchGoogleCalendarEvents } from '../services/googleCalendarService';
import './CalendarView.css';
import { Task, Category, Project } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (
    id: string,
    title: string,
    dueDate: string | null,
    categoryIds?: string[],
    projectId?: string | null
  ) => void;
  addTask: (
    title: string,
    dueDate: string | null,
    parentId?: string,
    categoryIds?: string[],
    projectId?: string | null
  ) => void;
  categories: Category[];
  projects: Project[];
}

const CalendarView = ({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
  addTask,
  categories,
  projects
}: CalendarViewProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = async (credentialResponse: any) => {
    console.log('Google login successful!', credentialResponse);

    if (credentialResponse && credentialResponse.access_token) {
      setAccessToken(credentialResponse.access_token);
    } else {
      console.error('No access token received!');
    }
  };

  useEffect(() => {
    async function getEvents() {
      if (!accessToken) return;

      try {
        setLoading(true);
        const fetchedEvents = await fetchGoogleCalendarEvents(accessToken);
        setEvents(fetchedEvents);
        console.log('Fetched Events:', fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    }

    getEvents();
  }, [accessToken]);

  // Format the event date
  const formatEventTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="calendar-view">
      {!accessToken ? (
        <div className="calendar-login-container">
          <h2>Connect to Google Calendar</h2>
          <p>
            Connect your Google Calendar to see your upcoming events alongside your tasks.
          </p>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => {
              console.log('Google Login Failed');
            }}
          />
        </div>
      ) : (
        <div className="calendar-events">
          <h2>Calendar Events</h2>
          
          {loading ? (
            <div className="loading-spinner">Loading calendar events...</div>
          ) : events.length > 0 ? (
            <ul className="calendar-event-list">
              {events.map(event => (
                <li key={event.id} className="calendar-event-item">
                  <div className="calendar-event-time">
                    {event.start?.dateTime 
                      ? formatEventTime(event.start.dateTime)
                      : 'All day'}
                  </div>
                  <div className="calendar-event-summary">{event.summary}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="calendar-empty-state">
              <p>No upcoming events found in your calendar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;