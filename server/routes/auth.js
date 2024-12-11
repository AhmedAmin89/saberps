import express from 'express';
import { AuthService } from '../services/auth.service.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await AuthService.validateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        status: 'error' 
      });
    }

    const token = AuthService.generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      redirectTo: user.role === 'admin' ? '/admin' : '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'An error occurred during login',
      status: 'error'
    });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        status: 'error' 
      });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      status: 'error' 
    });
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Logged out successfully',
    status: 'success' 
  });
});

export default router;