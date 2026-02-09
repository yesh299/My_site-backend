const express = require('express');
const { getUsers, signup, login } = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', getUsers);

router.post('/signup', fileUpload.single('image'), signup);

router.post('/login', login);

module.exports = router;
