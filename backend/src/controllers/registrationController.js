import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { generateQRCodeDataUrl } from '../utils/qrcode.js';
import { sendEmail } from '../utils/email.js';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== 'approved') return res.status(400).json({ message: 'Event not available' });

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline for this event has passed.' });
    }

    if (event.capacity && event.capacity > 0) {
      const activeCount = await Registration.countDocuments({ event: event._id, status: { $ne: 'cancelled' } });
      if (activeCount >= event.capacity) {
        return res.status(400).json({ message: 'Event capacity is full.' });
      }
    }

    const payload = JSON.stringify({ userId: req.user.id, eventId: event._id, at: Date.now() });
    const qrCodeDataUrl = await generateQRCodeDataUrl(payload);
    const reg = await Registration.create({ user: req.user.id, event: event._id, qrCodeDataUrl });
    try {
      await sendEmail({ to: req.user.email, subject: `Registered: ${event.title}`, html: `<p>You are registered for ${event.title}.</p>` });
    } catch (_) {}
    res.status(201).json({ registration: reg });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }
    res.status(500).json({ message: err.message });
  }
};

export const myRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user.id }).populate('event');
    res.json({ registrations: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const participantsForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You are not the organizer of this event' });
    }
    const regs = await Registration.find({ event: req.params.id }).populate('user', 'name email role createdAt');
    res.json({ participants: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkInParticipant = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You are not the organizer of this event' });
    }
    const reg = await Registration.findOneAndUpdate(
      { user: req.body.userId, event: req.params.id },
      { status: 'attended', checkedInAt: new Date() },
      { new: true }
    );
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    res.json({ registration: reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const exportParticipantsCsv = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You are not the organizer of this event' });
    }
    const regs = await Registration.find({ event: req.params.id }).populate('user', 'name email role');
    const rows = regs.map(r => ({ name: r.user?.name || '', email: r.user?.email || '', role: r.user?.role || '', status: r.status, registeredAt: r.createdAt }));
    const filePath = path.join(process.cwd(), `participants-${req.params.id}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Role' },
        { id: 'status', title: 'Status' },
        { id: 'registeredAt', title: 'Registered At' },
      ],
    });
    await csvWriter.writeRecords(rows);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

