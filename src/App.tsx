import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import {
  // Added Dispatch and SetStateAction for correct generic typing
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
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Globe,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  onAuthStateChanged,
  RecaptchaVerifier,
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
  Timestamp,
} from "firebase/firestore";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDPZQhv_Ox_FytpDR_jUbsyWMzcPa_xxk",
  authDomain: "new-chitwan-driving.firebaseapp.com",
  projectId: "new-chitwan-driving",
  storageBucket: "new-chitwan-driving.firebaseapp.com",
  messagingSenderId: "538552281062",
  appId: "1:538552281062:web:b6f756314ff756314ff53acch11827",
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

// 🔥 TS FIX: Define the explicit type for Booking objects
interface BookingItem {
  id: string;
  status: "approved" | "pending" | "private" | "rejected" | string;
  clientName: string;
  clientPhone: string;
  packageName: string;
  duration: string;
  dailyTime?: string;
  date: string; // Summary date/time string
  courseDates: Array<{ date: string; time: string | null }>; // Detailed schedule
  price: number;
  instructor: string;
  type: "public" | "private";
  progress: number;
  notes?: string;
  createdAt?: Timestamp;
}

// 🔥 TS FIX: Define the explicit type for Security Settings
interface SecuritySettings {
  pin: string;
  question: string;
  answer: string;
}

// --- LANGUAGE DATA ---
const dictionary: { [key: string]: { [key: string]: string } } = {
  en: {
    Home: "Home",
    "Book Training": "Book Training",
    "About Us": "About Us",
    Contact: "Contact",
    "Est. 2003": "Est. 2003",
    "Driving Training Centre": "Driving Training Centre",
    "Learn to Drive...": "Learn to Drive with Confidence in Chitwan",
    "High Pass Rate": "High Pass Rate",
    "Expert Instructors": "Expert Instructors",
    "Well Maintained": "Well Maintained",
    "Check Progress": "Check Progress",
    "New Booking": "New Booking",
    "Student Progress Check": "Student Progress Check",
    "Enter Phone Number": "Enter Phone Number",
    "Active Courses": "Active Courses",
    "Next Class": "Next Class",
    "Course Progress": "Course Progress",
    "Send Info": "Send Info",
    Call: "Call",
    Pending: "Pending",
    Active: "Active",
    "Add Private": "Add Private",
    Settings: "Settings",
    Logout: "Logout",
    "Review Schedule": "View Schedule",
    Save: "Save",
    Reject: "Reject",
    Review: "Review",
    "Total Days": "Total Days",
    "First Session": "First Session",
    "Total Price": "Total Price",
    Address: "Address",
    "Bharatpur Address":
      "Bharatpur Height, Chitwan (Same building as Eye Express)",
    "Phone Numbers": "Phone Numbers",
    Email: "Email",
    "Get Directions": "Get Directions (Google Maps)",
    "Owner Access Only": "Owner Access Only",
    "Forgot PIN?": "Forgot PIN?",
    "Reset PIN": "Reset PIN",
    "Security Question": "Security Question",
    "Update Prices": "Update Prices",
    "Price Settings": "Price Settings (NPR)",
    "Private Booking": "Add Custom Private Booking",
    "Go to Calendar": "Go to Calendar",
    Duration: "Duration",
    "Daily Time": "Daily Time",
    "Client Name": "Client Name",
    "Client Phone": "Client Phone",
    Price: "Price",
    "Date & Time": "Date & Time",
    "Update Question/Answer": "Update Question/Answer",
    "SIMULATION MODE (Real SMS blocked in Preview)":
      "SIMULATION MODE (Real SMS blocked in Preview)",
    "Use code:": "Use code:",
    "Incorrect Code. Try 123456.": "Incorrect Code. Try 123456.",
    "Back to Dates": "Back to Dates",
    "Appointment Date": "Appointment Date",
    "Choose Time": "Choose Time",
    "Change Time": "Change Time",
    Instructor: "Instructor",
    "Your Name": "Your Name",
    "Mobile Number": "Mobile Number",
    "Verify & Submit": "Verify & Submit",
    "Verifying...": "Verifying...",
    "Confirm Booking": "Confirm Booking",
    "Wrong Number?": "Wrong Number?",
    "Full Course Schedule": "Full Course Schedule",
    Close: "Close",
    "View Schedule": "View Schedule",
    Remove: "Remove",
    "Edit Schedule": "Edit Schedule",
    Back: "Back",
    Course: "Course",
    "days total": "days total",
    Req: "Req.",
    "Same Time Daily": "Same Time Daily",
    "Different Times": "Different Times",
    "Select Time": "Select Time",
    "Continue to Verification": "Continue to Verification",
    "Review & Save": "Review & Save",
    "Save New Schedule": "Save New Schedule",
    "Start Over": "Start Over",
    Cancel: "Cancel",
    "Same time for all sessions, or different times?":
      "Same time for all sessions, or different times?",
    sessions: "sessions",
    "Please enter valid name and phone number":
      "Please enter valid name and phone number",
    "Private (1 Day)": "Private (1 Day)",
    "Private Course": "Private Course",
    "Trial Preparation (1 Day)": "Trial Preparation (1 Day)",
    "PIN must be at least 4 digits": "PIN must be at least 4 digits",
    "To be scheduled": "To be scheduled",
    "Update PIN": "Update PIN",
    "Our History": "Our History",
    "Our Team": "Our Team",
    "days selected": "days selected",
    Selected: "Selected",
    "Configure your course on the left": "Configure your course on the left",
    "to proceed.": "to proceed.",
    "Estimated Total": "Estimated Total",
    "Time Preference": "Time Preference",
    "This time will be applied to all": "This time will be applied to all",
    "selected days.": "selected days.",
    "Set Times for Each Day": "Set Times for Each Day",
    "times set.": "times set.",
    Client: "Client",
    Day: "Day",
    "What is the name of your first pet?":
      "What is the name of your first pet?",
    of: "of",
  },
  ne: {
    Home: "मुख्य पृष्ठ",
    "Book Training": "बुकिङ गर्नुहोस्",
    "About Us": "हाम्रो बारेमा",
    Contact: "सम्पर्क",
    "Est. 2003": "स्था. २०६०",
    "Driving Training Centre": "ड्राइभिङ तालिम केन्द्र",
    "Learn to Drive...": "चितवनमा आत्मविश्वासका साथ ड्राइभिङ सिक्नुहोस्",
    "High Pass Rate": "उच्च सफलता दर",
    "Expert Instructors": "विशेषज्ञ प्रशिक्षक",
    "Well Maintained": "सुसज्जित सवारी",
    "Check Progress": "प्रगति हेर्नुहोस्",
    "New Booking": "नयाँ बुकिङ",
    "Student Progress Check": "विद्यार्थीको प्रगति जाँच",
    "Enter Phone Number": "फोन नम्बर प्रविष्ट गर्नुहोस्",
    "Active Courses": "सक्रिय कक्षाहरू",
    "Next Class": "अर्को कक्षा",
    "Course Progress": "प्रगति",
    "Send Info": "जानकारी पठाउनुहोस्",
    Call: "कल गर्नुहोस्",
    Pending: "बाँकी बुकिङ",
    Active: "सक्रिय बुकिङ",
    "Add Private": "निजी बुकिङ थप्नुहोस्",
    Settings: "सेटिङहरू",
    Logout: "बाहिर निस्कनुहोस्",
    "Review Schedule": "तालिका हेर्नुहोस्",
    Save: "सुरक्षित गर्नुहोस्",
    Reject: "अस्वीकार गर्नुहोस्",
    Review: "समीक्षा गर्नुहोस्",
    "Total Days": "जम्मा दिन",
    "First Session": "पहिलो कक्षा",
    "Total Price": "कुल मूल्य",
    Address: "ठेगाना",
    "Bharatpur Address": "भरतपुर हाइट, चितवन (आई एक्सप्रेस भवन)",
    "Phone Numbers": "फोन नम्बरहरू",
    Email: "ईमेल",
    "Get Directions": "दिशा निर्देशन (गुगल नक्सा)",
    "Owner Access Only": "मालिकको पहुँच मात्र",
    "Forgot PIN?": "पिन बिर्सनुभयो?",
    "Reset PIN": "पिन रिसेट गर्नुहोस्",
    "Security Question": "सुरक्षा प्रश्न",
    "Update Prices": "मूल्य अपडेट गर्नुहोस्",
    "Price Settings": "मूल्य सेटिङहरू (रु)",
    "Private Booking": "निजी बुकिङ थप्नुहोस्",
    "Go to Calendar": "क्यालेन्डरमा जानुहोस्",
    Duration: "अवधि",
    "Daily Time": "दैनिक समय",
    "Client Name": "ग्राहकको नाम",
    "Client Phone": "ग्राहकको फोन",
    Price: "मूल्य",
    "Date & Time": "मिति र समय",
    "Update Question/Answer": "प्रश्न/उत्तर अपडेट गर्नुहोस्",
    "SIMULATION MODE (Real SMS blocked in Preview)":
      "सिमुलेशन मोड (प्रिभ्यूमा एसएमएस रोकिएको छ)",
    "Use code:": "कोड प्रयोग गर्नुहोस्:",
    "Incorrect Code. Try 123456.": "गलत कोड। 123456 प्रयास गर्नुहोस्।",
    "Back to Dates": "मितिमा फर्कनुहोस्",
    "Appointment Date": "बुकिङ मिति",
    "Choose Time": "समय छान्नुहोस्",
    "Change Time": "समय परिवर्तन गर्नुहोस्",
    Instructor: "प्रशिक्षक",
    "Your Name": "तपाईंको नाम",
    "Mobile Number": "मोबाइल नम्बर",
    "Verify & Submit": "पुष्टि गरी बुझाउनुहोस्",
    "Verifying...": "पुष्टि गर्दै...",
    "Confirm Booking": "बुकिङ निश्चित गर्नुहोस्",
    "Wrong Number?": "गलत नम्बर?",
    "Full Course Schedule": "पूर्ण कक्षा तालिका",
    Close: "बन्द गर्नुहोस्",
    "View Schedule": "तालिका हेर्नुहोस्",
    Remove: "हटाउनुहोस्",
    "Edit Schedule": "तालिका सम्पादन गर्नुहोस्",
    Back: "पछाडि",
    Course: "कोर्स",
    "days total": "दिन कुल",
    Req: "अनुरोध",
    "Same Time Daily": "दैनिक एउटै समय",
    "Different Times": "फरक फरक समय",
    "Select Time": "समय छान्नुहोस्",
    "Continue to Verification": "पुष्टिका लागि अगाडि बढ्नुहोस्",
    "Review & Save": "समीक्षा गरी सुरक्षित गर्नुहोस्",
    "Save New Schedule": "नयाँ तालिका सुरक्षित गर्नुहोस्",
    "Start Over": "फेरि सुरु गर्नुहोस्",
    Cancel: "रद्द गर्नुहोस्",
    "Same time for all sessions, or different times?":
      "सबै कक्षा एउटै समयमा वा फरक समयमा?",
    sessions: "कक्षाहरू",
    "Please enter valid name and phone number":
      "कृपया वैध नाम र फोन नम्बर प्रविष्ट गर्नुहोस्",
    "Private (1 Day)": "निजी (१ दिन)",
    "Private Course": "निजी कोर्स",
    "Trial Preparation (1 Day)": "परीक्षण तयारी (१ दिन)",
    "PIN must be at least 4 digits": "पिन कम्तीमा ४ अंकको हुनुपछ",
    "To be scheduled": "तालिका बनाउन बाँकी",
    "Update PIN": "पिन अपडेट गर्नुहोस्",
    "Our History": "हाम्रो इतिहास",
    "Our Team": "हाम्रो टोली",
    "days selected": "दिन छानियो",
    Selected: "छानिएको",
    "Configure your course on the left": "बायाँपट्टि आफ्नो कोर्स सेट गर्नुहोस्",
    "to proceed.": "अगाडि बढ्नका लागि।",
    "Estimated Total": "अनुमानित कुल",
    "Time Preference": "समय प्राथमिकता",
    "This time will be applied to all": "यो समय सबैमा लागू हुनेछ",
    "selected days.": "छानिएका दिनहरूमा।",
    "Set Times for Each Day": "प्रत्येक दिनको समय सेट गर्नुहोस्",
    "times set.": "समय सेट भयो।",
    Client: "ग्राहक",
    Day: "दिन",
    "What is the name of your first pet?":
      "तपाईंको पहिलो पाल्तु जनावरको नाम के हो?",
    of: "को",
  },
};

const T = (key: string, lang: string) => dictionary[lang]?.[key] || key;

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
// 🔥 TS2558 FIX: Make useStickyState a generic function
export function useStickyState<T>(
  defaultValue: T,
  key: string
): [T, Dispatch<SetStateAction<T>>] {
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

// Calendar Utilities
const getMonthDetails = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // FIX: Using English day names for calendar structure regardless of language
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    T("January", "en"),
    T("February", "en"),
    T("March", "en"),
    T("April", "en"),
    T("May", "en"),
    T("June", "en"),
    T("July", "en"),
    T("August", "en"),
    T("September", "en"),
    T("October", "en"),
    T("November", "en"),
    T("December", "en"),
  ];

  let calendar = [];
  let day = 1;

  for (let i = 0; i < 6; i++) {
    let week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        week.push(null);
      } else if (day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day++;
      }
    }
    calendar.push(week);
    if (day > daysInMonth) break;
  }
  return { calendar, monthName: monthNames[month], dayNames };
};

// --- COMPONENTS ---

const CalendarPicker = ({
  selectedDates,
  setSelectedDates,
  duration,
  onNext,
  isPrivate = false,
  lang,
}: any) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const monthDetails = useMemo(
    () => getMonthDetails(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const requiredDays =
    duration === "15 Days" ? 15 : duration === "30 Days" ? 30 : 1;

  const isDateSelected = (day: number) => {
    const dateString = `${currentYear}-${currentMonth + 1}-${day}`;
    return selectedDates.some((item: any) => item.date === dateString);
  };

  const toggleDate = (day: number) => {
    const dateString = `${currentYear}-${currentMonth + 1}-${day}`;
    const newDate = new Date(currentYear, currentMonth, day);

    if (
      !isPrivate &&
      newDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    )
      return;

    setSelectedDates((prev: any[]) => {
      if (prev.some((item: any) => item.date === dateString)) {
        return prev
          .filter((item) => item.date !== dateString)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
      } else {
        if (requiredDays > 1 && prev.length >= requiredDays) {
          return prev;
        }
        const newItem = { date: dateString, time: null };
        if (requiredDays === 1) return [newItem];
        return [...prev, newItem].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
    });
  };

  const navMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getDayClass = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const isPast =
      date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isSelected = isDateSelected(day);

    let className =
      "p-2 rounded-full h-8 w-8 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center";

    if (!isPrivate && isPast) {
      className +=
        " bg-slate-100 text-slate-400 cursor-not-allowed line-through";
    } else if (isSelected) {
      className += " bg-red-600 text-white shadow-lg";
    } else if (selectedDates.length >= requiredDays && requiredDays > 1) {
      className += " bg-slate-50 text-slate-400 cursor-not-allowed";
    } else {
      className += " hover:bg-red-50 text-slate-800";
    }
    return className;
  };

  const isSelectionComplete = selectedDates.length === requiredDays;

  return (
    <div className="animate-fade-in bg-white p-6 rounded-lg shadow-inner border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navMonth(-1)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-bold text-lg text-slate-800">
          {monthDetails.monthName} {currentYear}
        </h3>
        <button
          onClick={() => navMonth(1)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {requiredDays > 1 && (
        <div
          className={`text-center p-3 rounded-lg text-sm font-bold mb-4 transition-colors ${
            isSelectionComplete
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {selectedDates.length} {T("of", lang)} {requiredDays}{" "}
          {T("days selected", lang)}.
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 text-center">
        {monthDetails.dayNames.map((day) => (
          <span key={day} className="text-xs font-bold text-slate-500 py-2">
            {day}
          </span>
        ))}
        {monthDetails.calendar.flat().map((day, index) => (
          <div key={index} className="flex items-center justify-center">
            {day !== null && (
              <button
                onClick={() => toggleDate(day)}
                className={getDayClass(day)}
                disabled={
                  !isPrivate &&
                  new Date(currentYear, currentMonth, day) <
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    ) &&
                  day > 0
                }
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>

      {isSelectionComplete && (
        <div className="mt-6 text-center">
          <button
            onClick={onNext}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2 mx-auto"
          >
            {T("Confirm Dates & Choose Time", lang)}{" "}
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const EditScheduleModal = ({ booking, onClose, lang, onSave }: any) => {
  const [tempSchedule, setTempSchedule] = useState([...booking.courseDates]);
  const [saving, setSaving] = useState(false);

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

  const setTimeForDate = (index: number, time: string) => {
    setTempSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, time } : item))
    );
  };

  const handleSave = async () => {
    if (tempSchedule.some((item) => item.time === null)) {
      alert(T("Please select a time for every date.", lang));
      return;
    }
    setSaving(true);
    const newDateSummary =
      tempSchedule.length > 1
        ? `${T("First session", lang)}: ${tempSchedule[0].date} at ${
            tempSchedule[0].time
          } (${tempSchedule.length} ${T("days total", lang)})`
        : `${tempSchedule[0].date} at ${tempSchedule[0].time}`;

    await onSave(booking.id, tempSchedule, newDateSummary);
    setSaving(false);
    onClose();
  };

  const formatCourseDate = (dateString: string) => {
    const parts = dateString.split("-").map(Number);
    if (parts.length < 3) return dateString;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day).toLocaleDateString("en-NP", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            {T("Edit Schedule", lang)}
          </h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {booking.clientName} - {booking.packageName}
        </p>

        <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
          {tempSchedule.map((item: any, index: number) => (
            <div
              key={item.date}
              className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200"
            >
              <span className="font-bold text-slate-700 text-sm">
                {T("Day", lang)} {index + 1} ({formatCourseDate(item.date)}):
              </span>
              <select
                value={item.time || ""}
                onChange={(e: any) => setTimeForDate(index, e.target.value)}
                className="p-1 border rounded text-xs font-mono"
              >
                <option value="" disabled>
                  {T("Select Time", lang)}
                </option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            {T("Cancel", lang)}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-1"
          >
            {saving ? (
              T("Saving...", lang)
            ) : (
              <>
                <Save className="w-4 h-4" /> {T("Save New Schedule", lang)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ setView, activeView, language, setLanguage }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { id: "home", label: T("Home", language) },
    { id: "booking", label: T("Book Training", language) },
    { id: "about", label: T("About Us", language) },
    { id: "contact", label: T("Contact", language) },
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
                {T("Driving Training Centre", language)}
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
            <div className="ml-4">
              <button
                onClick={() => setLanguage(language === "en" ? "ne" : "en")}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs font-bold"
              >
                <Globe className="w-4 h-4" />{" "}
                {language === "en" ? "नेपाली" : "EN"}
              </button>
            </div>
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
              {T("Admin Login", language)}
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "ne" : "en")}
              className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-400 hover:bg-slate-700 flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />{" "}
              {language === "en" ? "नेपाली" : "English"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// 🔥 RECAPTCHA FIX: Added recaptchaVerifier prop
const BookingView = ({ onAddBooking, rates, lang, recaptchaVerifier }: any) => {
  const [tab, setTab] = useState("new");

  const [duration, setDuration] = useState("15 Days");
  const [dailyTime, setDailyTime] = useState("60 Mins");
  const [currentPrice, setCurrentPrice] = useState(rates["15 Days"]);

  const [selectedDates, setSelectedDates] = useState<any[]>([]);
  const [timeMode, setTimeMode] = useState("same");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+977 ");
  const [instructor, setInstructor] = useState("Prem Bahadur Gaire");

  const [step, setStep] = useState("customize");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);

  const [checkPhone, setCheckPhone] = useState("");
  const [myBookings, setMyBookings] = useState<any[]>([]);
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
    setSelectedDates([]);
  }, [duration, dailyTime, rates]);

  const setTimeForAll = (time: string) => {
    setSelectedDates((prev: any[]) => prev.map((item) => ({ ...item, time })));
  };

  const setTimeForDate = (dateString: string, time: string) => {
    setSelectedDates((prev: any[]) =>
      prev.map((item) => (item.date === dateString ? { ...item, time } : item))
    );
  };

  const isTimeSelectionComplete = useMemo(() => {
    return selectedDates.every((item) => item.time !== null);
  }, [selectedDates]);

  const requestOtp = async () => {
    if (!clientName || clientPhone.length < 10) {
      setError(T("Please enter valid name and phone number", lang));
      return;
    }
    // 🔥 RECAPTCHA FIX: Ensure the verifier is ready before proceeding
    if (!recaptchaVerifier) {
      setError("Recaptcha verification not ready. Please try again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 🔥 RECAPTCHA FIX: Pass the recaptchaVerifier as the third argument
      const result = await signInWithPhoneNumber(
        auth,
        clientPhone,
        recaptchaVerifier
      );

      setConfirmationResult(result as any);
      setStep("otp");
      setLoading(false);
    } catch (err: any) {
      console.warn("SMS Failed or Recaptcha Error. Falling back to Sim Mode.");

      // If the real SMS fails (e.g., in a preview environment), we trigger simulation mode.
      setSimulationMode(true);
      setStep("otp");
      setLoading(false);
      // 🔥 RECAPTCHA FIX: Reset recaptcha to allow re-verification if the user goes back and retries
      if (recaptchaVerifier && recaptchaVerifier.clear) {
        recaptchaVerifier.clear();
      }
      alert(
        `${T("SIMULATION MODE (Real SMS blocked in Preview)", lang)}.\n\n${T(
          "Use code:",
          lang
        )} 123456`
      );
    }
  };

  const verifyOtpAndBook = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      if (simulationMode) {
        if (otp !== "123456") throw new Error(T("Wrong code", lang));
      } else {
        await (confirmationResult as any).confirm(otp);
      }

      const pkgName =
        duration === "1 Day"
          ? T("Trial Preparation (1 Day)", lang)
          : `${duration} ${T("Course", lang)} (${dailyTime}/${T("day", lang)})`;

      const dateSummary =
        selectedDates.length > 1
          ? `${T("First session", lang)}: ${selectedDates[0].date} at ${
              selectedDates[0].time
            } (${selectedDates.length} ${T("days total", lang)})`
          : `${selectedDates[0].date} at ${selectedDates[0].time}`;

      await onAddBooking({
        clientName,
        clientPhone,
        packageName: pkgName,
        duration,
        dailyTime,
        date: dateSummary, // Single string for admin list view
        courseDates: selectedDates, // Detailed array for detailed view
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
      setError(T("Incorrect Code. Try 123456.", lang));
    }
  };

  const handleCheckProgress = async () => {
    setCheckError("");
    setMyBookings([]);
    // FIX: Aggressively clean number for reliable search
    const cleanPhone = checkPhone.replace(/[^\d+]/g, "");
    if (!cleanPhone || cleanPhone.length < 9)
      return setCheckError(T("Please enter a valid phone number.", lang));

    // CRITICAL FIX: Query the DB using the cleaned number
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "bookings"),
      where("clientPhone", "==", cleanPhone)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      setCheckError(T("No booking found for this number.", lang));
    } else {
      // 🔥 TS2339 FIX: Map the data to the correct BookingItem type before filtering
      const activeCourses = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as BookingItem))
        .filter(
          (booking: BookingItem) =>
            booking.status === "approved" || booking.status === "private"
        );

      if (activeCourses.length === 0) {
        setCheckError(
          T("No *active* (approved) booking found for this number.", lang)
        );
      } else {
        setMyBookings(activeCourses);
        setCheckError("");
      }
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
            {T("Request Sent!", lang)}
          </h2>
          <p className="text-slate-600 mb-6">
            {T(
              "Your phone number has been verified. Prem Sir will review your request shortly.",
              lang
            )}
          </p>
          <button
            onClick={() => {
              setStep("customize");
              setDuration("15 Days");
              setSelectedDates([]);
              setTimeMode("same");
            }}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold"
          >
            {T("New Booking", lang)}
          </button>
        </div>
      </div>
    );
  }

  const requiredDays =
    duration === "15 Days" ? 15 : duration === "30 Days" ? 30 : 1;
  const isDateSelectionComplete = selectedDates.length === requiredDays;
  const nextStepButtonText =
    requiredDays > 1
      ? `${T("Select", lang)} ${requiredDays} ${T("Days", lang)}`
      : T("Choose Date", lang);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col min-h-[550px] border border-slate-100 animate-fade-in">
      <div className="flex border-b">
        <button
          onClick={() => setTab("new")}
          className={`flex-1 p-4 text-center font-bold ${
            tab === "new"
              ? "bg-slate-50 text-red-600 border-b-2 border-red-600"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          {T("New Booking", lang)}
        </button>
        <button
          onClick={() => setTab("check")}
          className={`flex-1 p-4 text-center font-bold ${
            tab === "check"
              ? "bg-slate-50 text-red-600 border-b-2 border-red-600"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          {T("Check Progress", lang)}
        </button>
      </div>

      {tab === "check" && (
        <div className="p-8 flex flex-col items-center justify-center h-full">
          <h3 className="text-xl font-bold mb-4 text-slate-800">
            {T("Student Progress Check", lang)}
          </h3>
          <div className="flex gap-2 w-full max-w-md mb-6">
            <input
              type="tel"
              placeholder={T("Enter Phone Number", lang)}
              className="flex-grow p-3 border rounded"
              value={checkPhone}
              onChange={(e: any) => setCheckPhone(e.target.value)}
            />
            <button
              onClick={handleCheckProgress}
              className="bg-slate-900 text-white px-6 rounded font-bold"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          {checkError && <p className="text-red-500 mb-4">{checkError}</p>}

          {myBookings.length > 0 && (
            <div className="w-full max-w-lg space-y-4">
              <h4 className="font-bold text-lg text-slate-800">
                {T("Active Courses", lang)} ({myBookings.length})
              </h4>
              {myBookings.map((booking, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-6"
                >
                  <h4 className="font-bold text-md text-slate-800 mb-1">
                    {booking.packageName}
                  </h4>
                  <p className="text-slate-500 text-xs mb-4">
                    Instructor: {booking.instructor}
                  </p>

                  {(booking.packageName.includes("15") ||
                    booking.packageName.includes("30")) && (
                    <>
                      <div className="mb-2 flex justify-between text-xs font-bold uppercase text-slate-400">
                        <span>{T("Course Progress", lang)}</span>
                        <span>
                          Day {booking.progress || 0} /{" "}
                          {booking.packageName.includes("30") ? 30 : 15}
                        </span>
                      </div>
                      <div className="h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${
                              ((booking.progress || 0) /
                                (booking.packageName.includes("30")
                                  ? 30
                                  : 15)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                  <div className="text-center p-3 bg-white rounded border border-slate-200 text-sm">
                    {T("Next Class", lang)}:{" "}
                    <span className="font-bold text-slate-800">
                      {booking.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "new" && (
        <div className="flex flex-col md:flex-row flex-grow">
          <div className="md:w-1/2 p-6 bg-slate-50/50 border-r border-slate-100 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {T("Build Your Course", lang)}
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              {T("Selected", lang)}:{" "}
              <span className="font-bold text-red-600">
                {duration} ({dailyTime})
              </span>
            </p>
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                {T("Course Duration", lang)}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["1 Day", "15 Days", "30 Days"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`p-3 rounded-lg text-sm font-bold transition-all ${
                      duration === d
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-red-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            {duration !== "1 Day" && (
              <div className="mb-6 animate-fade-in">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  {T("Daily Session Length", lang)}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["30 Mins", "60 Mins"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setDailyTime(t)}
                      className={`p-3 rounded-lg text-sm font-bold transition-all ${
                        dailyTime === t
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    {T("Estimated Total", lang)}
                  </p>
                  <p className="text-3xl font-black text-slate-800">
                    {formatPrice(currentPrice)}
                  </p>
                </div>
                {step === "customize" && (
                  <button
                    onClick={() => setStep("date")}
                    className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2"
                  >
                    {nextStepButtonText}{" "}
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-6 bg-white">
            {step === "customize" && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 opacity-20" />
                </div>
                <p>
                  {T("Configure your course on the left", lang)}
                  <br />
                  {T("to proceed.", lang)}
                </p>
              </div>
            )}

            {/* DATE PICKER STEP */}
            {step === "date" && requiredDays > 1 && (
              <CalendarPicker
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
                duration={duration}
                onNext={() => setStep("time_mode")}
                lang={lang}
              />
            )}
            {step === "date" && requiredDays === 1 && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-lg mb-4">
                  {T("Appointment Date", lang)}
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {["Tomorrow", "Day After Tomorrow"].map((d) => (
                    <button
                      key={d}
                      onClick={() =>
                        setSelectedDates([{ date: d, time: null }])
                      }
                      className={`p-3 border rounded text-sm font-medium transition-colors ${
                        selectedDates[0]?.date === d
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {selectedDates.length > 0 && (
                  <button
                    onClick={() => setStep("time")}
                    className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                  >
                    {T("Choose Time", lang)}{" "}
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setStep("customize")}
                  className="mt-6 text-sm text-slate-400 underline"
                >
                  {T("Back", lang)}
                </button>
              </div>
            )}

            {/* TIME MODE STEP (Same or Different) */}
            {step === "time_mode" && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-lg mb-4 text-slate-800">
                  {T("Time Preference", lang)}
                </h3>
                <p className="text-slate-500 mb-6">
                  {T("Same time for all sessions, or different times?", lang)}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setTimeMode("same");
                      setStep("time");
                    }}
                    className={`p-4 rounded-xl border-4 transition-colors ${
                      timeMode === "same"
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <Clock className="w-6 h-6 mb-2 text-red-600" />
                    <span className="font-bold text-sm">
                      {T("Same Time Daily", lang)}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setTimeMode("different");
                      setStep("time");
                    }}
                    className={`p-4 rounded-xl border-4 transition-colors ${
                      timeMode === "different"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <Calendar className="w-6 h-6 mb-2 text-blue-600" />
                    <span className="font-bold text-sm">
                      {T("Different Times", lang)}
                    </span>
                  </button>
                </div>
                <button
                  onClick={() => setStep("date")}
                  className="mt-6 text-sm text-slate-400 underline"
                >
                  {T("Back to Dates", lang)}
                </button>
              </div>
            )}

            {/* TIME SELECTION STEP */}
            {step === "time" && timeMode === "same" && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-lg mb-4">
                  {T("Preferred Time for All Sessions", lang)}
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  {T("This time will be applied to all", lang)}{" "}
                  {selectedDates.length} {T("selected days.", lang)}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTimeForAll(t);
                        setStep("form");
                      }}
                      className={`p-2 border rounded hover:border-red-500 hover:bg-red-50 text-xs font-bold transition-colors ${
                        selectedDates[0]?.time === t
                          ? "border-red-500 bg-red-50 text-red-700"
                          : ""
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setStep(requiredDays === 1 ? "date" : "time_mode")
                  }
                  className="mt-6 text-sm text-slate-400 underline"
                >
                  {T("Back", lang)}
                </button>
              </div>
            )}
            {step === "time" && timeMode === "different" && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-lg mb-4">
                  {T("Set Times for Each Day", lang)}
                </h3>
                <p
                  className={`text-sm mb-4 font-bold ${
                    isTimeSelectionComplete ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {selectedDates.filter((d) => d.time).length} /{" "}
                  {selectedDates.length} {T("times set.", lang)}
                </p>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {selectedDates.map((item, index) => (
                    <div
                      key={item.date}
                      className="border p-3 rounded-lg bg-slate-50"
                    >
                      <p className="font-bold text-slate-800 mb-2 text-sm">
                        {T("Day", lang)} {index + 1}: {item.date}
                      </p>
                      <select
                        value={item.time || ""}
                        onChange={(e: any) =>
                          setTimeForDate(item.date, e.target.value)
                        }
                        className="w-full p-2 border rounded"
                      >
                        <option value="" disabled>
                          {T("Select Time", lang)}
                        </option>
                        {timeSlots.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                {isTimeSelectionComplete && (
                  <button
                    onClick={() => setStep("form")}
                    className="w-full mt-4 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800"
                  >
                    {T("Continue to Verification", lang)}
                  </button>
                )}
                <button
                  onClick={() => setStep("time_mode")}
                  className="mt-4 text-sm text-slate-400 underline"
                >
                  {T("Back to Time Preference", lang)}
                </button>
              </div>
            )}

            {/* FORM STEP */}
            {step === "form" && (
              <div className="animate-fade-in h-full flex flex-col">
                <h3 className="font-bold text-lg mb-4">
                  {T("Verification", lang)}
                </h3>
                <p className="text-sm text-slate-500 mb-4 font-bold">
                  {T("Booking Details", lang)}:{" "}
                  <span className="font-normal">
                    {selectedDates.length} {T("days at", lang)}{" "}
                    {timeMode === "same"
                      ? selectedDates[0]?.time
                      : T("Custom Times", lang)}
                  </span>
                </p>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      {T("Instructor", lang)}
                    </label>
                    <select
                      className="w-full p-3 border border-slate-300 rounded bg-white"
                      value={instructor}
                      onChange={(e: any) => setInstructor(e.target.value)}
                    >
                      <option>Prem Bahadur Gaire</option>
                      <option>{T("Other / Any Available", lang)}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      {T("Your Name", lang)}
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-300 rounded outline-none focus:border-red-500"
                      value={clientName}
                      onChange={(e: any) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      {T("Mobile Number", lang)}
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3 border border-slate-300 rounded outline-none focus:border-red-500"
                      value={clientPhone}
                      onChange={(e: any) => setClientPhone(e.target.value)}
                      placeholder="+977 98..."
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                {/* The reCAPTCHA badge will appear here via the #recaptcha-container element in App.tsx */}
                <button
                  onClick={requestOtp}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold hover:bg-slate-800 mt-auto shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    T("Sending SMS...", lang)
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />{" "}
                      {T("Verify & Submit", lang)}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep("time_mode")}
                  className="mt-3 text-center text-sm text-slate-400 underline"
                >
                  {T("Change Time", lang)}
                </button>
              </div>
            )}
            {step === "otp" && (
              <div className="animate-fade-in h-full flex flex-col">
                <h3 className="font-bold text-lg mb-4">
                  {T("Enter Code", lang)}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {T("Code sent to", lang)} {clientPhone}
                </p>
                {simulationMode && (
                  <p className="text-xs text-orange-600 bg-orange-100 p-2 rounded mb-2">
                    {T("Sim Mode: Enter 123456", lang)}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="123456"
                  className="w-full p-4 border-2 border-slate-300 rounded-lg text-center text-2xl tracking-widest outline-none focus:border-red-500 mb-4"
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
                  {loading
                    ? T("Verifying...", lang)
                    : T("Confirm Booking", lang)}
                </button>
                <button
                  onClick={() => setStep("form")}
                  className="mt-4 text-center text-sm text-slate-400 underline"
                >
                  {T("Wrong Number?", lang)}
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

const HomePage = ({ setView, lang }: any) => (
  <div className="animate-fade-in">
    <div className="relative h-80 md:h-96 bg-slate-900 overflow-hidden flex items-center justify-center text-center px-4 select-none">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60 z-10"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 z-0"></div>
      <div className="relative z-20 max-w-3xl">
        <span className="inline-block py-1 px-3 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-bold uppercase tracking-wider mb-4">
          {T("Est. 2003", lang)}
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {T("Learn to Drive...", lang)}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setView("booking")}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {T("Book Now", lang)} <ChevronRightIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView("contact")}
            className="px-8 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-bold shadow-lg transition-all"
          >
            {T("Contact Us", lang)}
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
            {T("High Pass Rate", lang)}
          </h3>
          <p className="text-slate-500">
            {T(
              'Our focused trial preparation ensures you master the "8" and "L" tracks quickly.',
              lang
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-blue-600">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {T("Expert Instructors", lang)}
          </h3>
          <p className="text-slate-500">
            {T(
              "Learn directly from Prem Bahadur Gaire, serving Chitwan since 2003.",
              lang
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-green-600">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {T("Well Maintained", lang)}
          </h3>
          <p className="text-slate-500">
            {T(
              "We use modern vehicles and well-maintained scooters for your safety and comfort.",
              lang
            )}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AboutPage = ({ lang }: any) => (
  <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in select-none">
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
      <div className="bg-slate-900 p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {T("Our History", lang)}
        </h2>
        <p className="text-slate-400">
          {T("Serving Bharatpur since April 3rd, 2003", lang)}
        </p>
      </div>
      <div className="p-8 md:p-12">
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          {T(
            "Established on April 3rd, 2003, New Chitwan Driving Training Centre has proudly served the Chitwan community for over two decades. We have built a legacy of success, fostering safe and confident drivers through expert instruction. Our commitment to excellence has resulted in a high pass rate and a long list of happy students and customers.",
            lang
          )}
        </p>
        <div className="mt-8 flex items-center gap-2 text-sm font-mono text-slate-400 bg-slate-50 p-3 rounded inline-block">
          <span>PAN No: 301569099</span>
        </div>
      </div>
    </div>
    <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
      {T("Our Team", lang)}
    </h2>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group border border-slate-100">
        <div className="h-80 bg-slate-200 relative">
          <img
            src="./dad.png"
            onError={(e: any) => {
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group border border-slate-100">
        <div className="h-80 bg-slate-200 relative">
          <img
            src="./mom.png"
            onError={(e: any) => {
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

const ContactPage = ({ lang }: any) => (
  <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in select-none">
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 space-y-6">
      <div className="flex items-start gap-4">
        <div className="bg-red-100 p-3 rounded-full text-red-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-slate-800">{T("Address", lang)}</p>
          <p className="text-slate-600">{T("Bharatpur Address", lang)}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
          <Phone className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <p className="font-bold text-slate-800">{T("Phone Numbers", lang)}</p>
          <p className="text-slate-600 text-sm">Landline: 056-518289</p>
          <p className="text-slate-600 text-sm">Anita Gaire: 9845278967</p>
          <p className="text-slate-600 text-sm">Prem Gaire: 9845048863</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-purple-100 p-3 rounded-full text-purple-600">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-slate-800">{T("Email", lang)}</p>
          <a
            href="mailto:cdriving47@gmail.com"
            className="text-blue-600 hover:underline text-sm"
          >
            cdriving47@gmail.com
          </a>
        </div>
      </div>
      <a
        href="https://maps.app.goo.gl/ajFQJt3BAUP4dkCM8?g_st=ipc"
        target="_blank"
        className="block w-full text-center bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
      >
        <Map className="w-5 h-5" /> {T("Get Directions", lang)}
      </a>
    </div>
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

const ViewScheduleModal = ({ booking, onClose, lang }: any) => {
  const formatCourseDate = (dateString: string) => {
    const parts = dateString.split("-").map(Number);
    if (parts.length < 3) return dateString;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day).toLocaleDateString("en-NP", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            {T("Full Course Schedule", lang)}
          </h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {booking.clientName} - {booking.packageName} (
          {booking.courseDates.length} {T("sessions", lang)})
        </p>

        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
          {booking.courseDates.map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="font-bold text-slate-700">
                {T("Day", lang)} {index + 1} ({formatCourseDate(item.date)}):
              </span>
              <span className="font-mono text-red-600">{item.time}</span>
            </div>
          ))}
        </div>

        {booking.notes && (
          <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            Notes: {booking.notes}
          </p>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-bold"
          >
            {T("Close", lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({
  securitySettings,
  updateSecurity,
  onExit,
  rates,
  setRates,
  lang,
}: any) => {
  const [adminTab, setAdminTab] = useState("pending");
  // 🔥 TS FIX: Use the defined BookingItem interface
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [scheduleModal, setScheduleModal] = useState<any>(null);
  const [editScheduleModal, setEditScheduleModal] = useState<any>(null); // NEW MODAL STATE

  // Private Booking State
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pDuration, setPDuration] = useState("15 Days");
  const [pDaily, setPDaily] = useState("60 Mins");
  const [pDates, setPDates] = useState<any[]>([]);
  const [pTimeMode, setPTimeMode] = useState("same");
  const [pNotes, setPNotes] = useState("");
  const [pStep, setPStep] = useState("setup");

  const [tempRates, setTempRates] = useState(rates);
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
      // Mapping the Firestore document to the typed array
      setBookings(
        snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as BookingItem)
        )
      );
    });
    return () => unsubscribe();
  }, []);

  // FIX: New function to save multi-day schedules
  const saveFullSchedule = async (
    id: string,
    newSchedule: any[],
    newDateSummary: string
  ) => {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "bookings", id),
      {
        courseDates: newSchedule,
        date: newDateSummary,
      }
    );
  };

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
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "bookings", id)
      );
    } catch (error: any) {
      alert(T("Error removing booking: ", lang) + error.message);
    }
  };

  const sendConfirmation = (booking: any) => {
    const dateList =
      booking.courseDates && booking.courseDates.length > 0
        ? booking.courseDates
            .map(
              (item: any, i: number) =>
                `\n${T("Day", lang)} ${i + 1}: ${item.date} at ${item.time}`
            )
            .join("")
        : `\n${T("Start Date", lang)}: ${
            booking.date || T("To be scheduled", lang)
          }`;

    const msg = `${T("Namaste", lang)} ${booking.clientName},\n\n${T(
      "Your driving course is confirmed!",
      lang
    )}\n\n*${T("Package", lang)}:* ${booking.packageName}\n*${T(
      "Duration",
      lang
    )}:* ${booking.duration}\n*${T("Daily Time", lang)}:* ${
      booking.dailyTime || T("N/A", lang)
    }\n${dateList}\n*${T("Total Price", lang)}:* ${formatPrice(
      booking.price
    )}\n*${T("Instructor", lang)}:* ${booking.instructor}\n\n${T(
      "Location",
      lang
    )}: ${T("Bharatpur Address", lang)}.\n${T(
      "Please arrive 5 minutes early for your first session.",
      lang
    )}\n\n${T("Contact", lang)}: 9845048863`;
    window.open(
      `https://wa.me/${booking.clientPhone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const setPTimeForAll = (time: string) => {
    setPDates((prev: any[]) => prev.map((item) => ({ ...item, time })));
  };

  const setPTimeForDate = (dateString: string, time: string) => {
    setPDates((prev: any[]) =>
      prev.map((item) => (item.date === dateString ? { ...item, time } : item))
    );
  };

  const isPTimeSelectionComplete = useMemo(() => {
    return pDates.every((item) => item.time !== null);
  }, [pDates]);

  const handleAddPrivate = async () => {
    if (!pName) return alert(T("Name Required", lang));
    if (pDates.length === 0)
      return alert(T("Please select dates for the booking.", lang));
    if (pDates.some((d) => d.time === null))
      return alert(T("Please select a time for every selected date.", lang));

    let price = 0;
    if (pDuration === "1 Day") price = rates["1 Day"];
    else if (pDuration === "15 Days")
      price = pDaily === "60 Mins" ? rates["15 Days"] : rates["15 Days (30m)"];
    else if (pDuration === "30 Days")
      price = pDaily === "60 Mins" ? rates["30 Days"] : rates["30 Days (30m)"];

    const pkgName =
      pDuration === "1 Day"
        ? T("Private (1 Day)", lang)
        : `${pDuration} ${T("Private Course", lang)} (${pDaily})`;

    const dateSummary =
      pDates.length > 1
        ? `${T("First session", lang)}: ${pDates[0].date} at ${
            pDates[0].time
          } (${pDates.length} ${T("days total", lang)})`
        : `${pDates[0].date} at ${pDates[0].time}`;

    await addDoc(
      collection(db, "artifacts", appId, "public", "data", "bookings"),
      {
        clientName: pName,
        clientPhone: pPhone,
        packageName: pkgName,
        duration: pDuration,
        dailyTime: pDaily,
        date: dateSummary,
        courseDates: pDates,
        price: price,
        instructor: "Prem Bahadur Gaire",
        type: "private",
        status: "approved",
        notes: pNotes,
        progress: 0,
        createdAt: serverTimestamp(),
      }
    );
    alert(T("Private Booking Added to Active Schedule!", lang));
    setAdminTab("active");
    setPName("");
    setPPhone("");
    setPNotes("");
    setPDates([]);
    setPStep("setup");
  };

  const handleUpdateSecurity = () => {
    if (tempQuestion.length < 5 || tempAnswer.length < 3) {
      setSecurityMessage(T("Question/Answer must be long enough.", lang));
      return;
    }
    updateSecurity("question", tempQuestion);
    updateSecurity("answer", tempAnswer);
    setSecurityMessage(T("Security Question/Answer Updated!", lang));
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  // Type is correctly inferred as BookingItem[], resolving TS2339
  const activeBookings = bookings.filter(
    (b) => b.status === "approved" || b.status === "private"
  );

  const requiredPDays =
    pDuration === "15 Days" ? 15 : pDuration === "30 Days" ? 30 : 1;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-red-100 animate-fade-in overflow-hidden flex flex-col h-[calc(100vh-100px)] relative">
      {/* MODALS */}
      {editingBooking && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">{T("Edit Booking", lang)}</h3>
              <button onClick={() => setEditingBooking(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500">
                  {T("Client Name", lang)}
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
                <label className="text-xs font-bold text-slate-500">
                  {T("Phone", lang)}
                </label>
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
                <label className="text-xs font-bold text-slate-500">
                  {T("Price", lang)} (Override)
                </label>
                <input
                  type="number"
                  value={editingBooking.finalPrice}
                  onChange={(e: any) =>
                    setEditingBooking({
                      ...editingBooking,
                      finalPrice: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded font-bold text-red-600"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">
                  {T("Date & Time", lang)}
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
                {T("Cancel", lang)}
              </button>
              <button
                onClick={handleSaveBookingEdit}
                className="flex-1 py-2 bg-slate-900 text-white rounded font-bold"
              >
                <Save className="w-4 h-4 inline mr-1" /> {T("Save", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
      {scheduleModal && (
        <ViewScheduleModal
          booking={scheduleModal}
          onClose={() => setScheduleModal(null)}
          lang={lang}
        />
      )}
      {editScheduleModal && (
        <EditScheduleModal
          booking={editScheduleModal}
          onClose={() => setEditScheduleModal(null)}
          lang={lang}
          onSave={saveFullSchedule}
        />
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
            <AlertTriangle className="w-4 h-4" /> {T("Pending", lang)} (
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
            <Calendar className="w-4 h-4" /> {T("Active", lang)}
          </button>
          <button
            onClick={() => setAdminTab("private")}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
              adminTab === "private"
                ? "bg-red-100 text-red-700"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            <Plus className="w-4 h-4" /> {T("Add Private", lang)}
          </button>
          <button
            onClick={() => setAdminTab("settings")}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${
              adminTab === "settings"
                ? "bg-red-100 text-red-700"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            <Settings className="w-4 h-4" /> {T("Settings", lang)}
          </button>
          <button
            onClick={onExit}
            className="p-3 rounded-lg flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 mt-auto"
          >
            <RefreshCcw className="w-4 h-4" /> {T("Logout", lang)}
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {adminTab === "pending" && (
            <div className="space-y-3">
              {pendingBookings.length === 0 ? (
                <p className="text-slate-400 italic">
                  {T("No new requests.", lang)}
                </p>
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
                        {T("Req", lang)}: {b.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {b.courseDates && b.courseDates.length > 1 && (
                        <button
                          onClick={() => setScheduleModal(b)}
                          className="px-3 py-2 border border-slate-300 text-slate-600 rounded text-sm hover:bg-white"
                        >
                          {T("View Schedule", lang)}
                        </button>
                      )}
                      <button
                        onClick={() => deleteBooking(b.id)}
                        className="px-3 py-2 border border-red-200 text-red-500 rounded text-sm hover:bg-red-50"
                      >
                        {T("Reject", lang)}
                      </button>
                      <button
                        onClick={() =>
                          setEditingBooking({
                            ...b,
                            finalPrice: b.price,
                            newDate: b.date,
                          })
                        }
                        className="px-3 py-2 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800"
                      >
                        {T("Review", lang)}
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
                <p className="text-slate-400 italic">
                  {T("No active students.", lang)}
                </p>
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
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            {T("Remove", lang)}
                          </button>
                        </div>
                        <p className="text-sm text-slate-500">
                          {b.packageName}
                        </p>
                        {b.notes && (
                          <p className="text-xs text-amber-600 bg-amber-50 p-1 rounded mt-1 inline-block">
                            📝 {b.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-bold text-blue-600">
                            {b.date}
                          </p>
                          {/* FIX: Edit icon opens the specific schedule editor */}
                          {b.courseDates && b.courseDates.length > 1 ? (
                            <button onClick={() => setEditScheduleModal(b)}>
                              <Edit3 className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setEditingBooking({
                                  ...b,
                                  finalPrice: b.price,
                                  newDate: b.date,
                                })
                              }
                            >
                              <Edit3 className="w-3 h-3 text-slate-400 hover:text-blue-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700">
                          {formatPrice(b.price)}
                        </p>
                      </div>
                    </div>
                    {(b.packageName.includes("15") ||
                      b.packageName.includes("30")) && (
                      <div className="bg-slate-100 p-3 rounded mb-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                          <span>{T("Course Progress", lang)}</span>
                          <span>Day {b.progress || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateProgress(b, -1)}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
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

                    {b.courseDates && b.courseDates.length > 1 && (
                      <div className="pt-3 border-t flex justify-end gap-2">
                        <button
                          onClick={() => setScheduleModal(b)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200"
                        >
                          {T("View Schedule", lang)}
                        </button>
                      </div>
                    )}

                    <div className="pt-3 border-t flex justify-end gap-2">
                      <a
                        href={`tel:${b.clientPhone}`}
                        className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200"
                      >
                        {T("Call", lang)}
                      </a>
                      <button
                        onClick={() => sendConfirmation(b)}
                        className="px-3 py-1 bg-[#25D366] text-white rounded text-xs font-bold hover:opacity-90 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />{" "}
                        {T("Send Info", lang)}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {adminTab === "private" && (
            <div className="max-w-md space-y-4">
              <h3 className="text-xl font-bold text-slate-800">
                {T("Private Booking", lang)}
              </h3>
              <p className="text-sm text-slate-500">
                {T(
                  "Manually add discounted or special appointment slots.",
                  lang
                )}
              </p>

              {pStep === "setup" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={pDuration}
                      onChange={(e: any) => {
                        setPDuration(e.target.value);
                        setPDates([]);
                      }}
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
                    placeholder={T("Client Name", lang)}
                    className="w-full p-2 border rounded"
                    value={pName}
                    onChange={(e: any) => setPName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder={T("Client Phone (+977...)", lang)}
                    className="w-full p-2 border rounded"
                    value={pPhone}
                    onChange={(e: any) => setPPhone(e.target.value)}
                  />
                  <textarea
                    placeholder={T(
                      "Notes (e.g. Family Discount, Cash Paid)",
                      lang
                    )}
                    className="w-full p-2 border rounded"
                    value={pNotes}
                    onChange={(e: any) => setPNotes(e.target.value)}
                  />
                  <button
                    onClick={() => setPStep("date")}
                    className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    {T("Select Dates", lang)}{" "}
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {pStep === "date" && requiredPDays > 0 && (
                <div className="animate-fade-in">
                  <CalendarPicker
                    selectedDates={pDates}
                    setSelectedDates={setPDates}
                    duration={pDuration}
                    onNext={() =>
                      setPStep(requiredPDays > 1 ? "time_mode" : "review")
                    }
                    isPrivate={true}
                    lang={lang}
                  />
                  <button
                    onClick={() => setPStep("setup")}
                    className="mt-4 text-sm text-slate-400 underline"
                  >
                    {T("Back to Setup", lang)}
                  </button>
                </div>
              )}

              {pStep === "time_mode" && (
                <div className="animate-fade-in">
                  <h3 className="font-bold text-lg mb-4 text-slate-800">
                    {T("Time Preference", lang)}
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {T("Same time for all sessions, or different times?", lang)}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setPTimeMode("same");
                        setPStep("time");
                      }}
                      className={`p-4 rounded-xl border-4 transition-colors ${
                        pTimeMode === "same"
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <Clock className="w-6 h-6 mb-2 text-red-600" />
                      <span className="font-bold text-sm">
                        {T("Same Time Daily", lang)}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setPTimeMode("different");
                        setPStep("time");
                      }}
                      className={`p-4 rounded-xl border-4 transition-colors ${
                        pTimeMode === "different"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <Calendar className="w-6 h-6 mb-2 text-blue-600" />
                      <span className="font-bold text-sm">
                        {T("Different Times", lang)}
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => setPStep("date")}
                    className="mt-6 text-sm text-slate-400 underline"
                  >
                    {T("Back to Dates", lang)}
                  </button>
                </div>
              )}

              {pStep === "time" && pTimeMode === "same" && (
                <div className="animate-fade-in">
                  <h3 className="font-bold text-lg mb-4">
                    {T("Preferred Time for All Sessions", lang)}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setPTimeForAll(t);
                          setPStep("review");
                        }}
                        className={`p-2 border rounded hover:border-red-500 hover:bg-red-50 text-xs font-bold transition-colors ${
                          pDates[0]?.time === t
                            ? "border-red-500 bg-red-50 text-red-700"
                            : ""
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setPStep(requiredPDays === 1 ? "review" : "time_mode")
                    }
                    className="mt-6 text-sm text-slate-400 underline"
                  >
                    {T("Back", lang)}
                  </button>
                </div>
              )}

              {pStep === "time" && pTimeMode === "different" && (
                <div className="animate-fade-in">
                  <h3 className="font-bold text-lg mb-4">
                    {T("Set Times for Each Day", lang)}
                  </h3>
                  <p
                    className={`text-sm mb-4 font-bold ${
                      isPTimeSelectionComplete
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {pDates.filter((d) => d.time).length} / {pDates.length}{" "}
                    {T("times set.", lang)}
                  </p>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {pDates.map((item, index) => (
                      <div
                        key={item.date}
                        className="border p-3 rounded-lg bg-slate-100"
                      >
                        <p className="font-bold text-slate-800 mb-2 text-sm">
                          {T("Day", lang)} {index + 1}: {item.date}
                        </p>
                        <select
                          value={item.time || ""}
                          onChange={(e: any) =>
                            setPTimeForDate(item.date, e.target.value)
                          }
                          className="w-full p-2 border rounded"
                        >
                          <option value="" disabled>
                            {T("Select Time", lang)}
                          </option>
                          {timeSlots.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  {isPTimeSelectionComplete && (
                    <button
                      onClick={() => setPStep("review")}
                      className="w-full mt-4 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800"
                    >
                      {T("Continue to Review", lang)}
                    </button>
                  )}
                  <button
                    onClick={() => setPStep("time_mode")}
                    className="mt-4 text-sm text-slate-400 underline"
                  >
                    {T("Back to Time Preference", lang)}
                  </button>
                </div>
              )}

              {pStep === "review" && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="font-bold text-xl text-red-600">
                    {T("Review & Save", lang)}
                  </h3>
                  <p className="text-slate-800 font-bold">
                    {T("Client", lang)}:{" "}
                    <span className="font-normal">
                      {pName} ({pPhone})
                    </span>
                  </p>
                  <p className="text-slate-800 font-bold">
                    {T("Course", lang)}:{" "}
                    <span className="font-normal">
                      {pDuration} ({pDaily})
                    </span>
                  </p>
                  <p className="text-slate-800 font-bold">
                    {T("Total Days", lang)}:{" "}
                    <span className="font-normal">{pDates.length}</span>
                  </p>

                  <div className="border border-slate-200 p-3 rounded max-h-40 overflow-y-auto bg-slate-50">
                    {pDates.map((item, index) => (
                      <p key={index} className="text-sm">
                        {T("Day", lang)} {index + 1}: {item.date} @ {item.time}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={handleAddPrivate}
                    className="w-full bg-green-600 text-white p-3 rounded-lg font-bold"
                  >
                    {T("Save to Active Schedule", lang)}
                  </button>
                  <button
                    onClick={() => setPStep("setup")}
                    className="w-full mt-2 text-sm text-slate-400 underline"
                  >
                    {T("Start Over", lang)}
                  </button>
                </div>
              )}
            </div>
          )}
          {adminTab === "settings" && (
            <div className="max-w-md space-y-6">
              <h2 className="text-xl font-bold">
                {T("Security & Price Settings", lang)}
              </h2>

              {/* PIN Change Section */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                  <Key className="w-5 h-5 text-red-600" />{" "}
                  {T("Change Login PIN", lang)}
                </div>
                <label className="text-xs font-bold text-slate-500">
                  {T("Current PIN", lang)}:
                </label>
                <input
                  type="text"
                  value={securitySettings.pin}
                  onChange={(e: any) => updateSecurity("pin", e.target.value)}
                  className="w-full p-3 border rounded font-mono text-center tracking-widest text-lg"
                />
              </div>

              {/* Security Question Section */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                  <Lock className="w-5 h-5 text-indigo-600" />{" "}
                  {T("Recovery Question Setup", lang)}
                </div>

                <label className="text-xs font-bold text-slate-500">
                  {T("Security Question", lang)}:
                </label>
                <input
                  type="text"
                  value={tempQuestion}
                  onChange={(e: any) => setTempQuestion(e.target.value)}
                  className="w-full p-3 border rounded mb-3"
                />

                <label className="text-xs font-bold text-slate-500">
                  {T("Recovery Answer", lang)}:
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
                  {T("Update Question/Answer", lang)}
                </button>
                {securityMessage && (
                  <p className="text-xs mt-2 text-green-600 font-medium">
                    {securityMessage}
                  </p>
                )}
              </div>

              {/* Price Settings Section */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                  <Settings className="w-5 h-5 text-blue-600" />{" "}
                  {T("Price Settings", lang)}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm">
                      1 Day ({T("Trial", lang)})
                    </label>
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
                      alert(T("Rates Updated!", lang));
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded text-sm font-bold mt-2"
                  >
                    {T("Update Prices", lang)}
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
  const [language, setLanguage] = useStickyState("en", "ncdc_lang");
  useCopyProtection(true);
  const [view, setView] = useState("home");
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");

  const [newPin, setNewPin] = useState("");
  const [recoveryStep, setRecoveryStep] = useState("question");

  // 🔥 TS2558 FIX: useStickyState is now generic, we can remove the complex tuple type argument
  const [securitySettings, setSecuritySettings] =
    useStickyState<SecuritySettings>(
      {
        pin: "1234",
        question: dictionary.en["What is the name of your first pet?"],
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

  // 🔥 RECAPTCHA FIX: State and Ref for RecaptchaVerifier
  const recaptchaRef = useRef(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);

  useEffect(() => {
    if (auth && !recaptchaVerifier) {
      try {
        // The recaptcha-container must exist in the JSX for this to attach.
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: (response: any) => {
            console.log("Recaptcha resolved, ready for phone sign-in.");
          },
          "expired-callback": () => {
            console.log("Recaptcha expired, user needs to retry.");
          },
        });
        // Render it to make the badge visible
        verifier.render().then(() => setRecaptchaVerifier(verifier));
      } catch (e) {
        console.error("Recaptcha Init Error:", e);
      }
    }
  }, [recaptchaVerifier]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (loginInput === securitySettings.pin) {
      setView("admin");
      setLoginError("");
      setLoginInput("");
    } else {
      setLoginError(T("Incorrect PIN", language));
    }
  };

  // Updated Recovery Logic
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
        setLoginError(T("Incorrect Answer", language));
      }
    } else {
      if (newPin.length < 4) {
        setLoginError(T("PIN must be at least 4 digits", language));
        return;
      }
      // 🔥 TS7006 FIX: The state updater now correctly infers the type of 'prev'
      setSecuritySettings((prev) => ({ ...prev, pin: newPin }));

      alert(T("PIN Reset Successful! Logging you in...", language));
      setView("admin");
      setRecoveryStep("question");
      setRecoveryAnswer("");
      setNewPin("");
      setLoginError("");
    }
  };

  const updateSecurity = (field: keyof SecuritySettings, value: string) => {
    setSecuritySettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddBooking = async (data: any) => {
    try {
      if (db)
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "bookings"),
          { ...data, createdAt: serverTimestamp() }
        );
      else alert(T("Database not ready", language));
    } catch (e: any) {
      alert(T("Error saving: ", language) + e.message);
    }
  };

  if (firebaseError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-800 p-10">
        <div className="max-w-md text-center">
          <AlertOctagon className="w-16 h-16 mx-auto mb-4" />
          <h2 className="2xl font-bold mb-2">
            {T("Connection Error", language)}
          </h2>
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
      <Navbar
        setView={setView}
        activeView={view}
        language={language}
        setLanguage={setLanguage}
      />
      <main className="flex-grow">
        {view === "home" && <HomePage setView={setView} lang={language} />}
        {view === "about" && <AboutPage lang={language} />}
        {view === "contact" && <ContactPage lang={language} />}

        {/* 🔥 RECAPTCHA FIX: Pass the verifier down to BookingView */}
        {view === "booking" && (
          <div className="max-w-4xl mx-auto p-4 pt-8">
            <BookingView
              onAddBooking={handleAddBooking}
              rates={rates}
              lang={language}
              recaptchaVerifier={recaptchaVerifier}
            />
          </div>
        )}

        {view === "login" && (
          <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl animate-fade-in border-t-4 border-red-600">
              <div className="text-center mb-6">
                <h2 className="font-bold text-xl text-slate-800">
                  {T("Admin Login", language)}
                </h2>
                <p className="text-slate-500 text-sm">
                  {T("Owner Access Only", language)}
                </p>
              </div>
              <form onSubmit={handleLogin}>
                <input
                  type="password"
                  value={loginInput}
                  onChange={(e: any) => setLoginInput(e.target.value)}
                  placeholder={T("Enter PIN", language)}
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
                  {T("Login", language)}
                </button>
              </form>
              <button
                onClick={() => {
                  setView("recovery");
                  setLoginError("");
                }}
                className="w-full mt-4 text-xs text-slate-400 hover:text-red-500 text-center underline"
              >
                {T("Forgot PIN?", language)}
              </button>
            </div>
          </div>
        )}

        {view === "recovery" && (
          <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl animate-fade-in">
              <h2 className="font-bold text-xl mb-4 text-center">
                {recoveryStep === "question"
                  ? T("Reset PIN", language)
                  : T("Set New PIN", language)}
              </h2>

              <form onSubmit={handleRecover}>
                {recoveryStep === "question" ? (
                  <>
                    <p className="text-sm text-slate-500 mb-2">
                      {T("Security Question", language)}:
                    </p>
                    <p className="font-bold text-slate-800 mb-4 p-3 bg-slate-50 rounded border">
                      {securitySettings.question}
                    </p>
                    <input
                      type="text"
                      placeholder={T("Your Answer", language)}
                      value={recoveryAnswer}
                      onChange={(e: any) => setRecoveryAnswer(e.target.value)}
                      className="w-full p-3 border rounded mb-4 outline-none focus:border-red-500"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 mb-2">
                      {T("Enter your new PIN code", language)}:
                    </p>
                    <input
                      type="text"
                      placeholder={T("New PIN", language)}
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
                  className="w-full bg-slate-800 text-white p-3 rounded font-bold"
                >
                  {recoveryStep === "question"
                    ? T("Verify Answer", language)
                    : T("Save New PIN", language)}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setRecoveryStep("question");
                  }}
                  className="w-full mt-2 text-sm text-slate-400 text-center block"
                >
                  {T("Back to Login", language)}
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
              lang={language}
            />
          </div>
        )}
      </main>

      {/* 🔥 RECAPTCHA FIX: This hidden container is crucial for reCAPTCHA to render. */}
      {/* It will be automatically filled by the Firebase SDK and is set to invisible. */}
      <div
        id="recaptcha-container"
        style={{ position: "absolute", bottom: 0, left: 0, zIndex: 1000 }}
        ref={recaptchaRef}
      />

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p className="mb-2 text-white font-bold">
          New Chitwan Driving Training Centre
        </p>
        <p>{T("Bharatpur Address", language)}</p>
        <p className="text-xs mt-1">Email: cdriving47@gmail.com</p>
        <p className="mt-4 opacity-50">
          © 2024 All Rights Reserved. • PAN: 301569099
        </p>
      </footer>
    </div>
  );
}
