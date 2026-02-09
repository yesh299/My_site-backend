const express = require('express');
const {
  getPlaceById,
  getPlacesByUserId,
  createPlaces,
  updatePlaceById,
  deletePlace,
  reverseGeocode
} = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/auth');

const router = express.Router();

router.get('/user/:uid', getPlacesByUserId);

router.get('/:pid', getPlaceById);

// Public reverse-geocoding: lat,lng -> address
router.get('/reverse-geocode', reverseGeocode);

router.post('/', checkAuth, fileUpload.single('image'), createPlaces);

router.patch('/:pid', checkAuth, fileUpload.single('image'), updatePlaceById);

router.delete('/:pid', checkAuth, deletePlace);

module.exports = router;
