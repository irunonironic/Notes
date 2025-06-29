import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js'; 
const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Fixed: Added missing ! operator
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        // Fixed: User.create instead of user.create, removed duplicate hashing
        const newUser = await User.create({ username, password });
        
        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser._id, username: newUser.username }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login',async(req,res) =>{
    try{
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    res.json({ token });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;