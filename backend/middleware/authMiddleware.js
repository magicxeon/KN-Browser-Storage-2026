import jwt from 'jsonwebtoken';

// Middleware to authenticate requests using JWT stored in cookies
export const authMiddleware = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: No access token cookie provided.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_key_12345';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Access token is invalid or expired.'
    });
  }
};
