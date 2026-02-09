const axios = require("axios");

const HttpError = require("../models/http-error");

async function getcoordinatesForAddress(address) {
  // If no Google API key, return mock coordinates
  if (!process.env.GOOGLE_API_KEY) {
    // Return mock coordinates for demo purposes
    return {
      lat: 40.7128,
      lng: -74.0060,
    };
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${process.env.GOOGLE_API_KEY}`,
    );
    const data = response.data;
    if (!data || data.status === "ZERO_RESULTS") {
      throw new HttpError("Could not find location for the specified address.", 422);
    }
    const coordinates = data.results[0].geometry.location;
    return coordinates;
  } catch (error) {
    throw new HttpError("Could not find location for the specified address.", 422);
  }
}

module.exports = getcoordinatesForAddress;