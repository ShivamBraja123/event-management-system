import User from '../models/User.js';

export function authorizeRoles(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

export async function requireApprovedOrganizer(req, res, next) {
  if (req.user?.role !== 'organizer') return next();

  try {
    const dbUser = await User.findById(req.user.id).lean();
    if (!dbUser) return res.status(401).json({ message: 'User not found' });
    const organizerStatus = dbUser.organizerStatus || dbUser.status || 'pending';
    if (organizerStatus === 'approved') return next();
    if (organizerStatus === 'declined') {
      return res.status(403).json({ message: 'Your organizer request was declined.' });
    }
    return res.status(403).json({ message: 'Your organizer account is pending approval.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error checking authorization status' });
  }
}



