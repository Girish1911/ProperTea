import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Ensure this path correctly points to your User model

const router = express.Router();

// --- USER REGISTRATION ---
// Handles POST requests to /api/users/register
router.post('/register', async (req, res) => {
  console.log('--- REGISTER ROUTE HIT ---');
  const { name, email, password } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user instance
    user = new User({
      name,
      email,
      password,
    });

    // Hash the password before saving to the database
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();

    // Send a success response
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


// --- USER LOGIN ---
// Handles POST requests to /api/users/login
router.post('/login', async (req, res) => {
  console.log('--- LOGIN ROUTE HIT ---');
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the submitted password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If credentials are correct, create a JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token and send it back to the client
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Ensure JWT_SECRET is set in your .env file
      { expiresIn: '1h' }, // Token will be valid for 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;

