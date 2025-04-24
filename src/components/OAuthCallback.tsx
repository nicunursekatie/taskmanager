import { useEffect, useState } from 'react';
import { handleAuthCode } from '../services/googleCalendarService';

const OAuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the authorization code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code found in the URL');
          return;
        }
        
        // Process the authorization code
        await handleAuthCode(code);
        setStatus('success');
        
        // Redirect back to the calendar view after a short delay
        setTimeout(() => {
          window.location.href = '/taskmanager/';
        }, 3000);
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    };
    
    processAuth();
  }, []);

  return (
    <div className="oauth-callback">
      <div className="callback-container">
        {status === 'loading' && <p>Processing authentication...</p>}
        
        {status === 'success' && (
          <>
            <h2>Authentication Successful!</h2>
            <p>You have successfully connected to Google Calendar.</p>
            <p>Redirecting you back to the app...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <h2>Authentication Failed</h2>
            <p>There was an error connecting to Google Calendar:</p>
            <p className="error-message">{errorMessage}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/taskmanager/'}
            >
              Return to App
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
