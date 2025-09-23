# Google OAuth Setup Instructions

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_CONNECTION_STRING=your_mongodb_connection_string

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Configuration
SESSION_SECRET=your_session_secret_key

# OpenAI Configuration (if using)
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3000
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set the authorized redirect URIs to:
   - `http://localhost:3000/api/auth/google/callback`
   - Add your production domain when deploying
6. Copy the Client ID and Client Secret to your `.env` file

## Testing the Integration

1. Start the backend server: `npm run dev`
2. Start the frontend server: `cd frontend && npm run dev`
3. Navigate to the login page
4. Click "Continue with Google" button
5. Complete the Google OAuth flow

## Features Added

- Google OAuth authentication
- User profile picture support
- Seamless integration with existing login system
- Responsive Google login button
- Error handling for OAuth failures

