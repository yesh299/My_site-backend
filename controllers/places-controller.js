const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const fs = require('fs');

const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");
const getCoordinatesForAddress = require("../util/location");
const getAddressForCoordinates = require("../util/reverse-geocode");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  try {
    const place = await Place.findById(placeId).populate('creator', '-password');
    if (!place) {
      return next(new HttpError("Place not found", 404));
    }
    const plain = place.toObject({ getters: true });
    res.json({ place: { ...plain, creatorId: place.creator ? place.creator.id || place.creator.toString() : null } });
  } catch (err) {
    next(new HttpError("Fetching place failed.", 500));
  }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const userPlaces = await Place.find({ creator: userId }).populate('creator', '-password');
    if (!userPlaces || userPlaces.length === 0) {
      return next(
        new HttpError("Could not find places for the provided user id.", 404),
      );
    }
    res.json({ places: userPlaces.map(p => {
      const plain = p.toObject({ getters: true });
      return { ...plain, creatorId: p.creator ? p.creator.id || p.creator.toString() : null };
    }) });
  } catch (err) {
    next(new HttpError("Fetching places failed.", 500));
  }
};

const createPlaces = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { title, description, address } = req.body;
  const creator = req.userData?.userId;

  if (!creator) {
    return next(new HttpError("Authentication required.", 401));
  }

  let coordinates;
  try {
    coordinates = await getCoordinatesForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file ? req.file.path.replace(/\\/g, '/') : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
    if (!user) {
      return next(new HttpError("Could not find user for provided id.", 404));
    }
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  try {
    await createdPlace.save();
    user.places.push(createdPlace);
    await user.save();

    const plain = createdPlace.toObject({ getters: true });
    res.status(201).json({ place: { ...plain, creatorId: creator } });
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  
  try {
    const place = await Place.findById(placeId);
    if (!place) {
      return next(new HttpError("Place not found", 404));
    }

    // Verify ownership
    if (place.creator.toString() !== req.userData.userId) {
      return next(new HttpError("You are not allowed to edit this place.", 403));
    }

    place.title = title;
    place.description = description;

    // Handle image update
    if (req.file) {
      // Delete old image if it exists and is not a default image
      if (place.image && place.image.startsWith('uploads/')) {
        try {
          fs.unlink(place.image, err => {
            if (err) console.log(err);
          });
        } catch (err) {
          console.log('Could not delete old image file:', err);
        }
      }
      // Use new image path
      place.image = req.file.path.replace(/\\/g, '/');
    }

    await place.save();
    
    res.status(200).json({ place: place.toObject({ getters: true }) });
  } catch (err) {
    next(new HttpError("Updating place failed.", 500));
  }
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  
  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
    if (!place) {
      return next(new HttpError("Could not find place for this id.", 404));
    }
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete place.", 500));
  }

  // Verify ownership
  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this place.", 403));
  }

  try {
    await place.deleteOne();
    place.creator.places.pull(place);
    await place.creator.save();

    // Delete image file if it exists and is not a URL
    if (place.image && place.image.startsWith('uploads/')) {
      fs.unlink(place.image, err => {
        if (err) console.log(err);
      });
    }

    res.status(200).json({ message: "Deleted place." });
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete place.", 500));
  }
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlaces,
  updatePlaceById,
  deletePlace,
  reverseGeocode: async (req, res, next) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return next(new HttpError("Please provide valid 'lat' and 'lng' query params.", 400));
    }

    try {
      const address = await getAddressForCoordinates(lat, lng);
      res.json({ address });
    } catch (err) {
      next(err);
    }
  }
};
