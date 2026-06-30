import dotenv from 'dotenv';
dotenv.config(); // Loads environment variables from backend/.env

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 7400;

// Configure CORS to permit credentials (cookies) from local React/Vite development server
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Base health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Backend server is running successfully.',
    timestamp: new Date().toISOString()
  });
});

// 1. HttpOnly Cookie Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Mock login check (accepts any credentials for demo purposes)
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  // Generate a random anti-CSRF token
  const csrfToken = 'csrf_' + Math.random().toString(36).substring(2, 15);

  // Generate JWT access token containing user payload and the CSRF token binding
  const userPayload = {
    username: username,
    role: 'Administrator',
    csrfToken: csrfToken // Bound token to prevent CSRF attacks
  };

  const secret = process.env.JWT_SECRET || 'super_secret_key_12345';
  const accessToken = jwt.sign(userPayload, secret, { expiresIn: '1h' });

  // Set the JWT access token in an HttpOnly cookie
  res.cookie('access_token', accessToken, {
    httpOnly: true,                 // Block client-side JavaScript access (prevents XSS theft)
    secure: false,                  // Set to true in production (requires HTTPS)
    sameSite: 'Strict',             // Mitigates CSRF by sending cookie only on same-site navigations
    maxAge: 3600000                 // 1 Hour expiration
  });

  // Return the user information and the anti-CSRF token in the response body
  res.status(200).json({
    success: true,
    message: 'Login successful. Access token cookie dispatched.',
    user: {
      username: username,
      role: 'Administrator'
    },
    csrfToken: csrfToken // Sent in body to be stored in client-side memory
  });
});

// 2. HttpOnly Cookie Authenticated Profile Endpoint (Protected by JWT + anti-CSRF Header validation)
app.get('/api/profile', authMiddleware, (req, res) => {
  const clientCsrfToken = req.headers['x-csrf-token'];
  const expectedCsrfToken = req.user.csrfToken;

  // Validate the Anti-CSRF Token
  if (!clientCsrfToken || clientCsrfToken !== expectedCsrfToken) {
    console.warn('[CSRF Shield] Request blocked: Invalid or missing CSRF token header.');
    return res.status(403).json({
      success: false,
      message: 'CSRF Protection: Request blocked due to invalid X-CSRF-Token header.'
    });
  }

  // Return protected user details
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully. Cookies and CSRF headers verified.',
    data: {
      username: req.user.username,
      role: req.user.role,
      secretClearence: 'Top-Secret: 42-AXA-IndexDB-Storage',
      boundCsrfToken: expectedCsrfToken
    }
  });
});

// 3. HttpOnly Cookie Logout Endpoint
app.post('/api/logout', (req, res) => {
  // Clear the access token cookie
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'Strict'
  });
  
  res.status(200).json({
    success: true,
    message: 'Logout successful. Cookie destroyed.'
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[CORS] Configured to accept credentials from: ${corsOptions.origin.join(', ')}`);
});
