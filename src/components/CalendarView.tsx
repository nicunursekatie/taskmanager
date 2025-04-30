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
        const fetchedEvents = await fetchGoogleCalendarEvents(accessToken);
        setEvents(fetchedEvents);
        console.log('Fetched Events:', fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    }

    getEvents();
  }, [accessToken]);

  return (
    <div className="calendar-view">
      {!accessToken && (
        <div>
          <h2>Connect to Google Calendar</h2>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => {
              console.log('Google Login Failed');
            }}
          />
        </div>
      )}

      {accessToken && (
        <div>
          <h2>Calendar Events</h2>
          {events.length > 0 ? (
            <ul>
              {events.map(event => (
                <li key={event.id}>
                  {event.summary} ({event.start?.dateTime || event.start?.date})
                </li>
              ))}
            </ul>
          ) : (
            <p>No events found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;