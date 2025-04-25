export default function GoogleCalendarButton() {
  const handleClick = () => {
    if (window.google) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: '337205432675-oo17078ed2km8pjaoh4beulrpn39dfgq.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: (tokenResponse) => {
          console.log('✅ Access token:', tokenResponse.access_token);
          // Call fetchGoogleCalendarEvents(tokenResponse.access_token)
        },
      });

      tokenClient.requestAccessToken();
    }
  };

  return (
    <button onClick={handleClick} className="btn btn-primary">
      Connect Google Calendar
    </button>
  );
}