import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Activity, 
  ChevronRight, 
  User, 
  Stethoscope, 
  Loader2, 
  Download, 
  Phone, 
  MapPin, 
  Award, 
  Plus, 
  LogOut, 
  Heart, 
  ArrowRight, 
  ShieldCheck, 
  Droplet, 
  Scale,
  Search as SearchIcon,
  Star,
  Users,
  Pencil,
  Save,
  X as XIcon
} from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
import { authService } from '../services/authService';
import { discoveryService } from '../services/discoveryService';
import { locationService } from '../services/locationService';
import BookingModal from '../components/BookingModal';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Data states
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  
  // Search state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [wilayaId, setWilayaId] = useState('');
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  
  const [isWilayaDropdownOpen, setIsWilayaDropdownOpen] = useState(false);
  const [isSpecialityDropdownOpen, setIsSpecialityDropdownOpen] = useState(false);
  const [wilayaSearchQuery, setWilayaSearchQuery] = useState('');
  const [specialitySearchQuery, setSpecialitySearchQuery] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  
  const wilayaDropdownRef = useRef(null);
  const specialityDropdownRef = useRef(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');

  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [communes, setCommunes] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wilayaDropdownRef.current && !wilayaDropdownRef.current.contains(event.target)) {
        setIsWilayaDropdownOpen(false);
      }
      if (specialityDropdownRef.current && !specialityDropdownRef.current.contains(event.target)) {
        setIsSpecialityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load patient info from localStorage as an immediate fallback/initial state
    const storedPatient = localStorage.getItem('patient');
    if (storedPatient) {
      try {
        setPatientInfo(JSON.parse(storedPatient));
      } catch (e) {
        console.error('Error parsing patient data:', e);
      }
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Parallel requests to load appointments, prescriptions, profile, specialities, wilayas, and default doctors
        const [aptsRes, rxRes, profileRes, specsRes, wilayasRes, doctorsRes] = await Promise.all([
          appointmentService.getMyAppointments().catch(() => []),
          appointmentService.getPatientPrescriptions().catch(() => []),
          authService.getProfile().catch(err => {
            console.warn('Failed to fetch backend profile, falling back to localStorage:', err);
            const stored = localStorage.getItem('patient');
            return stored ? JSON.parse(stored) : null;
          }),
          discoveryService.getSpecialities().catch(() => []),
          locationService.getWilayas().catch(() => []),
          discoveryService.searchDoctors().catch(() => [])
        ]);
        setAppointments(aptsRes || []);
        setPrescriptions(rxRes || []);
        if (profileRes) {
          setPatientInfo(profileRes);
        }
        setSpecialities(specsRes || []);
        setWilayas(wilayasRes || []);
        setDoctors(doctorsRes || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  // Re-run search when specialities, wilayaId, or search query changes
  const handleSearch = async () => {
    setSearchLoading(true);
    setSearchError('');
    try {
      const params = { query: searchQuery };
      if (wilayaId) params.wilayaId = wilayaId;
      if (selectedSpecialities.length > 0) {
        params.specialityId = selectedSpecialities[0];
      }
      
      const res = await discoveryService.searchDoctors(params);
      setDoctors(res || []);
    } catch (err) {
      setSearchError(err.message || 'Search failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'search') {
      handleSearch();
    }
  }, [selectedSpecialities, wilayaId, activeTab]);

  const handleBookingClose = async () => {
    setSelectedDoctorForBooking(null);
    setActiveTab('appointments');
    // Refresh appointments list on close
    try {
      setLoading(true);
      const aptsRes = await appointmentService.getMyAppointments();
      setAppointments(aptsRes || []);
    } catch (e) {
      console.error('Failed to refresh appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    setEditForm({
      firstname: patientInfo.firstname || '',
      lastname: patientInfo.lastname || '',
      birthdate: patientInfo.birthdate ? patientInfo.birthdate.split('T')[0] : '',
      gender: patientInfo.gender || 'male',
      wilaya_id: patientInfo.wilaya_id || '',
      commun_id: patientInfo.commun_id || '',
      address: patientInfo.address || '',
    });
    setCommunes([]);
    setEditError('');
    setEditSuccess('');
    setIsEditingProfile(true);
    // Pre-load communes if wilaya is set
    if (patientInfo.wilaya_id) {
      locationService.getCommunes(patientInfo.wilaya_id).then(setCommunes).catch(() => {});
    }
  };

  const handleEditWilayaChange = async (e) => {
    const val = e.target.value;
    setEditForm(f => ({ ...f, wilaya_id: val, commun_id: '' }));
    setCommunes([]);
    if (val) {
      try {
        const c = await locationService.getCommunes(val);
        setCommunes(c || []);
      } catch {}
    }
  };

  const handleSaveProfile = async () => {
    setEditSaving(true);
    setEditError('');
    setEditSuccess('');
    try {
      const updated = await authService.updateProfile(editForm);
      setPatientInfo(updated);
      setEditSuccess('Profil mis à jour avec succès !');
      setTimeout(() => {
        setIsEditingProfile(false);
        setEditSuccess('');
      }, 1500);
    } catch (err) {
      setEditError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setEditSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    switch(s) {
      case 'confirmed':
      case 'confirme':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Confirmé
          </span>
        );
      case 'pending':
      case 'en attente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            En attente
          </span>
        );
      case 'cancelled':
      case 'annule':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Annulé
          </span>
        );
      case 'completed':
      case 'completed_visit':
      case 'passé':
      case 'passe':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold border border-sky-100">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Complété
          </span>
        );
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold border border-gray-100 capitalize">{status}</span>;
    }
  };

  const upcomingAppointments = appointments.filter(a => {
    const s = a.status ? a.status.toLowerCase() : '';
    return s === 'confirmed' || s === 'pending' || s === 'confirme' || s === 'en attente';
  });

  const pastAppointments = appointments.filter(a => {
    const s = a.status ? a.status.toLowerCase() : '';
    return s === 'completed' || s === 'cancelled' || s === 'passé' || s === 'passe' || s === 'annule';
  });

  // Next upcoming visit to focus on
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  const filteredWilayas = wilayas.filter(w => 
    w.name.toLowerCase().includes(wilayaSearchQuery.toLowerCase()) || 
    w.id.toString().includes(wilayaSearchQuery)
  );

  const filteredSpecialities = specialities.filter(s => 
    s.name.toLowerCase().includes(specialitySearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 xl:w-72 bg-white/80 backdrop-blur-xl border-r border-slate-100/80 shadow-sm z-50 flex-shrink-0 justify-between">
        <div>
          {/* Logo brand aligning with frontEnd */}
          <div className="h-16 xl:h-20 flex items-center gap-3 px-6 border-b border-slate-100/80 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0 animate-pulse" style={{ animationDuration: '4s' }}>
              <Heart className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">MedeliRDV</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Espace Patient</p>
            </div>
          </div>

          {/* Navigation Links aligning with frontEnd */}
          <nav className="flex-1 p-4 space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1.5">
              Navigation
            </p>
            
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer
                ${activeTab === 'appointments' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-900'}`}
            >
              <Calendar className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${activeTab === 'appointments' ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1 text-left">Rendez-vous</span>
              {activeTab === 'appointments' && <div className="w-1.5 h-1.5 bg-white rounded-full shadow" />}
            </button>

            <button 
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer
                ${activeTab === 'search' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-900'}`}
            >
              <Plus className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${activeTab === 'search' ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1 text-left">Nouveau RDV</span>
              {activeTab === 'search' && <div className="w-1.5 h-1.5 bg-white rounded-full shadow" />}
            </button>

            <button 
              onClick={() => setActiveTab('prescriptions')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer
                ${activeTab === 'prescriptions' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-900'}`}
            >
              <FileText className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${activeTab === 'prescriptions' ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1 text-left">Ordonnances</span>
              {prescriptions.length > 0 && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-all ${activeTab === 'prescriptions' ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-600'}`}>
                  {prescriptions.length}
                </span>
              )}
              {activeTab === 'prescriptions' && <div className="w-1.5 h-1.5 bg-white rounded-full shadow" />}
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer
                ${activeTab === 'profile' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-md shadow-primary-500/20 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-900'}`}
            >
              <User className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1 text-left">Mon Profil</span>
              {activeTab === 'profile' && <div className="w-1.5 h-1.5 bg-white rounded-full shadow" />}
            </button>
          </nav>
        </div>

        {/* Patient Profile Card at bottom aligning with frontEnd */}
        {patientInfo && (
          <div className="p-4 border-t border-slate-100/80 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-slate-200/85 transition-colors">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                  {patientInfo.firstname[0]}{patientInfo.lastname[0]}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {patientInfo.firstname} {patientInfo.lastname}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 truncate">#PAT-{patientInfo.id}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-100/80 font-bold text-xs cursor-pointer transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Se déconnecter
            </button>
          </div>
        )}
      </aside>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-grow flex flex-col min-w-0 lg:ml-64 xl:ml-72 pb-20 lg:pb-0">
        
        {/* ─── DYNAMIC TOP BAR HEADER (Matching frontEnd style) ─── */}
        <header className="sticky top-0 z-30 h-16 xl:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-10">
          
          {/* Header Left: Logo + Title */}
          <div className="flex items-center gap-3">
            {/* Stethoscope Logo (visible on mobile, hidden on desktop where sidebar has it) */}
            <div className="lg:hidden w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                {activeTab === 'appointments' && 'Rendez-vous'}
                {activeTab === 'search' && 'Nouveau RDV'}
                {activeTab === 'prescriptions' && 'Ordonnances'}
                {activeTab === 'profile' && 'Mon Profil'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "short", day: "numeric", month: "short",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Date badge */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-primary-50/60 border border-primary-100/80 rounded-2xl">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-primary-700">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>

          

            {/* Patient Avatar (mobile) */}
            {patientInfo && (
              <div className="lg:hidden relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                  {patientInfo.firstname?.[0]}{patientInfo.lastname?.[0]}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
            )}
          </div>
        </header>

        {/* ─── DYNAMIC WORKSPACE PANEL ─── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 h-full">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-4" />
              <p className="text-gray-400 font-bold text-sm">Chargement des données...</p>
            </div>
          ) : (
            <>
              {activeTab === 'appointments' && (
                <div className="space-y-8 animate-fade-in-up">
                  
                  {/* Grid Layout for Featured Next Appointment Focus */}
                  <div className="grid grid-cols-1 gap-6">
                    
                    {/* Featured Appointment Display (Consolidated Gradient Card matching frontEnd Theme) */}
                    <div className="w-full">
                      {nextAppointment ? (
                        <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary-500/10 border border-white/10 flex flex-col sm:flex-row items-stretch justify-between gap-6 hover:shadow-2xl hover:shadow-primary-500/15 transition-all duration-300">
                          {/* Ambient glow decoration */}
                          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                          
                          {/* Left ticket cutout */}
                          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 z-10 border-r border-slate-100/30"></div>
                          {/* Right ticket cutout */}
                          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full -translate-y-1/2 z-10 border-l border-slate-100/30"></div>
                          
                          {/* Doctor Info (Left Block) */}
                          <div className="flex-grow flex flex-col justify-between relative z-10 pl-2">
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-extrabold uppercase tracking-wider mb-5 border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Prochain Rendez-vous
                              </span>

                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg">
                                  <Stethoscope className="w-7 h-7" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-extrabold text-white">Dr. {nextAppointment.doctor_first_name || nextAppointment.doctor?.firstname || nextAppointment.doctor_firstname || ''} {nextAppointment.doctor_last_name || nextAppointment.doctor?.lastname || nextAppointment.doctor_lastname || ''}</h3>
                                  <p className="text-white/80 font-bold text-sm mt-0.5">{nextAppointment.specialty || nextAppointment.doctor?.specialities || nextAppointment.speciality_name || 'Médecine Générale'}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex items-center gap-3">
                              <span className="text-xs text-white/70 font-bold">Statut:</span>
                              <div>
                                {getStatusBadge(nextAppointment.status)}
                              </div>
                            </div>
                          </div>

                          {/* Dashed Divider Line (Middle) */}
                          <div className="hidden sm:block border-l-2 border-dashed border-white/20 my-2 self-stretch"></div>
                          <div className="sm:hidden border-t border-dashed border-white/20 my-1 w-full"></div>

                          {/* Date and Time (Right Block) */}
                          <div className="flex-grow flex flex-col justify-center sm:pl-6 relative z-10 gap-5">
                            <div className="flex items-center gap-3.5">
                              <div className="w-9.5 h-9.5 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                                <Calendar className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">Date du RDV</p>
                                <p className="text-sm font-bold text-white mt-0.5">
                                  {new Date(nextAppointment.appointment_date).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3.5">
                              <div className="w-9.5 h-9.5 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                                <Clock className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">Créneau Horaire</p>
                                <p className="text-sm font-bold text-white mt-0.5">{nextAppointment.start_time} - {nextAppointment.end_time || '30 min'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-100/80 rounded-3xl p-8 text-center shadow-sm flex flex-col items-center justify-center min-h-[260px] hover-lift">
                          <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <Calendar className="w-7 h-7" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1.5">Aucun rendez-vous à venir</h3>
                          <p className="text-slate-400 text-xs max-w-sm mb-5 leading-relaxed">Restez à l'écoute de votre santé ! Planifiez une consultation avec un médecin spécialiste dès aujourd'hui.</p>
                          <button 
                            onClick={() => setActiveTab('search')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-primary-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                          >
                            Trouver un médecin
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vitals Summary Indicators Grid Cards aligning with frontEnd */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white border border-slate-100/80 rounded-2xl p-5.5 shadow-sm flex items-center gap-4 hover-lift">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 shadow-inner">
                        <Calendar className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">RDV Programmés</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{upcomingAppointments.length}</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100/80 rounded-2xl p-5.5 shadow-sm flex items-center gap-4 hover-lift">
                      <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center shrink-0 shadow-inner">
                        <CheckCircle2 className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">RDV Terminés</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                          {appointments.filter(a => {
                            const s = a.status ? a.status.toLowerCase() : '';
                            return s === 'completed' || s === 'passé' || s === 'passe';
                          }).length}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100/80 rounded-2xl p-5.5 shadow-sm flex items-center gap-4 hover-lift">
                      <div className="w-12 h-12 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center shrink-0 shadow-inner">
                        <FileText className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Ordonnances Actives</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{prescriptions.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* General Appointments Catalog list (History & Schedule) */}
                  <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-5 pb-3 border-b border-slate-50 uppercase tracking-wider">Registre Complet des Consultations</h3>

                    {appointments.length === 0 ? (
                      <p className="text-slate-400 text-xs text-center py-8">Aucune consultation enregistrée.</p>
                    ) : (
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100/80">
                              <th className="pb-3 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Praticien</th>
                              <th className="pb-3 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Date & Heure</th>
                              <th className="pb-3 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Type</th>
                              <th className="pb-3 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {appointments.map((apt, idx) => (
                              <tr key={idx} className="group hover:bg-slate-50/40 transition-colors duration-150">
                                <td className="py-4 px-2 pr-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors shrink-0 shadow-inner">
                                      <Stethoscope className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-sm">Dr. {apt.doctor_first_name || apt.doctor?.firstname || apt.doctor_firstname || ''} {apt.doctor_last_name || apt.doctor?.lastname || apt.doctor_lastname || ''}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{apt.specialty || apt.doctor?.specialities || apt.speciality_name || 'Médecine Générale'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-2">
                                  <p className="font-bold text-slate-800 text-sm">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{apt.start_time}</p>
                                </td>
                                <td className="py-4 px-2">
                                  <span className="text-[11px] text-slate-500 font-bold">Consultation Standard</span>
                                </td>
                                <td className="py-4 px-2">
                                  {getStatusBadge(apt.status)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── DYNAMIC DIRECT SEARCH WORKSPACE (TAB NEW RDV) ─── */}
              {activeTab === 'search' && (
                <div className="space-y-6 animate-fade-in-up">
                  
                  {/* Filter Search Inputs bar */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-md border border-slate-100/80 flex flex-col md:flex-row gap-3 relative z-30 items-center">
                    
                    {/* Search by Name */}
                    <div className="w-full md:flex-1 relative flex items-center bg-slate-50/70 border border-slate-100 rounded-xl px-4 py-3 focus-within:bg-white focus-within:border-primary-300 transition-all duration-200">
                      <SearchIcon className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Nom du médecin ou condition..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="bg-transparent w-full outline-none text-slate-800 placeholder-slate-400 font-bold text-xs"
                      />
                    </div>

                    {/* Custom Speciality Dropdown */}
                    <div 
                      ref={specialityDropdownRef}
                      className="w-full md:flex-1 relative flex items-center bg-slate-50/70 border border-slate-100 rounded-xl px-4 py-3 cursor-pointer select-none hover:bg-white hover:border-slate-200 transition-all duration-200"
                      onClick={() => setIsSpecialityDropdownOpen(!isSpecialityDropdownOpen)}
                    >
                      <Stethoscope className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className={`font-bold text-xs ${selectedSpecialities.length > 0 ? 'text-slate-900 font-extrabold' : 'text-slate-400'} truncate mr-2`}>
                          {selectedSpecialities.length > 0 ? specialities.find(s => s.id === selectedSpecialities[0])?.name || 'Toutes Spécialités' : 'Toutes Spécialités'}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isSpecialityDropdownOpen ? 'rotate-90 text-primary-500' : ''}`} />
                      </div>

                      {/* Speciality Dropdown Menu */}
                      {isSpecialityDropdownOpen && (
                        <div 
                          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100/80 overflow-hidden z-[60] animate-scale-in"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <div className="p-2 border-b border-slate-100/80 bg-slate-50/60">
                            <input 
                              type="text" 
                              placeholder="Rechercher spécialité..."
                              value={specialitySearchQuery}
                              onChange={(e) => setSpecialitySearchQuery(e.target.value)}
                              className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-lg outline-none border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
                            <div 
                              className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${selectedSpecialities.length === 0 ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50/80'}`}
                              onClick={() => { setSelectedSpecialities([]); setIsSpecialityDropdownOpen(false); setSpecialitySearchQuery(''); }}
                            >
                              Toutes Spécialités
                            </div>
                            {filteredSpecialities.map(spec => (
                              <div 
                                key={spec.id}
                                className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${selectedSpecialities.includes(spec.id) ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50/80'}`}
                                onClick={() => { setSelectedSpecialities([spec.id]); setIsSpecialityDropdownOpen(false); setSpecialitySearchQuery(''); }}
                              >
                                {spec.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Custom Wilaya Dropdown */}
                    <div 
                      ref={wilayaDropdownRef}
                      className="w-full md:flex-1 relative flex items-center bg-slate-50/70 border border-slate-100 rounded-xl px-4 py-3 cursor-pointer select-none hover:bg-white hover:border-slate-200 transition-all duration-200"
                      onClick={() => setIsWilayaDropdownOpen(!isWilayaDropdownOpen)}
                    >
                      <MapPin className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className={`font-bold text-xs ${wilayaId ? 'text-slate-900 font-extrabold' : 'text-slate-400'} truncate mr-2`}>
                          {wilayaId ? wilayas.find(w => w.id == wilayaId)?.name || 'Toutes Wilayas' : 'Toutes Wilayas'}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isWilayaDropdownOpen ? 'rotate-90 text-primary-500' : ''}`} />
                      </div>

                      {/* Dropdown Menu */}
                      {isWilayaDropdownOpen && (
                        <div 
                          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100/80 overflow-hidden z-[60] animate-scale-in"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <div className="p-2 border-b border-slate-100/80 bg-slate-50/60">
                            <input 
                              type="text" 
                              placeholder="Rechercher wilaya..."
                              value={wilayaSearchQuery}
                              onChange={(e) => setWilayaSearchQuery(e.target.value)}
                              className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-lg outline-none border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
                            <div 
                              className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${!wilayaId ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50/80'}`}
                              onClick={() => { setWilayaId(''); setIsWilayaDropdownOpen(false); setWilayaSearchQuery(''); }}
                            >
                              Toutes Wilayas
                            </div>
                            {filteredWilayas.map(w => (
                              <div 
                                key={w.id}
                                className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${wilayaId == w.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50/80'}`}
                                onClick={() => { setWilayaId(w.id); setIsWilayaDropdownOpen(false); setWilayaSearchQuery(''); }}
                              >
                                {w.id} - {w.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Search Trigger Button */}
                    <button 
                      onClick={handleSearch}
                      className="w-full md:w-auto bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary-500/20 text-xs min-w-[100px] cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      {searchLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Rechercher'}
                    </button>
                  </div>

                  {/* Search Results Catalog Grid */}
                  <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10">
                    
                    {/* Doctors Cards Container List */}
                    <div className="flex-grow w-full space-y-4">
                      {searchError && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs font-bold">
                          {searchError}
                        </div>
                      )}
                      
                      {searchLoading && doctors.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100/80">
                          <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary-500" />
                          <p className="text-xs font-bold">Recherche de praticiens...</p>
                        </div>
                      )}

                      {!searchLoading && doctors.length === 0 && !searchError && (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100/80 shadow-sm flex flex-col items-center justify-center">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                            <SearchIcon className="w-7 h-7 text-slate-300" />
                          </div>
                          <h3 className="text-base font-bold text-slate-800 mb-1">Aucun médecin trouvé</h3>
                          <p className="text-slate-400 text-xs leading-relaxed max-w-xs">Veuillez modifier vos filtres ou élargir la zone de recherche.</p>
                        </div>
                      )}

                      {doctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-3xl p-5 border border-slate-100/80 shadow-sm hover-lift flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                          <div className="flex gap-4 items-center">
                            {/* Doctor Profile Picture */}
                            <div className="relative shrink-0 shadow-md rounded-2xl overflow-hidden">
                              <img 
                                src={doctor.img_url || `https://ui-avatars.com/api/?name=${doctor.firstname}+${doctor.lastname}&background=0ea5e9&color=fff`} 
                                alt={`Dr. ${doctor.lastname}`} 
                                className="w-16 h-16 rounded-2xl object-cover border border-slate-100" 
                              />
                              <div className="absolute -bottom-1 -right-1 bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-white flex items-center gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                En ligne
                              </div>
                            </div>

                            {/* Doctor Identity Metadata */}
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-base">Dr. {doctor.firstname} {doctor.lastname}</h3>
                              <p className="text-primary-600 font-bold text-xs mt-0.5">{doctor.specialities || 'Spécialiste'}</p>
                              
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-3.5 font-bold">
                                <span className="flex items-center gap-0.5 text-slate-500">
                                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                  {doctor.commune_name || 'Commune'}, {doctor.wilaya_name || 'Wilaya'}
                                </span>
                                {doctor.rating !== undefined && (
                                  <span className="flex items-center gap-0.5 text-slate-500">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className="text-slate-700 font-extrabold">{doctor.rating}</span>
                                    <span>({doctor.reviews_count || 0})</span>
                                  </span>
                                )}
                                {doctor.price && (
                                  <span className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-extrabold text-xs shadow-inner">
                                    {doctor.price} DZD
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick booking slots action */}
                          <div className="w-full sm:w-auto flex flex-row sm:flex-col gap-3 pt-3.5 sm:pt-0 sm:pl-5 sm:border-l border-slate-100 shrink-0 self-stretch sm:self-center justify-between items-center sm:items-stretch">
                            <span className="text-[10px] font-bold text-primary-700 bg-primary-50/70 border border-primary-100/50 py-1.5 px-3 rounded-lg text-center flex items-center gap-1.5 justify-center">
                              <Calendar className="w-3.5 h-3.5" />
                              Disponible
                            </span>
                            <button 
                              onClick={() => setSelectedDoctorForBooking(doctor)}
                              className="bg-slate-900 hover:bg-primary-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all duration-200 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95"
                            >
                              Réserver
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Discovery trusted platform side information panel */}
                    <div className="w-full xl:w-72 shrink-0 space-y-4">
                      <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-slate-50">
                          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Pourquoi MedeliRDV ?</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-xs">Médecins Agréés</h5>
                              <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Tous nos praticiens font l'objet d'une validation rigoureuse de leur diplôme.</p>
                            </div>
                          </div>

                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
                              <Clock className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-xs">Prise de RDV en Ligne</h5>
                              <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Prenez rendez-vous directement en ligne, 24h/24 et 7j/7 sans attendre.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}

              {/* ─── Mes Ordonnances Médicales ─── */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-6 animate-fade-in-up">
                  
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-100/80 rounded-3xl shadow-sm flex flex-col items-center justify-center hover-lift">
                      <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <FileText className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1.5">Aucun document pharmaceutique</h3>
                      <p className="text-slate-400 text-xs max-w-sm leading-relaxed">Lorsque votre médecin traitant émet une ordonnance, elle s'affichera instantanément ici en toute sécurité.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100/80 rounded-3xl shadow-sm overflow-hidden">
                      {/* List Header */}
                      <div className="px-6 py-4 border-b border-slate-100/80 bg-slate-50/40">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Mes Ordonnances</h3>
                          <span className="text-[10px] font-extrabold text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-lg">{prescriptions.length} document{prescriptions.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* List Items */}
                      <div className="divide-y divide-slate-50">
                        {prescriptions.map((rx, index) => (
                          <div 
                            key={rx.id} 
                            className="group px-6 py-5 hover:bg-slate-50/40 transition-all duration-200 "
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center gap-5">
                              
                              {/* Prescription Icon */}
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100/50 text-primary-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                <FileText className="w-5.5 h-5.5" />
                              </div>

                              {/* Main Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-extrabold text-slate-900 text-sm truncate">Dr. {rx.doctor_firstname} {rx.doctor_lastname}</h4>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-[8px] font-extrabold uppercase tracking-wider border border-primary-100/50 shrink-0">
                                    Ordonnance
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{rx.speciality_name || 'Médecin Traitant'}</p>
                                
                                {/* Medications inline summary */}
                                {rx.medicaments && rx.medicaments.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                    {rx.medicaments.slice(0, 4).map((med, i) => (
                                      <span key={i} className="inline-flex items-center px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                                        {med.name}
                                        {med.dosage && <span className="ml-1 text-slate-400">({med.dosage})</span>}
                                      </span>
                                    ))}
                                    {rx.medicaments.length > 4 && (
                                      <span className="text-[10px] font-extrabold text-primary-500">+{rx.medicaments.length - 4} autres</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Right side: Date + Actions */}
                              <div className="flex items-center gap-4 shrink-0">
                                {/* Date */}
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Émis le</p>
                                  <p className="text-xs font-bold text-slate-700 mt-0.5">{new Date(rx.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                  
                                </div>

                                {/* Download Button */}
                                {rx.file_url && (
                                  <a 
                                    href={rx.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white shadow-md shadow-primary-500/20 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                                    title="Télécharger le PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}

                                
                                
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="max-w-3xl space-y-6 animate-fade-in-up">
                  
                  {patientInfo ? (
                    <div className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                      {/* Ambient background decoration */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>

                      {/* ── Profile Header ── */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-md shrink-0 border border-white/20">
                            {patientInfo.firstname?.[0]}{patientInfo.lastname?.[0]}
                          </div>
                          <div>
                            <h2 className="text-xl font-extrabold text-slate-900">{patientInfo.firstname} {patientInfo.lastname}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-extrabold uppercase tracking-wider border border-emerald-100/80">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Compte Vérifié
                              </span>
                              <span className="text-xs text-slate-400 font-bold uppercase">Réf Patient: #PAT-{patientInfo.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit toggle button */}
                        {!isEditingProfile && (
                          <button
                            onClick={handleEditProfile}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 font-bold text-xs border border-primary-100 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Modifier le profil
                          </button>
                        )}
                      </div>

                      {/* ── READ-ONLY VIEW ── */}
                      {!isEditingProfile && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                          <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100/55 flex gap-3.5 items-start hover:bg-slate-50 transition-colors duration-150">
                            <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                              <Phone className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Numéro de Téléphone</p>
                              <p className="font-extrabold text-slate-800 text-sm mt-1">{patientInfo.phone}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100/55 flex gap-3.5 items-start hover:bg-slate-50 transition-colors duration-150">
                            <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                              <Calendar className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Date de Naissance</p>
                              <p className="font-extrabold text-slate-800 text-sm mt-1">
                                {patientInfo.birthdate ? new Date(patientInfo.birthdate).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' }) : 'Non fournie'}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100/55 flex gap-3.5 items-start hover:bg-slate-50 transition-colors duration-150">
                            <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                              <User className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Genre Biologique</p>
                              <p className="font-extrabold text-slate-800 text-sm mt-1 capitalize">{patientInfo.gender || 'Non spécifié'}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100/55 flex gap-3.5 items-start hover:bg-slate-50 transition-colors duration-150">
                            <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                              <MapPin className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Lieu de Résidence</p>
                              <p className="font-extrabold text-slate-800 text-sm mt-1">
                                {patientInfo.commune_name || patientInfo.address || 'Non spécifié'}
                                {(patientInfo.commune_name && patientInfo.wilaya_name) && `, ${patientInfo.wilaya_name}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── EDIT FORM ── */}
                      {isEditingProfile && (
                        <div className="relative z-10 space-y-5">

                          {/* Feedback banners */}
                          {editError && (
                            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold">
                              <XCircle className="w-4 h-4 shrink-0" />
                              {editError}
                            </div>
                          )}
                          {editSuccess && (
                            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              {editSuccess}
                            </div>
                          )}

                          {/* Name row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Prénom</label>
                              <input
                                type="text"
                                value={editForm.firstname}
                                onChange={e => setEditForm(f => ({ ...f, firstname: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all"
                                placeholder="Prénom"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Nom</label>
                              <input
                                type="text"
                                value={editForm.lastname}
                                onChange={e => setEditForm(f => ({ ...f, lastname: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all"
                                placeholder="Nom"
                              />
                            </div>
                          </div>

                          {/* Birthdate & Gender row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Date de Naissance</label>
                              <input
                                type="date"
                                value={editForm.birthdate}
                                onChange={e => setEditForm(f => ({ ...f, birthdate: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Genre</label>
                              <select
                                value={editForm.gender}
                                onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer"
                              >
                                <option value="male">Masculin</option>
                                <option value="female">Féminin</option>
                              </select>
                            </div>
                          </div>

                          {/* Wilaya & Commune row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Wilaya</label>
                              <select
                                value={editForm.wilaya_id}
                                onChange={handleEditWilayaChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer"
                              >
                                <option value="">Toutes wilayas</option>
                                {wilayas.map(w => (
                                  <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Commune</label>
                              <select
                                value={editForm.commun_id}
                                onChange={e => setEditForm(f => ({ ...f, commun_id: e.target.value }))}
                                disabled={communes.length === 0}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">{communes.length === 0 ? 'Sélectionnez une wilaya' : 'Toutes communes'}</option>
                                {communes.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Adresse</label>
                            <input
                              type="text"
                              value={editForm.address}
                              onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-all"
                              placeholder="Ex: 12 Rue des Martyrs, Alger"
                            />
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                              onClick={() => { setIsEditingProfile(false); setEditError(''); setEditSuccess(''); }}
                              disabled={editSaving}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                              Annuler
                            </button>
                            <button
                              onClick={handleSaveProfile}
                              disabled={editSaving}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {editSaving
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Save className="w-3.5 h-3.5" />
                              }
                              {editSaving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <p className="text-slate-500 font-bold">Impossible de charger le profil.</p>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ─── MOBILE BOTTOM TAB BAR (Matching frontEnd layout) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-slate-100/80 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] rounded-t-3xl">
        <div className="flex items-center px-2 py-1.5 safe-area-inset-bottom justify-around">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all duration-200 active:scale-90 min-h-[52px] cursor-pointer
              ${activeTab === 'appointments' ? "text-primary-600" : "text-slate-400"}`}
          >
            <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
              ${activeTab === 'appointments' ? "bg-primary-50" : ""}`}>
              <Calendar className={`w-5 h-5 transition-all duration-200 ${activeTab === 'appointments' ? "text-primary-500 scale-105" : "text-slate-400"}`} />
            </div>
            <span className={`text-[9px] font-bold tracking-tight transition-all duration-200 ${activeTab === 'appointments' ? "text-primary-600 font-extrabold" : "text-slate-400"}`}>
              Rendez-vous
            </span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all duration-200 active:scale-90 min-h-[52px] cursor-pointer
              ${activeTab === 'search' ? "text-primary-600" : "text-slate-400"}`}
          >
            <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
              ${activeTab === 'search' ? "bg-primary-50" : ""}`}>
              <Plus className={`w-5 h-5 transition-all duration-200 ${activeTab === 'search' ? "text-primary-500 scale-105" : "text-slate-400"}`} />
            </div>
            <span className={`text-[9px] font-bold tracking-tight transition-all duration-200 ${activeTab === 'search' ? "text-primary-600 font-extrabold" : "text-slate-400"}`}>
              Nouveau RDV
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all duration-200 active:scale-90 min-h-[52px] cursor-pointer
              ${activeTab === 'prescriptions' ? "text-primary-600" : "text-slate-400"}`}
          >
            <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
              ${activeTab === 'prescriptions' ? "bg-primary-50" : ""}`}>
              <FileText className={`w-5 h-5 transition-all duration-200 ${activeTab === 'prescriptions' ? "text-primary-500 scale-105" : "text-slate-400"}`} />
              {prescriptions.length > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-extrabold shadow-sm">
                  {prescriptions.length}
                </div>
              )}
            </div>
            <span className={`text-[9px] font-bold tracking-tight transition-all duration-200 ${activeTab === 'prescriptions' ? "text-primary-600 font-extrabold" : "text-slate-400"}`}>
              Ordonnances
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all duration-200 active:scale-90 min-h-[52px] cursor-pointer
              ${activeTab === 'profile' ? "text-primary-600" : "text-slate-400"}`}
          >
            <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
              ${activeTab === 'profile' ? "bg-primary-50" : ""}`}>
              <User className={`w-5 h-5 transition-all duration-200 ${activeTab === 'profile' ? "text-primary-500 scale-105" : "text-slate-400"}`} />
            </div>
            <span className={`text-[9px] font-bold tracking-tight transition-all duration-200 ${activeTab === 'profile' ? "text-primary-600 font-extrabold" : "text-slate-400"}`}>
              Profil
            </span>
          </button>
        </div>
      </nav>

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal 
          doctor={selectedDoctorForBooking} 
          onClose={handleBookingClose} 
        />
      )}
    </div>
  );
};

export default PatientDashboard;
