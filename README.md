# My Site - Backend API

A fully functional Node.js/Express backend with MongoDB integration for managing users and places.

## Features

- ✅ **User Authentication**: Signup/Login with password hashing (bcryptjs) and JWT tokens
- ✅ **JWT Authorization**: Protected routes using token-based authentication
- ✅ **Places Management**: Full CRUD operations for places with ownership verification
- ✅ **Geolocation Support**: Address geocoding (Google Maps API or mock coordinates)
- ✅ **Input Validation**: Express-validator for request validation
- ✅ **Error Handling**: Comprehensive error handling with custom HTTP error class
- ✅ **CORS Enabled**: Configured for frontend communication
- ✅ **MongoDB Integration**: Mongoose ORM for data persistence

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```
     MONGODB_URI=mongodb://localhost:27017/mysite
     PORT=5000
     JWT_SECRET=your_secure_secret_key
     GOOGLE_API_KEY=your_google_maps_api_key (optional)
     CLIENT_ORIGIN=http://localhost:3000
     ```

3. **Ensure MongoDB is running:**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud service

## Running the Server

**Development mode** (with auto-restart on file changes):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT)

## API Endpoints

### Authentication Routes (`/api/users`)

#### Get All Users
- **GET** `/api/users`
- Response: `{ users: [{ id, name, email }, ...] }`

#### Sign Up
- **POST** `/api/users/signup`
- Body: `{ name, email, password }`
- Response: `{ user: { id, name, email, token } }`
- Validations: name required, email valid, password min 6 chars

#### Login
- **POST** `/api/users/login`
- Body: `{ email, password }`
- Response: `{ message, user: { id, name, email, token } }`
- Validations: email valid, password min 6 chars

### Places Routes (`/api/places`)

#### Get Place by ID
- **GET** `/api/places/:pid`
- Response: `{ place: { id, title, description, address, location, creator } }`

#### Get Places by User ID
- **GET** `/api/places/user/:uid`
- Response: `{ places: [...] }`

#### Create Place (Protected)
- **POST** `/api/places`
- Headers: `Authorization: Bearer <token>`
- Body: `{ title, description, address }`
- Response: `{ place: { id, title, description, address, location, creator } }`
- Validations: title required, description min 5 chars, address required

#### Update Place (Protected)
- **PATCH** `/api/places/:pid`
- Headers: `Authorization: Bearer <token>`
- Body: `{ title, description }`
- Response: `{ place: {...} }`
- Validations: title required, description min 5 chars
- Authorization: Only place creator can update

#### Delete Place (Protected)
- **DELETE** `/api/places/:pid`
- Headers: `Authorization: Bearer <token>`
- Response: `{ message: "Deleted place!" }`
- Authorization: Only place creator can delete

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens are valid for 7 days. Include the token received from login/signup in subsequent requests.

## Error Handling

All errors follow this format:
```json
{
  "message": "Error description",
  "code": 400
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Project Structure

```
backend/
├── aap.js                      # Main application file
├── package.json                # Dependencies
├── .env                        # Environment variables
├── .env.example                # Environment variables template
├── controllers/
│   ├── users-controllers.js    # User auth logic
│   └── places-controller.js    # Place CRUD logic
├── models/
│   ├── user.js                 # User MongoDB schema
│   ├── place.js                # Place MongoDB schema
│   └── http-error.js           # Custom error class
├── routes/
│   ├── users-routes.js         # User endpoints
│   └── places-routes.js        # Place endpoints
├── middleware/
│   └── auth.js                 # JWT authentication middleware
└── util/
    ├── db.js                   # MongoDB connection
    └── location.js             # Geocoding utility
```

## Database Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, min 6, hashed),
  timestamps: true
}
```

### Place
```javascript
{
  title: String (required),
  description: String (required, min 5),
  address: String (required),
  location: {
    lat: Number (required),
    lng: Number (required)
  },
  creator: String (user ID, required),
  timestamps: true
}
```

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens are signed with a secret key (change in production)
- CORS is configured for specified origin
- Protected routes require valid JWT token
- Ownership verification for place updates/deletes

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env` is correct
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### CORS Errors
- Update `CLIENT_ORIGIN` in `.env` to match your frontend URL
- Default is `http://localhost:3000`

### Authentication Failures
- Ensure `JWT_SECRET` is set in `.env`
- Token must be in format: `Authorization: Bearer <token>`
- Check token hasn't expired (7 day expiry)

## Development

To add new features:
1. Create new model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Import and use routes in `aap.js`

## License

ISC


### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Backend API & Frontend Connection

The Express backend runs on port 5000 and exposes routes like:

- Users: `/api/users`, `/api/users/signup`, `/api/users/login`
- Places: `/api/places`, `/api/places/:pid`, `/api/places/user/:uid`

MongoDB is used via Mongoose. Configure the backend `.env`:

```
MONGODB_URI=mongodb://localhost:27017/mysite
# Optional
PORT=5000
```

Backend start:

```powershell
Push-Location "D:\mysite\backend"
npm run dev
```

The frontend calls the backend through `src/util/api.js`. Set the base for React dev:

```powershell
$env:REACT_APP_API_BASE = "http://localhost:5000"
```

Pages updated:

- `src/user/pages/Users.js` fetches from `/api/users`.
- `src/places/pages/UserPlaces.js` fetches from `/api/places/user/:uid`.
- `src/places/pages/NewPlaces.js` posts to `/api/places`.

The backend enables CORS to allow `http://localhost:3000`.
