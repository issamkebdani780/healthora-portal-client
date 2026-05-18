import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ doctor, onClose }) => {
  const navigate = useNavigate();
  // Get next 7 days for date picker
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState('');
  
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError('');
      try {
        const slotsRes = await appointmentService.getAvailableSlots(doctor.id, selectedDate);
        setSlots(slotsRes || []);
      } catch (err) {
        setSlots([]); // Some APIs return 404 for no slots
      } finally {
        setLoadingSlots(false);
      }
    };
    if (doctor && selectedDate) {
      fetchSlots();
    }
  }, [doctor, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Must be logged in to book
      navigate('/login');
      return;
    }

    setBookingInProgress(true);
    setError('');
    try {
      await appointmentService.bookAppointment(doctor.id, selectedDate, selectedSlot, note);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setBookingInProgress(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-600 mb-6">Your appointment with Dr. {doctor.lastname} has been successfully scheduled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Book Appointment</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Snippet */}
        <div className="px-6 py-4 bg-slate-50 flex items-center gap-4">
          <img 
            src={doctor.img_url || `https://ui-avatars.com/api/?name=${doctor.firstname}+${doctor.lastname}&background=0284c7&color=fff`} 
            alt="Doctor" 
            className="w-14 h-14 rounded-2xl object-cover shadow-sm"
          />
          <div>
            <h3 className="font-bold text-slate-900">Dr. {doctor.firstname} {doctor.lastname}</h3>
            <p className="text-sm text-primary-600 font-medium">{doctor.specialities || 'Specialist'}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Date Selection */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <Calendar className="w-4 h-4 text-primary-500" />
              Select Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {dates.map(date => {
                const isSelected = selectedDate === date;
                const d = new Date(date);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = d.getDate();
                return (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-600/20' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-primary-100' : 'text-slate-500'}`}>{dayName}</span>
                    <span className="text-xl font-bold">{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Selection */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <Clock className="w-4 h-4 text-primary-500" />
              Available Time
            </label>
            {loadingSlots ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      selectedSlot === slot
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <p className="text-sm text-slate-500">No available slots on this date.</p>
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <FileText className="w-4 h-4 text-primary-500" />
              Note (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for visit or any symptoms..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none bg-slate-50/50"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            disabled={!selectedSlot || bookingInProgress}
            onClick={handleBook}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-600/20 transition-all"
          >
            {bookingInProgress ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingModal;
