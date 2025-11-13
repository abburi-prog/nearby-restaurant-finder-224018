# Nearby Restaurant Finder

Two-container app:
- Frontend: React (port 3000)
- Backend: FastAPI (port 3001)

Features:
- Geolocation-based search
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
- GOOGLE_MAPS_API_KEY=server-side key (required)
- REACT_APP_FRONTEND_URL=http://localhost:3000

## Run

Backend:
- cd nearby-restaurant-finder-224019/backend
- pip install -r requirements.txt
- uvicorn main:app --host 0.0.0.0 --port 3001

Frontend:
- cd nearby-restaurant-finder-224018/frontend_react
- npm install
- npm start