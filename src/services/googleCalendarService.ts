export async function fetchGoogleCalendarEvents(accessToken: string) {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const data = await response.json();
  return data.items;
}

export type GoogleEvent = {
    id: string;
    summary: string;
    description?: string | null; // Allow null here
    location?: string | null;     // Also fix location
    start: Date;
    end: Date;
    colorId?: string | null;      // And colorId
  };

// This interface will help TypeScript understand the structure of our stored auth tokens
interface StoredTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

// Client ID and API key from the Google API Console
const CLIENT_ID = '337205432675-oo17078ed2km8pjaoh4beulrpn39dfgq.apps.googleusercontent.com';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Create an OAuth2 client
const createOAuthClient = () => {
  return new google.auth.OAuth2(
    CLIENT_ID,
    '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', // Client secret
    'https://nicunursekatie.github.io/taskmanager/oauth-callback' // Your configured redirect URI
  );
};

// Check if we're already authenticated
export const isAuthenticated = (): boolean => {
  const tokens = localStorage.getItem('googleCalendarTokens');
  if (!tokens) return false;
  
  try {
    const parsedTokens: StoredTokens = JSON.parse(tokens);
    return parsedTokens.expiry_date > Date.now();
  } catch (error) {
    console.error('Error parsing stored tokens:', error);
    return false;
  }
};
// Add this function to your googleCalendarService.ts file
export const initiateGoogleAuth = (): void => {
    window.location.href = getAuthUrl();
  };

// Get the authorization URL
export const getAuthUrl = (): string => {
  const oauth2Client = createOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
};

// Handle the authorization code returned from Google
export const handleAuthCode = async (code: string): Promise<void> => {
  const oauth2Client = createOAuthClient();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    localStorage.setItem('googleCalendarTokens', JSON.stringify(tokens));
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
};

// Set up the authenticated calendar client
const getCalendarClient = (): calendar_v3.Calendar => {
  const tokens = localStorage.getItem('googleCalendarTokens');
  if (!tokens) {
    throw new Error('Not authenticated with Google Calendar');
  }
  
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(JSON.parse(tokens));
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Fetch calendar events for a specific date range
export const fetchEvents = async (
  startDate: Date,
  endDate: Date
): Promise<GoogleEvent[]> => {
  try {
    const calendar = getCalendarClient();
    
    const response = await calendar.events.list({
      calendarId: 'primary', // 'primary' refers to the user's default calendar
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    if (!response.data.items) return [];
    
    // Map the API response to our simpler GoogleEvent type
    return response.data.items.map(event => ({
      id: event.id || '',
      summary: event.summary || 'Untitled Event',
      description: event.description,
      location: event.location,
      start: event.start?.dateTime 
        ? new Date(event.start.dateTime) 
        : event.start?.date 
          ? new Date(event.start.date) 
          : new Date(),
      end: event.end?.dateTime 
        ? new Date(event.end.dateTime) 
        : event.end?.date 
          ? new Date(event.end.date) 
          : new Date(),
      colorId: event.colorId,
    }));
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

// Get available calendars
export const getCalendars = async (): Promise<calendar_v3.Schema$CalendarListEntry[]> => {
  try {
    const calendar = getCalendarClient();
    const response = await calendar.calendarList.list();
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendars:', error);
    throw error;
  }
};

// Log out/revoke access
export const logOut = (): void => {
  localStorage.removeItem('googleCalendarTokens');
};