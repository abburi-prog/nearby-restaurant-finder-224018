# Nearby Restaurant Finder - Frontend (React)

Modern React UI for searching and displaying nearby restaurants on an interactive map.

## Env Vars

Provide through `.env` (do not commit secrets):

- REACT_APP_API_BASE or REACT_APP_BACKEND_URL: Backend base URL (e.g., http://localhost:3001)
- REACT_APP_FRONTEND_URL: Frontend origin for backend CORS (e.g., http://localhost:3000)
- REACT_APP_GOOGLE_MAPS_API_KEY (optional): Enables interactive Google Map. If omitted, a static map fallback is shown.

## Run

npm install
npm start

The app requests geolocation on first load. Use the search bar to filter by keyword and adjust radius.

## Notes

- No API keys are hardcoded; all Google Places requests go through the backend.
- Styles follow the "Ocean Professional" theme with blue primary and amber accents.
