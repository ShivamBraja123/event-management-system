import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import Review from './models/Review.js';
import { generateQRCodeDataUrl } from './utils/qrcode.js';

const SEED_TAG = 'seed-2026';
const password = 'password';
const cities = [
  ['Delhi', 'India Habitat Centre'],
  ['Chandigarh', 'Tagore Theatre'],
  ['Ambala', 'Maharaja Agrasen Auditorium'],
  ['Gurgaon', 'The Leela Ambience Convention Hotel'],
  ['Noida', 'India Expo Mart'],
  ['Jaipur', 'Birla Auditorium'],
  ['Mumbai', 'Jio World Convention Centre'],
  ['Pune', 'Bal Gandharva Rang Mandir'],
  ['Bengaluru', 'Bangalore International Centre'],
  ['Hyderabad', 'HICC Novotel'],
  ['Chennai', 'Chennai Trade Centre'],
  ['Kolkata', 'Science City Auditorium'],
  ['Ahmedabad', 'Sabarmati Riverfront Event Centre'],
  ['Lucknow', 'Indira Gandhi Pratishthan'],
  ['Dehradun', 'Himalayan Cultural Centre'],
  ['Amritsar', 'Gobindgarh Fort'],
  ['Shimla', 'Gaiety Heritage Cultural Complex'],
];

const categories = {
  Technology: ['AI', 'cloud', 'developer', 'robotics', 'cybersecurity', 'hackathon'],
  Music: ['live music', 'concert', 'DJ', 'indie', 'classical', 'festival'],
  Sports: ['cricket', 'football', 'basketball', 'marathon', 'badminton', 'esports'],
  Business: ['startup', 'leadership', 'investing', 'entrepreneurship', 'strategy', 'founders'],
  Education: ['career', 'learning', 'seminar', 'university', 'training', 'students'],
  Cultural: ['dance', 'heritage', 'tradition', 'theatre', 'celebration', 'folk'],
  Entertainment: ['comedy', 'cinema', 'stand-up', 'show', 'performance', 'live'],
  'Health & Wellness': ['yoga', 'fitness', 'wellness', 'meditation', 'nutrition', 'health'],
  'Food & Lifestyle': ['food', 'cooking', 'tasting', 'lifestyle', 'chef', 'market'],
  Art: ['painting', 'photography', 'gallery', 'illustration', 'creative', 'design'],
  Conferences: ['industry', 'academic', 'professional', 'summit', 'research', 'leaders'],
  Workshops: ['programming', 'design', 'marketing', 'photography', 'business', 'career'],
  Networking: ['professional', 'founder', 'student', 'developer', 'community', 'connections'],
  Festivals: ['city', 'college', 'cultural', 'food', 'music', 'seasonal'],
  Other: ['community', 'local', 'special', 'public', 'social', 'gathering'],
};

const imageIds = [
  '1517248135467-4c7edcad34c4', '1492684223066-81342ee5ff30', '1506157786151-b8491531f063',
  '1540575467063-178a50c2df87', '1511578314322-379afb476865', '1503095396549-807759245b35',
  '1501281668745-f7f25cbbf8b4', '1516450360452-9312f5e86fc7', '1493225457124-a3eb161ffa5f',
  '1528605248644-14dd04022da1', '1511632765486-a01980e01a18', '1527529482837-4698179dc6ce',
  '1519389950473-47ba0277781c', '1504384308090-c894fdcc538d', '1556761175-b413da4baf72',
  '1552664730-d307ca884978', '1542744173-8e7e53415bb0', '1517048676732-d65bc937f952',
  '1531482615713-2afd69097998', '1521737711867-e3b97375f902', '1517457373958-b7bdd4587205',
  '1517245386807-bb43f82c33c4', '1529156069898-49953e39b3ac', '1517245386807-bb43f82c33c4',
  '1497366754035-f200968a6e72', '1556761175-b413da4baf72', '1516321318423-f06f85e504b3',
  '1497366811353-6870744d04b2', '1524758631624-e2822e304c36', '1543269865-cbf427effbad',
];

const organizerProfiles = [
  ['TechConnect India', 'techconnect@seed.event', ['Technology', 'Conferences', 'Workshops']],
  ['EventSphere', 'eventsphere@seed.event', ['Entertainment', 'Festivals', 'Cultural']],
  ['Campus Events Network', 'campus@seed.event', ['Education', 'Sports', 'Music']],
  ['Startup India Community', 'startup@seed.event', ['Business', 'Networking', 'Conferences']],
  ['Developer Community India', 'developers@seed.event', ['Technology', 'Workshops', 'Networking']],
  ['SportsHub', 'sportshub@seed.event', ['Sports', 'Health & Wellness']],
  ['Cultural Events India', 'culture@seed.event', ['Cultural', 'Art', 'Festivals']],
];

const customerProfiles = [
  ['Aarav Mehta', 'aarav@seed.event'], ['Diya Sharma', 'diya@seed.event'],
  ['Kabir Singh', 'kabir@seed.event'], ['Meera Iyer', 'meera@seed.event'],
  ['Rohan Kapoor', 'rohan@seed.event'], ['Ananya Das', 'ananya@seed.event'],
  ['Ishaan Verma', 'ishaan@seed.event'], ['Sana Khan', 'sana@seed.event'],
  ['Vivaan Joshi', 'vivaan@seed.event'], ['Nisha Patel', 'nisha@seed.event'],
  ['Arjun Nair', 'arjun@seed.event'], ['Tara Bhatia', 'tara@seed.event'],
];

function posterUrl(category, index) {
  const imageId = imageIds[(index + category.length) % imageIds.length];
  return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=1200&h=700&q=80&sig=${encodeURIComponent(`${category}-${index}`)}`;
}

function eventDate(index) {
  const date = new Date();
  const bucket = index % 10;
  date.setDate(date.getDate() + (bucket < 8 ? 7 + index : -(index % 45 + 1)));
  date.setHours(9 + (index % 8), (index % 2) * 30, 0, 0);
  return date;
}

function eventStatus(index) {
  if (index % 25 === 0) return 'rejected';
  if (index % 17 === 0) return 'pending';
  return 'approved';
}

async function ensureUser({ name, email, role, interests = [] }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.findOneAndUpdate(
    { email },
    { $set: { name, role, interests, isBlocked: false, password: passwordHash, points: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).select('+password');
}

async function run() {
  await connectDB();

  const generatedUsers = await User.find({ email: /@seed\.event$/ }).select('_id');
  const generatedEvents = await Event.find({ tags: SEED_TAG }).select('_id');
  const generatedEventIds = generatedEvents.map(({ _id }) => _id);
  await Promise.all([
    Registration.deleteMany({ $or: [{ user: { $in: generatedUsers.map(({ _id }) => _id) } }, { event: { $in: generatedEventIds } }] }),
    Review.deleteMany({ $or: [{ user: { $in: generatedUsers.map(({ _id }) => _id) } }, { event: { $in: generatedEventIds } }] }),
    Event.deleteMany({ tags: SEED_TAG }),
    User.deleteMany({ email: /@seed\.event$/ }),
  ]);

  const admin = await ensureUser({ name: 'Adam Admin', email: 'admin@example.com', role: 'admin' });
  const demoCustomer = await ensureUser({ name: 'Alice Customer', email: 'customer@example.com', role: 'customer', interests: ['Technology', 'Music'] });
  const demoOrganizer = await ensureUser({ name: 'Oscar Organizer', email: 'organizer@example.com', role: 'organizer' });

  const organizers = [demoOrganizer];
  for (const [name, email, interests] of organizerProfiles) {
    organizers.push(await ensureUser({ name, email, role: 'organizer', interests }));
  }
  const customers = [demoCustomer];
  for (const [name, email] of customerProfiles) {
    customers.push(await ensureUser({ name, email, role: 'customer', interests: Object.keys(categories).slice(customers.length % 5, (customers.length % 5) + 3) }));
  }

  const eventDocs = [];
  let index = 0;
  for (const [category, topics] of Object.entries(categories)) {
    for (let number = 0; number < 100; number += 1) {
      const topic = topics[number % topics.length];
      const [city, venue] = cities[(index + number) % cities.length];
      const date = eventDate(index);
      const status = eventStatus(number);
      eventDocs.push({
        title: `${city} ${topic.replace(/\b\w/g, c => c.toUpperCase())} ${category} Forum`,
        description: `Join practitioners, learners and enthusiasts for a hands-on ${topic} programme in ${city}. Explore practical ideas, meet the community and leave with connections and insights you can use.`,
        category,
        date,
        location: `${venue}, ${city}`,
        capacity: 80 + ((index * 37) % 921),
        organizer: organizers[index % organizers.length]._id,
        posterUrl: posterUrl(category, index),
        status,
        tags: [SEED_TAG, topic, city.toLowerCase()],
        averageRating: 0,
        createdAt: new Date(date.getTime() - (index % 60 + 5) * 86400000),
      });
      index += 1;
    }
  }
  const events = await Event.insertMany(eventDocs, { ordered: true });
  const approved = events.filter(event => event.status === 'approved');
  const completed = approved.filter(event => event.date < new Date());
  const registrations = [];

  for (let i = 0; i < Math.min(360, approved.length); i += 1) {
    const event = approved[(i * 7) % approved.length];
    const user = customers[i % customers.length];
    const exists = registrations.some(registration => String(registration.user) === String(user._id) && String(registration.event) === String(event._id));
    if (!exists) {
      const status = event.date < new Date() && i % 4 === 0 ? 'attended' : 'registered';
      const payload = JSON.stringify({ userId: user._id.toString(), eventId: event._id.toString(), at: Date.now() });
      registrations.push({
        user: user._id,
        event: event._id,
        status,
        qrCodeDataUrl: await generateQRCodeDataUrl(payload),
        checkedInAt: status === 'attended' ? new Date(event.date.getTime() + 2 * 3600000) : undefined,
      });
    }
  }
  if (!registrations.some(registration => String(registration.user) === String(demoCustomer._id))) {
    const event = approved[0];
    registrations.push({
      user: demoCustomer._id,
      event: event._id,
      status: 'registered',
      qrCodeDataUrl: await generateQRCodeDataUrl(JSON.stringify({ userId: demoCustomer._id.toString(), eventId: event._id.toString(), at: Date.now() })),
    });
  }
  await Registration.insertMany(registrations, { ordered: false });

  const reviews = [];
  for (let i = 0; i < Math.min(90, completed.length); i += 1) {
    const event = completed[i];
    const user = customers[(i + 3) % customers.length];
    if (await Review.exists({ event: event._id, user: user._id })) continue;
    reviews.push({
      event: event._id,
      user: user._id,
      rating: 3 + (i % 3),
      comment: ['Well organised and useful.', 'Great speakers and a welcoming community.', 'A memorable experience with practical takeaways.'][i % 3],
    });
  }
  await Review.insertMany(reviews, { ordered: false });
  for (const event of completed) {
    const aggregate = await Review.aggregate([{ $match: { event: event._id } }, { $group: { _id: '$event', average: { $avg: '$rating' } } }]);
    if (aggregate[0]) await Event.updateOne({ _id: event._id }, { $set: { averageRating: Number(aggregate[0].average.toFixed(1)) } });
  }

  await User.updateOne({ _id: admin._id }, { $set: { points: 0 } });
  console.log(JSON.stringify({
    users: await User.countDocuments({}),
    organizers: await User.countDocuments({ role: 'organizer' }),
    customers: await User.countDocuments({ role: 'customer' }),
    events: events.length,
    eventsPerCategory: 100,
    registrations: registrations.length,
    reviews: reviews.length,
    generatedAccounts: organizers.length - 1 + customers.length - 1,
  }, null, 2));
  await mongoose.disconnect();
}

run().catch(async error => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
