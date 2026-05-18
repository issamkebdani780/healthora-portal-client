import { Search, Calendar, Star, Shield, ArrowRight, Heart, Smartphone, FileText, Clock, UserCog, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-200/50 blur-3xl opacity-50"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-secondary-200/50 blur-3xl opacity-50"></div>
          <div className="absolute -bottom-20 right-20 w-80 h-80 rounded-full bg-accent-200/50 blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-8 border border-primary-100">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
            Your health, prioritized
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            Find the right doctor & <br className="hidden md:block" />
            <span className="text-gradient">book in minutes.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Access thousands of certified medical professionals. View real-time availability and manage all your healthcare needs from one intuitive dashboard.
          </p>

          {/* Search Bar - Hero */}
          <div className="max-w-3xl mx-auto glass rounded-2xl p-3 shadow-xl flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 border border-slate-100">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Condition, procedure, doctor..." 
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 border border-slate-100">
              <Calendar className="w-5 h-5 text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="City, neighborhood, zip..." 
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <Link 
              to="/search" 
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl px-8 py-3 transition-colors flex items-center justify-center whitespace-nowrap shadow-md shadow-primary-600/20"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-secondary-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 font-bold text-xs uppercase tracking-widest mb-4">
              Everything You Need
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Your Complete Healthcare Hub</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Manage your entire medical journey from one secure, easy-to-use platform.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Search */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Doctor Search</h3>
              <p className="text-slate-600 leading-relaxed">
                Find the perfect specialist by filtering through locations (Wilaya/Commune), specialties, and patient reviews.
              </p>
            </div>

            {/* Feature 2: Booking */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-secondary-100 text-secondary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Online Booking</h3>
              <p className="text-slate-600 leading-relaxed">
                View real-time doctor availability and secure your appointment slot instantly without any phone calls.
              </p>
            </div>

            {/* Feature 3: Dashboard */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-accent-100 text-accent-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Appointment Dashboard</h3>
              <p className="text-slate-600 leading-relaxed">
                Track your upcoming visits, review past appointments, and easily reschedule or cancel if your plans change.
              </p>
            </div>

            {/* Feature 4: Prescriptions */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Digital Prescriptions</h3>
              <p className="text-slate-600 leading-relaxed">
                Access your medical prescriptions (ordonnances) directly from your portal. Download or print them anytime.
              </p>
            </div>

            {/* Feature 5: Profile */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <UserCog className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Medical Profile</h3>
              <p className="text-slate-600 leading-relaxed">
                Keep your personal demographics and medical history up-to-date for your doctors to provide better care.
              </p>
            </div>

            {/* Feature 6: Notifications */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Status Updates</h3>
              <p className="text-slate-600 leading-relaxed">
                Receive instant updates when doctors accept, modify, or complete your appointment requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Your journey to better health in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-accent-200 -z-10"></div>
            
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-primary-50 flex items-center justify-center mb-6 shadow-xl shadow-primary-100/50 relative z-10">
                <Search className="w-10 h-10 text-primary-500" />
                <div className="absolute top-0 right-0 translate-x-2 -translate-y-1 w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center border-4 border-white">1</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Search for a Doctor</h3>
              <p className="text-slate-600">Filter by specialty, location, or availability to find the perfect match for your needs.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-secondary-50 flex items-center justify-center mb-6 shadow-xl shadow-secondary-100/50 relative z-10">
                <Calendar className="w-10 h-10 text-secondary-500" />
                <div className="absolute top-0 right-0 translate-x-2 -translate-y-1 w-8 h-8 rounded-full bg-secondary-600 text-white font-bold flex items-center justify-center border-4 border-white">2</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Book an Appointment</h3>
              <p className="text-slate-600">Choose a time slot that works for you and confirm your booking instantly online.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-accent-50 flex items-center justify-center mb-6 shadow-xl shadow-accent-100/50 relative z-10">
                <Heart className="w-10 h-10 text-accent-500" />
                <div className="absolute top-0 right-0 translate-x-2 -translate-y-1 w-8 h-8 rounded-full bg-accent-600 text-white font-bold flex items-center justify-center border-4 border-white">3</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Get Quality Care</h3>
              <p className="text-slate-600">Attend your appointment with peace of mind. Manage all your health records securely in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Testimonials Section */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600 tracking-widest uppercase mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
              TRUST & RESULTS
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 max-w-3xl leading-tight tracking-tight">
              Building the future of healthcare <br className="hidden md:block"/> together.
            </h2>

            {/* Floating Stats Card */}
            <div className="w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 mb-20 border border-slate-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-slate-100">
                <div className="px-4 text-center">
                  <div className="text-4xl md:text-[2.75rem] font-extrabold text-slate-900 mb-3 tracking-tight">10k+</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">VERIFIED DOCTORS</div>
                </div>
                <div className="px-4 text-center">
                  <div className="text-4xl md:text-[2.75rem] font-extrabold text-slate-900 mb-3 tracking-tight">2M+</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ACTIVE PATIENTS</div>
                </div>
                <div className="px-4 text-center">
                  <div className="text-4xl md:text-[2.75rem] font-extrabold text-slate-900 mb-3 tracking-tight">5M+</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">APPOINTMENTS</div>
                </div>
                <div className="px-4 text-center">
                  <div className="text-4xl md:text-[2.75rem] font-extrabold text-slate-900 mb-3 tracking-tight">98%</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">SATISFACTION RATE</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-8 leading-relaxed">"I was able to find a specialist near me within minutes. The booking process was incredibly smooth and I didn't have to wait on hold for hours."</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">SM</div>
                <div>
                  <h4 className="font-bold text-slate-900">Sarah M.</h4>
                  <p className="text-sm text-slate-500">Verified Patient</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-8 leading-relaxed">"Having all my medical records in one secure place is a game changer. The doctors I visit through the platform can access my history instantly."</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold">JD</div>
                <div>
                  <h4 className="font-bold text-slate-900">James D.</h4>
                  <p className="text-sm text-slate-500">Verified Patient</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex text-amber-400 mb-6">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 italic mb-8 leading-relaxed">"The reminders are so helpful. I used to forget my appointments all the time, but MedeliRDV keeps me on track with my health checkups."</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold">EP</div>
                <div>
                  <h4 className="font-bold text-slate-900">Emily P.</h4>
                  <p className="text-sm text-slate-500">Verified Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Promo Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-200/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-primary-700 font-medium text-sm mb-6 border border-primary-100 shadow-sm">
                <Smartphone className="w-4 h-4 text-primary-600" />
                Available on iOS & Android
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                Take your healthcare <br />
                <span className="text-gradient">everywhere you go.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Download the MedeliRDV mobile app to manage your appointments, receive instant notifications, and access your digital medical records right from your pocket.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#" className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.84 1.5.05 2.78.8 3.59 2.05-3.01 1.6-2.58 5.76.25 6.95-.73 1.83-1.63 3.32-2.42 4.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] font-semibold leading-none opacity-80 mb-0.5">Download on the</div>
                    <div className="text-base font-bold leading-none">App Store</div>
                  </div>
                </a>
                <a href="#" className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.984 1.984 0 0 1-.504-1.294V3.108c0-.49.176-.948.503-1.294zM14.61 12.818l2.671 2.67-9.522 5.485 6.851-8.155zm.804-.818l4.475-2.578a1.2 1.2 0 0 1 .184-.083 1.196 1.196 0 0 1 .42-.075c.148 0 .292.026.42.075a1.2 1.2 0 0 1 .184.083l-4.474 2.578H15.414zm-.804-.818L7.759 3.027l9.522 5.485-2.671 2.67z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] font-semibold leading-none opacity-80 mb-0.5">GET IT ON</div>
                    <div className="text-base font-bold leading-none">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              {/* Mockup Frame */}
              <div className="relative mx-auto w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden z-10 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                {/* Screen inner */}
                <div className="absolute inset-0 bg-slate-50 flex flex-col">
                  {/* Status Bar */}
                  <div className="h-6 w-full bg-primary-600 flex justify-between items-center px-4 text-[10px] text-white font-medium">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-2 bg-white rounded-sm"></div>
                      <div className="w-3 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>
                  {/* Header */}
                  <div className="bg-primary-600 text-white p-4 rounded-b-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="font-bold text-sm">SM</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20"></div>
                    </div>
                    <h3 className="font-bold text-lg">Hello, Sarah!</h3>
                    <p className="text-primary-100 text-xs">How are you feeling today?</p>
                  </div>
                  {/* Body mock */}
                  <div className="p-4 flex-1 space-y-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <div className="text-xs font-bold text-slate-800 mb-2">Upcoming Appointment</div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg"></div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Dr. Emily Chen</div>
                          <div className="text-[10px] text-slate-500">Today, 2:30 PM</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-24">
                        <div className="w-8 h-8 rounded-full bg-primary-50 mb-2"></div>
                        <div className="text-xs font-bold text-slate-700">Doctors</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-24">
                        <div className="w-8 h-8 rounded-full bg-accent-50 mb-2"></div>
                        <div className="text-xs font-bold text-slate-700">Records</div>
                      </div>
                    </div>
                  </div>
                  {/* Navigation bar mock */}
                  <div className="h-16 bg-white border-t border-slate-100 flex justify-around items-center px-4">
                    <div className="w-6 h-6 rounded-md bg-primary-100"></div>
                    <div className="w-6 h-6 rounded-md bg-slate-100"></div>
                    <div className="w-6 h-6 rounded-md bg-slate-100"></div>
                    <div className="w-6 h-6 rounded-md bg-slate-100"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating decorative elements */}
              <div className="absolute top-20 -left-8 w-24 h-24 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-3 z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                <Star className="w-8 h-8 text-amber-400 mb-1" fill="currentColor" />
                <span className="font-bold text-sm text-slate-800">4.9/5</span>
              </div>
              <div className="absolute bottom-32 -right-6 w-28 bg-white rounded-2xl shadow-xl p-3 z-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center">
                    <Heart className="w-3 h-3 text-accent-600" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-800">Booked!</div>
                </div>
                <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-900 to-secondary-900 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
              Ready to prioritize your health?
            </h2>
            <p className="text-primary-100 mb-10 max-w-2xl mx-auto text-lg relative z-10">
              Join thousands of patients who have simplified their healthcare journey with MedeliRDV.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link to="/register" className="bg-white text-primary-900 hover:bg-slate-50 font-bold px-8 py-4 rounded-full transition-colors flex items-center justify-center gap-2">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/search" className="bg-primary-800/50 hover:bg-primary-800 border border-primary-700 text-white font-bold px-8 py-4 rounded-full transition-colors flex items-center justify-center">
                Browse Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
