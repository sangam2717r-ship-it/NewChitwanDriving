import React, { useState, useEffect, useMemo, useRef, Dispatch, SetStateAction } from 'react'; 
import { 
  Shield, Lock, Calendar, Clock, Settings, Check, ChevronRight, 
  Car, MapPin, Phone, MessageCircle, User, FileText, 
  RefreshCcw, Eye, EyeOff, Menu, X, Users, Award, 
  Edit3, Trash2, CheckCircle, AlertTriangle, Plus, Minus, Smartphone, AlertOctagon, Map, Key, Mail, Save, XCircle, Search, ChevronLeft, ChevronRight as ChevronRightIcon, Globe
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithPhoneNumber, onAuthStateChanged, RecaptchaVerifier
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, where, getDocs,
  Timestamp 
} from 'firebase/firestore'; 

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDPZQhv_Ox_FytpDR_jUbsyWMzcPa_xxk",
  authDomain: "new-chitwan-driving.firebaseapp.com",
  projectId: "new-chitwan-driving",
  storageBucket: "new-chitwan-driving.firebaseapp.com",
  messagingSenderId: "538552281062",
  appId: "1:538552281062:web:b6f756314ff756314ff53acch11827" 
};

// --- INITIALIZATION ---
let auth: any = {}; 
let db: any = {}; 
let firebaseError: string | null = null; 

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  try { auth.useDeviceLanguage(); } catch (e: any) {}
  db = getFirestore(app);
} catch (err: any) {
  console.error("Firebase Init Error:", err);
  firebaseError = err.message;
}

const appId = 'new-chitwan-v1'; 

// 🔥 TYPE DEFINITIONS (Crucial for Build Success)
interface BookingItem {
  id: string;
  status: 'approved' | 'pending' | 'private' | 'rejected' | string;
  clientName: string;
  clientPhone: string;
  packageName: string;
  duration: string;
  dailyTime?: string;
  date: string; 
  courseDates: Array<{ date: string, time: string | null }>; 
  price: number;
  instructor: string;
  type: 'public' | 'private';
  progress: number;
  notes?: string;
  createdAt?: Timestamp; 
}

interface SecuritySettings {
    pin: string;
    question: string;
    answer: string;
}

// --- LANGUAGE DATA ---
const dictionary: { [key: string]: { [key: string]: string } } = {
    'en': {
        'Home': 'Home', 'Book Training': 'Book Training', 'About Us': 'About Us', 'Contact': 'Contact',
        'Est. 2003': 'Est. 2003', 'Driving Training Centre': 'Driving Training Centre', 
        'Learn to Drive...': 'Learn to Drive with Confidence in Chitwan',
        'High Pass Rate': 'High Pass Rate', 'Expert Instructors': 'Expert Instructors', 'Well Maintained': 'Well Maintained',
        'Check Progress': 'Check Progress', 'New Booking': 'New Booking', 'Student Progress Check': 'Student Progress Check',
        'Enter Phone Number': 'Enter Phone Number', 'Active Courses': 'Active Courses', 'Next Class': 'Next Class',
        'Course Progress': 'Course Progress', 'Send Info': 'Send Info', 'Call': 'Call', 'Pending': 'Pending',
        'Active': 'Active', 'Add Private': 'Add Private', 'Settings': 'Settings', 'Logout': 'Logout',
        'Review Schedule': 'View Schedule', 'Save': 'Save', 'Reject': 'Reject', 'Review': 'Review',
        'Total Days': 'Total Days', 'First Session': 'First Session', 'Total Price': 'Total Price',
        'Address': 'Address', 'Bharatpur Address': 'Bharatpur Height, Chitwan (Same building as Eye Express)',
        'Phone Numbers': 'Phone Numbers', 'Email': 'Email', 'Get Directions': 'Get Directions (Google Maps)',
        'Owner Access Only': 'Owner Access Only', 'Forgot PIN?': 'Forgot PIN?', 'Reset PIN': 'Reset PIN',
        'Security Question': 'Security Question', 'Update Prices': 'Update Prices', 'Price Settings': 'Price Settings (NPR)',
        'Private Booking': 'Add Custom Private Booking', 'Go to Calendar': 'Go to Calendar',
        'Duration': 'Duration', 'Daily Time': 'Daily Time', 'Client Name': 'Client Name', 'Client Phone': 'Client Phone',
        'Price': 'Price', 'Date & Time': 'Date & Time', 'Update Question/Answer': 'Update Question/Answer',
        'SIMULATION MODE (Real SMS blocked in Preview)': 'SIMULATION MODE (Real SMS blocked in Preview)',
        'Use code:': 'Use code:', 'Incorrect Code. Try 123456.': 'Incorrect Code. Try 123456.',
        'Back to Dates': 'Back to Dates', 'Appointment Date': 'Appointment Date', 'Choose Time': 'Choose Time',
        'Change Time': 'Change Time', 'Instructor': 'Instructor', 'Your Name': 'Your Name', 'Mobile Number': 'Mobile Number',
        'Verify & Submit': 'Verify & Submit', 'Verifying...': 'Verifying...', 'Confirm Booking': 'Confirm Booking',
        'Wrong Number?': 'Wrong Number?', 'Full Course Schedule': 'Full Course Schedule', 'Close': 'Close', 
        'View Schedule': 'View Schedule', 'Remove': 'Remove', 'Edit Schedule': 'Edit Schedule',
        'Back': 'Back', 'Course': 'Course', 'days total': 'days total', 'Req': 'Req.',
        'Same Time Daily': 'Same Time Daily', 'Different Times': 'Different Times', 'Select Time': 'Select Time',
        'Continue to Verification': 'Continue to Verification', 'Review & Save': 'Review & Save',
        'Save New Schedule': 'Save New Schedule', 'Start Over': 'Start Over', 'Cancel': 'Cancel',
        'Same time for all sessions, or different times?': 'Same time for all sessions, or different times?',
        'sessions': 'sessions', 'Please enter valid name and phone number': 'Please enter valid name and phone number',
        'Private (1 Day)': 'Private (1 Day)', 'Private Course': 'Private Course', 'Trial Preparation (1 Day)': 'Trial Preparation (1 Day)',
        'PIN must be at least 4 digits': 'PIN must be at least 4 digits', 'To be scheduled': 'To be scheduled',
        'Update PIN': 'Update PIN', 'Our History': 'Our History', 'Our Team': 'Our Team',
        'days selected': 'days selected', 'Selected': 'Selected', 'Configure your course on the left': 'Configure your course on the left',
        'to proceed.': 'to proceed.', 'Estimated Total': 'Estimated Total', 'Time Preference': 'Time Preference',
        'This time will be applied to all': 'This time will be applied to all', 'selected days.': 'selected days.',
        'Set Times for Each Day': 'Set Times for Each Day', 'times set.': 'times set.', 'Client': 'Client', 'Day': 'Day',
        'What is the name of your first pet?': 'What is the name of your first pet?', 'of': 'of',
    },
    'ne': {
        'Home': 'मुख्य पृष्ठ', 'Book Training': 'बुकिङ गर्नुहोस्', 'About Us': 'हाम्रो बारेमा', 'Contact': 'सम्पर्क',
        'Est. 2003': 'स्था. २०६०', 'Driving Training Centre': 'ड्राइभिङ तालिम केन्द्र', 
        'Learn to Drive...': 'चितवनमा आत्मविश्वासका साथ ड्राइभिङ सिक्नुहोस्',
        'High Pass Rate': 'उच्च सफलता दर', 'Expert Instructors': 'विशेषज्ञ प्रशिक्षक', 'Well Maintained': 'सुसज्जित सवारी',
        'Check Progress': 'प्रगति हेर्नुहोस्', 'New Booking': 'नयाँ बुकिङ', 'Student Progress Check': 'विद्यार्थीको प्रगति जाँच',
        'Enter Phone Number': 'फोन नम्बर प्रविष्ट गर्नुहोस्', 'Active Courses': 'सक्रिय कक्षाहरू', 'Next Class': 'अर्को कक्षा',
        'Course Progress': 'प्रगति', 'Send Info': 'जानकारी पठाउनुहोस्', 'Call': 'कल गर्नुहोस्', 'Pending': 'बाँकी बुकिङ',
        'Active': 'सक्रिय बुकिङ', 'Add Private': 'निजी बुकिङ थप्नुहोस्', 'Settings': 'सेटिङहरू', 'Logout': 'बाहिर निस्कनुहोस्',
        'Review Schedule': 'तालिका हेर्नुहोस्', 'Save': 'सुरक्षित गर्नुहोस्', 'Reject': 'अस्वीकार गर्नुहोस्', 'Review': 'समीक्षा गर्नुहोस्',
        'Total Days': 'जम्मा दिन', 'First Session': 'पहिलो कक्षा', 'Total Price': 'कुल मूल्य',
        'Address': 'ठेगाना', 'Bharatpur Address': 'भरतपुर हाइट, चितवन (आई एक्सप्रेस भवन)',
        'Phone Numbers': 'फोन नम्बरहरू', 'Email': 'ईमेल', 'Get Directions': 'दिशा निर्देशन (गुगल नक्सा)',
        'Owner Access Only': 'मालिकको पहुँच मात्र', 'Forgot PIN?': 'पिन बिर्सनुभयो?', 'Reset PIN': 'पिन रिसेट गर्नुहोस्',
        'Security Question': 'सुरक्षा प्रश्न', 'Update Prices': 'मूल्य अपडेट गर्नुहोस्', 'Price Settings': 'मूल्य सेटिङहरू (रु)',
        'Private Booking': 'निजी बुकिङ थप्नुहोस्', 'Go to Calendar': 'क्यालेन्डरमा जानुहोस्',
        'Duration': 'अवधि', 'Daily Time': 'दैनिक समय', 'Client Name': 'ग्राहकको नाम', 'Client Phone': 'ग्राहकको फोन',
        'Price': 'मूल्य', 'Date & Time': 'मिति र समय', 'Update Question/Answer': 'प्रश्न/उत्तर अपडेट गर्नुहोस्',
        'SIMULATION MODE (Real SMS blocked in Preview)': 'सिमुलेशन मोड (प्रिभ्यूमा एसएमएस रोकिएको छ)',
        'Use code:': 'कोड प्रयोग गर्नुहोस्:', 'Incorrect Code. Try 123456.': 'गलत कोड। 123456 प्रयास गर्नुहोस्।',
        'Back to Dates': 'मितिमा फर्कनुहोस्', 'Appointment Date': 'बुकिङ मिति', 'Choose Time': 'समय छान्नुहोस्',
        'Change Time': 'समय परिवर्तन गर्नुहोस्', 'Instructor': 'प्रशिक्षक', 'Your Name': 'तपाईंको नाम', 'Mobile Number': 'मोबाइल नम्बर',
        'Verify & Submit': 'पुष्टि गरी बुझाउनुहोस्', 'Verifying...': 'पुष्टि गर्दै...', 'Confirm Booking': 'बुकिङ निश्चित गर्नुहोस्',
        'Wrong Number?': 'गलत नम्बर?', 'Full Course Schedule': 'पूर्ण कक्षा तालिका', 'Close': 'बन्द गर्नुहोस्', 
        'View Schedule': 'तालिका हेर्नुहोस्', 'Remove': 'हटाउनुहोस्', 'Edit Schedule': 'तालिका सम्पादन गर्नुहोस्',
        'Back': 'पछाडि', 'Course': 'कोर्स', 'days total': 'दिन कुल', 'Req': 'अनुरोध',
        'Same Time Daily': 'दैनिक एउटै समय', 'Different Times': 'फरक फरक समय', 'Select Time': 'समय छान्नुहोस्',
        'Continue to Verification': 'पुष्टिका लागि अगाडि बढ्नुहोस्', 'Review & Save': 'समीक्षा गरी सुरक्षित गर्नुहोस्',
        'Save New Schedule': 'नयाँ तालिका सुरक्षित गर्नुहोस्', 'Start Over': 'फेरि सुरु गर्नुहोस्', 'Cancel': 'रद्द गर्नुहोस्',
        'Same time for all sessions, or different times?': 'सबै कक्षा एउटै समयमा वा फरक समयमा?',
        'sessions': 'कक्षाहरू', 'Please enter valid name and phone number': 'कृपया वैध नाम र फोन नम्बर प्रविष्ट गर्नुहोस्',
        'Private (1 Day)': 'निजी (१ दिन)', 'Private Course': 'निजी कोर्स', 'Trial Preparation (1 Day)': 'परीक्षण तयारी (१ दिन)',
        'PIN must be at least 4 digits': 'पिन कम्तीमा ४ अंकको हुनुपर्छ', 'To be scheduled': 'तालिका बनाउन बाँकी',
        'Update PIN': 'पिन अपडेट गर्नुहोस्', 'Our History': 'हाम्रो इतिहास', 'Our Team': 'हाम्रो टोली',
        'days selected': 'दिन छानियो', 'Selected': 'छानिएको', 'Configure your course on the left': 'बायाँपट्टि आफ्नो कोर्स सेट गर्नुहोस्',
        'to proceed.': 'अगाडि बढ्नका लागि।', 'Estimated Total': 'अनुमानित कुल', 'Time Preference': 'समय प्राथमिकता',
        'This time will be applied to all': 'यो समय सबैमा लागू हुनेछ', 'selected days.': 'छानिएका दिनहरूमा।',
        'Set Times for Each Day': 'प्रत्येक दिनको समय सेट गर्नुहोस्', 'times set.': 'समय सेट भयो।', 'Client': 'ग्राहक', 'Day': 'दिन',
        'What is the name of your first pet?': 'तपाईंको पहिलो पाल्तु जनावरको नाम के हो?', 'of': 'को',
    }
};

// --- SECURITY HOOK ---
const useCopyProtection = (active = true) => {
  useEffect(() => {
    const preventContext = (e: any) => { e.preventDefault(); return false; }; 
    const preventKeys = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 's', 'p', 'u', 'a'].includes(e.key.toLowerCase())) { e.preventDefault(); }
      if (e.key === 'F12') e.preventDefault();
    };
    const preventDrag = (e: any) => e.preventDefault();
    if (!active) return;
    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);
    document.addEventListener('dragstart', preventDrag); 
    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventKeys);
      document.removeEventListener('dragstart', preventDrag);
    };
  }, [active]);
};

// --- UTILITIES ---
export function useStickyState<T>(defaultValue: T, key: string): [T, Dispatch<SetStateAction<T>>] {
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

const formatPrice = (price: number) => new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 0 }).format(price);

// Calendar Utilities (unchanged)
const getMonthDetails = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
  const monthNames = [T('January', 'en'), T('February', 'en'), T('March', 'en'), T('April', 'en'), T('May', 'en'), T('June', 'en'), T('July', 'en'), T('August', 'en'), T('September', 'en'), T('October', 'en'), T('November', 'en'), T('December', 'en')];
  let calendar = [];
  let day = 1;
  for (let i = 0; i < 6; i++) {
    let week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) { week.push(null); } else if (day > daysInMonth) { week.push(null); } else { week.push(day); day++; }
    }
    calendar.push(week);
    if (day > daysInMonth) break;
  }
  return { calendar, monthName: monthNames[month], dayNames };
};

// --- COMPONENTS ---

// CalendarPicker (unchanged structure)
const CalendarPicker = ({ selectedDates, setSelectedDates, duration, onNext, isPrivate=false, lang }: any) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const monthDetails = useMemo(() => getMonthDetails(currentYear, currentMonth), [currentYear, currentMonth]);
    const requiredDays = duration === '15 Days' ? 15 : (duration === '30 Days' ? 30 : 1);
    
    const isDateSelected = (day: number) => {
        const dateString = `${currentYear}-${currentMonth + 1}-${day}`;
        return selectedDates.some((item: any) => item.date === dateString);
    };
    const toggleDate = (day: number) => {
        const dateString = `${currentYear}-${currentMonth + 1}-${day}`;
        const newDate = new Date(currentYear, currentMonth, day);
        if (!isPrivate && newDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
        setSelectedDates((prev: any[]) => {
            if (prev.some((item: any) => item.date === dateString)) {
                return prev.filter(item => item.date !== dateString).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            } else {
                if (requiredDays > 1 && prev.length >= requiredDays) { return prev; }
                const newItem = { date: dateString, time: null };
                if (requiredDays === 1) return [newItem];
                return [...prev, newItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }
        });
    };
    const navMonth = (direction: number) => {
        let newMonth = currentMonth + direction; let newYear = currentYear;
        if (newMonth > 11) { newMonth = 0; newYear++; } if (newMonth < 0) { newMonth = 11; newYear--; }
        setCurrentMonth(newMonth); setCurrentYear(newYear);
    };
    const getDayClass = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isSelected = isDateSelected(day);
        let className = 'p-2 rounded-full h-8 w-8 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center';
        if (!isPrivate && isPast) { className += ' bg-slate-100 text-slate-400 cursor-not-allowed line-through'; } else if (isSelected) { className += ' bg-red-600 text-white shadow-lg'; } else if (selectedDates.length >= requiredDays && requiredDays > 1) { className += ' bg-slate-50 text-slate-400 cursor-not-allowed'; } else { className += ' hover:bg-red-50 text-slate-800'; }
        return className;
    };
    const isSelectionComplete = selectedDates.length === requiredDays;

    return (
        <div className="animate-fade-in bg-white p-6 rounded-lg shadow-inner border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="font-bold text-lg text-slate-800">{monthDetails.monthName} {currentYear}</h3>
                <button onClick={() => navMonth(1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            {requiredDays > 1 && (
                <div className={`text-center p-3 rounded-lg text-sm font-bold mb-4 transition-colors ${isSelectionComplete ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedDates.length} {T('of', lang)} {requiredDays} {T('days selected', lang)}.
                </div>
            )}
            <div className="grid grid-cols-7 gap-1 text-center">
                {monthDetails.dayNames.map(day => (<span key={day} className="text-xs font-bold text-slate-500 py-2">{day}</span>))}
                {monthDetails.calendar.flat().map((day, index) => (
                    <div key={index} className="flex items-center justify-center">
                        {day !== null && (<button onClick={() => toggleDate(day)} className={getDayClass(day)} disabled={!isPrivate && new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate()) && day > 0}>{day}</button>)}
                    </div>
                ))}
            </div>
            {isSelectionComplete && (<div className="mt-6 text-center"><button onClick={onNext} className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2 mx-auto">{T('Confirm Dates & Choose Time', lang)} <ChevronRightIcon className="w-4 h-4" /></button></div>)}
        </div>
    );
};

// EditScheduleModal
const EditScheduleModal = ({ booking, onClose, lang, onSave }: any) => {
    const [tempSchedule, setTempSchedule] = useState([...booking.courseDates]);
    const [saving, setSaving] = useState(false);
    const timeSlots = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
    const setTimeForDate = (index: number, time: string) => { setTempSchedule(prev => prev.map((item, i) => i === index ? { ...item, time } : item)); };
    const handleSave = async () => {
        if (tempSchedule.some(item => item.time === null)) { alert(T('Please select a time for every date.', lang)); return; }
        setSaving(true);
        const newDateSummary = tempSchedule.length > 1 ? `${T('First session', lang)}: ${tempSchedule[0].date} at ${tempSchedule[0].time} (${tempSchedule.length} ${T('days total', lang)})` : `${tempSchedule[0].date} at ${tempSchedule[0].time}`;
        await onSave(booking.id, tempSchedule, newDateSummary);
        setSaving(false); onClose();
    };
    const formatCourseDate = (dateString: string) => { const parts = dateString.split('-').map(Number); if (parts.length < 3) return dateString; const [year, month, day] = parts; return new Date(year, month - 1, day).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' }); };

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-2xl">
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-800">{T('Edit Schedule', lang)}</h3><button onClick={onClose}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button></div>
                <p className="text-sm text-slate-500 mb-4">{booking.clientName} - {booking.packageName}</p>
                <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                    {tempSchedule.map((item: any, index: number) => (
                        <div key={item.date} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-700 text-sm">{T('Day', lang)} {index + 1} ({formatCourseDate(item.date)}):</span>
                            <select value={item.time || ''} onChange={(e: any) => setTimeForDate(index, e.target.value)} className="p-1 border rounded text-xs font-mono">
                                <option value="" disabled>{T('Select Time', lang)}</option>
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 border rounded-lg">{T('Cancel', lang)}</button><button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-1">{saving ? T('Saving...', lang) : <><Save className="w-4 h-4" /> {T('Save New Schedule', lang)}</>}</button></div>
            </div>
        </div>
    );
};

// Navbar
const Navbar = ({ setView, activeView, language, setLanguage }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [ { id: 'home', label: T('Home', language) }, { id: 'booking', label: T('Book Training', language) }, { id: 'about', label: T('About Us', language) }, { id: 'contact', label: T('Contact', language) } ];
  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg border-b-4 border-red-600 select-none">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer select-none">
            <div className="bg-red-600 p-2 rounded-lg"><Car className="text-white w-6 h-6" /></div>
            <div><h1 className="font-bold text-lg leading-tight tracking-tight">New Chitwan</h1><p className="text-[10px] text-slate-400 uppercase tracking-wider">{T('Driving Training Centre', language)}</p></div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (<button key={item.id} onClick={() => setView(item.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === item.id ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>{item.label}</button>))}
            <button onClick={() => setView('login')} className="ml-4 px-3 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"><Lock className="w-4 h-4 text-slate-400" /></button>
            <div className="ml-4"><button onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs font-bold"><Globe className="w-4 h-4" /> {language === 'en' ? 'नेपाली' : 'EN'}</button></div>
          </div>
          <div className="md:hidden flex items-center"><button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white p-2">{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button></div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 animate-fade-in select-none">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (<button key={item.id} onClick={() => { setView(item.id); setIsOpen(false); }} className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${activeView === item.id ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>{item.label}</button>))}
            <button onClick={() => { setView('login'); setIsOpen(false); }} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-400 hover:bg-slate-700">{T('Admin Login', language)}</button>
            <button onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-400 hover:bg-slate-700 flex items-center gap-2"><Globe className="w-4 h-4" /> {language === 'en' ? 'नेपाली' : 'English'}</button>
          </div>
        </div>
      )}
    </nav>
  );
};

// BookingView
const BookingView = ({ onAddBooking, rates, lang, recaptchaVerifier }: any) => { 
  const [tab, setTab] = useState('new'); 
  const [duration, setDuration] = useState('15 Days');
  const [dailyTime, setDailyTime] = useState('60 Mins');
  const [currentPrice, setCurrentPrice] = useState(rates['15 Days']);
  const [selectedDates, setSelectedDates] = useState<any[]>([]); 
  const [timeMode, setTimeMode] = useState('same'); 
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+977 ');
  const [instructor, setInstructor] = useState('Prem Bahadur Gaire');
  const [step, setStep] = useState('customize'); 
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [checkPhone, setCheckPhone] = useState('');
  const [myBookings, setMyBookings] = useState<any[]>([]); 
  const [checkError, setCheckError] = useState('');
  const timeSlots = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

  useEffect(() => {
    let base = 0;
    if (duration === '1 Day') base = rates['1 Day'];
    else if (duration === '15 Days') base = dailyTime === '60 Mins' ? rates['15 Days'] : rates['15 Days (30m)'];
    else if (duration === '30 Days') base = dailyTime === '60 Mins' ? rates['30 Days'] : rates['30 Days (30m)'];
    setCurrentPrice(base); setSelectedDates([]); 
  }, [duration, dailyTime, rates]);

  const setTimeForAll = (time: string) => { setSelectedDates((prev: any[]) => prev.map(item => ({ ...item, time }))); };
  const setTimeForDate = (dateString: string, time: string) => { setSelectedDates((prev: any[]) => prev.map(item => item.date === dateString ? { ...item, time } : item)); };
  const isTimeSelectionComplete = useMemo(() => selectedDates.every(item => item.time !== null), [selectedDates]);

  const requestOtp = async () => {
    if (!clientName || clientPhone.length < 10) { setError(T("Please enter valid name and phone number", lang)); return; }
    // Recaptcha check
    if (!recaptchaVerifier) { setError("Recaptcha verification not ready. Please try again."); return; }
    setError(''); setLoading(true);
    try {
      const result = await signInWithPhoneNumber(auth, clientPhone, recaptchaVerifier); 
      setConfirmationResult(result as any); setStep('otp'); setLoading(false);
    } catch (err: any) {
      console.warn("SMS Failed. Falling back to Sim Mode.");
      setSimulationMode(true); setStep('otp'); setLoading(false);
      if (recaptchaVerifier && recaptchaVerifier.clear) { recaptchaVerifier.clear(); }
      alert(`${T('SIMULATION MODE (Real SMS blocked in Preview)', lang)}.\n\n${T('Use code:', lang)} 123456`);
    }
  };

  const verifyOtpAndBook = async () => {
    if(!otp) return;
    setLoading(true);
    try {
      if (simulationMode) { if (otp !== '123456') throw new Error(T("Wrong code", lang)); } 
      else { await (confirmationResult as any).confirm(otp); }
      const pkgName = duration === '1 Day' ? T('Trial Preparation (1 Day)', lang) : `${duration} ${T('Course', lang)} (${dailyTime}/${T('day', lang)})`;
      const dateSummary = selectedDates.length > 1 ? `${T('First session', lang)}: ${selectedDates[0].date} at ${selectedDates[0].time} (${selectedDates.length} ${T('days total', lang)})` : `${selectedDates[0].date} at ${selectedDates[0].time}`;
      await onAddBooking({
        clientName, clientPhone, packageName: pkgName, duration, dailyTime, date: dateSummary, courseDates: selectedDates, price: currentPrice, instructor, type: 'public', status: 'pending', progress: 0
      });
      setStep('done'); setLoading(false);
    } catch (err) { setLoading(false); setError(T("Incorrect Code. Try 1234
