const express = require("express");
const { check } = require("express-validator");

const {
  getPlaceById,
  getPlacesByUserId,
  createPlaces,
  updatePlaceById,
  deletePlace,
} = require("../controllers/places-controller");

const auth = require("../middleware/auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

// Public routes
router.get("/:pid", getPlaceById);
router.get("/user/:uid", getPlacesByUserId);

// Protected routes
router.post(
  "/",
  auth,
  fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  createPlaces
);

router.patch(
  "/:pid",
  auth,
  fileUpload.single('image'),
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  updatePlaceById,
);

router.delete("/:pid", auth, deletePlace);

module.exports = router;
