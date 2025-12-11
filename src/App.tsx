import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Calendar, Clock, Car, MapPin, Phone, MessageCircle, 
  Menu, X, ChevronRight, User, FileText, Droplet, Users, Settings, 
  LogOut, Trash2, CheckCircle, Plus, DollarSign
} from 'lucide-react';
import { db, auth } from './firebase';
import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail 
} from 'firebase/auth';

// --- Types ---
interface Booking {
  id?: string;
  fullName: string;
  phone: string;
  address: string;
  citizenshipNo: string;
  bloodGroup: string;
  fmhName: string;
  course: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  createdAt: any;
}

interface AppSettings {
  bikeRate: string;
  scooterRate: string;
  carRate: string;
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState<'home' | 'admin' | 'login'>('home');
  const [user, setUser] = useState<any>(null);
  
  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    bikeRate: '500',
    scooterRate: '500',
    carRate: 'Contact for pricing'
  });

  // Admin Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Form State
  const initialFormState = {
    fullName: '', phone: '', address: '', citizenshipNo: '',
    bloodGroup: 'A+', fmhName: '', course: 'Bike Trial', date: '', time: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // --- Effects ---

  // 1. Monitor Auth Status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && view === 'login') setView('admin');
    });
    return () => unsubscribe();
  }, [view]);

  // 2. Fetch Data (Real-time)
  useEffect(() => {
    // Fetch Settings
    const settingsUnsub = onSnapshot(doc(db, "settings", "general"), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      }
    });

    // Fetch Bookings (Only if admin)
    let bookingsUnsub = () => {};
    if (user) {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      bookingsUnsub = onSnapshot(q, (snapshot) => {
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(books);
      });
    }

    return () => {
      settingsUnsub();
      bookingsUnsub();
    };
  }, [user]);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setView('admin');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Save to Firebase
      await addDoc(collection(db, "bookings"), {
        ...formData,
        status: 'Pending',
        createdAt: new Date()
      });

      // 2. WhatsApp Notification
      const message = `*New Booking Request*%0A%0AName: ${formData.fullName}%0APhone: ${formData.phone}%0ACourse: ${formData.course}%0ADate: ${formData.date}`;
      window.open(`https://wa.me/9779855056777?text=${message}`, '_blank');

      alert("Booking Request Sent Successfully!");
      setFormData(initialFormState);
    } catch (err) {
      console.error(err);
      alert("Error submitting booking. Please try again.");
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDoc(doc(db, "settings", "general"), { ...settings }); // Note: Create this doc in Firebase manually first time or handle creation
    alert("Rates updated!");
  };

  const updateBookingStatus = async (id: string, newStatus: 'Confirmed' | 'Completed') => {
    const bookingRef = doc(db, "bookings", id);
    await updateDoc(bookingRef, { status: newStatus });
  };

  const deleteBooking = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      await deleteDoc(doc(db, "bookings", id));
    }
  };

  // --- Render Helpers ---

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Admin Login</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          {resetSent && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">Password reset email sent! Check your inbox.</div>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <button onClick={handleForgotPassword} className="text-blue-600 hover:underline">Forgot Password?</button>
            <span className="mx-2">|</span>
            <button onClick={() => setView('home')} className="text-gray-500 hover:underline">Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'admin' && user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Admin Header */}
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 hidden sm:block">{user.email}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded transition">
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Settings & Add Manual */}
            <div className="space-y-8">
               {/* Rate Settings */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings className="h-5 w-5"/> Update Rates</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Bike Rate</label>
                    <input value={settings.bikeRate} onChange={e => setSettings({...settings, bikeRate: e.target.value})} className="w-full border p-2 rounded"/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Scooter Rate</label>
                    <input value={settings.scooterRate} onChange={e => setSettings({...settings, scooterRate: e.target.value})} className="w-full border p-2 rounded"/>
                  </div>
                  <button onClick={handleUpdateSettings} className="w-full bg-gray-800 text-white py-2 rounded text-sm hover:bg-gray-900">Save Rates</button>
                </div>
              </div>

              {/* Manual Booking */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="h-5 w-5"/> Manual Booking</h2>
                <form onSubmit={handleSubmitBooking} className="space-y-3">
                  <input name="fullName" placeholder="Full Name" onChange={handleInputChange} className="w-full border p-2 rounded text-sm" required/>
                  <input name="phone" placeholder="Phone" onChange={handleInputChange} className="w-full border p-2 rounded text-sm" required/>
                  <select name="course" onChange={handleInputChange} className="w-full border p-2 rounded text-sm">
                     <option value="Bike Trial">Bike Trial</option>
                     <option value="Scooter Trial">Scooter Trial</option>
                  </select>
                  <input type="date" name="date" onChange={handleInputChange} className="w-full border p-2 rounded text-sm" required/>
                   <input type="time" name="time" onChange={handleInputChange} className="w-full border p-2 rounded text-sm" required/>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">Add Booking</button>
                </form>
              </div>
            </div>

            {/* Right Column: Booking List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
               <div className="p-6 border-b">
                 <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5"/> Recent Bookings</h2>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="p-4">Name / Phone</th>
                       <th className="p-4">Course</th>
                       <th className="p-4">Date & Time</th>
                       <th className="p-4">Status</th>
                       <th className="p-4">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {bookings.map(book => (
                       <tr key={book.id} className="hover:bg-gray-50">
                         <td className="p-4">
                           <div className="font-bold">{book.fullName}</div>
                           <div className="text-gray-500">{book.phone}</div>
                         </td>
                         <td className="p-4">{book.course}</td>
                         <td className="p-4">
                           <div>{book.date}</div>
                           <div className="text-gray-500">{book.time}</div>
                         </td>
                         <td className="p-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                             book.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                             book.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                           }`}>
                             {book.status}
                           </span>
                         </td>
                         <td className="p-4 flex gap-2">
                           {book.status !== 'Completed' && (
                             <button onClick={() => updateBookingStatus(book.id!, 'Completed')} title="Mark Completed" className="p-1 text-green-600 hover:bg-green-50 rounded">
                               <CheckCircle className="h-5 w-5"/>
                             </button>
                           )}
                           <button onClick={() => deleteBooking(book.id!)} title="Delete" className="p-1 text-red-600 hover:bg-red-50 rounded">
                             <Trash2 className="h-5 w-5"/>
                           </button>
                         </td>
                       </tr>
                     ))}
                     {bookings.length === 0 && (
                       <tr><td colSpan={5} className="p-8 text-center text-gray-500">No bookings yet.</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Customer View ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navigation */}
      <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8" />
              <span className="font-bold text-lg md:text-xl tracking-wide">New Chitwan Driving</span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#home" className="hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition">Home</a>
                <a href="#courses" className="hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition">Courses</a>
                <button onClick={() => setView('login')} className="hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition flex items-center gap-1">
                  <Lock className="h-4 w-4"/> Admin
                </button>
                <a href="#book" className="bg-white text-blue-700 hover:bg-gray-100 px-4 py-2 rounded-md font-bold transition shadow-sm">Book Now</a>
              </div>
            </div>
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-blue-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-blue-800 p-2">
             <a href="#home" className="block px-3 py-2 hover:bg-blue-600 rounded">Home</a>
             <a href="#courses" className="block px-3 py-2 hover:bg-blue-600 rounded">Courses</a>
             <button onClick={() => setView('login')} className="block w-full text-left px-3 py-2 hover:bg-blue-600 rounded">Admin Login</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div id="home" className="bg-blue-600 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Learn to Drive with Confidence</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">Professional instructors in Chitwan.</p>
          <a href="#book" className="inline-flex items-center bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 shadow-lg transition">
            Start Learning Today <ChevronRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Info Column */}
        <div className="space-y-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Shield className="text-blue-600" /> Why Choose Us?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3"><div className="bg-green-100 p-2 rounded-full text-green-600 mt-1"><Lock className="h-4 w-4"/></div><div><h3 className="font-semibold">Safe & Secure</h3><p className="text-gray-600 text-sm">Dual-control vehicles.</p></div></li>
              <li className="flex items-start gap-3"><div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1"><Clock className="h-4 w-4"/></div><div><h3 className="font-semibold">Flexible Timing</h3><p className="text-gray-600 text-sm">Morning, day, evening.</p></div></li>
            </ul>
          </div>

          <div id="courses" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Rates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 bg-gray-50">
                <div className="font-bold text-lg mb-1">Bike Trial</div>
                <div className="text-blue-600 font-bold">Rs. {settings.bikeRate} <span className="text-gray-400 text-sm font-normal">/ session</span></div>
              </div>
              <div className="border rounded-xl p-4 bg-gray-50">
                <div className="font-bold text-lg mb-1">Scooter Trial</div>
                <div className="text-blue-600 font-bold">Rs. {settings.scooterRate} <span className="text-gray-400 text-sm font-normal">/ session</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div id="book" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6" /> Book Your Slot</h2>
          </div>
          
          <form onSubmit={handleSubmitBooking} className="p-6 md:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative"><User className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input type="text" name="fullName" required placeholder="Client Full Name" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.fullName} onChange={handleInputChange}/></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative"><Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><input type="tel" name="phone" required placeholder="98xxxxxxxx" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone} onChange={handleInputChange}/></div>
            </div>

            {/* Extra Fields */}
            <div className="grid grid-cols-2 gap-4">
               <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" name="address" required className="w-full px-3 py-3 rounded-lg border border-gray-300" value={formData.address} onChange={handleInputChange}/></div>
               <div><label className="block text-sm font-medium text-gray-700 mb-1">Citizenship No</label><input type="text" name="citizenshipNo" className="w-full px-3 py-3 rounded-lg border border-gray-300" value={formData.citizenshipNo} onChange={handleInputChange}/></div>
            </div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label><select name="bloodGroup" className="w-full px-3 py-3 rounded-lg border border-gray-300 bg-white" value={formData.bloodGroup} onChange={handleInputChange}>{bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div>
               <div><label className="block text-sm font-medium text-gray-700 mb-1">F/M/H Name</label><input type="text" name="fmhName" className="w-full px-3 py-3 rounded-lg border border-gray-300" value={formData.fmhName} onChange={handleInputChange}/></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" name="date" required className="w-full px-4 py-3 rounded-lg border border-gray-300" value={formData.date} onChange={handleInputChange}/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><input type="time" name="time" required className="w-full px-4 py-3 rounded-lg border border-gray-300" value={formData.time} onChange={handleInputChange}/></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              <select name="course" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" value={formData.course} onChange={handleInputChange}>
                <option value="Bike Trial">Bike Trial (Rs. {settings.bikeRate})</option>
                <option value="Scooter Trial">Scooter Trial (Rs. {settings.scooterRate})</option>
                <option value="Car Training">Car Training</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5" /> Book & Notify via WhatsApp
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
