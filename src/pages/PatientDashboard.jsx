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
  Users
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
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 xl:w-72 bg-white border-r border-gray-100 shadow-sm z-50 flex-shrink-0 justify-between">
        <div>
          {/* Logo brand aligning with frontEnd */}
          <div className="h-16 xl:h-20 flex items-center gap-3 px-6 border-b border-gray-100 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25 flex-shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-gray-900 leading-none">MedeliRDV</h1>
              <p className="text-[10px] text-gray-400 font-medium mt-1">Espace Patient</p>
            </div>
          </div>

          {/* Navigation Links aligning with frontEnd */}
          <nav className="flex-1 p-3 space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-1">
              Navigation
            </p>
            
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150
                ${activeTab === 'appointments' 
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Calendar className={`w-4.5 h-4.5 flex-shrink-0 ${activeTab === 'appointments' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-1 text-left">Rendez-vous</span>
              {activeTab === 'appointments' && <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150
                ${activeTab === 'search' 
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Plus className={`w-4.5 h-4.5 flex-shrink-0 ${activeTab === 'search' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-1 text-left">Nouveau RDV</span>
              {activeTab === 'search' && <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('prescriptions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150
                ${activeTab === 'prescriptions' 
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <FileText className={`w-4.5 h-4.5 flex-shrink-0 ${activeTab === 'prescriptions' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-1 text-left">Ordonnances</span>
              {prescriptions.length > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'prescriptions' ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600'}`}>
                  {prescriptions.length}
                </span>
              )}
              {activeTab === 'prescriptions' && <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />}
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150
                ${activeTab === 'profile' 
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <User className={`w-4.5 h-4.5 flex-shrink-0 ${activeTab === 'profile' ? 'text-white' : 'text-gray-400'}`} />
              <span className="flex-1 text-left">Mon Profil</span>
              {activeTab === 'profile' && <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />}
            </button>
          </nav>
        </div>

        {/* Patient Profile Card at bottom aligning with frontEnd */}
        {patientInfo && (
          <div className="p-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow">
                  {patientInfo.firstname[0]}{patientInfo.lastname[0]}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">
                  {patientInfo.firstname} {patientInfo.lastname}
                </p>
                <p className="text-[11px] text-gray-400 truncate">#PAT-{patientInfo.id}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 font-bold text-xs transition-all duration-150"
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
        <header className="sticky top-0 z-30 h-16 xl:h-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm flex items-center justify-between px-6 lg:px-10">
          
          {/* Header Title (aligning with page) */}
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-900 leading-none">
              {activeTab === 'appointments' && 'Gestion des Rendez-vous'}
              {activeTab === 'search' && 'Trouver un Praticien'}
              {activeTab === 'prescriptions' && 'Mes Ordonnances Médicales'}
              {activeTab === 'profile' && 'Mon Profil Personnel'}
            </h2>
            <p className="text-[11px] text-gray-400 font-medium mt-1.5 hidden sm:block">
              {activeTab === 'appointments' && 'Planification et historique de vos consultations'}
              {activeTab === 'search' && 'Rechercher des médecins par wilaya et spécialité'}
              {activeTab === 'prescriptions' && 'Vos documents officiels et prescriptions'}
              {activeTab === 'profile' && 'Consulter et gérer vos informations personnelles'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Date badge aligned with doctor dashboard */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-100 rounded-2xl">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-sky-700">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>

            {/* Quick Consultation CTA */}
            {activeTab !== 'search' && (
              <button 
                onClick={() => setActiveTab('search')}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-2.5 px-4.5 rounded-xl shadow-md shadow-sky-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-xs"
              >
                <Plus className="w-4 h-4" />
                Nouveau RDV
              </button>
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
              {/* ─── APPOINTMENTS WORKSPACE ─── */}
              {activeTab === 'appointments' && (
                <div className="space-y-8">
                  
                  {/* Grid Layout for Featured Next Appointment Focus */}
                  <div className="grid grid-cols-1 gap-6">
                    
                    {/* Featured Appointment Display (Consolidated Gradient Card matching frontEnd Theme) */}
                    <div className="w-full">
                      {nextAppointment ? (
                        <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl p-6.5 text-white shadow-lg shadow-sky-500/20 border border-sky-400/20 h-full flex flex-col justify-between">
                          {/* Ambient glow decoration */}
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                          
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider mb-5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Prochain Rendez-vous
                            </span>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg">
                                  <Stethoscope className="w-7 h-7" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-black text-white">Dr. {nextAppointment.doctor_first_name || nextAppointment.doctor?.firstname || nextAppointment.doctor_firstname || ''} {nextAppointment.doctor_last_name || nextAppointment.doctor?.lastname || nextAppointment.doctor_lastname || ''}</h3>
                                  <p className="text-white/80 font-semibold text-sm mt-0.5">{nextAppointment.specialty || nextAppointment.doctor?.specialities || nextAppointment.speciality_name || 'Médecine Générale'}</p>
                                </div>
                              </div>

                              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-3 py-1.5 shrink-0 self-start sm:self-center">
                                {getStatusBadge(nextAppointment.status)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-white/15 mt-4">
                            <div className="flex items-center gap-2.5">
                              <Calendar className="w-4.5 h-4.5 text-white/80 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Date</p>
                                <p className="text-xs font-bold text-white mt-0.5">{new Date(nextAppointment.appointment_date).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Clock className="w-4.5 h-4.5 text-white/80 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Créneau Horaire</p>
                                <p className="text-xs font-bold text-white mt-0.5">{nextAppointment.start_time} - {nextAppointment.end_time || '30 min'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm flex flex-col items-center justify-center min-h-[260px]">
                          <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center mb-3">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-extrabold text-gray-900 mb-1">Aucun rendez-vous à venir</h3>
                          <p className="text-gray-400 text-xs max-w-sm mb-4">Restez à l'écoute de votre santé! Planifiez une consultation avec un médecin spécialiste dès aujourd'hui.</p>
                          <button 
                            onClick={() => setActiveTab('search')}
                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md shadow-sky-500/25 transition-all"
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
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">RDV Programmés</p>
                        <p className="text-xl font-black text-gray-900 mt-0.5">{upcomingAppointments.length}</p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">RDV Terminés</p>
                        <p className="text-xl font-black text-gray-900 mt-0.5">
                          {appointments.filter(a => {
                            const s = a.status ? a.status.toLowerCase() : '';
                            return s === 'completed' || s === 'passé' || s === 'passe';
                          }).length}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ordonnances Actives</p>
                        <p className="text-xl font-black text-gray-900 mt-0.5">{prescriptions.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* General Appointments Catalog list (History & Schedule) */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-extrabold text-gray-900 mb-5 pb-3 border-b border-gray-50">Registre Complet des Consultations</h3>

                    {appointments.length === 0 ? (
                      <p className="text-gray-400 text-xs text-center py-8">Aucune consultation enregistrée.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professionnel</th>
                              <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Heure</th>
                              <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                              <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {appointments.map((apt, idx) => (
                              <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-3.5 pr-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors shrink-0">
                                      <Stethoscope className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900 text-sm">Dr. {apt.doctor_first_name || apt.doctor?.firstname || apt.doctor_firstname || ''} {apt.doctor_last_name || apt.doctor?.lastname || apt.doctor_lastname || ''}</p>
                                      <p className="text-[10px] text-gray-400 font-semibold">{apt.specialty || apt.doctor?.specialities || apt.speciality_name || 'Médecine Générale'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-2">
                                  <p className="font-bold text-gray-800 text-sm">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{apt.start_time}</p>
                                </td>
                                <td className="py-3.5 px-2">
                                  <span className="text-[11px] text-gray-500 font-semibold">Consultation Standard</span>
                                </td>
                                <td className="py-3.5 pl-4">
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
                <div className="space-y-6">
                  
                  {/* Filter Search Inputs bar */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 relative z-30 items-center">
                    
                    {/* Search by Name */}
                    <div className="w-full md:flex-1 relative flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-sky-200 transition-colors">
                      <SearchIcon className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Nom du médecin ou condition..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="bg-transparent w-full outline-none text-gray-800 placeholder-gray-400 font-medium text-xs"
                      />
                    </div>

                    {/* Custom Speciality Dropdown */}
                    <div 
                      ref={specialityDropdownRef}
                      className="w-full md:flex-1 relative flex items-center bg-gray-50 rounded-xl px-4 py-2.5 cursor-pointer select-none border border-transparent hover:border-gray-200 transition-colors"
                      onClick={() => setIsSpecialityDropdownOpen(!isSpecialityDropdownOpen)}
                    >
                      <Stethoscope className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className={`font-semibold text-xs ${selectedSpecialities.length > 0 ? 'text-gray-900' : 'text-gray-400'} truncate mr-2`}>
                          {selectedSpecialities.length > 0 ? specialities.find(s => s.id === selectedSpecialities[0])?.name || 'Toutes Spécialités' : 'Toutes Spécialités'}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${isSpecialityDropdownOpen ? 'rotate-90' : ''}`} />
                      </div>

                      {/* Speciality Dropdown Menu */}
                      {isSpecialityDropdownOpen && (
                        <div 
                          className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden z-[60]"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <div className="p-2 border-b border-gray-100 bg-gray-50">
                            <input 
                              type="text" 
                              placeholder="Rechercher spécialité..."
                              value={specialitySearchQuery}
                              onChange={(e) => setSpecialitySearchQuery(e.target.value)}
                              className="w-full bg-white text-xs text-gray-900 px-3 py-2 rounded-lg outline-none border border-gray-200 focus:border-sky-500 transition-all"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
                            <div 
                              className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${selectedSpecialities.length === 0 ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50'}`}
                              onClick={() => { setSelectedSpecialities([]); setIsSpecialityDropdownOpen(false); setSpecialitySearchQuery(''); }}
                            >
                              Toutes Spécialités
                            </div>
                            {filteredSpecialities.map(spec => (
                              <div 
                                key={spec.id}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${selectedSpecialities.includes(spec.id) ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50'}`}
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
                      className="w-full md:flex-1 relative flex items-center bg-gray-50 rounded-xl px-4 py-2.5 cursor-pointer select-none border border-transparent hover:border-gray-200 transition-colors"
                      onClick={() => setIsWilayaDropdownOpen(!isWilayaDropdownOpen)}
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className={`font-semibold text-xs ${wilayaId ? 'text-gray-900' : 'text-gray-400'} truncate mr-2`}>
                          {wilayaId ? wilayas.find(w => w.id == wilayaId)?.name || 'Toutes Wilayas' : 'Toutes Wilayas'}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${isWilayaDropdownOpen ? 'rotate-90' : ''}`} />
                      </div>

                      {/* Dropdown Menu */}
                      {isWilayaDropdownOpen && (
                        <div 
                          className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden z-[60]"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <div className="p-2 border-b border-gray-100 bg-gray-50">
                            <input 
                              type="text" 
                              placeholder="Rechercher wilaya..."
                              value={wilayaSearchQuery}
                              onChange={(e) => setWilayaSearchQuery(e.target.value)}
                              className="w-full bg-white text-xs text-gray-900 px-3 py-2 rounded-lg outline-none border border-gray-200 focus:border-sky-500 transition-all"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
                            <div 
                              className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${!wilayaId ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50'}`}
                              onClick={() => { setWilayaId(''); setIsWilayaDropdownOpen(false); setWilayaSearchQuery(''); }}
                            >
                              Toutes Wilayas
                            </div>
                            {filteredWilayas.map(w => (
                              <div 
                                key={w.id}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${wilayaId == w.id ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50'}`}
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
                      className="w-full md:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-sky-500/20 text-xs min-w-[100px]"
                    >
                      {searchLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Rechercher'}
                    </button>
                  </div>

                  {/* Search Results Catalog Grid */}
                  <div className="flex flex-col xl:flex-row gap-6 items-start relative z-10">
                    
                    {/* Doctors Cards Container List */}
                    <div className="flex-grow w-full space-y-4">
                      {searchError && (
                        <div className="p-3.5 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold">
                          {searchError}
                        </div>
                      )}
                      
                      {searchLoading && doctors.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
                          <Loader2 className="w-8 h-8 animate-spin mb-3 text-sky-500" />
                          <p className="text-xs font-bold">Recherche de praticiens...</p>
                        </div>
                      )}

                      {!searchLoading && doctors.length === 0 && !searchError && (
                        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
                          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <SearchIcon className="w-7 h-7 text-gray-300" />
                          </div>
                          <h3 className="text-base font-extrabold text-gray-800 mb-1">Aucun médecin trouvé</h3>
                          <p className="text-gray-400 text-xs">Veuillez modifier vos filtres ou élargir la zone de recherche.</p>
                        </div>
                      )}

                      {doctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                          <div className="flex gap-4 items-center">
                            {/* Doctor Profile Picture */}
                            <div className="relative shrink-0">
                              <img 
                                src={doctor.img_url || `https://ui-avatars.com/api/?name=${doctor.firstname}+${doctor.lastname}&background=0284c7&color=fff`} 
                                alt={`Dr. ${doctor.lastname}`} 
                                className="w-16 h-16 rounded-xl object-cover border border-gray-100" 
                              />
                              <div className="absolute -bottom-1 -right-1 bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-white flex items-center gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                Disponible
                              </div>
                            </div>

                            {/* Doctor Identity Metadata */}
                            <div>
                              <h3 className="font-extrabold text-gray-900 text-base">Dr. {doctor.firstname} {doctor.lastname}</h3>
                              <p className="text-sky-600 font-bold text-xs mt-0.5">{doctor.specialities || 'Spécialiste'}</p>
                              
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mt-2.5 font-semibold">
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3.5 h-3.5 text-gray-300" />
                                  {doctor.commune_name || 'Commune'}, {doctor.wilaya_name || 'Wilaya'}
                                </span>
                                {doctor.rating !== undefined && (
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className="text-gray-700 font-bold">{doctor.rating}</span>
                                    <span>({doctor.reviews_count || 0})</span>
                                  </span>
                                )}
                                {doctor.price && (
                                  <span className="bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">
                                    {doctor.price} DZD
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick booking slots action */}
                          <div className="w-full sm:w-auto flex flex-col gap-2 pt-3.5 sm:pt-0 sm:pl-5 sm:border-l border-gray-100 shrink-0 self-stretch sm:self-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 bg-sky-50 text-sky-700 border border-sky-100/50 py-1.5 px-3 rounded-lg text-center flex items-center gap-1.5 justify-center">
                              <Calendar className="w-3.5 h-3.5" />
                              Disponible
                            </span>
                            <button 
                              onClick={() => setSelectedDoctorForBooking(doctor)}
                              className="bg-slate-900 hover:bg-sky-600 text-white font-bold py-2 px-4.5 rounded-xl text-xs transition-colors shadow-sm"
                            >
                              Réserver
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Discovery trusted platform side information panel */}
                    <div className="w-full xl:w-72 shrink-0 space-y-4">
                      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-gray-50">
                          <h4 className="font-extrabold text-gray-900 text-sm tracking-tight">Pourquoi MedeliRDV ?</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-800 text-xs">Médecins Agréés</h5>
                              <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Tous nos praticiens font l'objet d'une validation rigoureuse de leur diplôme.</p>
                            </div>
                          </div>

                          <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <Clock className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-800 text-xs">Prise de RDV en Ligne</h5>
                              <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Prenez rendez-vous directement en ligne, 24h/24 et 7j/7 sans attendre.</p>
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
                <div className="space-y-6">
                  
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Aucun document pharmaceutique</h3>
                      <p className="text-gray-400 text-xs max-w-sm">Lorsque votre médecin traitant émet une ordonnance, elle s'affichera instantanément ici en toute sécurité.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {prescriptions.map((rx) => (
                        <div key={rx.id} className="bg-white border border-gray-100 rounded-2xl p-5.5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                          
                          <div>
                            <div className="flex justify-between items-start gap-3 pb-3.5 border-b border-gray-100 mb-4">
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 text-sky-600 text-[9px] font-bold uppercase tracking-wider mb-1.5 border border-sky-100">
                                  Document Officiel
                                </span>
                                <h3 className="font-extrabold text-gray-900 text-base">Dr. {rx.doctor_firstname} {rx.doctor_lastname}</h3>
                                <p className="text-[10px] text-gray-400 font-semibold">{rx.speciality_name || 'Médecin Spécialiste'}</p>
                              </div>

                              {rx.file_url && (
                                <a 
                                  href={rx.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all shrink-0"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  PDF
                                </a>
                              )}
                            </div>

                            {/* Prescribed Drugs details */}
                            {rx.medicaments && rx.medicaments.length > 0 ? (
                              <div className="space-y-2.5">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Médicaments prescrits</p>
                                <div className="space-y-2">
                                  {rx.medicaments.map((med, index) => (
                                    <div key={index} className="p-3 bg-gray-50/75 rounded-xl border border-gray-100 flex justify-between items-center gap-3">
                                      <div>
                                        <h4 className="font-bold text-gray-800 text-xs">{med.name}</h4>
                                        <p className="text-[9px] text-gray-400 font-semibold mt-0.5">
                                          Freq: {med.frequency} • Dur: {med.duration}
                                        </p>
                                      </div>
                                      <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-gray-100 text-gray-600 rounded-lg shrink-0">
                                        Dosage: {med.dosage}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Aucune information détaillée de médicament.</p>
                            )}
                          </div>

                          <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                            <span>Dossier #MED-RX-{rx.id}</span>
                            <span>Émis le: {new Date(rx.created_at).toLocaleDateString("fr-FR", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Mon Profil Personnel ─── */}
              {activeTab === 'profile' && (
                <div className="max-w-3xl space-y-6">
                  
                  {patientInfo ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6.5 shadow-sm relative overflow-hidden">
                      {/* Ambient background decoration */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0 border border-white/20">
                            {patientInfo.firstname[0]}{patientInfo.lastname[0]}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{patientInfo.firstname} {patientInfo.lastname}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider border border-emerald-100">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Compte Vérifié
                              </span>
                              <span className="text-xs text-gray-400 font-semibold">Réf Patient: #PAT-{patientInfo.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                        <div className="p-3.5 bg-gray-50/75 rounded-xl border border-gray-100 flex gap-3.5 items-start">
                          <div className="w-9 h-9 bg-white border border-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            <Phone className="w-4.5 h-4.5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Numéro de Téléphone</p>
                            <p className="font-extrabold text-gray-800 text-sm mt-0.5">{patientInfo.phone}</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-gray-50/75 rounded-xl border border-gray-100 flex gap-3.5 items-start">
                          <div className="w-9 h-9 bg-white border border-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            <Calendar className="w-4.5 h-4.5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date de Naissance</p>
                            <p className="font-extrabold text-gray-800 text-sm mt-0.5">
                              {patientInfo.birthdate ? new Date(patientInfo.birthdate).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' }) : 'Non fournie'}
                            </p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-gray-50/75 rounded-xl border border-gray-100 flex gap-3.5 items-start">
                          <div className="w-9 h-9 bg-white border border-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            <User className="w-4.5 h-4.5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Genre Biologique</p>
                            <p className="font-extrabold text-gray-800 text-sm mt-0.5 capitalize">{patientInfo.gender || 'Non spécifié'}</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-gray-50/75 rounded-xl border border-gray-100 flex gap-3.5 items-start">
                          <div className="w-9 h-9 bg-white border border-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            <MapPin className="w-4.5 h-4.5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lieu de Résidence</p>
                            <p className="font-extrabold text-gray-800 text-sm mt-0.5">
                              {patientInfo.commune_name || patientInfo.address || 'Non spécifié'}
                              {(patientInfo.commune_name && patientInfo.wilaya_name) && `, ${patientInfo.wilaya_name}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">Impossible de charger le profil.</p>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ─── MOBILE BOTTOM TAB BAR (Matching frontEnd layout) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center px-1 py-1 safe-area-inset-bottom">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 min-h-[56px]
              ${activeTab === 'appointments' ? "text-sky-600" : "text-gray-400"}`}
          >
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
              ${activeTab === 'appointments' ? "bg-sky-500/10" : ""}`}>
              <Calendar className={`w-5 h-5 transition-all duration-200 ${activeTab === 'appointments' ? "text-sky-500 scale-110" : "text-gray-400"}`} />
            </div>
            <span className={`text-[10px] font-semibold tracking-tight transition-all duration-200 ${activeTab === 'appointments' ? "text-sky-600" : "text-gray-400"}`}>
              Rendez-vous
            </span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 min-h-[56px]
              ${activeTab === 'search' ? "text-sky-600" : "text-gray-400"}`}
          >
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
              ${activeTab === 'search' ? "bg-sky-500/10" : ""}`}>
              <Plus className={`w-5 h-5 transition-all duration-200 ${activeTab === 'search' ? "text-sky-500 scale-110" : "text-gray-400"}`} />
            </div>
            <span className={`text-[10px] font-semibold tracking-tight transition-all duration-200 ${activeTab === 'search' ? "text-sky-600" : "text-gray-400"}`}>
              Nouveau RDV
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 min-h-[56px]
              ${activeTab === 'prescriptions' ? "text-sky-600" : "text-gray-400"}`}
          >
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
              ${activeTab === 'prescriptions' ? "bg-sky-500/10" : ""}`}>
              <FileText className={`w-5 h-5 transition-all duration-200 ${activeTab === 'prescriptions' ? "text-sky-500 scale-110" : "text-gray-400"}`} />
              {prescriptions.length > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sky-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                  {prescriptions.length}
                </div>
              )}
            </div>
            <span className={`text-[10px] font-semibold tracking-tight transition-all duration-200 ${activeTab === 'prescriptions' ? "text-sky-600" : "text-gray-400"}`}>
              Ordonnances
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 min-h-[56px]
              ${activeTab === 'profile' ? "text-sky-600" : "text-gray-400"}`}
          >
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
              ${activeTab === 'profile' ? "bg-sky-500/10" : ""}`}>
              <User className={`w-5 h-5 transition-all duration-200 ${activeTab === 'profile' ? "text-sky-500 scale-110" : "text-gray-400"}`} />
            </div>
            <span className={`text-[10px] font-semibold tracking-tight transition-all duration-200 ${activeTab === 'profile' ? "text-sky-600" : "text-gray-400"}`}>
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
