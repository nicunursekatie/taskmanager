import React from 'react';
import { isAuthenticated, initiateGoogleAuth, logOut } from '../services/googleCalendarService';

interface GoogleCalendarButtonProps {
  onAuthStatusChange?: (isAuthenticated: boolean) => void;
}

const GoogleCalendarButton: React.FC<GoogleCalendarButtonProps> = ({ onAuthStatusChange }) => {
  const [authenticated, setAuthenticated] = React.useState<boolean>(isAuthenticated());
  
  const handleAuthClick = () => {
    if (authenticated) {
      logOut();
      setAuthenticated(false);
      if (onAuthStatusChange) onAuthStatusChange(false);
    } else {
      initiateGoogleAuth();
    }
  };
  
  return (
    <button 
      className={`btn ${authenticated ? 'btn-outline' : 'btn-primary'}`}
      onClick={handleAuthClick}
    >
      {authenticated ? 'Disconnect Google Calendar' : 'Connect Google Calendar'}
    </button>
  );
};

export default GoogleCalendarButton;
