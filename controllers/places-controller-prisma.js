const fs = require('fs');
const { prisma } = require('../util/db-prisma');
const HttpError = require('../models/http-error');
const getCoordinatesForAddress = require('../util/location');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await prisma.place.findUnique({
      where: { id: placeId },
      include: { creator: true }
    });
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find place.', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for the provided id.', 404);
    return next(error);
  }

  // Transform location for frontend
  const transformedPlace = {
    ...place,
    coordinates: place.location,
    creatorId: place.creatorId,
    creator: place.creator
  };

  res.json({ place: transformedPlace });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userPlaces;
  try {
    userPlaces = await prisma.place.findMany({
      where: { creatorId: userId },
      include: { creator: true }
    });
  } catch (err) {
    const error = new HttpError('Fetching places failed, please try again later.', 500);
    return next(error);
  }

  if (!userPlaces || userPlaces.length === 0) {
    return next(new HttpError('Could not find places for the provided user id.', 404));
  }

  // Transform location for frontend
  const transformedPlaces = userPlaces.map(place => ({
    ...place,
    coordinates: place.location,
    creatorId: place.creatorId
  }));

  res.json({ places: transformedPlaces });
};

const createPlaces = async (req, res, next) => {
  const { title, description, address } = req.body;
  const userId = req.userData.userId;

  // Validate input
  if (!title || !description || !address) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  // Get image path
  let image = req.file ? req.file.path.replace(/\\/g, '/') : null;
  if (!image) {
    image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg';
  }

  // Get coordinates from address
  let coordinates;
  try {
    coordinates = await getCoordinatesForAddress(address);
  } catch (error) {
    return next(error);
  }

  // Create place
  let createdPlace;
  try {
    createdPlace = await prisma.place.create({
      data: {
        title,
        description,
        image,
        address,
        location: coordinates,
        creatorId: userId
      },
      include: { creator: true }
    });
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again.', 500);
    return next(error);
  }

  
  // Transform location for frontend response
  const transformedPlace = {
    ...createdPlace,
    coordinates: createdPlace.location,
    creatorId: createdPlace.creatorId
  };
  
  res.status(201).json({ place: transformedPlace });
};

const updatePlaceById = async (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const userId = req.userData.userId;

  // Find place
  let place;
  try {
    place = await prisma.place.findUnique({
      where: { id: placeId }
    });
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  // Check authorization
  if (place.creatorId !== userId) {
    const error = new HttpError('You are not allowed to update this place.', 401);
    return next(error);
  }

  // Handle image deletion if new image is uploaded
  let image = place.image;
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
    image = req.file.path.replace(/\\/g, '/');
  }

  // Update place
  let updatedPlace;
  try {
    updatedPlace = await prisma.place.update({
      where: { id: placeId },
      data: {
        title: title || place.title,
        description: description || place.description,
        image: image
      },
      include: { creator: true }
    });
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return next(error);
  }

  res.json({ place: updatedPlace });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  const userId = req.userData.userId;

  // Find place
  let place;
  try {
    place = await prisma.place.findUnique({
      where: { id: placeId }
    });
  } catch (err) {
    const error = new HttpError('Something went wrong, could not delete place.', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  // Check authorization
  if (place.creatorId !== userId) {
    const error = new HttpError('You are not allowed to delete this place.', 401);
    return next(error);
  }

  // Delete image file if it exists
  if (place.image && place.image.startsWith('uploads/')) {
    try {
      fs.unlink(place.image, err => {
        if (err) console.log(err);
      });
    } catch (err) {
      console.log('Could not delete image file:', err);
    }
  }

  // Delete place
  try {
    await prisma.place.delete({
      where: { id: placeId }
    });
  } catch (err) {
    const error = new HttpError('Something went wrong, could not delete place.', 500);
    return next(error);
  }

  res.json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlaces = createPlaces;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
