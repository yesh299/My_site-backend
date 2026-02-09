const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    try {
        // Only return lightweight user info; expose place count instead of full place objects
        const users = await User.find({}, '-password').populate('places', '_id');
        res.json({ users: users.map(u => ({ 
            id: u._id.toString(), 
            name: u.name, 
            email: u.email,
            image: u.image,
            places: Array.isArray(u.places) ? u.places.length : 0
        })) });
    } catch (err) {
        next(new HttpError('Fetching users failed.', 500));
    }
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new HttpError('User exists already, please login instead.', 422));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ 
            name, 
            email, 
            password: hashedPassword,
            image: req.file ? req.file.path.replace(/\\/g, '/') : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random',
            places: []
        });
        await user.save();
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );
        
        const sanitized = { 
            userId: user._id.toString(), 
            name: user.name, 
            email: user.email,
            image: user.image,
            token 
        };
        res.status(201).json(sanitized);
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Signing up failed:', err && err.message);
        }
        if (process.env.DEV_ALLOW_LOGIN === 'true') {
            try {
                const token = jwt.sign(
                    { userId: 'dev-user-1', email },
                    process.env.JWT_SECRET || 'your_jwt_secret_key',
                    { expiresIn: '7d' }
                );
                return res.status(201).json({
                    userId: 'dev-user-1',
                    name,
                    email,
                    image: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random',
                    token
                });
            } catch (signErr) {
                return next(new HttpError('Signing up failed.', 500));
            }
        }
        next(new HttpError('Signing up failed.', 500));
    }
};

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return next(new HttpError('Invalid credentials!', 401));
        }

        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return next(new HttpError('Invalid credentials!', 401));
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );

        res.json({ 
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            token
        });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Logging in failed:', err && err.message);
        }
        if (process.env.DEV_ALLOW_LOGIN === 'true') {
            try {
                const token = jwt.sign(
                    { userId: 'dev-user-1', email },
                    process.env.JWT_SECRET || 'your_jwt_secret_key',
                    { expiresIn: '7d' }
                );
                return res.json({
                    userId: 'dev-user-1',
                    name: 'Dev User',
                    email,
                    image: 'https://ui-avatars.com/api/?name=Dev%20User&background=random',
                    token
                });
            } catch (signErr) {
                return next(new HttpError('Logging in failed.', 500));
            }
        }
        next(new HttpError('Logging in failed.', 500));
    }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;