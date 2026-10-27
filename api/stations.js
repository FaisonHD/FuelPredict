const cache = new Map();
const TTL = 65_000;
let lastRequest = 0;

async function geocode(location) {
  if (/^\\d{5}$/.test(location)) {
    const response = await fetch('https://api.zippopotam.us/de/' + location);
    if (response.ok) {
      const data = await response.json();
      const place = data.places?.[0];
      if (place) return { lat: Number(place.latitude), lng: Number(place.longitude) };
    }
  }
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', location);
  url.searchParams.set('count', '10');
  url.searchParams.set('language', 'de');
  url.searchParams.set('format', 'json');
  const response = await fetch(url);
  if (!response.ok) throw new Error('Ortssuche derzeit nicht erreichbar.');
  const data = await response.json();
  const place = data.results?.find(item => item.country_code === 'DE');
  if (!place) throw new Error('Ort nicht gefunden. Bitte einen deutschen Ort oder eine Postleitzahl eingeben.');
  return { lat: place.latitude, lng: place.longitude };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Methode nicht erlaubt.' });
  const key = process.env.TANKERKOENIG_API_KEY;
  if (!key) return res.status(503).json({ error: 'TANKERKOENIG_API_KEY ist in Vercel noch nicht konfiguriert.' });
  const fuel = String(req.query.fuel || 'e5');
  const radius = Number(req.query.radius || 10);
  if (!['e5', 'e10', 'diesel'].includes(fuel) || !Number.isFinite(radius) || radius < 1 || radius > 25) {
    return res.status(400).json({ error: 'Ungültiger Kraftstoff oder Radius.' });
  }
  try {
    let lat, lng;
    if (req.query.lat !== undefined || req.query.lng !== undefined) {
      lat = Number(req.query.lat);
      lng = Number(req.query.lng);
    } else {
      const location = String(req.query.location || '').trim().slice(0, 100);
      if (location.length < 2) return res.status(400).json({ error: 'Bitte einen Ort eingeben.' });
      ({ lat, lng } = await geocode(location));
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 47 || lat > 55.2 || lng < 5.8 || lng > 15.2) {
      return res.status(400).json({ error: 'Bitte einen Standort in Deutschland verwenden.' });
    }
    const cacheKey = [lat.toFixed(2), lng.toFixed(2), radius, fuel].join(':');
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < TTL) return res.status(200).json(cached.data);
    if (Date.now() - lastRequest < 60_000) {
      return res.status(429).json({ error: 'Tankerkönig erlaubt nur eine Anfrage pro Minute. Bitte kurz warten und erneut versuchen.' });
    }
    lastRequest = Date.now();
    const url = new URL('https://creativecommons.tankerkoenig.de/json/list.php');
    for (const [name, value] of Object.entries({ lat, lng, rad: radius, sort: 'price', type: fuel, apikey: key })) {
      url.searchParams.set(name, String(value));
    }
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || 'Tankerkönig konnte nicht abgefragt werden.');
    const result = {
      stations: (data.stations || []).map(s => ({
        id: s.id, name: s.name, brand: s.brand, street: s.street, houseNumber: s.houseNumber,
        postCode: s.postCode, place: s.place, dist: s.dist, price: s.price,
        isOpen: s.isOpen, lat: s.lat, lng: s.lng
      })),
      fuel, radius, updatedAt: new Date().toISOString()
    };
    cache.set(cacheKey, { time: Date.now(), data: result });
    res.setHeader('Cache-Control', 'public, s-maxage=65, stale-while-revalidate=30');
    return res.status(200).json(result);
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Die Suche ist fehlgeschlagen.' });
  }
}
