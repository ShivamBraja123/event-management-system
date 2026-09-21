import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles, requireApprovedOrganizer } from '../middleware/roles.js';
import { upload } from '../utils/upload.js';
import { createEvent, updateEvent, deleteEvent, listEvents, getEvent } from '../controllers/eventController.js';

const router = Router();

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authenticate, authorizeRoles('organizer', 'admin'), requireApprovedOrganizer, upload.single('poster'), createEvent);
router.put('/:id', authenticate, authorizeRoles('organizer', 'admin'), requireApprovedOrganizer, upload.single('poster'), updateEvent);
router.delete('/:id', authenticate, authorizeRoles('organizer', 'admin'), requireApprovedOrganizer, deleteEvent);

export default router;


