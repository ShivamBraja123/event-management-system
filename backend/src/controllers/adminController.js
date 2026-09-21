import Event from '../models/Event.js';
import User from '../models/User.js';

export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' }).populate('organizer', 'name email');
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listOrganizers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'organizer' };
    if (status) {
      filter.$or = [{ status }, { organizerStatus: status }];
    }
    const organizers = await User.find(filter).sort({ createdAt: -1 });
    res.json({ organizers });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load organizers.' });
  }
};

export const updateOrganizerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'declined'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid organizer status.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Organizer not found.' });

    user.role = user.role === 'organizer' ? 'organizer' : 'customer';
    user.status = status;
    user.organizerStatus = status;
    await user.save();

    res.json({
      message: `Organizer ${status}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        organizerStatus: user.organizerStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update organizer status.' });
  }
};

export const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


