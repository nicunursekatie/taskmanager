// src/components/GoogleCalendarButton.tsx

import { GoogleLogin } from '@react-oauth/google';
import { fetchGoogleCalendarEvents } from '../services/googleCalendarService';

export default function GoogleCalendarButton() {
  const handleSuccess = async (credentialResponse: any) => {
    console.log('Login Success!', credentialResponse);

    if (credentialResponse && credentialResponse.access_token) {
      const events = await fetchGoogleCalendarEvents(credentialResponse.access_token);
      console.log('Fetched Events:', events);
      // You can now do something with events, like setState to show them
    } else {
      console.error('No access token received!');
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </div>
  );
}