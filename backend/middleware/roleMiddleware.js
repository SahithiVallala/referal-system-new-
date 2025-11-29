exports.role = (allowed = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (typeof allowed === 'string') allowed = [allowed];
  if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden: insufficient role' });
  next();
};