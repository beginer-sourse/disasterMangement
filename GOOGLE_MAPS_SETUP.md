# Google Maps Setup Instructions

## Getting Your Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for enhanced search)
   - Geocoding API (optional, for address lookup)
4. Go to "Credentials" and create an API key
5. Restrict your API key to your domain for security

## Setting Up the Environment Variable

1. Create a `.env` file in the root directory of your project
2. Add your Google Maps API key:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## API Key Security

- Never commit your actual API key to version control
- Use environment variables to store sensitive keys
- Restrict your API key in Google Cloud Console to specific domains
- Consider using different keys for development and production

## Required APIs

Make sure to enable these APIs in Google Cloud Console:
- **Maps JavaScript API** (required)
- **Places API** (optional, for enhanced search functionality)
- **Geocoding API** (optional, for address lookup)

## Testing

After setting up your API key, the map should load automatically when you visit the Live Map page. If you see a loading spinner that doesn't resolve, check:

1. Your API key is correct
2. The required APIs are enabled
3. Your API key restrictions allow your domain
4. Check the browser console for any error messages
