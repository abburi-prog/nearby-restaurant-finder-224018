import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

/**
 * Ocean Professional theme tokens
 */
const theme = {
  colors: {
    primary: '#2563EB',
    secondary: '#F59E0B',
    error: '#EF4444',
    bg: '#f9fafb',
    surface: '#ffffff',
    text: '#111827'
  },
  shadow: '0 8px 24px rgba(0,0,0,0.08)',
  radius: '12px'
};

const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Feature flag: Force India (Delhi) defaults regardless of geolocation.
// Defaults to true unless explicitly set to 'false'.
const FORCE_INDIA_DEFAULTS = String(process.env.REACT_APP_FORCE_INDIA_DEFAULTS || 'true').toLowerCase() !== 'false';

// Canonical Delhi coordinates and locale bias for India.
const INDIA_DEFAULT_COORDS = { lat: 28.6139, lng: 77.2090 };
const INDIA_REGION = 'IN';
const INDIA_LANGUAGE = 'en-IN';

/**
 * Helpers
 */
function metersToKm(m) {
  if (m == null) return '';
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some(v => typeof v !== 'number')) return null;
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Load Google Maps JS API optionally if REACT_APP_GOOGLE_MAPS_API_KEY is provided.
 * If not available, we will fallback to a simple non-interactive embed or placeholder.
 */
function useGoogleMaps() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setLoaded(false);
      return;
    }
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setLoaded(false);
    document.body.appendChild(script);
    return () => {
      // best effort cleanup
    };
  }, []);
  return loaded;
}

/**
 * Header component
 */
// PUBLIC_INTERFACE
function Header() {
  /** Header with app title and subtle gradient bar */
  return (
    <header style={{
      background: theme.colors.surface,
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky', top: 0, zIndex: 10
    }}>
      <div style={{maxWidth: 1200, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 36, height: 36, borderRadius: 8, background: theme.colors.primary, boxShadow: theme.shadow}} />
          <h1 style={{margin: 0, fontSize: 20, color: theme.colors.text}}>Nearby Restaurant Finder — India Defaults</h1>
        </div>
      </div>
      <div style={{height: 4, background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`}} />
    </header>
  );
}

/**
 * SearchBar component
 */
// PUBLIC_INTERFACE
function SearchBar({ keyword, setKeyword, onSearch, radius, setRadius }) {
  return (
    <div style={{
      display: 'flex', gap: 8, padding: 12,
      background: theme.colors.surface, boxShadow: theme.shadow, borderRadius: theme.radius, border: '1px solid #e5e7eb'
    }}>
      <input
        aria-label="Search keyword"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="Search cuisine or name (e.g., sushi, pizza)"
        style={{flex: 1, border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px'}}
      />
      <input
        aria-label="Radius meters"
        type="number"
        min={100}
        max={50000}
        step={100}
        value={radius}
        onChange={e => setRadius(parseInt(e.target.value || '0', 10))}
        style={{width: 120, border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px'}}
      />
      <button onClick={onSearch} style={{
        background: theme.colors.primary, color: 'white', border: 'none',
        borderRadius: 10, padding: '10px 16px', cursor: 'pointer'
      }}>Search</button>
    </div>
  );
}

/**
 * RestaurantList component
 */
// PUBLIC_INTERFACE
function RestaurantList({ items, onSelect, userLocation }) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      {items.length === 0 ? (
        <div style={{padding: 16, color: '#6b7280'}}>No restaurants found. Try a different keyword or increase radius.</div>
      ) : items.map(r => {
        const dist = haversineDistanceMeters(userLocation?.lat, userLocation?.lng, r.lat, r.lng);
        return (
          <button key={r.place_id} onClick={() => onSelect(r)} style={{
            textAlign: 'left', padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', background: 'white',
            cursor: 'pointer', transition: 'box-shadow .2s', boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <div style={{fontWeight: 600, color: theme.colors.text}}>{r.name}</div>
              <div style={{color: '#6b7280'}}>{r.rating ? `★ ${r.rating}` : 'No rating'}</div>
            </div>
            <div style={{color: '#6b7280', fontSize: 13}}>{r.vicinity || 'Address unavailable'}</div>
            <div style={{marginTop: 6, color: theme.colors.secondary, fontSize: 13}}>{dist ? metersToKm(dist) : ''}</div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * RestaurantDetail component
 */
// PUBLIC_INTERFACE
function RestaurantDetail({ item, onClose }) {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const url = `${API_BASE}/api/restaurants/${encodeURIComponent(item.place_id)}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Failed ${r.status}`);
        const data = await r.json();
        if (mounted) setDetail(data);
      } catch (e) {
        if (mounted) setError('Failed to load details');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (item?.place_id) load();
    return () => { mounted = false; };
  }, [item]);

  return (
    <div style={{
      position: 'fixed', right: 24, bottom: 24, width: 360, maxWidth: '90vw', background: theme.colors.surface,
      border: '1px solid #e5e7eb', borderRadius: 16, boxShadow: theme.shadow, padding: 16, zIndex: 50
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <div style={{fontWeight: 700}}>{item?.name}</div>
        <button onClick={onClose} aria-label="Close details" style={{
          background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer'
        }}>×</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{color: theme.colors.error}}>{error}</div>}
      {!loading && !error && detail && (
        <div style={{display: 'grid', gap: 8}}>
          <div style={{color: '#374151'}}>{detail.formatted_address}</div>
          {detail.international_phone_number && <div>📞 {detail.international_phone_number}</div>}
          {typeof detail.rating === 'number' && <div>★ {detail.rating} ({detail.user_ratings_total || 0})</div>}
          {detail.website && <a href={detail.website} target="_blank" rel="noreferrer">Website</a>}
          {detail.url && <a href={detail.url} target="_blank" rel="noreferrer">Open in Google Maps</a>}
        </div>
      )}
    </div>
  );
}

/**
 * MapView component with optional Google Maps (interactive if key present) or placeholder map
 */
// PUBLIC_INTERFACE
function MapView({ userLocation, restaurants, selected, onSelect }) {
  const googleLoaded = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!googleLoaded || !mapRef.current || !userLocation) return;

    // Initialize map
    const center = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        disableDefaultUI: false,
      });
    } else {
      mapInstanceRef.current.setCenter(center);
    }

    // Clear markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Add user marker
    markersRef.current.push(new window.google.maps.Marker({
      map: mapInstanceRef.current,
      position: center,
      title: 'You',
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#2563EB', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }
    }));

    // Add restaurant markers
    restaurants.forEach(r => {
      if (typeof r.lat !== 'number' || typeof r.lng !== 'number') return;
      const marker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position: { lat: r.lat, lng: r.lng },
        title: r.name
      });
      marker.addListener('click', () => onSelect(r));
      markersRef.current.push(marker);
    });

  }, [googleLoaded, userLocation, restaurants, onSelect]);

  if (!userLocation) {
    return <div style={{height: '100%', display: 'grid', placeItems: 'center'}}>Centering on Delhi, India…</div>;
  }

  if (googleLoaded) {
    return <div ref={mapRef} style={{width: '100%', height: '100%', borderRadius: 12, border: '1px solid #e5e7eb'}} />;
  }

  // Fallback: simple static map via openstreetmap tile in an iframe (no keys, acceptable placeholder)
  const lat = userLocation.lat.toFixed(5);
  const lng = userLocation.lng.toFixed(5);
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng}%2C${lat}%2C${lng}%2C${lat}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div style={{width: '100%', height: '100%'}}>
      <iframe title="Map" src={osmSrc} style={{border: 0, width: '100%', height: '100%', borderRadius: 12}} />
      <div style={{position: 'absolute', marginTop: 8, marginLeft: 8, background: 'rgba(255,255,255,0.9)', padding: '6px 8px', borderRadius: 8, border: '1px solid #e5e7eb'}}>
        Interactive map available when REACT_APP_GOOGLE_MAPS_API_KEY is set.
      </div>
    </div>
  );
}

/**
 * Root App
 */
// PUBLIC_INTERFACE
function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [radius, setRadius] = useState(1500);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);

  // Location initialization on mount
  useEffect(() => {
    // If forcing India defaults, skip geolocation entirely and set Delhi.
    if (FORCE_INDIA_DEFAULTS) {
      setUserLocation(INDIA_DEFAULT_COORDS);
      setError('Using India defaults (Delhi).');
      return;
    }

    // Otherwise, attempt browser geolocation with fallback to Delhi.
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using India defaults (Delhi).');
      setUserLocation(INDIA_DEFAULT_COORDS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setError('Location permission denied. Using India defaults (Delhi).');
        setUserLocation(INDIA_DEFAULT_COORDS);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const searchNearby = async () => {
    if (!userLocation) return;
    setLoading(true); setError(null); setSelected(null);
    try {
      const url = `${API_BASE}/api/restaurants/nearby`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: Math.max(1, Math.min(50000, Number.isFinite(radius) ? radius : 1500)),
          keyword: keyword?.trim() || undefined,
          region: INDIA_REGION,
          language: INDIA_LANGUAGE
        })
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Backend error: ${r.status} ${txt}`);
      }
      const data = await r.json();
      setRestaurants(data.results || []);
    } catch (e) {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto search when location becomes available
  useEffect(() => {
    if (userLocation) searchNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  const layoutStyles = useMemo(() => ({
    page: { background: theme.colors.bg, minHeight: '100vh' },
    container: { maxWidth: 1200, margin: '0 auto', padding: 16 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 },
    gridMobile: { display: 'grid', gridTemplateColumns: '1fr', gap: 16 },
    card: { background: theme.colors.surface, borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: theme.shadow }
  }), []);

  const gridStyle = window.innerWidth < 1024 ? layoutStyles.gridMobile : layoutStyles.grid;

  return (
    <div style={layoutStyles.page}>
      <Header />
      <main style={layoutStyles.container}>
        <div style={{marginBottom: 12}}>
          <SearchBar keyword={keyword} setKeyword={setKeyword} onSearch={searchNearby}
                     radius={radius} setRadius={setRadius} />
        </div>
        {error && <div style={{marginBottom: 12, color: theme.colors.error}}>{error}</div>}
        <div style={gridStyle}>
          <div style={{...layoutStyles.card, height: '70vh', overflow: 'hidden'}}>
            <MapView userLocation={userLocation} restaurants={restaurants} selected={selected} onSelect={setSelected} />
          </div>
          <div style={{...layoutStyles.card, padding: 12, height: '70vh', overflow: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px 10px'}}>
              <div style={{fontWeight: 700, color: theme.colors.text}}>Results</div>
              {loading ? <div style={{color: '#6b7280'}}>Loading…</div> : <div style={{color: '#6b7280'}}>{restaurants.length} found (centered on Delhi, IN)</div>}
            </div>
            <RestaurantList items={restaurants} onSelect={setSelected} userLocation={userLocation} />
          </div>
        </div>
      </main>
      {selected && <RestaurantDetail item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default App;
