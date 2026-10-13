const jwt = require('jsonwebtoken');

const cookieName = 'liboria_session';
const duration = () => {
  const value = process.env.JWT_EXPIRES_IN || '8h';
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error('JWT_EXPIRES_IN must use s, m, h, or d');
  return Number(match[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[match[2]];
};
const sign = (user) => {
  duration();
  return jwt.sign(
    { id: String(user._id), account_type: user.account_type },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
  );
};
const verify = (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  if (!payload.id || !['librarian', 'non-librarian', 'student'].includes(payload.account_type)) throw new Error('Invalid token');
  return payload;
};
const cookieOptions = () => ({ httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: duration() * 1000 });
const authenticate = (req, res, next) => {
  try {
    const cookie = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`));
    const token = cookie ? decodeURIComponent(cookie.slice(cookieName.length + 1)) : req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    req.user = verify(token);
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired session' }); }
};
const authorize = (...roles) => (req, res, next) => roles.includes(req.user.account_type) ? next() : res.status(403).json({ error: 'Access denied' });
const ownUser = (req, res, next) => req.user.account_type === 'librarian' || req.user.id === req.params.id ? next() : res.status(403).json({ error: 'Access denied' });
module.exports = { cookieName, duration, sign, cookieOptions, authenticate, authorize, ownUser };
