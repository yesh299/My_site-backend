const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { connectDB } = require('./util/db-mongodb');

const placesRoutes = require('./routes/places-routes-prisma');
const usersRoutes = require('./routes/users-routes-prisma');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

// Serve static images - use absolute path
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// DB health endpoint
app.get('/health/db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      res.json({ ok: true, provider: 'mongodb', status: 'connected' });
    } else {
      res.status(500).json({ ok: false, error: 'MongoDB not connected' });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// App health endpoint
app.get('/health/app', (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbConnected = mongoose.connection && mongoose.connection.readyState === 1;
    res.json({
      ok: true,
      env: process.env.NODE_ENV || 'development',
      uptime: Math.round(process.uptime()),
      dbConnected
    });
  } catch (err) {
    res.status(200).json({
      ok: true,
      env: process.env.NODE_ENV || 'development',
      uptime: Math.round(process.uptime()),
      dbConnected: false
    });
  }
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Could not find this route.');
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Delete uploaded file if an error occurred
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headersSent) {
    return next(err);
  }
  
  // Map multer error codes to HTTP status codes
  const multerErrorMap = {
    'LIMIT_FILE_SIZE': 413,      // Payload Too Large
    'LIMIT_FILE_COUNT': 400,     // Bad Request
    'LIMIT_PART_COUNT': 400,
    'LIMIT_FIELD_KEY': 400,
    'LIMIT_FIELD_VALUE': 400,
    'LIMIT_FIELD_COUNT': 400,
    'LIMIT_UNEXPECTED_FILE': 400
  };
  
  const statusCode = multerErrorMap[err.code] || (typeof err.code === 'number' ? err.code : 500);
  
  res.status(statusCode);
  res.json({ 
    message: err.message || 'An unknown error occurred!',
    code: err.code || statusCode
  });
});

const PORT = process.env.PORT || 5000;

// Start server immediately without waiting for DB
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Connect to DB in background; won't block server startup
connectDB()
  .catch((err) => {
    console.error('Database connection pending - will retry...', err.message);
  });
