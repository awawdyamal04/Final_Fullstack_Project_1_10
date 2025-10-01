import jwt from 'jsonwebtoken';

export function detectGuest(req, _res, next) {
  // אם יש כותרת X-Guest או טוקן אורח
  const isGuest = req.header("X-Guest") === "true";
  req.user = req.user || {};
  req.user.isGuest = !!isGuest;
  next();
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
