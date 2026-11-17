import '../style.css';

const form = document.querySelector('#station-search');
const status = document.querySelector('#search-status');
const results = document.querySelector('#station-results');
const nearbyButton = document.querySelector('#nearby-search');
const openOnly = document.querySelector('#open-only');
const sortBy = document.querySelector('#sort-by');
const state = { stations: [] };
let requestId = 0;
let locationRequestId = 0;
let cooldownTimer = null;
console.log('FuelPredict bereit', form);

const storageKey = 'fuelpredict.preferences.v1';
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && saved.version === 1) {
    if (['e5', 'e10', 'diesel'].includes(saved.fuel)) form.elements['fuel-type'].value = saved.fuel;
    if (['5', '10', '20', '25'].includes(saved.radius)) form.elements.radius.value = saved.radius;
    if (['price', 'distance'].includes(saved.sort)) sortBy.value = saved.sort;
    if (typeof saved.openOnly === 'boolean') openOnly.checked = saved.openOnly;
  }
} catch { /* Ignore unavailable or invalid storage. */ }
form.addEventListener('change', () => {
  try { localStorage.setItem(storageKey, JSON.stringify({version: 1, fuel: form.elements['fuel-type'].value, radius: form.elements.radius.value, sort: sortBy.value, openOnly: openOnly.checked})); } catch { /* Storage is optional. */ }
});
form.addEventListener('reset', () => {
  try { localStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
});

function stopCooldown() {
  if (cooldownTimer !== null) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
}

function showCooldown(seconds, id) {
  stopCooldown();
  const deadline = Date.now() + seconds * 1000;
  const update = () => {
    if (id !== requestId) {
      stopCooldown();
      return;
    }
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (remaining === 0) {
      stopCooldown();
      status.textContent = 'Du kannst jetzt erneut nach Tankstellen suchen.';
    } else {
      status.textContent = `Bitte noch ${remaining} Sekunden warten, bevor du erneut suchst.`;
    }
  };
  update();
  if (Date.now() < deadline) cooldownTimer = setInterval(update, 1000);
}

function clearResults() {
  results.replaceChildren();
}

function sortStations(stations, mode) {
  const value = (station, field) => {
    const raw = station[field];
    const number = Number(raw);
    return raw != null && raw !== '' && Number.isFinite(number) && number >= 0 && (field !== 'price' || number > 0)
      ? number : Infinity;
  };
  return [...stations].sort((a, b) => {
    const first = mode === 'distance' ? 'dist' : 'price';
    const second = mode === 'distance' ? 'price' : 'dist';
    return (value(a, first) - value(b, first)) || (value(a, second) - value(b, second)) || 0;
  });
}

function renderStations() {
  clearResults();
  const filtered = openOnly.checked ? state.stations.filter(station => station.isOpen === true) : state.stations;
  const stations = sortStations(filtered, sortBy.value);
  if (openOnly.checked && state.stations.length && !stations.length) {
    status.textContent = 'Keine geöffneten Tankstellen gefunden. Filter deaktivieren, um alle anzuzeigen.';
  } else {
    status.textContent = stations.length
      ? stations.length + (openOnly.checked ? ' geöffnete Tankstellen' : ' Tankstellen') + ' gefunden · Preise von Tankerkönig'
      : 'Keine Tankstellen im gewählten Radius gefunden.';
  }
    for (const station of stations) {
      const article = document.createElement('article');
      article.className = 'station-item';
      const title = document.createElement('h3');
      title.textContent = station.name || station.brand || 'Tankstelle';
      const address = document.createElement('p');
      address.textContent = [station.street, station.houseNumber, station.postCode, station.place].filter(Boolean).join(' ');
      const info = document.createElement('p');
      const price = Number(station.price);
      info.textContent = (Number.isFinite(price) && price > 0 ? price.toFixed(3).replace('.', ',') + ' €/l' : 'Kein Preis verfügbar')
        + ' · ' + (Number(station.dist) || 0).toFixed(1).replace('.', ',') + ' km'
        + ' · ' + (station.isOpen ? 'Geöffnet' : 'Geschlossen');
      article.append(title, address, info);
      const lat = Number(station.lat);
      const lng = Number(station.lng);
      if (station.lat != null && station.lng != null &&
          Number.isFinite(lat) && Number.isFinite(lng) &&
          lat >= 47 && lat <= 55.2 && lng >= 5.8 && lng <= 15.2) {
        const directions = new URL('https://www.google.com/maps/dir/');
        directions.searchParams.set('api', '1');
        directions.searchParams.set('destination', lat + ',' + lng);
        const link = document.createElement('a');
        link.href = directions.toString();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Route planen';
        link.setAttribute('aria-label', 'Route zu ' + (station.name || station.brand || 'Tankstelle') + ' planen');
        article.append(link);
      }
      results.append(article);
    }
}

async function search(params) {
  stopCooldown();
  const id = ++requestId;
  state.stations = [];
  clearResults();
  status.textContent = 'Tankstellen werden gesucht …';
  const url = new URL('/api/stations', window.location.origin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (id !== requestId) return;
    if (!response.ok) {
      if (response.status === 429) {
        const seconds = Number(data.retryAfterSeconds ?? response.headers.get('Retry-After'));
        if (Number.isFinite(seconds) && seconds > 0) {
          showCooldown(seconds, id);
          return;
        }
      }
      throw new Error(data.error || 'Suche fehlgeschlagen.');
    }
    state.stations = Array.isArray(data.stations) ? data.stations : [];
    renderStations();
  } catch (error) {
    if (id === requestId) status.textContent = error.message;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  ++locationRequestId;
  const location = form.elements.location.value.trim();
  if (location.length < 2) return;
  search({ location, fuel: form.elements['fuel-type'].value, radius: form.elements.radius.value });
});

form.addEventListener('reset', () => {
  stopCooldown();
  ++locationRequestId;
  ++requestId;
  state.stations = [];
  clearResults();
  status.textContent = 'Noch keine Tankstellen geladen.';
});

openOnly.addEventListener('change', () => {
  if (state.stations.length) renderStations();
});

sortBy.addEventListener('change', () => {
  if (state.stations.length) renderStations();
});

nearbyButton.addEventListener('click', () => {
  const locationId = ++locationRequestId;
  if (!navigator.geolocation) {
    status.textContent = 'Dein Browser unterstützt keine Standortbestimmung.';
    return;
  }
  status.textContent = 'Standort wird ermittelt …';
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      if (locationId !== locationRequestId) return;
      search({
        lat: coords.latitude, lng: coords.longitude,
        fuel: form.elements['fuel-type'].value, radius: form.elements.radius.value
      });
    },
    () => {
      if (locationId === locationRequestId) {
        status.textContent = 'Standort nicht verfügbar. Bitte einen Ort eingeben.';
      }
    },
    { timeout: 10000, maximumAge: 60000 }
  );
});
