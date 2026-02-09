const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../util/db-prisma');
const HttpError = require('../models/http-error');

const TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 7 days in seconds

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: { places: true }
        }
      }
    });
  } catch (err) {
    const error = new HttpError('Could not fetch users.', 500);
    return next(error);
  }

  // Format response
  const formattedUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    image: user.image,
    places: user._count.places
  }));

  res.json({ users: formattedUsers });
};

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return next(new HttpError('Please provide name, email, and password.', 422));
  }

  // Check if user already exists
  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: { email }
    });
  } catch (err) {
    const error = new HttpError('Signup failed, please try again later.', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login instead.', 422);
    return next(error);
  }

  // Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    const error = new HttpError('Could not create user, please try again.', 500);
    return next(error);
  }

  // Determine image
  let image = req.file ? req.file.path.replace(/\\/g, '/') : null;
  if (!image) {
    // Fallback to UI Avatars API
    image = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }

  // Create user
  let createdUser;
  try {
    createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image
      }
    });
  } catch (err) {
    const error = new HttpError('Signup failed, please try again later.', 500);
    return next(error);
  }

  // Generate JWT token
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET,
      { expiresIn: `${TOKEN_EXPIRATION}s` }
    );
  } catch (err) {
    const error = new HttpError('Signup failed, please try again later.', 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
    expiresIn: TOKEN_EXPIRATION,
    image: createdUser.image
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new HttpError('Invalid credentials, could not log you in.', 403));
  }

  // Find user
  let identifiedUser;
  try {
    identifiedUser = await prisma.user.findUnique({
      where: { email }
    });
  } catch (err) {
    const error = new HttpError('Login failed, please try again later.', 500);
    return next(error);
  }

  if (!identifiedUser) {
    const error = new HttpError('Invalid credentials, could not log you in.', 403);
    return next(error);
  }

  // Compare passwords
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    const error = new HttpError('Could not log you in, please try again later.', 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid credentials, could not log you in.', 403);
    return next(error);
  }

  // Generate JWT token
  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: `${TOKEN_EXPIRATION}s` }
    );
  } catch (err) {
    const error = new HttpError('Login failed, please try again later.', 500);
    return next(error);
  }

  res.json({
    userId: identifiedUser.id,
    email: identifiedUser.email,
    token: token,
    expiresIn: TOKEN_EXPIRATION,
    image: identifiedUser.image
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
