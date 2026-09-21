import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [mine, setMine] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Tech');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState(null);
  const [pending, setPending] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloadAction, setDownloadAction] = useState(null);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
  };

  const downloadTicketDirect = async (registration) => {
    try {
      // Create a temporary div to render the ticket
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '980px';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);

      // Render the ticket HTML directly
      const event = registration.event;
      const eventDate = new Date(event?.date);
      const registrationDate = new Date(registration.createdAt);

      tempDiv.innerHTML = `
        <div style="width: 980px; padding: 20px;">
          <div style="display: flex; min-height: 360px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
            <!-- Left main area -->
            <div style="flex: 1; padding: 32px; color: white; background: linear-gradient(135deg, #3730a3, #7c3aed, #3730a3);">
              <!-- Top brand row -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                <div>
                  <div style="font-size: 14px; letter-spacing: 0.1em; color: #f0abfc;">EVENT MANAGER</div>
                  <div style="font-size: 12px; color: #c7d2fe;">Official Event Ticket</div>
                </div>
              </div>
              
              <!-- Event title -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.025em;">${event?.title}</div>
                <div style="color: #67e8f9; font-weight: 600; margin-top: 4px;">${event?.category} EVENT</div>
              </div>
              
              <!-- Big date/time row -->
              <div style="display: flex; align-items: end; gap: 32px; margin-bottom: 24px;">
                <div style="font-size: 30px; font-weight: 800; letter-spacing: 0.025em;">${eventDate.toLocaleDateString('en-GB')}</div>
                <div style="font-size: 30px; font-weight: 800; letter-spacing: 0.025em;">${eventDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <div style="text-transform: uppercase; letter-spacing: 0.1em; color: #67e8f9; margin-bottom: 24px;">${event?.location}</div>
              
              <!-- Barcode -->
              <div style="display: flex; align-items: center;">
                <div style="height: 64px; width: 224px; background: repeating-linear-gradient(90deg, #fff 0, #fff 2px, transparent 2px, transparent 4px); border-radius: 4px;"></div>
              </div>
            </div>
            
            <!-- Perforation divider -->
            <div style="width: 2px; background: rgba(255,255,255,0.4); position: relative;">
              <div style="position: absolute; top: 24px; bottom: 24px; left: 0; right: 0; border-left: 2px dashed rgba(255,255,255,0.7);"></div>
            </div>
            
            <!-- Right stub -->
            <div style="width: 256px; padding: 24px; color: white; background: linear-gradient(to bottom, #312e81, #1e40af); display: flex; flex-direction: column;">
              <!-- Vertical date/time -->
              <div style="color: #67e8f9; font-size: 16px; font-weight: 700; margin-bottom: 20px; writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 2px; text-shadow: 0 0 10px rgba(103, 232, 249, 0.5);">
                ${eventDate.getDate().toString().padStart(2, '0')} ${(eventDate.getMonth() + 1).toString().padStart(2, '0')} ${eventDate.getFullYear()} • ${eventDate.getHours().toString().padStart(2, '0')} ${eventDate.getMinutes().toString().padStart(2, '0')}
              </div>
              
              <!-- QR -->
              <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 16px; text-align: center;">
                <div style="color: #c7d2fe; font-size: 14px; margin-bottom: 8px;">ENTRY QR</div>
                ${registration.qrCodeDataUrl ? `<img src="${registration.qrCodeDataUrl}" alt="QR" style="margin: 0 auto; width: 144px; height: 144px; border-radius: 6px; background: white; padding: 4px;" />` : ''}
              </div>
              
              <!-- Footer small -->
              <div style="margin-top: auto; text-align: center; font-size: 10px; color: rgba(199, 210, 254, 0.8);">
                <div style="font-weight: 600;">EventManager</div>
                <div>© 2025 All rights reserved</div>
                <div style="opacity: 0.7;">www.eventmanager.com</div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        padding: 20
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = margin;
      const y = margin + (contentHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      const fileName = `${event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`;
      pdf.save(fileName);
      
      // Clean up
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const [myRegs, setMyRegs] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [organizerTab, setOrganizerTab] = useState('all');

  useEffect(() => {
    if (!user) return;
    loadMyRegs();
    if (user.role === 'organizer') loadMyEvents();
    if (user.role === 'admin') {
      loadPending();
      loadOrganizers();
    }
  }, [user]);

  async function loadMyRegs() {
    try {
      const res = await axios.get('/api/registrations/me');
      setMyRegs(res.data.registrations || []);
    } catch (_) {}
  }

  async function loadMyEvents() {
    try {
      const res = await axios.get('/api/events', { params: { organizer: user.id } });
      setMine(res.data.events || []);
    } catch (_) {}
  }

  async function loadPending() {
    try {
      const res = await axios.get('/api/events', { params: { status: 'pending' } });
      setPending(res.data.events || []);
    } catch (_) {}
  }

  async function loadOrganizers() {
    try {
      const res = await axios.get('/api/admin/organizers');
      setOrganizers(res.data.organizers || []);
    } catch (_) {}
  }

  async function handleUpdateOrganizerStatus(id, status) {
    try {
      await axios.patch(`/api/admin/organizers/${id}/status`, { status });
      showToast('success', `Organizer status updated to ${status}.`);
      await loadOrganizers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update status');
    }
  }

  async function loadParticipants(eventId) {
    try {
      const res = await axios.get(`/api/registrations/${eventId}/participants`);
      setParticipants(res.data.participants || []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load participants');
    }
  }

  async function exportCsv(eventId) {
    try {
      const check = await axios.get(`/api/registrations/${eventId}/participants`);
      const list = check.data.participants || [];
      if (!Array.isArray(list) || list.length === 0) {
        showToast('error', 'No participants available for this event.');
        return;
      }
    } catch (e) {
      showToast('error', 'Unable to fetch participants. Please try again.');
      return;
    }

    const res = await axios.get(`/api/registrations/${eventId}/participants.csv`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = `participants-${eventId}.csv`; a.click();
    window.URL.revokeObjectURL(url);
  }

  async function createEvent(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('date', date);
      fd.append('location', location);
      fd.append('category', category);
      fd.append('description', description);
      if (poster) fd.append('poster', poster);
      await axios.post('/api/events', fd);
      showToast('success', 'Event created successfully!');
      setTitle(''); setDate(''); setLocation(''); setDescription(''); setPoster(null);
      await loadMyEvents();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create event');
    }
  }

  async function approve(id) { await axios.post(`/api/admin/events/${id}/approve`); await loadPending(); showToast('success', 'Event approved.'); }
  async function reject(id) { await axios.post(`/api/admin/events/${id}/reject`); await loadPending(); showToast('info', 'Event rejected.'); }

  const analytics = useMemo(() => {
    const byStatus = mine.reduce((acc,e)=>{ acc[e.status]=(acc[e.status]||0)+1; return acc; },{});
    const byCategory = mine.reduce((acc,e)=>{ acc[e.category]=(acc[e.category]||0)+1; return acc; },{});
    return { byStatus, byCategory };
  }, [mine]);

  const isOrganizerApproved = user?.role === 'organizer' && (user?.organizerStatus === 'approved' || user?.status === 'approved');
  const isOrganizerPending = user?.role === 'organizer' && (user?.organizerStatus === 'pending' || user?.status === 'pending');
  const isOrganizerDeclined = user?.role === 'organizer' && (user?.organizerStatus === 'declined' || user?.status === 'declined');

  return (
    <div className="space-y-4">
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white shadow-lg ${toast.type==='error'?'bg-red-600':toast.type==='success'?'bg-green-600':'bg-blue-600'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <span>{user?.name} ({user?.role}{user?.role === 'organizer' ? ` - ${user?.organizerStatus || user?.status}` : ''})</span>
          <button className="underline" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Organizer Status Banners */}
      {isOrganizerPending && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 text-amber-800 dark:text-amber-200">
          <div className="font-semibold text-base">⏳ Organizer Account Pending Approval</div>
          <p className="text-sm mt-1">
            Your organizer account is pending approval by an admin. Once approved, you can create and manage events.
            In the meantime, you can browse and participate in available events below!
          </p>
        </div>
      )}

      {isOrganizerDeclined && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 p-4 text-rose-800 dark:text-rose-200">
          <div className="font-semibold text-base">❌ Organizer Request Declined</div>
          <p className="text-sm mt-1">
            Your organizer application was declined by an administrator. Organizer access is restricted, but you can continue participating in events as an attendee.
          </p>
        </div>
      )}

      {/* My Registrations Section (Visible to both Participants and Organizers) */}
      {(user?.role === 'customer' || user?.role === 'organizer') && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 w-full">
          <h2 className="font-semibold text-lg mb-3">My Registered Events (As Participant)</h2>
          {myRegs.length === 0 ? (
            <div className="text-sm text-slate-500 italic p-6 text-center border rounded-xl w-full dark:border-slate-800">
              No registrations found yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRegs.map((r) => (
                <div key={r._id} className="p-4 border rounded-xl hover:shadow-md transition-shadow dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-lg">{r.event?.title}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {r.event?.date ? new Date(r.event.date).toLocaleDateString() : 'N/A'} • {r.event?.location}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        Status: <span className={`font-semibold capitalize ${r.status === 'registered' ? 'text-green-600' : 'text-yellow-600'}`}>{r.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {r.qrCodeDataUrl && (
                        <img src={r.qrCodeDataUrl} className="h-16 w-16 border rounded-lg" alt="QR Code" />
                      )}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedTicket(r)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          View Ticket
                        </button>
                        <button
                          onClick={() => downloadTicketDirect(r)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          📥 Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Organizer Tools Section (Only for APPROVED organizers) */}
      {isOrganizerApproved && (
        <div className="grid md:grid-cols-2 gap-4 w-full mt-4">
          <form onSubmit={createEvent} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
            <h2 className="font-semibold text-lg">Create Event</h2>
            <div className="space-y-1">
              <label className="text-sm text-slate-600 dark:text-slate-300">Title</label>
              <input className="input w-full" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-600 dark:text-slate-300">Date & Time</label>
              <input className="input w-full" type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-600 dark:text-slate-300">Location / Venue</label>
              <input className="input w-full" placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-600 dark:text-slate-300">Category</label>
              <select className="input w-full" value={category} onChange={(e)=>setCategory(e.target.value)}>
                <option>Technology</option><option>Sports</option><option>Cultural</option><option>Workshop</option><option>Business</option><option>Music</option><option>Entertainment</option><option>Education</option><option>Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-600 dark:text-slate-300">Description</label>
              <textarea className="input w-full min-h-[100px]" rows="4" placeholder="Describe the event in detail" value={description} onChange={(e)=>setDescription(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-600 dark:text-slate-300">Poster Image</label>
              <input className="input w-full" type="file" onChange={(e)=>setPoster(e.target.files[0])} />
            </div>
            <div className="flex justify-end">
              <button className="btn">Publish Event</button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <h2 className="font-semibold text-lg mb-2">My Events Analytics</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium mb-1 text-slate-600 dark:text-slate-400">By Status</div>
                  <ul className="space-y-1">{Object.entries(analytics.byStatus).map(([k,v])=> <li key={k} className="flex justify-between"><span>{k}</span><span className="font-semibold">{v}</span></li>)}</ul>
                </div>
                <div>
                  <div className="font-medium mb-1 text-slate-600 dark:text-slate-400">By Category</div>
                  <ul className="space-y-1">{Object.entries(analytics.byCategory).map(([k,v])=> <li key={k} className="flex justify-between"><span>{k}</span><span className="font-semibold">{v}</span></li>)}</ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <h2 className="font-semibold text-lg mb-2">Organized Events ({mine.length})</h2>
              {mine.length === 0 ? (
                <div className="text-sm text-slate-500 italic p-4 text-center border rounded-xl">No events created yet.</div>
              ) : (
                <ul className="space-y-2">
                  {mine.map((e) => (
                    <li key={e._id} className="p-3 border rounded-xl grid grid-cols-12 gap-3 items-center dark:border-slate-800">
                      <div className="col-span-8">
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Status: <span className="font-medium">{e.status}</span> • Registered Participants: <span className="font-bold text-blue-600 dark:text-blue-400">{e.participantCount ?? e.registrations ?? 0}</span>
                        </div>
                      </div>
                      <div className="col-span-4 justify-self-end flex flex-col gap-1 items-end">
                        <button className="btn-outline px-2 py-1 text-xs" onClick={()=>{setSelectedEvent(e._id);loadParticipants(e._id);}}>Participants ({e.participantCount ?? e.registrations ?? 0})</button>
                        <button className="btn px-2 py-1 text-xs" onClick={()=>exportCsv(e._id)}>CSV Export</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedEvent && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">Registered Participants ({participants.length})</h2>
                  <button className="text-xs text-slate-500 underline" onClick={()=>setSelectedEvent('')}>Close</button>
                </div>
                {participants.length === 0 ? (
                  <div className="text-sm text-slate-500 italic p-4 text-center border rounded-lg">No participants registered for this event yet.</div>
                ) : (
                  <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
                    {participants.map(a => (
                      <li key={a._id} className="flex items-center justify-between p-2 border rounded-lg dark:border-slate-800">
                        <div>
                          <div className="font-medium">{a.user?.name}</div>
                          <div className="text-xs text-slate-500">{a.user?.email} ({a.user?.role})</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">{a.status}</span>
                          <div className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD MANAGEMENT SECTION */}
      {user?.role === 'admin' && (
        <div className="space-y-6 w-full mt-4">
          {/* Organizers Management Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 w-full space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-lg">Organizer Approval Management</h2>
              <div className="flex gap-2 text-xs">
                {['all', 'pending', 'approved', 'declined'].map(t => (
                  <button
                    key={t}
                    onClick={() => setOrganizerTab(t)}
                    className={`px-3 py-1 rounded-full border capitalize font-medium ${organizerTab === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}
                  >
                    {t} ({organizers.filter(o => t === 'all' || (o.organizerStatus || o.status) === t).length})
                  </button>
                ))}
              </div>
            </div>

            {organizers.filter(o => organizerTab === 'all' || (o.organizerStatus || o.status) === organizerTab).length === 0 ? (
              <div className="text-sm text-slate-500 italic p-6 text-center border rounded-xl dark:border-slate-800">
                No organizers found for filter "{organizerTab}".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Registered Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {organizers
                      .filter(o => organizerTab === 'all' || (o.organizerStatus || o.status) === organizerTab)
                      .map(o => {
                        const currentStatus = o.organizerStatus || o.status || 'pending';
                        return (
                          <tr key={o._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 font-medium">{o.name}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{o.email}</td>
                            <td className="p-3">
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${
                                currentStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                currentStatus === 'declined' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300' :
                                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
                              }`}>
                                {currentStatus}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 text-right space-x-2">
                              {currentStatus !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateOrganizerStatus(o._id, 'approved')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-medium"
                                >
                                  Approve
                                </button>
                              )}
                              {currentStatus !== 'declined' && (
                                <button
                                  onClick={() => handleUpdateOrganizerStatus(o._id, 'declined')}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-xs font-medium"
                                >
                                  Decline
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Events Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 w-full space-y-3">
            <h2 className="font-semibold text-lg">Pending Events Approval ({pending.length})</h2>
            {pending.length === 0 ? (
              <div className="text-sm text-slate-500 italic p-4 text-center border rounded-xl dark:border-slate-800">No pending events requiring approval.</div>
            ) : (
              <ul className="space-y-2">
                {pending.map((e) => (
                  <li key={e._id} className="p-3 border rounded-xl grid grid-cols-12 gap-3 items-center dark:border-slate-800">
                    <div className="col-span-8">
                      <div className="font-medium">{e.title}</div>
                      <div className="text-sm text-slate-500">Organizer: {e.organizer?.name} ({e.organizer?.email})</div>
                    </div>
                    <div className="col-span-4 justify-self-end flex gap-2">
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-medium" onClick={()=>approve(e._id)}>Approve Event</button>
                      <button className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-xs font-medium" onClick={()=>reject(e._id)}>Reject Event</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Event Ticket</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadAction && downloadAction()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    📥 Download Ticket
                  </button>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>
              <EventTicket 
                registration={selectedTicket} 
                user={user}
                onReady={(fn) => setDownloadAction(() => fn)}
                onDownload={() => {
                  // Optional: Show success message or close modal
                  console.log('Ticket downloaded successfully');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
