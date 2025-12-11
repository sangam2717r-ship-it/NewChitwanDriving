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
  Minus,
  Smartphone,
  AlertOctagon,
  Map,
  Key,
  Mail,
  Save,
  XCircle,
  Search,
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
  where,
  getDocs,
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
let auth: any = {};
let db: any = {};
let firebaseError: string | null = null;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  try {
    auth.useDeviceLanguage();
  } catch (e: any) {}
  db = getFirestore(app);
} catch (err: any) {
  console.error("Firebase Init Error:", err);
  firebaseError = err.message;
}

const appId = "new-chitwan-v1";

// --- SECURITY HOOK ---
const useCopyProtection = (active = true) => {
  useEffect(() => {
    const preventContext = (e: any) => {
      e.preventDefault();
      return false;
    };
    const preventKeys = (e: any) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "s", "p", "u", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      if (e.key === "F12") e.preventDefault();
    };
    const preventDrag = (e: any) => e.preventDefault();

    if (!active) return;

    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("keydown", preventKeys);
    document.addEventListener("dragstart", preventDrag);

    return () => {
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("keydown", preventKeys);
      document.removeEventListener("dragstart", preventDrag);
    };
  }, [active]);
};

// --- UTILITIES ---
// FIX: Added generic <T> to properly handle state types and avoid "any" errors
function useStickyState<T>(
  defaultValue: T,
  key: string
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
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
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(price);

// --- COMPONENTS ---

const Navbar = ({ setView, activeView }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { id: "home", label: "Home" },
    { id: "booking", label: "Book Training" },
    { id: "about", label: "About Us" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav className="bg-red-900 text-white sticky top-0 z-50 shadow-lg border-b-4 border-red-700 select-none">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div
            onClick={() => setView("home")}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="bg-white p-2 rounded-lg">
              <Car className="text-red-700 w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">
                New Chitwan
              </h1>
              <p className="text-[10px] text-red-200 uppercase tracking-wider">
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
                    ? "bg-white text-red-700 font-bold shadow"
                    : "text-red-100 hover:text-white hover:bg-red-800"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setView("login")}
              className="ml-4 px-3 py-2 bg-red-950 rounded-full hover:bg-black transition-colors border border-red-800"
            >
              <Lock className="w-4 h-4 text-red-200" />
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-red-100 hover:text-white p-2"
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
        <div className="md:hidden bg-red-800 border-t border-red-700 animate-fade-in select-none">
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
                    ? "bg-white text-red-800"
                    : "text-red-100 hover:bg-red-700"
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
              className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-300 hover:bg-red-900"
            >
              Admin Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const BookingView = ({ onAddBooking, rates }: any) => {
  const [tab, setTab] = useState("new");
  const [duration, setDuration] = useState("15 Days");
  const [dailyTime, setDailyTime] = useState("60 Mins");
  const [currentPrice, setCurrentPrice] = useState(rates["15 Days"]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+977 ");
  const [instructor, setInstructor] = useState("Prem Bahadur Gaire");

  const [step, setStep] = useState("customize");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);

  const [checkPhone, setCheckPhone] = useState("");
  const [myBooking, setMyBooking] = useState<any>(null);
  const [checkError, setCheckError] = useState("");

  const timeSlots = [
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  useEffect(() => {
    let base = 0;
    if (duration === "1 Day") base = rates["1 Day"];
    else if (duration === "15 Days")
      base =
        dailyTime === "60 Mins" ? rates["15 Days"] : rates["15 Days (30m)"];
    else if (duration === "30 Days")
      base =
        dailyTime === "60 Mins" ? rates["30 Days"] : rates["30 Days (30m)"];
    setCurrentPrice(base);
  }, [duration, dailyTime, rates]);

  useEffect(() => {
    if (!auth) return;
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {},
          }
        );
      }
    } catch (e) {
      console.log("Recaptcha init:", e);
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
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(
        auth,
        clientPhone,
        appVerifier
      );
      setConfirmationResult(result);
      setStep("otp");
      setLoading(false);
    } catch (err) {
      console.warn("SMS Failed. Using Sim.");
      setSimulationMode(true);
      setStep("otp");
      setLoading(false);
      alert(
        "SIMULATION MODE (Real SMS blocked in Preview).\n\nUse code: 123456"
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
      const pkgName =
        duration === "1 Day"
          ? "Trial Preparation (1 Day)"
          : `${duration} Course (${dailyTime}/day)`;
      await onAddBooking({
        clientName,
        clientPhone,
        packageName: pkgName,
        duration,
        dailyTime,
        date: `${selectedDate} at ${selectedTime}`,
        price: currentPrice,
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

  const handleCheckProgress = async () => {
    setCheckError("");
    setMyBooking(null);
    if (!checkPhone) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "bookings"),
      where("clientPhone", "==", checkPhone),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty)
      setCheckError("No active booking found for this number.");
    else setMyBooking(snapshot.docs[0].data());
  };

  if (step === "done") {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-white rounded-xl shadow-xl p-8 text-center animate-fade-in select-none">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Request Sent!
          </h2>
          <p className="text-gray-600 mb-6">
            Your phone number has been verified. Prem Sir will review your
            request shortly.
          </p>
          <button
            onClick={() => {
              setStep("customize");
              setDuration("15 Days");
              setSelectedDate(null);
              setSelectedTime(null);
            }}
            className="px-6 py-3 bg-red-900 text-white rounded-lg font-bold"
          >
            New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col min-h-[550px] border border-gray-100 animate-fade-in">
      <div className="flex border-b">
        <button
          onClick={() => setTab("new")}
          className={`flex-1 p-4 text-center font-bold ${
            tab === "new"
              ? "bg-red-50 text-red-700 border-b-2 border-red-700"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          New Booking
        </button>
        <button
          onClick={() => setTab("check")}
          className={`flex-1 p-4 text-center font-bold ${
            tab === "check"
              ? "bg-red-50 text-red-700 border-b-2 border-red-700"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Check Progress
        </button>
      </div>

      {tab === "check" && (
        <div className="p-8 flex flex-col items-center justify-center h-full">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Student Progress Check
          </h3>
          <div className="flex gap-2 w-full max-w-md mb-6">
            <input
              type="tel"
              placeholder="Enter Phone Number"
              className="flex-grow p-3 border rounded focus:border-red-500 outline-none"
              value={checkPhone}
              onChange={(e: any) => setCheckPhone(e.target.value)}
            />
            <button
              onClick={handleCheckProgress}
              className="bg-red-900 text-white px-6 rounded font-bold hover:bg-red-800"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          {checkError && <p className="text-red-500 mb-4">{checkError}</p>}

          {myBooking && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full max-w-md">
              <h4 className="font-bold text-lg text-gray-800 mb-1">
                {myBooking.clientName}
              </h4>
              <p className="text-gray-500 text-sm mb-4">
                {myBooking.packageName}
              </p>
              <div className="mb-2 flex justify-between text-xs font-bold uppercase text-gray-400">
                <span>Progress</span>
                <span>
                  Day {myBooking.progress || 0} /{" "}
                  {myBooking.packageName.includes("30") ? 30 : 15}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${
                      ((myBooking.progress || 0) /
                        (myBooking.packageName.includes("30") ? 30 : 15)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-center p-3 bg-white rounded border border-gray-200 text-sm">
                Next Class:{" "}
                <span className="font-bold text-gray-800">
                  {myBooking.date}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "new" && (
        <div className="flex flex-col md:flex-row flex-grow">
          <div id="recaptcha-container"></div>
          <div className="md:w-1/2 p-6 bg-gray-50/50 border-r border-gray-100 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Build Your Course
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Select the duration and daily time.
            </p>
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Course Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["1 Day", "15 Days", "30 Days"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`p-3 rounded-lg text-sm font-bold transition-all ${
                      duration === d
                        ? "bg-red-700 text-white shadow-md"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            {duration !== "1 Day" && (
              <div className="mb-6 animate-fade-in">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Daily Session Length
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["30 Mins", "60 Mins"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setDailyTime(t)}
                      className={`p-3 rounded-lg text-sm font-bold transition-all ${
                        dailyTime === t
                          ? "bg-red-500 text-white shadow-md"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Estimated Total
                  </p>
                  <p className="text-3xl font-black text-gray-800">
                    {formatPrice(currentPrice)}
                  </p>
                </div>
                {step === "customize" && (
                  <button
                    onClick={() => setStep("date")}
                    className="px-6 py-3 bg-red-900 text-white rounded-lg font-bold hover:bg-red-800 flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-6 bg-white">
            {step === "customize" && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 opacity-20" />
                </div>
                <p>
                  Configure your course on the left
                  <br />
                  to proceed.
                </p>
              </div>
            )}
            {step === "date" && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-lg mb-4">
                  {duration === "1 Day" ? "Appointment Date" : "Start Date"}
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {["Tomorrow", "Day After Tomorrow"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`p-3 border rounded text-sm font-medium transition-colors ${
                        selectedDate === d
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {selectedDate && (
                  <div className="animate-fade-in">
                    <h3 className="font-bold text-lg mb-4">Preferred Time</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setSelectedTime(t);
                            setStep("form");
                          }}
                          className="p-2 border rounded hover:border-red-500 hover:bg-red-50 text-xs font-bold transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setStep("customize")}
                  className="mt-6 text-sm text-gray-400 underline"
                >
                  Back
                </button>
              </div>
            )}
            {step === "form" && (
              <div className="animate-fade-in h-full flex flex-col">
                <h3 className="font-bold text-lg mb-4">Verification</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Instructor
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded bg-white"
                      value={instructor}
                      onChange={(e: any) => setInstructor(e.target.value)}
                    >
                      <option>Prem Bahadur Gaire</option>
                      <option>Other / Any Available</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded outline-none focus:border-red-500"
                      value={clientName}
                      onChange={(e: any) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-gray-300 rounded outline-none focus:border-red-500"
                      value={clientPhone}
                      onChange={(e: any) => setClientPhone(e.target.value)}
                      placeholder="+977 98..."
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <button
                  onClick={requestOtp}
                  disabled={loading}
                  className="w-full bg-red-900 text-white py-4 rounded-lg font-bold hover:bg-red-800 mt-auto shadow-lg flex items-center justify-center gap-2"
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
                  onClick={() => setStep("date")}
                  className="mt-3 text-center text-sm text-gray-400 underline"
                >
                  Change Time
                </button>
              </div>
            )}
            {step === "otp" && (
              <div className="animate-fade-in h-full flex flex-col">
                <h3 className="font-bold text-lg mb-4">Enter Code</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Code sent to {clientPhone}
                </p>
                {simulationMode && (
                  <p className="text-xs text-orange-600 bg-orange-100 p-2 rounded mb-2">
                    Sim Mode: Enter 123456
                  </p>
                )}
                <input
                  type="text"
                  placeholder="123456"
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest outline-none focus:border-red-500 mb-4"
                  value={otp}
                  onChange={(e: any) => setOtp(e.target.value)}
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-sm mb-3 text-center">
                    {error}
                  </p>
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
                  className="mt-4 text-center text-sm text-gray-400 underline"
                >
                  Wrong Number?
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- PAGES ---

const HomePage = ({ setView }: any) => (
  <div className="animate-fade-in">
    <div className="relative h-80 md:h-96 bg-red-900 overflow-hidden flex items-center justify-center text-center px-4 select-none">
      <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-900/80 to-red-900/60 z-10"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 z-0"></div>
      <div className="relative z-20 max-w-3xl">
        <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider mb-4">
          Est. 2003
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Learn to Drive with Confidence in Chitwan
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setView("booking")}
            className="px-8 py-3 bg-white text-red-800 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            Book Now <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView("contact")}
            className="px-8 py-3 bg-red-800/50 hover:bg-red-800/70 text-white border border-red-400 rounded-lg font-bold shadow-lg transition-all"
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
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            High Pass Rate
          </h3>
          <p className="text-gray-500">
            Our focused trial preparation ensures you master the "8" and "L"
            tracks quickly.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-red-600">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Expert Instructors
          </h3>
          <p className="text-gray-500">
            Learn directly from Prem Bahadur Gaire, serving Chitwan since 2003.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-red-600">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Well Maintained
          </h3>
          <p className="text-gray-500">
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
      <div className="bg-red-900 p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Our History</h2>
        <p className="text-red-200">Serving Bharatpur since April 3rd, 2003</p>
      </div>
      <div className="p-8 md:p-12">
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          New Chitwan Driving Training Centre was established with a mission to
          create safe, responsible, and skilled drivers in our community.
        </p>
        <div className="mt-8 flex items-center gap-2 text-sm font-mono text-gray-400 bg-gray-50 p-3 rounded inline-block">
          <span>PAN No: 301569099</span>
        </div>
      </div>
    </div>
    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
      Our Team
    </h2>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100">
        <div className="h-80 bg-gray-200 relative">
          <img
            src="./dad.png"
            onError={(e: any) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
            className="w-full h-full object-cover object-top"
            alt="Prem"
          />
          <div className="w-full h-full hidden flex-col items-center justify-center bg-gray-300 text-gray-500 absolute inset-0">
            <User className="w-20 h-20 mb-2 opacity-50" />
            <span className="text-xs font-bold text-center px-4">
              Add 'dad.png'
            </span>
          </div>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">
            Prem Bahadur Gaire
          </h3>
          <p className="text-red-600 font-medium text-sm mb-2">
            Proprietor & Instructor
          </p>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" /> 9845048863
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100">
        <div className="h-80 bg-gray-200 relative">
          <img
            src="./mom.png"
            onError={(e: any) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
            className="w-full h-full object-cover object-top"
            alt="Anita"
          />
          <div className="w-full h-full hidden flex-col items-center justify-center bg-gray-300 text-gray-500 absolute inset-0">
            <User className="w-20 h-20 mb-2 opacity-50" />
            <span className="text-xs font-bold text-center px-4">
              Add 'mom.png'
            </span>
          </div>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900">Anita Gaire</h3>
          <p className="text-red-600 font-medium text-sm mb-2">
            Manager & Reception
          </p>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" /> 9845278967
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in select-none">
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
      <div className="flex items-start gap-4">
        <div className="bg-red-100 p-3 rounded-full text-red-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-800">Address</p>
          <p className="text-gray-600">
            Bharatpur Height, Chitwan (Same building as Eye Express)
          </p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-red-100 p-3 rounded-full text-red-600">
          <Phone className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <p className="font-bold text-gray-800">Phone Numbers</p>
          <p className="text-gray-600 text-sm">Landline: 056-518289</p>
          <p className="text-gray-600 text-sm">Anita Gaire: 9845278967</p>
          <p className="text-gray-600 text-sm">Prem Gaire: 9845048863</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-red-100 p-3 rounded-full text-red-600">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-800">Email</p>
          <a
            href="mailto:cdriving47@gmail.com"
            className="text-red-600 hover:underline text-sm"
          >
            cdriving47@gmail.com
          </a>
        </div>
      </div>
      <a
        href="https://maps.app.goo.gl/ajFQJt3BAUP4dkCM8?g_st=ipc"
        target="_blank"
        className="block w-full text-center bg-red-900 text-white py-3 rounded-lg font-bold hover:bg-red-800 flex items-center justify-center gap-2"
      >
        <Map className="w-5 h-5" /> Get Directions (Google Maps)
      </a>
    </div>
    <div className="bg-gray-200 rounded-xl overflow-hidden shadow-inner h-96 w-full relative mt-8">
      <iframe
        className="absolute inset-0 w-full h-full"
        src="https://maps.google.com/maps?q=MCQH%2B28+Bharatpur&t=&z=17&ie=UTF8&iwloc=&output=embed"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        title="Location Map"
      ></iframe>
    </div>
  </div>
);

const AdminPanel = ({
  securitySettings,
  updateSecurity,
  onExit,
  rates,
  setRates,
}: any) => {
  const [adminTab, setAdminTab] = useState("pending");
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingBooking, setEditingBooking] = useState<any>(null);

  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pDuration, setPDuration] = useState("15 Days");
  const [pDaily, setPDaily] = useState("60 Mins");
  const [pDate, setPDate] = useState("");
  const [pNotes, setPNotes] = useState("");
  const [tempRates, setTempRates] = useState(rates);

  const [tempQuestion, setTempQuestion] = useState(securitySettings.question);
  const [tempAnswer, setTempAnswer] = useState(securitySettings.answer);
  const [securityMessage, setSecurityMessage] = useState("");

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "bookings"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSaveBookingEdit = async () => {
    if (!editingBooking) return;
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
        clientName: editingBooking.clientName,
        clientPhone: editingBooking.clientPhone,
        price: Number(editingBooking.finalPrice),
        date: editingBooking.newDate,
        status:
          editingBooking.status === "pending"
            ? "approved"
            : editingBooking.status,
      }
    );
    setEditingBooking(null);
    setAdminTab("active");
  };

  const updateProgress = async (booking: any, increment: number) => {
    const newProgress = (booking.progress || 0) + increment;
    if (newProgress < 0) return;
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "bookings", booking.id),
      { progress: newProgress }
    );
  };

  const deleteBooking = async (id: string) => {
    if (confirm("Delete this?"))
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "bookings", id)
      );
  };

  const sendConfirmation = (booking: any) => {
    const msg = `Namaste ${
      booking.clientName
    },\n\nYour driving course is confirmed!\n\n*Package:* ${
      booking.packageName
    }\n*Duration:* ${booking.duration}\n*Daily Time:* ${
      booking.dailyTime || "N/A"
    }\n*Start Date:* ${booking.date}\n*Total Price:* ${formatPrice(
      booking.price
    )}\n*Instructor:* ${
      booking.instructor
    }\n\nLocation: Bharatpur Height (Same building as Eye Express).\nPlease arrive 5 minutes early for your first session.\n\nContact: 9845048863`;
    window.open(
      `https://wa.me/${booking.clientPhone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const handleAddPrivate = async () => {
    if (!pName) return alert("Name Required");
    let price = 0;
    if (pDuration === "1 Day") price = rates["1 Day"];
    else if (pDuration === "15 Days")
      price = pDaily === "60 Mins" ? rates["15 Days"] : rates["15 Days (30m)"];
    else if (pDuration === "30 Days")
      price = pDaily === "60 Mins" ? rates["30 Days"] : rates["30 Days (30m)"];

    const pkgName =
      pDuration === "1 Day"
        ? "Private (1 Day)"
        : `${pDuration} Private Course (${pDaily})`;

    await addDoc(
      collection(db, "artifacts", appId, "public", "data", "bookings"),
      {
        clientName: pName,
        clientPhone: pPhone,
        packageName: pkgName,
        duration: pDuration,
        dailyTime: pDaily,
        date: pDate,
        price: price,
        instructor: "Prem Bahadur Gaire",
        type: "private",
        status: "private",
        notes: pNotes,
        progress: 0,
        createdAt: serverTimestamp(),
      }
    );
    alert("Private Booking Added!");
    setAdminTab("active");
    setPName("");
    setPPhone("");
    setPDate("");
    setPNotes("");
  };

  const handleUpdateSecurity = () => {
    if (tempQuestion.length < 5 || tempAnswer.length < 3) {
      setSecurityMessage("Question/Answer must be long enough.");
      return;
    }
    updateSecurity("question", tempQuestion);
    updateSecurity("answer", tempAnswer);
    setSecurityMessage("Security Question/Answer Updated!");
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter(
    (b) => b.status === "approved" || b.status === "private"
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-red-100 animate-fade-in overflow-hidden flex flex-col h-[calc(100vh-100px)] relative">
      {editingBooking && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Edit Booking</h3>
              <button onClick={() => setEditingBooking(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500">
                  Client Name
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingBooking.clientName}
                  onChange={(e: any) =>
                    setEditingBooking({
                      ...editingBooking,
                      clientName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Phone</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingBooking.clientPhone}
                  onChange={(e: any) =>
                    setEditingBooking({
                      ...editingBooking,
                      clientPhone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">
                  Price (Override)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded font-bold text-red-600"
                  value={editingBooking.finalPrice}
                  onChange={(e: any) =>
                    setEditingBooking({
                      ...editingBooking,
                      finalPrice: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">
                  Date & Time
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={editingBooking.newDate}
                  onChange={(e: any) =>
                    setEditingBooking({
                      ...editingBooking,
                      newDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditingBooking(null)}
                className="flex-1 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBookingEdit}
                className="flex-1 py-2 bg-red-900 text-white rounded font-bold"
              >
                <Save className="w-4 h-4 inline mr-1" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row border-b border-gray-100 h-full">
        <div className="bg-gray-50 md:w-64 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setAdminTab("pending")}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
              adminTab === "pending"
                ? "bg-red-100 text-red-700"
                : "text-gray-600 hover:bg-white"
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
                : "text-gray-600 hover:bg-white"
            }`}
          >
            <Calendar className="w-4 h-4" /> Active
          </button>
          <button
            onClick={() => setAdminTab("private")}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
              adminTab === "private"
                ? "bg-red-100 text-red-700"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            <Plus className="w-4 h-4" /> Add Private
          </button>
          <button
            onClick={() => setAdminTab("settings")}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
              adminTab === "settings"
                ? "bg-red-100 text-red-700"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button
            onClick={onExit}
            className="p-3 rounded-lg flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 mt-auto"
          >
            <RefreshCcw className="w-4 h-4" /> Logout
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {adminTab === "pending" && (
            <div className="space-y-3">
              {pendingBookings.length === 0 ? (
                <p className="text-gray-400 italic">No new requests.</p>
              ) : (
                pendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 border border-orange-200 bg-orange-50 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4"
                  >
                    <div>
                      <p className="font-bold text-gray-800">
                        {b.clientName}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          ({b.clientPhone})
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">{b.packageName}</p>
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
                        onClick={() =>
                          setEditingBooking({
                            ...b,
                            finalPrice: b.price,
                            newDate: b.date,
                          })
                        }
                        className="px-3 py-2 bg-red-800 text-white rounded text-sm font-bold hover:bg-red-900"
                      >
                        Review
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
                <p className="text-gray-400 italic">No active students.</p>
              ) : (
                activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800 text-lg">
                            {b.clientName}
                          </p>
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">{b.packageName}</p>
                        {b.notes && (
                          <p className="text-xs text-amber-600 bg-amber-50 p-1 rounded mt-1 inline-block">
                            📝 {b.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-bold text-blue-600">
                            {b.date}
                          </p>
                          <button
                            onClick={() =>
                              setEditingBooking({
                                ...b,
                                finalPrice: b.price,
                                newDate: b.date,
                              })
                            }
                          >
                            <Edit3 className="w-3 h-3 text-gray-400 hover:text-blue-500" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-700">
                          {formatPrice(b.price)}
                        </p>
                      </div>
                    </div>
                    {(b.packageName.includes("15") ||
                      b.packageName.includes("30")) && (
                      <div className="bg-gray-100 p-3 rounded mb-3">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                          <span>Course Progress</span>
                          <span>Day {b.progress || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateProgress(b, -1)}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{
                                width: `${
                                  ((b.progress || 0) /
                                    (b.packageName.includes("30") ? 30 : 15)) *
                                  100
                                }%`,
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
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold hover:bg-gray-200"
                      >
                        Call
                      </a>
                      <button
                        onClick={() => sendConfirmation(b)}
                        className="px-3 py-1 bg-[#25D366] text-white rounded text-xs font-bold hover:opacity-90 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> Send Info
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
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={pDuration}
                  onChange={(e: any) => setPDuration(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option>1 Day</option>
                  <option>15 Days</option>
                  <option>30 Days</option>
                </select>
                <select
                  value={pDaily}
                  onChange={(e: any) => setPDaily(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option>30 Mins</option>
                  <option>60 Mins</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 border rounded"
                value={pName}
                onChange={(e: any) => setPName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Phone"
                className="w-full p-2 border rounded"
                value={pPhone}
                onChange={(e: any) => setPPhone(e.target.value)}
              />
              <input
                type="text"
                placeholder="Date & Time"
                className="w-full p-2 border rounded"
                value={pDate}
                onChange={(e: any) => setPDate(e.target.value)}
              />
              <textarea
                placeholder="Notes (e.g. Family Discount, Cash Paid)"
                className="w-full p-2 border rounded"
                value={pNotes}
                onChange={(e: any) => setPNotes(e.target.value)}
              />
              <button
                onClick={handleAddPrivate}
                className="w-full bg-red-900 text-white p-3 rounded-lg font-bold"
              >
                Save to Active
              </button>
            </div>
          )}
          {adminTab === "settings" && (
            <div className="max-w-md space-y-6">
              <h2 className="text-xl font-bold">Security & Price Settings</h2>

              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                  <Key className="w-5 h-5 text-red-600" /> Change Login PIN
                </div>
                <label className="text-xs font-bold text-gray-500">
                  Current PIN:
                </label>
                <input
                  type="text"
                  value={securitySettings.pin}
                  onChange={(e: any) => updateSecurity("pin", e.target.value)}
                  className="w-full p-3 border rounded font-mono text-center tracking-widest text-lg"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                  <Lock className="w-5 h-5 text-indigo-600" /> Recovery Question
                  Setup
                </div>
                <label className="text-xs font-bold text-gray-500">
                  Security Question:
                </label>
                <input
                  type="text"
                  value={tempQuestion}
                  onChange={(e: any) => setTempQuestion(e.target.value)}
                  className="w-full p-3 border rounded mb-3"
                />
                <label className="text-xs font-bold text-gray-500">
                  Recovery Answer:
                </label>
                <input
                  type="text"
                  value={tempAnswer}
                  onChange={(e: any) => setTempAnswer(e.target.value)}
                  className="w-full p-3 border rounded mb-4"
                />
                <button
                  onClick={handleUpdateSecurity}
                  className="w-full py-2 bg-indigo-600 text-white rounded text-sm font-bold"
                >
                  Update Question/Answer
                </button>
                {securityMessage && (
                  <p className="text-xs mt-2 text-green-600 font-medium">
                    {securityMessage}
                  </p>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                  <Settings className="w-5 h-5 text-blue-600" /> Price Settings
                  (NPR)
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm">1 Day (Trial)</label>
                    <input
                      type="number"
                      value={tempRates["1 Day"]}
                      onChange={(e: any) =>
                        setTempRates({
                          ...tempRates,
                          "1 Day": Number(e.target.value),
                        })
                      }
                      className="w-24 p-1 border rounded text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">15 Days (60m)</label>
                    <input
                      type="number"
                      value={tempRates["15 Days"]}
                      onChange={(e: any) =>
                        setTempRates({
                          ...tempRates,
                          "15 Days": Number(e.target.value),
                        })
                      }
                      className="w-24 p-1 border rounded text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">15 Days (30m)</label>
                    <input
                      type="number"
                      value={tempRates["15 Days (30m)"]}
                      onChange={(e: any) =>
                        setTempRates({
                          ...tempRates,
                          "15 Days (30m)": Number(e.target.value),
                        })
                      }
                      className="w-24 p-1 border rounded text-right bg-blue-50 border-blue-200"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">30 Days (60m)</label>
                    <input
                      type="number"
                      value={tempRates["30 Days"]}
                      onChange={(e: any) =>
                        setTempRates({
                          ...tempRates,
                          "30 Days": Number(e.target.value),
                        })
                      }
                      className="w-24 p-1 border rounded text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">30 Days (30m)</label>
                    <input
                      type="number"
                      value={tempRates["30 Days (30m)"]}
                      onChange={(e: any) =>
                        setTempRates({
                          ...tempRates,
                          "30 Days (30m)": Number(e.target.value),
                        })
                      }
                      className="w-24 p-1 border rounded text-right bg-blue-50 border-blue-200"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setRates(tempRates);
                      alert("Rates Updated!");
                    }}
                    className="w-full py-2 bg-red-900 text-white rounded text-sm font-bold mt-2"
                  >
                    Update Prices
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  useCopyProtection(true);
  const [view, setView] = useState("home");
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");

  const [newPin, setNewPin] = useState("");
  const [recoveryStep, setRecoveryStep] = useState("question");

  const [securitySettings, setSecuritySettings] = useStickyState(
    {
      pin: "1234",
      question: "What is the name of your first pet?",
      answer: "lucky",
    },
    "ncdc_security_v3"
  );

  // Rate State
  const [rates, setRates] = useStickyState(
    {
      "1 Day": 1500,
      "15 Days": 15000,
      "15 Days (30m)": 10000,
      "30 Days": 25000,
      "30 Days (30m)": 18000,
    },
    "ncdc_rates_v2"
  );

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (loginInput === securitySettings.pin) {
      setView("admin");
      setLoginError("");
      setLoginInput("");
    } else {
      setLoginError("Incorrect PIN");
    }
  };

  // FIX: Type 'prev' explicitly as 'any' to fix the TS7006 error
  const handleRecover = (e: any) => {
    e.preventDefault();
    if (recoveryStep === "question") {
      if (
        recoveryAnswer.toLowerCase().trim() ===
        securitySettings.answer.toLowerCase().trim()
      ) {
        setRecoveryStep("reset");
        setLoginError("");
      } else {
        setLoginError("Incorrect Answer");
      }
    } else {
      if (newPin.length < 4) {
        setLoginError("PIN must be at least 4 digits");
        return;
      }
      // FIXED LINE BELOW
      setSecuritySettings((prev: any) => ({ ...prev, pin: newPin }));
      alert("PIN Reset Successful! Logging you in...");
      setView("admin");
      setRecoveryStep("question");
      setRecoveryAnswer("");
      setNewPin("");
      setLoginError("");
    }
  };

  // FIX: Type 'prev' explicitly as 'any' to fix the TS7006 error
  const updateSecurity = (field: string, value: string) => {
    setSecuritySettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddBooking = async (data: any) => {
    try {
      if (db)
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "bookings"),
          { ...data, createdAt: serverTimestamp() }
        );
      else alert("Database not ready");
    } catch (e: any) {
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
      className="min-h-screen bg-gray-50 font-sans select-none flex flex-col"
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
            <BookingView onAddBooking={handleAddBooking} rates={rates} />
          </div>
        )}

        {view === "login" && (
          <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl animate-fade-in border-t-4 border-red-800">
              <div className="text-center mb-6">
                <h2 className="font-bold text-xl text-gray-800">Admin Login</h2>
                <p className="text-gray-500 text-sm">Owner Access Only</p>
              </div>
              <form onSubmit={handleLogin}>
                <input
                  type="password"
                  value={loginInput}
                  onChange={(e: any) => setLoginInput(e.target.value)}
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
                  className="w-full p-3 bg-red-900 text-white rounded-lg font-bold hover:bg-red-800 transition-colors shadow-lg"
                >
                  Login
                </button>
              </form>
              <button
                onClick={() => {
                  setView("recovery");
                  setLoginError("");
                }}
                className="w-full mt-4 text-xs text-gray-400 hover:text-red-500 text-center underline"
              >
                Forgot PIN?
              </button>
            </div>
          </div>
        )}

        {view === "recovery" && (
          <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl animate-fade-in">
              <h2 className="font-bold text-xl mb-4 text-center">
                {recoveryStep === "question" ? "Reset PIN" : "Set New PIN"}
              </h2>
              <form onSubmit={handleRecover}>
                {recoveryStep === "question" ? (
                  <>
                    <p className="text-sm text-gray-500 mb-2">
                      Security Question:
                    </p>
                    <p className="font-bold text-gray-800 mb-4 p-3 bg-gray-50 rounded border">
                      {securitySettings.question}
                    </p>
                    <input
                      type="text"
                      placeholder="Your Answer"
                      value={recoveryAnswer}
                      onChange={(e: any) => setRecoveryAnswer(e.target.value)}
                      className="w-full p-3 border rounded mb-4 outline-none focus:border-red-500"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-2">
                      Enter your new PIN code:
                    </p>
                    <input
                      type="text"
                      placeholder="New PIN"
                      value={newPin}
                      onChange={(e: any) => setNewPin(e.target.value)}
                      className="w-full p-3 border rounded mb-4 outline-none focus:border-red-500 text-center tracking-widest text-xl"
                      autoFocus
                    />
                  </>
                )}
                {loginError && (
                  <p className="text-red-500 text-sm mb-4">{loginError}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-red-900 text-white p-3 rounded font-bold"
                >
                  {recoveryStep === "question"
                    ? "Verify Answer"
                    : "Save New PIN"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setRecoveryStep("question");
                  }}
                  className="w-full mt-2 text-sm text-gray-400 text-center block"
                >
                  Back to Login
                </button>
              </form>
            </div>
          </div>
        )}

        {view === "admin" && (
          <div className="max-w-6xl mx-auto p-4">
            <AdminPanel
              securitySettings={securitySettings}
              updateSecurity={updateSecurity}
              rates={rates}
              setRates={setRates}
              onExit={() => setView("home")}
            />
          </div>
        )}
      </main>
      <footer className="bg-red-950 text-red-200 py-8 text-center text-sm">
        <p className="mb-2 text-white font-bold">
          New Chitwan Driving Training Centre
        </p>
        <p>Bharatpur Height, Chitwan (Same building as Eye Express)</p>
        <p className="text-xs mt-1">Email: cdriving47@gmail.com</p>
        <p className="mt-4 opacity-50">
          © 2024 All Rights Reserved. • PAN: 301569099
        </p>
      </footer>
    </div>
  );
}
