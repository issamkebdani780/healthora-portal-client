import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, MapPin, Star, Calendar, Loader2, ChevronDown, Stethoscope, ShieldCheck, Clock, Users } from 'lucide-react';
import { discoveryService } from '../services/discoveryService';
import { locationService } from '../services/locationService';
import BookingModal from '../components/BookingModal';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [wilayaId, setWilayaId] = useState('');
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isWilayaDropdownOpen, setIsWilayaDropdownOpen] = useState(false);
  const [isSpecialityDropdownOpen, setIsSpecialityDropdownOpen] = useState(false);
  
  const [wilayaSearchQuery, setWilayaSearchQuery] = useState('');
  const [specialitySearchQuery, setSpecialitySearchQuery] = useState('');
  
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  
  const wilayaDropdownRef = useRef(null);
  const specialityDropdownRef = useRef(null);

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

  // Fetch doctors, specialities, and wilayas on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorsRes, specsRes, wilayasRes] = await Promise.all([
          discoveryService.searchDoctors(),
          discoveryService.getSpecialities(),
          locationService.getWilayas()
        ]);
        setDoctors(doctorsRes);
        setSpecialities(specsRes);
        setWilayas(wilayasRes);
      } catch (err) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Re-run search when specialities change
  useEffect(() => {
    handleSearch();
  }, [selectedSpecialities]);

  const handleSearch = async () => {
    if (!specialities.length && loading) return; 
    setLoading(true);
    setError('');
    try {
      const params = { query: searchQuery };
      if (wilayaId) params.wilayaId = wilayaId;
      if (selectedSpecialities.length > 0) {
        params.specialityId = selectedSpecialities[0];
      }
      
      const res = await discoveryService.searchDoctors(params);
      setDoctors(res);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredWilayas = wilayas.filter(w => 
    w.name.toLowerCase().includes(wilayaSearchQuery.toLowerCase()) || 
    w.id.toString().includes(wilayaSearchQuery)
  );

  const filteredSpecialities = specialities.filter(s => 
    s.name.toLowerCase().includes(specialitySearchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search Bar */}
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Find and book the right doctor
          </h1>
          
          <div className="bg-white rounded-[2rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row gap-3 relative z-50 items-center">
            
            {/* Search by Name */}
            <div className="w-full lg:flex-1 relative flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary-200 transition-colors">
              <SearchIcon className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Doctor name or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent w-full outline-none text-slate-900 placeholder-slate-400 font-medium"
              />
            </div>

            {/* Custom Speciality Dropdown */}
            <div 
              ref={specialityDropdownRef}
              className="w-full lg:flex-1 relative flex items-center bg-slate-50 rounded-xl px-4 py-3 cursor-pointer select-none border border-transparent hover:border-slate-200 transition-colors"
              onClick={() => setIsSpecialityDropdownOpen(!isSpecialityDropdownOpen)}
            >
              <Stethoscope className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className={`font-medium ${selectedSpecialities.length > 0 ? 'text-slate-900' : 'text-slate-400'} truncate mr-2`}>
                  {selectedSpecialities.length > 0 ? specialities.find(s => s.id === selectedSpecialities[0])?.name || 'All Specialties' : 'All Specialties'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isSpecialityDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Speciality Dropdown Menu */}
              {isSpecialityDropdownOpen && (
                <div 
                  className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-[60]"
                  onClick={(e) => e.stopPropagation()} 
                >
                  <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                    <input 
                      type="text" 
                      placeholder="Search specialty..."
                      value={specialitySearchQuery}
                      onChange={(e) => setSpecialitySearchQuery(e.target.value)}
                      className="w-full bg-white text-sm text-slate-900 px-3 py-2 rounded-lg outline-none border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                    <div 
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${selectedSpecialities.length === 0 ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => { setSelectedSpecialities([]); setIsSpecialityDropdownOpen(false); setSpecialitySearchQuery(''); }}
                    >
                      All Specialties
                    </div>
                    {filteredSpecialities.map(spec => (
                      <div 
                        key={spec.id}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${selectedSpecialities.includes(spec.id) ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        onClick={() => { setSelectedSpecialities([spec.id]); setIsSpecialityDropdownOpen(false); setSpecialitySearchQuery(''); }}
                      >
                        {spec.name}
                      </div>
                    ))}
                    {filteredSpecialities.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-400 text-center font-medium">
                        No specialties found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Location Dropdown */}
            <div 
              ref={wilayaDropdownRef}
              className="w-full lg:flex-1 relative flex items-center bg-slate-50 rounded-xl px-4 py-3 cursor-pointer select-none border border-transparent hover:border-slate-200 transition-colors"
              onClick={() => setIsWilayaDropdownOpen(!isWilayaDropdownOpen)}
            >
              <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className={`font-medium ${wilayaId ? 'text-slate-900' : 'text-slate-400'} truncate mr-2`}>
                  {wilayaId ? wilayas.find(w => w.id == wilayaId)?.name || 'All Wilayas' : 'All Wilayas'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isWilayaDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isWilayaDropdownOpen && (
                <div 
                  className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-[60]"
                  onClick={(e) => e.stopPropagation()} 
                >
                  <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                    <input 
                      type="text" 
                      placeholder="Search wilaya..."
                      value={wilayaSearchQuery}
                      onChange={(e) => setWilayaSearchQuery(e.target.value)}
                      className="w-full bg-white text-sm text-slate-900 px-3 py-2 rounded-lg outline-none border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                    <div 
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${!wilayaId ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => { setWilayaId(''); setIsWilayaDropdownOpen(false); setWilayaSearchQuery(''); }}
                    >
                      All Wilayas
                    </div>
                    {filteredWilayas.map(w => (
                      <div 
                        key={w.id}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${wilayaId == w.id ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        onClick={() => { setWilayaId(w.id); setIsWilayaDropdownOpen(false); setWilayaSearchQuery(''); }}
                      >
                        {w.id} - {w.name}
                      </div>
                    ))}
                    {filteredWilayas.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-400 text-center font-medium">
                        No wilayas found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <button 
              onClick={handleSearch}
              className="w-full lg:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md shadow-primary-600/20 flex items-center justify-center min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Stats Sidebar */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
              <div className="mb-8 border-b border-slate-100 pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 tracking-widest uppercase mb-3 shadow-sm border border-emerald-100">
                  <ShieldCheck className="w-3 h-3" />
                  Trusted Platform
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Why book with MedeliRDV?
                </h3>
              </div>

              <div className="space-y-6">
                
                <div className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">Verified Doctors</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Every doctor profile is authenticated and verified by our medical board.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-600 transition-colors">Real-time Booking</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Book instantly without making a single phone call, 24/7 access.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-purple-600 transition-colors">1M+ Patients</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Join thousands of patients managing their health digitally.</p>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 rounded-2xl p-4 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Need help?</p>
                  <span className="text-sm font-bold text-primary-600">Contact Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="flex-1 space-y-4">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}
            
            {loading && doctors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
                <p>Loading doctors...</p>
              </div>
            )}

            {!loading && doctors.length === 0 && !error && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No doctors found</h3>
                <p className="text-slate-500">Try adjusting your search criteria or location.</p>
              </div>
            )}

            {doctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                
                {/* Doctor Avatar */}
                <div className="relative shrink-0">
                  <img 
                    src={doctor.img_url || `https://ui-avatars.com/api/?name=${doctor.firstname}+${doctor.lastname}&background=0284c7&color=fff`} 
                    alt={`Dr. ${doctor.lastname}`} 
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm" 
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-white flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Available
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Dr. {doctor.firstname} {doctor.lastname}</h3>
                  <p className="text-primary-600 font-medium text-sm mb-3">
                    {doctor.specialities || 'Specialist'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {doctor.commune_name || 'Commune'}, {doctor.wilaya_name || 'Wilaya'}
                    </div>
                    {doctor.rating !== undefined && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-700">{doctor.rating}</span>
                        <span>({doctor.reviews_count || 0} reviews)</span>
                      </div>
                    )}
                    {doctor.price && (
                      <div className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {doctor.price} DZD
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Action */}
                <div className="w-full sm:w-auto flex flex-col gap-3 sm:items-end border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-6 sm:border-l border-slate-100 shrink-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100/50 w-full justify-center">
                    <Calendar className="w-4 h-4" />
                    Next: {doctor.next_slots && doctor.next_slots.length > 0 ? new Date(doctor.next_slots[0]).toLocaleDateString() : 'Available'}
                  </div>
                  <button 
                    onClick={() => setSelectedDoctorForBooking(doctor)}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
                  >
                    Book Appointment
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
      
      {selectedDoctorForBooking && (
        <BookingModal 
          doctor={selectedDoctorForBooking} 
          onClose={() => setSelectedDoctorForBooking(null)} 
        />
      )}
    </div>
  );
};

export default Search;
