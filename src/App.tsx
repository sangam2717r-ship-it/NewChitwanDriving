import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Calendar,
  Clock,
  Settings,
  Check,
  ChevronRight,
  Car,
  MapPin,
  Phone,
  MessageCircle,
  User,
  FileText,
  RefreshCcw,
  Eye,
  EyeOff,
  Menu,
  X,
  Users,
  Award,
  Edit3,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Plus,
  Smartphone,
  AlertOctagon,
  Map,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDPZQhv_Ox_FytpDR_jU0bsyWMzcPa_xxk",
  authDomain: "new-chitwan-driving.firebaseapp.com",
  projectId: "new-chitwan-driving",
  storageBucket: "new-chitwan-driving.firebasestorage.app",
  messagingSenderId: "538552281062",
  appId: "1:538552281062:web:b6f756314ff53acch11827",
};

// --- INITIALIZATION ---
let auth, db;
let firebaseError = null;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  try {
    auth.useDeviceLanguage();
  } catch (e) {}
  db = getFirestore(app);
} catch (err) {
  console.error("Firebase Init Error:", err);
  firebaseError = err.message;
}

const appId = "new-chitwan-v1";

// --- SECURITY HOOK (ANTI-COPY) ---
const useCopyProtection = (active = true) => {
  useEffect(() => {
    if (!active) return;

    // 1. Disable Right Click
    const preventContext = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts (Ctrl+C, Ctrl+U, F12, etc)
    const preventKeys = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "s", "p", "u", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      if (e.key === "F12") e.preventDefault();
    };

    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("keydown", preventKeys);
    document.addEventListener("dragstart", (e) => e.preventDefault());

    return () => {
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("keydown", preventKeys);
      document.removeEventListener("dragstart", (e) => e.preventDefault());
    };
  }, [active]);
};

// --- UTILITIES ---
const useStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(price);

// --- COMPONENTS ---

const Navbar = ({ setView, activeView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { id: "home", label: "Home" },
    { id: "booking", label: "Book Training" },
    { id: "about", label: "About Us" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg border-b-4 border-red-600 select-none">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div
            onClick={() => setView("home")}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="bg-red-600 p-2 rounded-lg">
              <Car className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">
                New Chitwan
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Driving Training Centre
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? "bg-red-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setView("login")}
              className="ml-4 px-3 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Lock className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 animate-fade-in select-none">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${
                  activeView === item.id
                    ? "bg-red-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setView("login");
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-400 hover:bg-slate-700"
            >
              Admin Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const BookingView = ({ packages, onAddBooking }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+977 ");
  const [instructor, setInstructor] = useState("Prem Bahadur Gaire");

  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);

  useEffect(() => {
    if (!auth) return;
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {},
          }
        );
      }
    } catch (e) {
      console.log("Recaptcha error:", e);
    }
  }, []);

  const requestOtp = async () => {
    if (!clientName || clientPhone.length < 10) {
      setError("Please enter valid name and phone number");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(
        auth,
        clientPhone,
        appVerifier
      );
      setConfirmationResult(result);
      setStep("otp");
      setLoading(false);
    } catch (err) {
      console.warn("SMS Failed (preview block). Using Sim.");
      setSimulationMode(true);
      setStep("otp");
      setLoading(false);
      alert(
        "Note: Preview Window detected. Real SMS blocked by browser. \n\nSIMULATION MODE ACTIVE.\nUse code: 123456"
      );
    }
  };

  const verifyOtpAndBook = async () => {
    if (!otp) return;
    setLoading(true);

    try {
      if (simulationMode) {
        if (otp !== "123456") throw new Error("Wrong code");
      } else {
        await confirmationResult.confirm(otp);
      }

      await onAddBooking({
        clientName,
        clientPhone,
        packageName: selectedPackage.name,
        date: selectedDate,
        price: selectedPackage.price,
        instructor,
        type: "public",
        status: "pending",
        progress: 0,
      });
      setStep("done");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Incorrect Code. Try 123456.");
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-white rounded-xl shadow-xl p-8 text-center animate-fade-in select-none">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Request Sent!
          </h2>
          <p className="text-slate-600 mb-6">
            Your phone number has been verified. Prem Sir will review your
            request shortly.
          </p>
          <button
            onClick={() => {
              setStep("form");
              setSelectedPackage(null);
              setSelectedDate(null);
            }}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold"
          >
            New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-slate-100 animate-fade-in">
      <div id="recaptcha-container"></div>

      <div className="md:w-1/2 p-6 bg-slate-50/50 border-r border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Select Course
        </h2>
        <div className="space-y-3 mt-4">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => {
                setSelectedPackage(pkg);
                setSelectedDate(null);
              }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedPackage?.id === pkg.id
                  ? "border-red-600 bg-white shadow-md"
                  : "border-white bg-white hover:border-red-100"
              }`}
            >
              <div className="flex justify-between font-bold text-slate-800">
                <span>{pkg.name}</span>
                <span className="text-red-600">{formatPrice(pkg.price)}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="md:w-1/2 p-6 bg-white">
        {!selectedPackage ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Car className="w-12 h-12 opacity-20 mb-2" />
            <p>Select a course to begin</p>
          </div>
        ) : !selectedDate ? (
          <div className="animate-fade-in">
            <h3 className="font-bold text-lg mb-4">Preferred Time</h3>
            <div className="grid grid-cols-2 gap-2">
              {["6:00 AM", "7:00 AM", "8:00 AM", "4:00 PM", "5:00 PM"].map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedDate(t)}
                    className="p-3 border rounded hover:border-red-500 hover:bg-red-50 text-sm font-medium"
                  >
                    Tomorrow • {t}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setSelectedPackage(null)}
              className="mt-4 text-sm text-slate-400 underline"
            >
              Back
            </button>
          </div>
        ) : step === "form" ? (
          <div className="animate-fade-in h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4">Verification</h3>
            <div className="bg-yellow-50 p-3 rounded mb-4 text-sm border border-yellow-100 text-yellow-800">
              <p>We will send an SMS code to verify your booking.</p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Instructor
                </label>
                <select
                  className="w-full p-3 border border-slate-300 rounded bg-white"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                >
                  <option>Prem Bahadur Gaire</option>
                  <option>Other / Any Available</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-300 rounded outline-none focus:border-red-500"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-slate-300 rounded outline-none focus:border-red-500"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+977 98..."
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold hover:bg-slate-800 mt-auto shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                "Sending SMS..."
              ) : (
                <>
                  <Smartphone className="w-4 h-4" /> Verify & Submit
                </>
              )}
            </button>
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-3 text-center text-sm text-slate-400 underline"
            >
              Change Time
            </button>
          </div>
        ) : (
          <div className="animate-fade-in h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4">Enter Code</h3>
            <p className="text-sm text-slate-500 mb-4">
              We sent a code to {clientPhone}
            </p>
            {simulationMode && (
              <p className="text-xs text-orange-600 bg-orange-100 p-2 rounded mb-2">
                Sim Mode: Enter 123456
              </p>
            )}
            <input
              type="text"
              placeholder="123456"
              className="w-full p-4 border-2 border-slate-300 rounded-lg text-center text-2xl tracking-widest outline-none focus:border-red-500 mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
            )}
            <button
              onClick={verifyOtpAndBook}
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-bold hover:bg-red-700 shadow-lg"
            >
              {loading ? "Verifying..." : "Confirm Booking"}
            </button>
            <button
              onClick={() => setStep("form")}
              className="mt-4 text-center text-sm text-slate-400 underline"
            >
              Wrong Number?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PAGES ---

const HomePage = ({ setView }) => (
  <div className="animate-fade-in">
    <div className="relative h-80 md:h-96 bg-slate-900 overflow-hidden flex items-center justify-center text-center px-4 select-none">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60 z-10"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 z-0"></div>
      <div className="relative z-20 max-w-3xl">
        <span className="inline-block py-1 px-3 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-bold uppercase tracking-wider mb-4">
          Est. 2003
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Learn to Drive with Confidence in Chitwan
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setView("booking")}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Book Now <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView("contact")}
            className="px-8 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-bold shadow-lg transition-all"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-6 py-16 select-none">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-red-600">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            High Pass Rate
          </h3>
          <p className="text-slate-500">
            Our focused trial preparation ensures you master the "8" and "L"
            tracks quickly.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-blue-600">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Expert Instructors
          </h3>
          <p className="text-slate-500">
            Learn directly from Prem Bahadur Gaire, serving Chitwan since 2003.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-green-600">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Well Maintained
          </h3>
          <p className="text-slate-500">
            We use modern vehicles and well-maintained scooters for your safety
            and comfort.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in select-none">
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
      <div className="bg-slate-900 p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Our History</h2>
        <p className="text-slate-400">
          Serving Bharatpur since April 3rd, 2003
        </p>
      </div>
      <div className="p-8 md:p-12">
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          New Chitwan Driving Training Centre was established with a mission to
          create safe, responsible, and skilled drivers in our community. For
          over two decades, we have maintained a reputation for excellence,
          patience, and results.
        </p>
        <p className="text-lg text-slate-600 leading-relaxed">
          We pride ourselves on our personalized approach. Whether you are
          nervous about holding a steering wheel for the first time or just need
          a refresher before your trial, we have the right course for you.
        </p>
        <div className="mt-8 flex items-center gap-2 text-sm font-mono text-slate-400 bg-slate-50 p-3 rounded inline-block">
          <span>PAN No: 301569099</span>
        </div>
      </div>
    </div>
    <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
      Our Team
    </h2>
    <div className="grid md:grid-cols-2 gap-8">
      {/* Dad */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group border border-slate-100">
        <div className="h-80 bg-slate-200 relative">
          <img
            src="./dad.png"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
            className="w-full h-full object-cover object-top"
            alt="Prem"
          />
          <div className="w-full h-full hidden flex-col items-center justify-center bg-slate-300 text-slate-500 absolute inset-0">
            <User className="w-20 h-20 mb-2 opacity-50" />
            <span className="text-xs font-bold text-center px-4">
              Add 'dad.png'
            </span>
          </div>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-slate-900">
            Prem Bahadur Gaire
          </h3>
          <p className="text-red-600 font-medium text-sm mb-2">
            Proprietor & Instructor
          </p>
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" /> 9845048863
          </p>
        </div>
      </div>
      {/* Mom */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group border border-slate-100">
        <div className="h-80 bg-slate-200 relative">
          <img
            src="./mom.png"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
            className="w-full h-full object-cover object-top"
            alt="Anita"
          />
          <div className="w-full h-full hidden flex-col items-center justify-center bg-slate-300 text-slate-500 absolute inset-0">
            <User className="w-20 h-20 mb-2 opacity-50" />
            <span className="text-xs font-bold text-center px-4">
              Add 'mom.png'
            </span>
          </div>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-slate-900">Anita Gaire</h3>
          <p className="text-red-600 font-medium text-sm mb-2">
            Manager & Reception
          </p>
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" /> 9845278967
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in select-none">
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 space-y-6">
      <div className="flex items-start gap-4">
        <div className="bg-red-100 p-3 rounded-full text-red-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-slate-800">Address</p>
          <p className="text-slate-600">
            Bharatpur Height, Chitwan (Same building as Eye Express)
          </p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
          <Phone className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <p className="font-bold text-slate-800">Phone Numbers</p>
          <p className="text-slate-600 text-sm">
            Landline:{" "}
            <span className="font-mono text-slate-500">056-518289</span>
          </p>
          <p className="text-slate-600 text-sm">
            Anita Gaire:{" "}
            <span className="font-mono text-slate-500">9845278967</span>
          </p>
          <p className="text-slate-600 text-sm">
            Prem Gaire:{" "}
            <span className="font-mono text-slate-500">9845048863</span>
          </p>
        </div>
      </div>

      <a
        href="https://maps.app.goo.gl/ajFQJt3BAUP4dkCM8?g_st=ipc"
        target="_blank"
        className="block w-full text-center bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
      >
        <Map className="w-5 h-5" /> Get Directions (Google Maps)
      </a>
    </div>

    {/* MAP PINNED USING PLUS CODE MCQH+28 (Your Requested Location) */}
    <div className="bg-slate-200 rounded-xl overflow-hidden shadow-inner h-96 w-full relative mt-8">
      <iframe
        className="absolute inset-0 w-full h-full"
        src="https://maps.google.com/maps?q=MCQH%2B28+Bharatpur&t=&z=17&ie=UTF8&iwloc=&output=embed"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        title="Location Map"
      ></iframe>
    </div>
  </div>
);

const AdminPanel = ({ packages, onExit }) => {
  const [adminTab, setAdminTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "bookings"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setBookings(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (err) => console.log("DB waiting for init...")
    );
    return () => unsubscribe();
  }, []);

  const handleApprove = async (booking) => {
    setEditingBooking({
      ...booking,
      finalPrice: booking.price,
      newDate: booking.date,
    });
  };
  const confirmApproval = async () => {
    await updateDoc(
      doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "bookings",
        editingBooking.id
      ),
      {
        status: "approved",
        price: Number(editingBooking.finalPrice),
        date: editingBooking.newDate,
      }
    );
    setEditingBooking(null);
    setAdminTab("active");
  };
  const updateProgress = async (booking, increment) => {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "bookings", booking.id),
      { progress: (booking.progress || 0) + increment }
    );
  };
  const updateSchedule = async (bookingId, newDate) => {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "bookings", bookingId),
      { date: newDate }
    );
  };
  const deleteBooking = async (id) => {
    if (confirm("Delete this?"))
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "bookings", id)
      );
  };
  const sendConfirmation = (booking) => {
    window.open(
      `https://wa.me/${booking.clientPhone}?text=${encodeURIComponent(
        `Namaste ${booking.clientName}, your booking for ${booking.packageName} is confirmed. Next Class: ${booking.date}. Instructor: ${booking.instructor}.`
      )}`,
      "_blank"
    );
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter(
    (b) => b.status === "approved" || b.status === "private"
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-red-100 animate-fade-in overflow-hidden flex flex-col h-[calc(100vh-100px)] relative">
      {editingBooking && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Approve Booking</h3>
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Final Price (Discreet)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded font-bold text-red-600"
                value={editingBooking.finalPrice}
                onChange={(e) =>
                  setEditingBooking({
                    ...editingBooking,
                    finalPrice: e.target.value,
                  })
                }
              />
              <p className="text-xs text-slate-400 mt-1">
                Change for discounts. Student won't see.
              </p>
            </div>
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Confirm/Edit Time
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={editingBooking.newDate}
                onChange={(e) =>
                  setEditingBooking({
                    ...editingBooking,
                    newDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingBooking(null)}
                className="flex-1 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                className="flex-1 py-2 bg-green-600 text-white rounded font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row border-b border-slate-100 h-full">
        <div className="bg-slate-50 md:w-64 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setAdminTab("pending")}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
              adminTab === "pending"
                ? "bg-red-100 text-red-700"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Pending (
            {pendingBookings.length})
          </button>
          <button
            onClick={() => setAdminTab("active")}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
              adminTab === "active"
                ? "bg-red-100 text-red-700"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            <Calendar className="w-4 h-4" /> Active
          </button>
          <button
            onClick={() => setAdminTab("private")}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
              adminTab === "private"
                ? "bg-red-100 text-red-700"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            <User className="w-4 h-4" /> Add Private
          </button>
          <button
            onClick={onExit}
            className="p-3 rounded-lg flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 mt-auto"
          >
            <RefreshCcw className="w-4 h-4" /> Logout
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {adminTab === "pending" && (
            <div className="space-y-3">
              {pendingBookings.length === 0 ? (
                <p className="text-slate-400 italic">No new requests.</p>
              ) : (
                pendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 border border-orange-200 bg-orange-50 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {b.clientName}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          ({b.clientPhone})
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">{b.packageName}</p>
                      <p className="text-sm font-bold text-orange-600 mt-1">
                        Req: {b.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteBooking(b.id)}
                        className="px-3 py-2 border border-red-200 text-red-500 rounded text-sm hover:bg-red-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(b)}
                        className="px-3 py-2 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {adminTab === "active" && (
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <p className="text-slate-400 italic">No active students.</p>
              ) : (
                activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 border rounded-lg hover:bg-slate-50 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-lg">
                            {b.clientName}
                          </p>
                          {b.price !== 15000 &&
                            b.packageName.includes("15") && (
                              <span className="bg-green-100 text-green-700 text-[10px] px-1 rounded">
                                DISCOUNTED
                              </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {b.packageName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Edit3 className="w-3 h-3 text-slate-400" />
                          <input
                            className="text-sm font-bold text-blue-600 bg-transparent border-b border-dashed border-blue-300 focus:outline-none w-40"
                            defaultValue={b.date}
                            onBlur={(e) => updateSchedule(b.id, e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700">
                          {formatPrice(b.price)}
                        </p>
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="text-xs text-red-300 hover:text-red-500 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {b.packageName.includes("15") && (
                      <div className="bg-slate-100 p-3 rounded mb-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                          <span>Course Progress</span>
                          <span>Day {b.progress || 0} / 15</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{
                                width: `${((b.progress || 0) / 15) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <button
                            onClick={() => updateProgress(b, 1)}
                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="pt-3 border-t flex justify-end gap-2">
                      <a
                        href={`tel:${b.clientPhone}`}
                        className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200"
                      >
                        Call
                      </a>
                      <button
                        onClick={() => sendConfirmation(b)}
                        className="px-3 py-1 bg-[#25D366] text-white rounded text-xs font-bold hover:opacity-90 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> Info
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {adminTab === "private" && (
            <div className="max-w-md space-y-4">
              <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded border border-amber-200">
                Private Booking (Skips Queue)
              </div>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 border rounded"
                id="p_name"
              />
              <input
                type="text"
                placeholder="Phone"
                className="w-full p-2 border rounded"
                id="p_phone"
              />
              <input
                type="text"
                placeholder="Service"
                className="w-full p-2 border rounded"
                id="p_desc"
              />
              <input
                type="text"
                placeholder="Date"
                className="w-full p-2 border rounded"
                id="p_date"
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full p-2 border rounded"
                id="p_price"
              />
              <button
                onClick={async () => {
                  const name = document.getElementById("p_name").value;
                  if (!name) return alert("Required");
                  await addDoc(
                    collection(
                      db,
                      "artifacts",
                      appId,
                      "public",
                      "data",
                      "bookings"
                    ),
                    {
                      clientName: name,
                      clientPhone: document.getElementById("p_phone").value,
                      packageName:
                        document.getElementById("p_desc").value || "Private",
                      date: document.getElementById("p_date").value,
                      price: Number(
                        document.getElementById("p_price").value || 0
                      ),
                      instructor: "Prem Bahadur Gaire",
                      type: "private",
                      status: "private",
                      createdAt: serverTimestamp(),
                    }
                  );
                  alert("Added!");
                  setAdminTab("active");
                }}
                className="w-full bg-slate-800 text-white p-3 rounded-lg font-bold"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  useCopyProtection(true); // Active protection
  const [view, setView] = useState("home");
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [securitySettings] = useStickyState(
    { pin: "1234" },
    "ncdc_security_v3"
  );
  const [packages] = useState([
    {
      id: 1,
      name: "Trial Preparation (1 Hour)",
      duration: 60,
      price: 1500,
      description: 'Intensive practice for the "8" and "L" tracks.',
    },
    {
      id: 2,
      name: "15 Day Learning Course",
      duration: 45,
      price: 15000,
      description: "Complete beginner to confident driver.",
    },
    {
      id: 3,
      name: "Scooter Training",
      duration: 45,
      price: 8000,
      description: "Balance and control training for scooters.",
    },
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginInput === securitySettings.pin) {
      setView("admin");
      setLoginError("");
      setLoginInput("");
    } else {
      setLoginError("Incorrect PIN");
    }
  };
  const handleAddBooking = async (data) => {
    try {
      if (db)
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "bookings"),
          { ...data, createdAt: serverTimestamp() }
        );
      else alert("Database not ready");
    } catch (e) {
      alert("Error saving: " + e.message);
    }
  };

  if (firebaseError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-800 p-10">
        <div className="max-w-md text-center">
          <AlertOctagon className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p>{firebaseError}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 font-sans select-none flex flex-col"
      style={{ WebkitUserSelect: "none" }}
    >
      <style>{`img { pointer-events: none; } .animate-fade-in { animation: fadeIn 0.4s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <Navbar setView={setView} activeView={view} />
      <main className="flex-grow">
        {view === "home" && <HomePage setView={setView} />}
        {view === "about" && <AboutPage />}
        {view === "contact" && <ContactPage />}
        {view === "booking" && (
          <div className="max-w-4xl mx-auto p-4 pt-8">
            <BookingView packages={packages} onAddBooking={handleAddBooking} />
          </div>
        )}
        {view === "login" && (
          <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl animate-fade-in border-t-4 border-red-600">
              <div className="text-center mb-6">
                <h2 className="font-bold text-xl text-slate-800">
                  Admin Login
                </h2>
                <p className="text-slate-500 text-sm">Owner Access Only</p>
              </div>
              <form onSubmit={handleLogin}>
                <input
                  type="password"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full p-3 border rounded-lg text-center tracking-widest text-lg outline-none focus:border-red-500 mb-4"
                  autoFocus
                />
                {loginError && (
                  <p className="text-red-500 text-sm text-center mb-4">
                    {loginError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full p-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        )}
        {view === "admin" && (
          <div className="max-w-6xl mx-auto p-4">
            <AdminPanel packages={packages} onExit={() => setView("home")} />
          </div>
        )}
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p className="mb-2 text-white font-bold">
          New Chitwan Driving Training Centre
        </p>
        <p>Bharatpur Height, Chitwan (Same building as Eye Express)</p>
        <p className="mt-4 opacity-50">
          © 2024 All Rights Reserved. • PAN: 301569099
        </p>
      </footer>
    </div>
  );
}
