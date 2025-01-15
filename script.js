// Replace YOUR_MAPBOX_TOKEN with your Mapbox API token
mapboxgl.accessToken = 'pk.eyJ1IjoidHJpcGJpYmgiLCJhIjoiY201eHk2Ym12MDhtYzJpcjMxeXg0MG51cSJ9.GgowZBlw5CDReY5_vzKE8g';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [77.1025, 28.7041], // Default center (longitude, latitude)
  zoom: 10
});

// Add current location button functionality
const currentLocationButton = document.getElementById('current-location');

currentLocationButton.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { longitude, latitude } = position.coords;
        map.flyTo({
          center: [longitude, latitude],
          zoom: 14
        });

        // Add a marker for the current location
        new mapboxgl.Marker({ color: 'red' })
          .setLngLat([longitude, latitude])
          .addTo(map);
      },
      error => {
        alert('Unable to access your location. Please enable location services.');
        console.error('Geolocation error:', error);
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

// Autocomplete for pickup and drop-off
const pickupInput = document.getElementById('pickup');
const dropoffInput = document.getElementById('dropoff');
const pickupSuggestions = document.getElementById('pickup-suggestions');
const dropoffSuggestions = document.getElementById('dropoff-suggestions');

// Fetch suggestions from Mapbox Geocoding API
function fetchSuggestions(query, callback) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const suggestions = data.features.map(feature => ({
        place_name: feature.place_name,
        center: feature.center
      }));
      callback(suggestions);
    })
    .catch(error => {
      console.error('Error fetching suggestions:', error);
    });
}

// Display suggestions in dropdown
function displaySuggestions(input, suggestions, container) {
  container.innerHTML = '';
  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = suggestion.place_name;
    item.addEventListener('click', () => {
      input.value = suggestion.place_name;
      container.innerHTML = '';
      map.flyTo({
        center: suggestion.center,
        zoom: 14
      });
      new mapboxgl.Marker().setLngLat(suggestion.center).addTo(map);
    });
    container.appendChild(item);
  });
}

// Event listeners for pickup input
pickupInput.addEventListener('input', () => {
  const query = pickupInput.value.trim();
  if (query.length > 2) {
    fetchSuggestions(query, suggestions => {
      displaySuggestions(pickupInput, suggestions, pickupSuggestions);
    });
  } else {
    pickupSuggestions.innerHTML = '';
  }
});

// Event listeners for drop-off input
dropoffInput.addEventListener('input', () => {
  const query = dropoffInput.value.trim();
  if (query.length > 2) {
    fetchSuggestions(query, suggestions => {
      displaySuggestions(dropoffInput, suggestions, dropoffSuggestions);
    });
  } else {
    dropoffSuggestions.innerHTML = '';
  }
});

// Close dropdown on outside click
document.addEventListener('click', event => {
  if (!pickupInput.contains(event.target)) {
    pickupSuggestions.innerHTML = '';
  }
  if (!dropoffInput.contains(event.target)) {
    dropoffSuggestions.innerHTML = '';
  }
});
