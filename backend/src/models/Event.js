import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    startTime: { type: String },
    endTime: { type: String },
    registrationDeadline: { type: Date },
    rules: { type: String },
    instructions: { type: String },
    eligibility: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    posterUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    tags: [{ type: String }],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ title: 'text', description: 'text', location: 'text' });

export const Event = mongoose.model('Event', eventSchema);
export default Event;

