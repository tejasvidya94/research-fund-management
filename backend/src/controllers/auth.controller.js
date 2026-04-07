const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const signup = async (req, res) => {
    const { name, email, password, designation, department } = req.body;

    if (!name || !email || !password || !designation) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            userName: name,
            email: email.toLowerCase(),
            password: hashedPassword,
            designation,
            department: department || 'N/A',
            profilePic: ''
        });

        await user.save();

        const userObj = {
            id: user._id.toString(),
            name: user.userName,
            email: user.email,
            designation: user.designation,
            department: user.department
        };

        const token = jwt.sign({ id: userObj.id, email: userObj.email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ token, user: userObj });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const userObj = {
            id: user._id.toString(),
            name: user.userName,
            email: user.email,
            designation: user.designation,
            department: user.department
        };

        const token = jwt.sign({ id: userObj.id, email: userObj.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user: userObj });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getAuthenticatedUser = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userObj = {
            id: user._id.toString(),
            name: user.userName,
            email: user.email,
            designation: user.designation,
            department: user.department
        };

        res.json({ user: userObj });
    } catch (error) {
        console.error('Get user error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

//implement logout later.

module.exports = { signup, login, getAuthenticatedUser }