# Nearby Restaurant Finder

Two-container app:
- Frontend: React (port 3000)
- Backend: FastAPI (port 3001)

Features:
- India-default search (Delhi) with region bias "IN" and language "en-IN" (geolocation ignored by default)
- Geolocation-based search can be re-enabled by setting REACT_APP_FORCE_INDIA_DEFAULTS=false
- Google Places proxy on backend (Nearby Search, Place Details)
- Map with markers (Google Maps interactive if key provided; otherwise static fallback)
- List and details panels
- Ocean Professional styling

## Env

Frontend (.env):
- REACT_APP_API_BASE or REACT_APP_BACKEND_URL=http://localhost:3001
- REACT_APP_FRONTEND_URL=http://localhost:3000
- REACT_APP_GOOGLE_MAPS_API_KEY=optional for interactive map

Backend (.env):
- (none required for sample; no external API keys needed)
- REACT_APP_FRONTEND_URL=http://localhost:3000

## Run

Backend:
- cd nearby-restaurant-finder-224019/backend
- pip install fastapi uvicorn pydantic
- uvicorn main:app --host 0.0.0.0 --port 3001

Frontend:
- cd nearby-restaurant-finder-224018/frontend_react
- npm install
- npm start