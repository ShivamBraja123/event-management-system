import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 5000);
  };

  const [participantCount, setParticipantCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    load();
  }, [id, user]);

  async function load() {
    try {
      const [e, r] = await Promise.all([
        axios.get(`/api/events/${id}`),
        axios.get(`/api/reviews/${id}`),
      ]);
      setEvent(e.data.event);
      setParticipantCount(e.data.participantCount ?? e.data.registrations ?? 0);
      setReviews(r.data.reviews || []);
      
      if (user) {
        const userReview = r.data.reviews?.find(review => review.user?._id === user.id);
        setHasReviewed(!!userReview);

        try {
          const myRegsRes = await axios.get('/api/registrations/me');
          const registered = myRegsRes.data.registrations?.some(reg => String(reg.event?._id || reg.event) === String(id));
          setIsRegistered(!!registered);
        } catch (_) {}
      }
    } catch (err) {
      showToast('error', 'Failed to load event details');
    }
  }

  async function register() {
    try {
      await axios.post(`/api/registrations/${id}/register`);
      showToast('success', 'Registered successfully! Check your dashboard for your ticket pass.');
      setIsRegistered(true);
      setParticipantCount(prev => prev + 1);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Registration failed.');
    }
  }

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(url); showToast('info', 'Event link copied to clipboard!');
    }
  }

  function downloadIcs() {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CampusEvents//EN\nBEGIN:VEVENT\nUID:${event._id}@campus\nDTSTAMP:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nDTSTART:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nDTEND:${end.toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nLOCATION:${event.location}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${event.title}.ics`; a.click(); URL.revokeObjectURL(url);
  }

  async function submitReview() {
    try {
      await axios.post(`/api/reviews/${id}`, { rating, comment });
      showToast('success', 'Review posted successfully!');
      setComment('');
      await load();
    } catch (error) {
      if (error.response?.status === 401) {
        showToast('warning', 'Please log in to post a review.');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('reviewed')) {
        showToast('info', 'You have already reviewed this event.');
      } else {
        showToast('error', `Failed to post review: ${error.response?.data?.message || 'Please try again.'}`);
      }
    }
  }

  if (!event) return <div className="p-8 text-center text-slate-500">Loading event details...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type==='success'?'bg-green-600':toast.type==='warning'?'bg-yellow-600':toast.type==='error'?'bg-red-600':'bg-blue-600'}`}>
          <div className="flex items-start gap-3">
            <span className="font-semibold capitalize">{toast.type}</span>
            <span className="opacity-90">{toast.message}</span>
            <button className="ml-4 opacity-80 hover:opacity-100" onClick={()=>setToast({ ...toast, open:false })}>×</button>
          </div>
        </div>
      )}

      {/* Main Banner & Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="relative h-72 md:h-96 w-full bg-slate-100 dark:bg-slate-800">
          <img src={event.posterUrl || '/placeholder.svg'} className="w-full h-full object-cover" alt={event.title} />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">{event.category}</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${event.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>{event.status}</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{event.title}</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Organized by <span className="font-semibold text-slate-800 dark:text-slate-200">{event.organizer?.name || 'Event Organizer'}</span> {event.organizer?.email && `(${event.organizer.email})`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isRegistered ? (
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
                  ✓ Registered
                </span>
              ) : (
                <button
                  className="btn px-6 py-2 text-base font-semibold"
                  onClick={register}
                  disabled={!user}
                >
                  {user ? 'Register Now' : 'Log in to Register'}
                </button>
              )}
              <button className="btn-outline px-4 py-2" onClick={shareEvent}>Share</button>
              <button className="btn-outline px-4 py-2" onClick={downloadIcs}>Calendar</button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm">
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium">Date & Time</span>
              <span className="font-semibold">{new Date(event.date).toLocaleDateString()} {event.startTime ? `at ${event.startTime}` : ''}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium">Venue / Location</span>
              <span className="font-semibold">{event.location}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium">Capacity</span>
              <span className="font-semibold">{event.capacity && event.capacity > 0 ? `${participantCount} / ${event.capacity}` : `${participantCount} registered`}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block uppercase font-medium">Registration Deadline</span>
              <span className="font-semibold">{event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'Open'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Requirements Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <h2 className="text-xl font-bold">About the Event</h2>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{event.description}</p>
          </div>

          {(event.rules || event.instructions || event.eligibility) && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <h2 className="text-xl font-bold">Rules & Guidelines</h2>
              {event.eligibility && (
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Eligibility:</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{event.eligibility}</p>
                </div>
              )}
              {event.rules && (
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Rules:</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-line">{event.rules}</p>
                </div>
              )}
              {event.instructions && (
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Instructions for Participants:</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-line">{event.instructions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 text-sm">
            <h3 className="font-bold text-base">Event Metadata</h3>
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{event.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Created Date:</span>
                <span>{new Date(event.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Rating:</span>
                <span className="font-semibold text-amber-600">⭐ {event.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="text-xl font-bold">Participant Reviews ({reviews.length})</h2>
        {user && !hasReviewed && (
          <div className="flex items-center gap-2">
            <select className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
            </select>
            <input className="input flex-1" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." />
            <button className="btn" onClick={submitReview} disabled={!comment.trim()}>Post Review</button>
          </div>
        )}

        {user && hasReviewed && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-green-800 dark:text-green-200 text-sm">✅ You have submitted a review for this event.</p>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No reviews yet for this event.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r._id} className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{r.user?.name}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-amber-500 text-sm">{'⭐'.repeat(r.rating)}</div>
                <p className="text-slate-700 dark:text-slate-300 text-sm">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
