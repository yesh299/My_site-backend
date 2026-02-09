require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Place = require('./models/place');

async function run() {
  if (!process.env.MONGODB_URL) {
    throw new Error('MONGODB_URL is not set in environment');
  }
  await mongoose.connect(process.env.MONGODB_URL);
  console.log('Connected to MongoDB for seeding');

  const email = 'seed@example.com';
  const password = 'seedpass';

  let user = await User.findOne({ email });
  if (!user) {
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({
      name: 'Seed User',
      email,
      password: hashed,
      image: 'https://ui-avatars.com/api/?name=Seed+User&background=random',
      places: []
    });
    console.log('Created user:', user._id.toString());
  } else {
    console.log('User already exists:', user._id.toString());
  }

  const placesPayload = [
    {
      title: 'Seed Place One',
      description: 'A seeded place for testing',
      address: 'New York, USA',
      location: { lat: 40.7128, lng: -74.0060 },
      creator: user._id,
    },
    {
      title: 'Seed Place Two',
      description: 'Another seeded place for testing',
      address: 'San Francisco, USA',
      location: { lat: 37.7749, lng: -122.4194 },
      creator: user._id,
    }
  ];

  let inserted = 0;
  for (const payload of placesPayload) {
    const exists = await Place.findOne({ title: payload.title, creator: user._id });
    if (!exists) {
      const place = await Place.create(payload);
      user.places.push(place._id);
      inserted += 1;
      console.log('Created place:', place._id.toString(), '-', payload.title);
    } else {
      console.log('Place already exists:', payload.title);
    }
  }

  await user.save();
  console.log('Seed complete:', { email, placesInserted: inserted });

  await mongoose.disconnect();
  console.log('Disconnected');
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
