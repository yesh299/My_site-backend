const axios = require('axios');
const HttpError = require('../models/http-error');

async function getAddressForCoordinates(lat, lng) {
  // If Google API key exists, prefer Google Reverse Geocoding
  const apiKey = process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;
      if (!data || data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new HttpError('Could not find address for the specified coordinates.', 422);
      }
      return data.results[0].formatted_address;
    } catch (err) {
      throw new HttpError('Could not find address for the specified coordinates.', 422);
    }
  }

  // Fallback to OpenStreetMap Nominatim (no key required, be respectful of usage limits)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'MySite/1.0 (reverse-geocode; contact: example@example.com)'
      }
    });
    const data = response.data;
    if (!data || !data.display_name) {
      throw new HttpError('Could not find address for the specified coordinates.', 422);
    }
    return data.display_name;
  } catch (err) {
    throw new HttpError('Could not find address for the specified coordinates.', 422);
  }
}

module.exports = getAddressForCoordinates;
