import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Calendar as CalIcon, Clock, Settings, Check, ChevronRight, ChevronLeft,
  Car, MapPin, Phone, MessageCircle, User, FileText, 
  RefreshCcw, Eye, EyeOff, Menu, X, Users, Award, 
  Edit3, Trash2, CheckCircle, AlertTriangle, Plus, Minus, Smartphone, AlertOctagon, Map, Key, Mail, Save, Search, Globe, XCircle, BookOpen, GraduationCap, History, PlayCircle, HelpCircle, ArrowLeft, Info
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, where, getDocs 
} from 'firebase/firestore';

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDPZQhv_Ox_FytpDR_jU0bsyWMzcPa_xxk",
  authDomain: "new-chitwan-driving.firebaseapp.com",
  projectId: "new-chitwan-driving",
  storageBucket: "new-chitwan-driving.firebasestorage.app",
  messagingSenderId: "538552281062",
  appId: "1:538552281062:web:b6f756314ff53acch11827"
};

// --- TRANSLATIONS ---
const t = {
  en: {
    nav_home: "Home", nav_book: "Book Training", nav_edu: "Education", nav_likhit: "Mock Test", nav_contact: "Contact", nav_admin: "Admin",
    hero_title: "Learn to Drive with Confidence in Chitwan", hero_subtitle: "Professional instructors, modern vehicles, and a track record of success.", hero_cta: "Book Now", hero_contact: "Contact Us",
    why_pass: "High Pass Rate", why_pass_desc: "Our focused trial preparation ensures you master the '8' and 'L' tracks quickly.",
    why_expert: "Expert Instructors", why_expert_desc: "Learn directly from Prem Bahadur Gaire, serving Chitwan since 2003.",
    why_safe: "Well Maintained", why_safe_desc: "We use modern vehicles and well-maintained scooters for your safety.",
    book_title: "Build Your Course", book_subtitle: "Select the duration and daily time.",
    duration: "Course Duration", daily_len: "Daily Session Length", est_total: "Estimated Total",
    next: "Next", back: "Back", verify_title: "Your Details", verify_btn: "Confirm Booking",
    success_title: "Request Sent!", success_msg: "Your booking request has been received. Prem Sir will review it and contact you shortly.",
    check_title: "Student Progress Check", check_placeholder: "Enter Phone Number", check_btn: "Search", check_not_found: "No active booking found for this number.",
    history_title: "Driving History & Safety in Nepal", 
    history_desc: "From the first car introduced by Rana Prime Ministers to the modern highways of today, Nepal's driving history is rich and evolving.",
    safety_title: "Why Training Matters",
    safety_desc: "Recent DoTM statistics reveal that over 50% of road accidents in Nepal involve motorcycles, with a significant portion caused by untrained or unlicensed riders. Proper training reduces accident risk by 70%. At New Chitwan, we don't just teach you to pass the trial; we teach you to survive on the road.",
    edu_title: "Traffic Signs & Rules", edu_subtitle: "Essential knowledge for your Likhit (Written) exam and daily driving.",
    team_title: "Our Team", role_proprietor: "Proprietor & Instructor", role_manager: "Manager & Reception",
    addr_title: "Address", addr_desc: "Bharatpur Height, Chitwan (Same building as Eye Express)", phone_title: "Phone Numbers", email_title: "Email", directions: "Get Directions (Google Maps)",
    footer_rights: "All Rights Reserved", select_date: "Select Class Dates", pref_time: "Preferred Time",
    opt_1day: "1 Day (Trial)", opt_15days: "15 Days", opt_30days: "30 Days", opt_30mins: "30 Mins", opt_60mins: "60 Mins",
    selected: "Selected", days: "days", continue: "Continue",
    signs_mandatory: "Mandatory Signs (Regulatory)", signs_warning: "Warning Signs (Cautionary)", signs_info: "Informational Signs",
    likhit_prep: "DoTM Mock Test", likhit_desc: "Attempt our infinite question pool based on the official 500 Question Collection.",
    start_quiz: "Start Mock Test", practice_mode: "Practice Mode (Instant Feedback)", exam_mode: "Exam Mode (Result at End)",
    correct: "Correct!", wrong: "Wrong!", score: "Your Score", restart: "Restart Test", prev: "Previous"
  },
  np: {
    nav_home: "गृहपृष्ठ", nav_book: "तालिम बुकिङ", nav_edu: "ट्राफिक शिक्षा", nav_likhit: "लिखित परीक्षा", nav_contact: "सम्पर्क", nav_admin: "एडमिन",
    hero_title: "चितवनमा विश्वासका साथ ड्राइभिङ सिक्नुहोस्", hero_subtitle: "अनुभवी प्रशिक्षकहरू र आधुनिक सवारी साधनहरूको साथ सफल नतिजा।", hero_cta: "बुकिङ गर्नुहोस्", hero_contact: "सम्पर्क गर्नुहोस्",
    why_pass: "उच्च पास दर", why_pass_desc: "हाम्रो विशेष ट्रायल तयारीले तपाईलाई '8' र 'L' ट्रयाकमा छिट्टै पोख्त बनाउँछ।",
    why_expert: "विज्ञ प्रशिक्षकहरू", why_expert_desc: "२०६० सालदेखि सेवारत प्रेम बहादुर गैरे सरबाट सिधै सिक्नुहोस्।",
    why_safe: "राम्रो अवस्थाका साधन", why_safe_desc: "तपाईंको सुरक्षाको लागि हामी आधुनिक र मर्मत गरिएका साधन प्रयोग गर्छौं।",
    book_title: "तपाईंको कोर्ष छान्नुहोस्", book_subtitle: "समयावधि र दैनिक समय चयन गर्नुहोस्।",
    duration: "कोर्षको समयावधि", daily_len: "दैनिक प्रशिक्षण समय", est_total: "अनुमानित जम्मा",
    next: "अर्को", back: "पछाडि", verify_title: "तपाईंको विवरण", verify_btn: "बुकिङ पक्का गर्नुहोस्",
    success_title: "अनुरोध पठाइयो!", success_msg: "तपाईंको बुकिङ अनुरोध प्राप्त भयो। प्रेम सरले हेरेर छिट्टै सम्पर्क गर्नुहुनेछ।",
    check_title: "प्रगति विवरण हेर्नुहोस्", check_placeholder: "फोन नम्बर राख्नुहोस्", check_btn: "खोज्नुहोस्", check_not_found: "यो नम्बरमा कुनै सक्रिय बुकिङ भेटिएन।",
    history_title: "नेपालमा सवारी इतिहास र सुरक्षा", 
    history_desc: "राणा प्रधानमन्त्रीहरूले भित्र्याएको पहिलो कार देखि आजका आधुनिक राजमार्गहरूसम्म, नेपालको सवारी इतिहास लामो छ।",
    safety_title: "तालिम किन आवश्यक छ?",
    safety_desc: "तथ्यांक अनुसार नेपालमा ५०% भन्दा बढी दुर्घटना मोटरसाइकलको कारण हुने गरेको छ, जसमा धेरैजसो अदक्ष चालकहरू जिम्मेवार छन्। सही तालिमले दुर्घटनाको जोखिम ७०% ले कम गर्छ। न्यू चितवनमा हामी लाइसेन्स मात्र होइन, सुरक्षित ड्राइभिङ सिकाउँछौं।",
    edu_title: "ट्राफिक संकेत र नियमहरू", edu_subtitle: "लिखित परीक्षा र दैनिक जीवनका लागि आवश्यक जानकारी।",
    team_title: "हाम्रो टिम", role_proprietor: "प्रोप्राइटर र प्रशिक्षक", role_manager: "प्रबन्धक र रिसेप्सन",
    addr_title: "ठेगाना", addr_desc: "भरतपुर हाइट, चितवन (आई एक्सप्रेस भएको भवन)", phone_title: "फोन नम्बरहरू", email_title: "इमेल", directions: "गुगल म्याप हेर्नुहोस्",
    footer_rights: "सर्वाधिकार सुरक्षित", select_date: "कक्षाको मिति छान्नुहोस्", pref_time: "समय छान्नुहोस्",
    opt_1day: "१ दिन (ट्रायल)", opt_15days: "१५ दिन", opt_30days: "३० दिन", opt_30mins: "३० मिनेट", opt_60mins: "६० मिनेट",
    selected: "छानिएको", days: "दिन", continue: "अगाडि बढ्नुहोस्",
    signs_mandatory: "अनिवार्य संकेतहरू (नियम)", signs_warning: "चेतावनी संकेतहरू (खतरा)", signs_info: "जानकारीमूलक संकेतहरू",
    likhit_prep: "लिखित परीक्षा (Mock Test)", likhit_desc: "यातायात व्यवस्था विभागको ५०० प्रश्न सँगालोबाट अभ्यास गर्नुहोस्।",
    start_quiz: "परीक्षा सुरु गर्नुहोस्", practice_mode: "अभ्यास मोड (तुरुन्त उत्तर)", exam_mode: "परीक्षा मोड (अन्तिम नतिजा)",
    correct: "सही जवाफ!", wrong: "गलत जवाफ!", score: "तपाईंको प्राप्तांक", restart: "फेरी प्रयास गर्नुहोस्", prev: "अघिल्लो"
  }
};

// --- EXPANDED QUIZ DATA (DoTM Based) ---
const quizQuestions = [
  { id: 1, q: { en: "What should you do when you see a Zebra Crossing?", np: "जेब्रा क्रसिङ देख्दा के गर्नुपर्छ?" }, options: [{ en: "Speed up", np: "गति बढाउने" }, { en: "Stop and give way to pedestrians", np: "रोकेर पैदल यात्रीलाई जान दिने" }, { en: "Honk loudly", np: "ठूलो स्वरले हर्न बजाउने" }, { en: "Overtake", np: "ओभरटेक गर्ने" }], correct: 1 },
  { id: 2, q: { en: "Which side should you overtake from?", np: "ओभरटेक कुन साइडबाट गर्नुपर्छ?" }, options: [{ en: "Left side", np: "बायाँ साइडबाट" }, { en: "Right side", np: "दायाँ साइडबाट" }, { en: "Any side", np: "जुनसुकै साइडबाट" }, { en: "None", np: "कुनै पनि होइन" }], correct: 1 },
  { id: 3, q: { en: "What is the color of the number plate for private vehicles in Nepal?", np: "नेपालमा निजी सवारी साधनको नम्बर प्लेटको रङ कस्तो हुन्छ?" }, options: [{ en: "Black with White letters", np: "कालोमा सेतो अक्षर" }, { en: "White with Red letters", np: "सेतोमा रातो अक्षर" }, { en: "Red with White letters", np: "रातोमा सेतो अक्षर" }, { en: "Green with White letters", np: "हरियोमा सेतो अक्षर" }], correct: 2 },
  { id: 4, q: { en: "When is it illegal to use a horn?", np: "हर्न बजाउन कहिले निषेध छ?" }, options: [{ en: "At night", np: "राति" }, { en: "In hospital/school zones", np: "अस्पताल र विद्यालय क्षेत्रमा" }, { en: "On highways", np: "राजमार्गमा" }, { en: "Traffic jams", np: "ट्राफिक जाममा" }], correct: 1 },
  { id: 5, q: { en: "What does a continuous white line mean?", np: "सडकको बीचमा निरन्तर सेतो रेखाले के जनाउँछ?" }, options: [{ en: "Overtake allowed", np: "ओभरटेक गर्न मिल्छ" }, { en: "Do not cross the line", np: "रेखा काट्न पाइदैन" }, { en: "Parking allowed", np: "पार्किङ गर्न मिल्छ" }, { en: "Stop", np: "रोक्नुहोस्" }], correct: 1 },
  { id: 6, q: { en: "What is the speed limit in city areas usually?", np: "सहरी क्षेत्रमा सामान्यतया गति सीमा कति हुन्छ?" }, options: [{ en: "40 km/h", np: "४० कि.मि./घण्टा" }, { en: "60 km/h", np: "६० कि.मि./घण्टा" }, { en: "80 km/h", np: "८० कि.मि./घण्टा" }, { en: "No limit", np: "कुनै सीमा छैन" }], correct: 0 },
  { id: 7, q: { en: "Which gear should be used while going downhill?", np: "ओरालो झर्दा कुन गियर प्रयोग गर्नुपर्छ?" }, options: [{ en: "Neutral", np: "न्युट्रल" }, { en: "Top Gear", np: "टप गियर" }, { en: "Low Gear", np: "लो (Low) गियर" }, { en: "Clutch pressed", np: "क्लच थिचेर" }], correct: 2 },
  { id: 8, q: { en: "What does a flashing yellow light mean?", np: "झिमिक-झिमिक गर्ने पहेंलो बत्तीले के जनाउँछ?" }, options: [{ en: "Stop immediately", np: "तुरुन्त रोक्नुहोस्" }, { en: "Proceed with caution", np: "होसियारीपूर्वक अगाडि बढ्नुहोस्" }, { en: "Go fast", np: "छिटो जानुहोस्" }, { en: "Parking", np: "पार्किङ" }], correct: 1 },
  { id: 9, q: { en: "Who has the first right of way at an intersection?", np: "चौबाटोमा पहिलो अधिकार कसको हुन्छ?" }, options: [{ en: "Big vehicle", np: "ठूलो गाडीको" }, { en: "Vehicle on the right", np: "दायाँबाट आउने सवारीको" }, { en: "Vehicle on the left", np: "बायाँबाट आउने सवारीको" }, { en: "Motorcycle", np: "मोटरसाइकलको" }], correct: 1 },
  { id: 10, q: { en: "Bluebook renewal period?", np: "ब्लुबुक नवीकरण कहिले गर्नुपर्छ?" }, options: [{ en: "Every year", np: "हरेक वर्ष" }, { en: "Every 5 years", np: "हरेक ५ वर्षमा" }, { en: "Every 6 months", np: "हरेक ६ महिनामा" }, { en: "Never", np: "गर्नुपर्दैन" }], correct: 0 }
];

// --- INITIALIZATION ---
let auth: any = {}; let db: any = {}; let firebaseError: string | null = null;
try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  try { auth.useDeviceLanguage(); } catch(e: any) {} 
  db = getFirestore(app);
} catch (err: any) { firebaseError = err.message; }
const appId = 'new-chitwan-v1'; 

// --- UTILS & COMPONENTS ---
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try { const stickyValue = window.localStorage.getItem(key); return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue; } catch (e) { return defaultValue; }
  });
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}
const formatPrice = (price: number) => new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 0 }).format(price);

const useCopyProtection = (active = true) => {
  useEffect(() => {
    if (!active) return;
    const preventContext = (e: any) => { e.preventDefault(); return false; }; 
    const preventKeys = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 's', 'p', 'u', 'a'].includes(e.key.toLowerCase())) { e.preventDefault(); }
      if (e.key === 'F12') e.preventDefault();
    };
    const preventDrag = (e: any) => e.preventDefault();
    document.addEventListener('contextmenu', preventContext); document.addEventListener('keydown', preventKeys); document.addEventListener('dragstart', preventDrag); 
    return () => { document.removeEventListener('contextmenu', preventContext); document.removeEventListener('keydown', preventKeys); document.removeEventListener('dragstart', preventDrag); };
  }, [active]);
};

// --- CUSTOM CALENDAR COMPONENT ---
interface Schedule { [date: string]: string }

const CustomCalendar = ({ schedule, setSchedule, targetDays }: { schedule: Schedule, setSchedule: any, targetDays: number }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pickingDate, setPickingDate] = useState<string | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const timeSlots = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

  const handleDateClick = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (schedule[dateString]) {
      const newSchedule = { ...schedule };
      delete newSchedule[dateString];
      setSchedule(newSchedule);
    } else {
      if (Object.keys(schedule).length >= targetDays) {
        alert(`You can only select ${targetDays} days.`);
        return;
      }
      setPickingDate(dateString);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (pickingDate) {
      setSchedule({ ...schedule, [pickingDate]: time });
      setPickingDate(null);
    }
  };

  const selectedCount = Object.keys(schedule).length;

  return (
    <div className="select-none">
      {pickingDate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-2 text-center">Select Time</h3>
            <p className="text-sm text-gray-500 text-center mb-4">{pickingDate}</p>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {timeSlots.map(t => (
                <button key={t} onClick={() => handleTimeSelect(t)} className="p-2 border rounded hover:bg-red-50 hover:border-red-500 text-xs font-bold transition">{t}</button>
              ))}
            </div>
            <button onClick={() => setPickingDate(null)} className="mt-4 w-full py-3 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5"/></button>
          <div className="font-bold text-gray-800">{monthNames[month]} {year}</div>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-xs font-bold text-gray-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = !!schedule[dateString];
            return (
              <div key={day} onClick={() => handleDateClick(day)} className={`h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium cursor-pointer transition-all ${isSelected ? 'bg-green-600 text-white shadow-md scale-105 ring-2 ring-green-100' : 'hover:bg-red-50 text-gray-700'}`}>{day}</div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between items-center bg-gray-50 p-2 rounded text-xs font-bold text-gray-600">
           <span>Selected: <span className={selectedCount === targetDays ? "text-green-600" : "text-red-600"}>{selectedCount}</span> / {targetDays} Days</span>
           <span className="text-[10px] text-gray-400 italic">Click date to set time</span>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto border border-gray-100">
          <div className="space-y-1">
            {Object.entries(schedule).sort().map(([date, time]) => (
              <div key={date} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-100 shadow-sm"><span className="font-medium text-gray-700">{date}</span><span className="font-bold text-green-600">{time}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- TRAFFIC SIGN COMPONENT (CSS SHAPES) ---
const Sign = ({ type, icon, label, sub }: any) => {
  return (
    <div className="flex flex-col items-center mb-4">
      {type === 'mandatory' && (
        <div className="w-16 h-16 rounded-full border-4 border-red-600 bg-white flex items-center justify-center shadow-sm">
          <div className="text-black font-bold text-xl">{icon}</div>
        </div>
      )}
      {type === 'warning' && (
        <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[60px] border-b-white relative drop-shadow-md">
           <div className="absolute top-2 -left-8 w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[56px] border-b-red-600 flex items-center justify-center">
              <div className="absolute top-4 -left-4 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[36px] border-b-white flex items-center justify-center">
                 <span className="absolute top-4 text-black font-bold text-lg">{icon}</span>
              </div>
           </div>
        </div>
      )}
      {type === 'info' && (
        <div className="w-16 h-16 bg-blue-600 rounded-md flex items-center justify-center shadow-sm border-2 border-white ring-1 ring-blue-600">
          <div className="text-white font-bold text-2xl">{icon}</div>
        </div>
      )}
      <p className="mt-2 text-xs font-bold text-gray-700 text-center leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-gray-500">{sub}</p>}
    </div>
  );
};

// --- APP SECTIONS ---

const Navbar = ({ setView, activeView, lang, setLang }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const T = t[lang as 'en' | 'np'];
  const navItems = [
    {id:'home',l:T.nav_home}, {id:'booking',l:T.nav_book}, {id:'education',l:T.nav_edu}, {id:'likhit',l:T.nav_likhit}, {id:'contact',l:T.nav_contact}
  ];

  return (
    <nav className="bg-red-900 text-white sticky top-0 z-50 shadow-lg border-b-4 border-red-700 select-none">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer">
            <div className="bg-white p-2 rounded-lg"><Car className="text-red-700 w-6 h-6" /></div>
            <div><h1 className="font-bold text-lg leading-tight">New Chitwan</h1><p className="text-[10px] text-red-200 uppercase">Driving Training Centre</p></div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <button onClick={() => setLang(lang === 'en' ? 'np' : 'en')} className="mr-4 flex items-center gap-1 bg-red-950 px-3 py-1 rounded-full text-xs font-bold border border-red-800 hover:bg-black transition"><Globe className="w-3 h-3"/> {lang === 'en' ? 'नेपाली' : 'English'}</button>
            {navItems.map(i => <button key={i.id} onClick={() => setView(i.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeView===i.id?'bg-white text-red-700 font-bold':'text-red-100 hover:bg-red-800'}`}>{i.l}</button>)}
            <button onClick={() => setView('login')} className="ml-4 px-3 py-2 bg-red-950 rounded-full hover:bg-black border border-red-800"><Lock className="w-4 h-4 text-red-200"/></button>
          </div>
          <div className="md:hidden flex items-center gap-4">
             <button onClick={() => setLang(lang === 'en' ? 'np' : 'en')} className="bg-red-950 px-3 py-1 rounded-full text-xs font-bold border border-red-800">{lang === 'en' ? 'NP' : 'EN'}</button>
             <button onClick={() => setIsOpen(!isOpen)} className="text-red-100 p-2">{isOpen ? <X/> : <Menu/>}</button>
          </div>
        </div>
      </div>
      {isOpen && <div className="md:hidden bg-red-800 border-t border-red-700 p-2">{navItems.map(i => <button key={i.id} onClick={()=>{setView(i.id);setIsOpen(false)}} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-100 hover:bg-red-700">{i.l}</button>)}<button onClick={()=>{setView('login');setIsOpen(false)}} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-300 hover:bg-red-900">{T.nav_admin}</button></div>}
    </nav>
  );
};

const QuizView = ({ lang, setView }: any) => {
  const T = t[lang as 'en' | 'np'];
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Shuffle logic for "Infinite" feel
  const [shuffledQuestions, setShuffledQuestions] = useState(quizQuestions);

  useEffect(() => {
    if (quizStarted) {
      setShuffledQuestions([...quizQuestions].sort(() => 0.5 - Math.random()));
    }
  }, [quizStarted]);

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null && isPracticeMode) return;
    setSelectedOption(optionIndex);
    if (!isPracticeMode) {
      if (optionIndex === shuffledQuestions[currentQ].correct) setScore(score + 1);
      setTimeout(() => {
        if (currentQ + 1 < shuffledQuestions.length) { setCurrentQ(currentQ + 1); setSelectedOption(null); } 
        else setShowResult(true);
      }, 500);
    }
  };

  const nextQuestion = () => {
    if (isPracticeMode && selectedOption === shuffledQuestions[currentQ].correct) setScore(score + 1);
    if (currentQ + 1 < shuffledQuestions.length) { setCurrentQ(currentQ + 1); setSelectedOption(null); } else setShowResult(true);
  };

  const prevQuestion = () => {
    if (currentQ > 0) { setCurrentQ(currentQ - 1); setSelectedOption(null); }
  };

  if (!quizStarted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg text-center my-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"><HelpCircle className="w-10 h-10 text-red-600" /></div>
        <h2 className="text-2xl font-bold mb-4">{T.likhit_prep}</h2>
        <p className="text-gray-600 mb-8">{T.likhit_desc}</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => { setIsPracticeMode(true); setQuizStarted(true); }} className="w-full py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"><BookOpen className="w-5 h-5"/> {T.practice_mode}</button>
          <button onClick={() => { setIsPracticeMode(false); setQuizStarted(true); }} className="w-full py-4 bg-red-800 text-white rounded-lg font-bold hover:bg-red-900 flex items-center justify-center gap-2"><GraduationCap className="w-5 h-5"/> {T.exam_mode}</button>
        </div>
        <button onClick={() => setView('education')} className="mt-6 text-gray-400 text-sm underline">{T.back}</button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center my-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{T.score}</h2>
        <div className="text-6xl font-black text-red-600 mb-6">{score} / {shuffledQuestions.length}</div>
        <button onClick={() => { setScore(0); setCurrentQ(0); setShowResult(false); setSelectedOption(null); setQuizStarted(false); }} className="w-full py-3 bg-red-700 text-white rounded-lg font-bold">{T.restart}</button>
      </div>
    );
  }

  const q = shuffledQuestions[currentQ];
  const langKey = lang as 'en' | 'np';

  return (
    <div className="max-w-lg mx-auto p-4 my-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-red-900 p-4 flex justify-between items-center text-white">
          <span className="font-bold">Q. {currentQ + 1} / {shuffledQuestions.length}</span>
          <span className="bg-red-800 px-2 py-1 rounded text-xs">{isPracticeMode ? "Practice" : "Exam"}</span>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{q.q[langKey]}</h3>
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let btnClass = "w-full p-4 rounded-lg border text-left transition font-medium ";
              if (selectedOption === idx) {
                if (isPracticeMode) btnClass += idx === q.correct ? "bg-green-100 border-green-500 text-green-800" : "bg-red-100 border-red-500 text-red-800";
                else btnClass += "bg-red-50 border-red-500 text-red-800";
              } else btnClass += "hover:bg-gray-50 border-gray-200 text-gray-700";
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} className={btnClass}>
                  <div className="flex justify-between items-center"><span>{opt[langKey]}</span>{isPracticeMode && selectedOption === idx && (idx === q.correct ? <CheckCircle className="w-5 h-5 text-green-600"/> : <XCircle className="w-5 h-5 text-red-600"/>)}</div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 flex gap-2">
             <button onClick={prevQuestion} disabled={currentQ===0} className="flex-1 py-3 border border-gray-300 rounded-lg font-bold text-gray-500 disabled:opacity-50">{T.prev}</button>
             {isPracticeMode && selectedOption !== null && <button onClick={nextQuestion} className="flex-[2] py-3 bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center gap-2">{T.next} <ChevronRight className="w-4 h-4"/></button>}
          </div>
        </div>
      </div>
    </div>
  );
};

const EducationPage = ({ lang, setView }: any) => {
  const T = t[lang as 'en' | 'np'];
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in select-none">
      <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-800 mb-2">{T.edu_title}</h2><p className="text-gray-500">{T.edu_subtitle}</p></div>

      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-8 mb-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div><h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><GraduationCap className="w-8 h-8 text-yellow-400" /> {T.likhit_prep}</h3><p className="opacity-90 max-w-lg">{T.likhit_desc}</p></div>
        <button onClick={() => setView('likhit')} className="px-8 py-3 bg-white text-red-900 rounded-full font-bold shadow-lg hover:bg-gray-100 transition flex items-center gap-2"><PlayCircle className="w-5 h-5" /> {T.start_quiz}</button>
      </div>

      <div className="space-y-12">
        <div>
          <h3 className="text-xl font-bold text-red-700 mb-4 border-b pb-2">{T.signs_mandatory}</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
             <Sign type="mandatory" icon="STOP" label="Stop" />
             <Sign type="mandatory" icon="🚫" label="No Entry" />
             <Sign type="mandatory" icon="←" label="Left Only" />
             <Sign type="mandatory" icon="40" label="Speed 40" />
             <Sign type="mandatory" icon="P" label="No Parking" sub="Crossed" />
             <Sign type="mandatory" icon="🎺" label="No Horn" sub="Crossed" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-yellow-600 mb-4 border-b pb-2">{T.signs_warning}</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
             <Sign type="warning" icon="🚦" label="Traffic Light" />
             <Sign type="warning" icon="🦓" label="Zebra Cross" />
             <Sign type="warning" icon="🏫" label="School" />
             <Sign type="warning" icon="↰" label="Left Bend" />
             <Sign type="warning" icon="⛰️" label="Steep Hill" />
             <Sign type="warning" icon="⚠️" label="Hazard" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-blue-600 mb-4 border-b pb-2">{T.signs_info}</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
             <Sign type="info" icon="P" label="Parking" />
             <Sign type="info" icon="H" label="Hospital" />
             <Sign type="info" icon="⛽" label="Fuel" />
             <Sign type="info" icon="🔧" label="Workshop" />
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingView = ({ onAddBooking, rates, lang }: any) => {
  const T = t[lang as 'en' | 'np'];
  const [tab, setTab] = useState('new'); const [duration, setDuration] = useState('15 Days'); const [dailyTime, setDailyTime] = useState('60 Mins'); const [currentPrice, setCurrentPrice] = useState(rates['15 Days']);
  const [schedule, setSchedule] = useState<{ [key: string]: string }>({});
  const [clientName, setClientName] = useState(''); const [clientPhone, setClientPhone] = useState('+977 '); const [instructor, setInstructor] = useState('Prem Bahadur Gaire');
  const [step, setStep] = useState('customize'); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [checkPhone, setCheckPhone] = useState(''); const [myBooking, setMyBooking] = useState<any>(null); const [checkError, setCheckError] = useState('');

  useEffect(() => {
    let base = 0;
    if (duration === '1 Day') base = rates['1 Day']; else if (duration === '15 Days') base = dailyTime === '60 Mins' ? rates['15 Days'] : rates['15 Days (30m)']; else base = dailyTime === '60 Mins' ? rates['30 Days'] : rates['30 Days (30m)'];
    setCurrentPrice(base); setSchedule({});
  }, [duration, dailyTime, rates]);

  const handleSubmitBooking = async () => {
    if (!clientName || clientPhone.length < 10) { setError("Invalid Details"); return; }
    const scheduleString = Object.entries(schedule).sort().map(([date, time]) => `${date} @ ${time}`).join('\n');
    setError(''); setLoading(true);
    try {
      const pkgName = duration === '1 Day' ? 'Trial (1 Day)' : `${duration} (${dailyTime})`;
      await onAddBooking({ clientName, clientPhone, packageName: pkgName, duration, dailyTime, date: scheduleString, price: currentPrice, instructor, type: 'public', status: 'pending', progress: 0 });
      setStep('done'); setLoading(false);
    } catch (err) { setLoading(false); setError("Connection Error"); }
  };

  const handleCheckProgress = async () => {
    setCheckError(''); setMyBooking(null); if(!checkPhone) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), where('clientPhone', '==', checkPhone), where('status', '==', 'approved'));
    const snapshot = await getDocs(q); if(snapshot.empty) setCheckError(T.check_not_found); else setMyBooking(snapshot.docs[0].data());
  };

  const getTargetDays = () => duration === '1 Day' ? 1 : duration === '15 Days' ? 15 : 30;

  if (step === 'done') {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-white rounded-xl shadow-xl p-8 text-center animate-fade-in"><div className="max-w-md"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div><h2 className="text-3xl font-bold text-gray-800 mb-4">{T.success_title}</h2><p className="text-gray-600 mb-6">{T.success_msg}</p><button onClick={() => { setStep('customize'); setDuration('15 Days'); setSchedule({}); }} className="px-6 py-3 bg-red-700 text-white rounded-lg font-bold">{T.nav_book}</button></div></div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl flex flex-col min-h-[550px] border border-gray-100 animate-fade-in">
      <div className="flex border-b"><button onClick={() => setTab('new')} className={`flex-1 p-4 text-center font-bold ${tab === 'new' ? 'bg-red-50 text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:bg-gray-50'}`}>{T.nav_book}</button><button onClick={() => setTab('check')} className={`flex-1 p-4 text-center font-bold ${tab === 'check' ? 'bg-red-50 text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:bg-gray-50'}`}>{T.check_title}</button></div>
      {tab === 'check' && (
         <div className="p-8 flex flex-col items-center justify-center h-full"><h3 className="text-xl font-bold mb-4 text-gray-800">{T.check_title}</h3><div className="flex gap-2 w-full max-w-md mb-6"><input type="tel" placeholder={T.check_placeholder} className="flex-grow p-3 border rounded focus:border-red-500 outline-none" value={checkPhone} onChange={(e: any) => setCheckPhone(e.target.value)} /><button onClick={handleCheckProgress} className="bg-red-900 text-white px-6 rounded font-bold hover:bg-red-800">{T.check_btn}</button></div>{checkError && <p className="text-red-500 mb-4">{checkError}</p>}{myBooking && (<div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full max-w-md"><h4 className="font-bold text-lg text-gray-800 mb-1">{myBooking.clientName}</h4><p className="text-gray-500 text-sm mb-4">{myBooking.packageName}</p><div className="mb-2 flex justify-between text-xs font-bold uppercase text-gray-400"><span>Progress</span><span>Day {myBooking.progress || 0} / {myBooking.packageName.includes('30') ? 30 : 15}</span></div><div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-4"><div className="h-full bg-green-500 transition-all" style={{ width: `${((myBooking.progress || 0) / (myBooking.packageName.includes('30') ? 30 : 15)) * 100}%` }}></div></div><div className="text-center p-3 bg-white rounded border border-gray-200 text-sm whitespace-pre-wrap">{myBooking.date}</div></div>)}</div>
      )}
      {tab === 'new' && (
        <div className="flex flex-col md:flex-row flex-grow">
          <div className="md:w-1/2 p-6 bg-gray-50/50 border-r border-gray-100 flex flex-col"><h2 className="text-2xl font-bold text-gray-800 mb-2">{T.book_title}</h2><p className="text-gray-500 mb-6 text-sm">{T.book_subtitle}</p><div className="mb-6"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">{T.duration}</label><div className="grid grid-cols-3 gap-2">{['1 Day', '15 Days', '30 Days'].map(d => (<button key={d} onClick={() => setDuration(d)} className={`p-3 rounded-lg text-sm font-bold transition-all ${duration === d ? 'bg-red-700 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}>{d === '1 Day' ? T.opt_1day : d === '15 Days' ? T.opt_15days : T.opt_30days}</button>))}</div></div>{duration !== '1 Day' && (<div className="mb-6 animate-fade-in"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">{T.daily_len}</label><div className="grid grid-cols-2 gap-2">{['30 Mins', '60 Mins'].map(t => (<button key={t} onClick={() => setDailyTime(t)} className={`p-3 rounded-lg text-sm font-bold transition-all ${dailyTime === t ? 'bg-red-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}>{t === '30 Mins' ? T.opt_30mins : T.opt_60mins}</button>))}</div></div>)}<div className="mt-auto pt-6 border-t border-gray-200"><div className="flex justify-between items-end"><div><p className="text-xs text-gray-500 uppercase font-bold">{T.est_total}</p><p className="text-3xl font-black text-gray-800">{formatPrice(currentPrice)}</p></div>{step === 'customize' && <button onClick={() => setStep('date')} className="px-6 py-3 bg-red-700 text-white rounded-lg font-bold hover:bg-red-800 flex items-center gap-2">{T.next} <ChevronRight className="w-4 h-4" /></button>}</div></div></div>
          <div className="md:w-1/2 p-6 bg-white">{step === 'customize' && (<div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-10 md:py-0"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Settings className="w-8 h-8 opacity-20" /></div><p>Configure your course on the left<br/>to proceed.</p></div>)}{step === 'date' && (<div className="animate-fade-in"><h3 className="font-bold text-lg mb-4">{T.select_date}</h3><div className="mb-4"><CustomCalendar schedule={schedule} setSchedule={setSchedule} targetDays={getTargetDays()} /></div><button onClick={() => { if(Object.keys(schedule).length === 0) alert("Please select at least one date."); else setStep('form'); }} className="mt-2 w-full py-3 bg-red-700 text-white rounded-lg font-bold hover:bg-red-800 flex items-center justify-center gap-2">{T.continue} <ChevronRight className="w-4 h-4" /></button><button onClick={() => setStep('customize')} className="mt-4 text-center text-sm text-gray-400 underline block w-full">{T.back}</button></div>)}{step === 'form' && (<div className="animate-fade-in h-full flex flex-col"><h3 className="font-bold text-lg mb-4">{T.verify_title}</h3><div className="space-y-4 mb-6"><div><label className="text-xs font-bold text-gray-500 uppercase">Instructor</label><select className="w-full p-3 border border-gray-300 rounded bg-white" value={instructor} onChange={(e: any) => setInstructor(e.target.value)}><option>Prem Bahadur Gaire</option><option>Other / Any Available</option></select></div><div><label className="text-xs font-bold text-gray-500 uppercase">Name</label><input type="text" className="w-full p-3 border border-gray-300 rounded outline-none focus:border-red-500" value={clientName} onChange={(e: any) => setClientName(e.target.value)} /></div><div><label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label><input type="tel" className="w-full p-3 border border-gray-300 rounded outline-none focus:border-red-500" value={clientPhone} onChange={(e: any) => setClientPhone(e.target.value)} placeholder="+977 98..." /></div></div>{error && <p className="text-red-500 text-sm mb-3">{error}</p>}<button onClick={handleSubmitBooking} disabled={loading} className="w-full bg-red-900 text-white py-4 rounded-lg font-bold hover:bg-red-800 mt-auto shadow-lg flex items-center justify-center gap-2">{loading ? 'Saving...' : <><Smartphone className="w-4 h-4" /> {T.verify_btn}</>}</button><button onClick={() => setStep('date')} className="mt-3 text-center text-sm text-gray-400 underline">{T.back}</button></div>)}</div>
        </div>
      )}
    </div>
  );
};

const HomePage = ({ setView, lang }: any) => {
  const T = t[lang as 'en' | 'np'];
  return (
  <div className="animate-fade-in">
    <div className="relative min-h-[60vh] bg-red-900 overflow-hidden flex flex-col justify-center items-center text-center px-4 py-20 select-none">
      <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-900/80 to-red-900/60 z-10"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 z-0"></div>
      <div className="relative z-20 max-w-3xl">
        <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider mb-4">Est. 2003</span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{T.hero_title}</h2>
        <p className="text-red-100 text-lg mb-8">{T.hero_subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => setView('booking')} className="px-8 py-3 bg-white text-red-800 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-gray-100">{T.hero_cta} <ChevronRight className="w-5 h-5" /></button>
          <button onClick={() => setView('contact')} className="px-8 py-3 bg-red-800/50 hover:bg-red-800/70 text-white border border-red-400 rounded-lg font-bold shadow-lg transition-all">{T.hero_contact}</button>
        </div>
      </div>
    </div>
    
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-red-50 rounded-xl p-8 mb-12 border-l-8 border-red-800 shadow-sm">
        <h3 className="text-2xl font-bold text-red-900 mb-4">{T.history_title}</h3>
        <p className="text-gray-700 leading-relaxed mb-4">{T.history_desc}</p>
        <h4 className="font-bold text-red-800 mt-4 mb-2">{T.safety_title}</h4>
        <p className="text-gray-700 leading-relaxed text-sm">{T.safety_desc}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-red-600"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600"><Award className="w-6 h-6" /></div><h3 className="text-xl font-bold text-gray-800 mb-2">{T.why_pass}</h3><p className="text-gray-500">{T.why_pass_desc}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-red-600"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600"><Users className="w-6 h-6" /></div><h3 className="text-xl font-bold text-gray-800 mb-2">{T.why_expert}</h3><p className="text-gray-500">{T.why_expert_desc}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-red-600"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600"><Settings className="w-6 h-6" /></div><h3 className="text-xl font-bold text-gray-800 mb-2">{T.why_safe}</h3><p className="text-gray-500">{T.why_safe_desc}</p></div>
      </div>
    </div>
  </div>
)};

const AboutPage = ({ lang }: any) => {
  const T = t[lang as 'en' | 'np'];
  return (
  <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in select-none">
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
      <div className="bg-red-900 p-8 text-center"><h2 className="text-3xl font-bold text-white mb-2">{T.history_title}</h2></div>
      <div className="p-8 md:p-12">
        <p className="text-lg text-gray-600 leading-relaxed mb-6">{T.history_desc}</p>
        <div className="mt-8 flex items-center gap-2 text-sm font-mono text-gray-400 bg-gray-50 p-3 rounded inline-block"><span>PAN No: 301569099</span></div>
      </div>
    </div>
    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{T.team_title}</h2>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100">
        <div className="h-80 bg-gray-200 relative"><img src="./dad.png" onError={(e: any) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} className="w-full h-full object-cover object-top" alt="Prem"/><div className="w-full h-full hidden flex-col items-center justify-center bg-gray-300 text-gray-500 absolute inset-0"><User className="w-20 h-20 mb-2 opacity-50" /><span className="text-xs font-bold text-center px-4">Add 'dad.png'</span></div></div>
        <div className="p-6 text-center"><h3 className="text-xl font-bold text-gray-900">Prem Bahadur Gaire</h3><p className="text-red-600 font-medium text-sm mb-2">{T.role_proprietor}</p><p className="text-gray-500 text-sm flex items-center justify-center gap-1"><Phone className="w-3 h-3"/> 9845048863</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100">
        <div className="h-80 bg-gray-200 relative"><img src="./mom.png" onError={(e: any) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} className="w-full h-full object-cover object-top" alt="Anita"/><div className="w-full h-full hidden flex-col items-center justify-center bg-gray-300 text-gray-500 absolute inset-0"><User className="w-20 h-20 mb-2 opacity-50" /><span className="text-xs font-bold text-center px-4">Add 'mom.png'</span></div></div>
        <div className="p-6 text-center"><h3 className="text-xl font-bold text-gray-900">Anita Gaire</h3><p className="text-red-600 font-medium text-sm mb-2">{T.role_manager}</p><p className="text-gray-500 text-sm flex items-center justify-center gap-1"><Phone className="w-3 h-3"/> 9845278967</p></div>
      </div>
    </div>
  </div>
)};

const ContactPage = ({ lang }: any) => {
  const T = t[lang as 'en' | 'np'];
  return (
  <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in select-none">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
          <div className="flex items-start gap-4"><div className="bg-red-100 p-3 rounded-full text-red-600"><MapPin className="w-5 h-5" /></div><div><p className="font-bold text-gray-800">{T.addr_title}</p><p className="text-gray-600">{T.addr_desc}</p></div></div>
          <div className="flex items-start gap-4"><div className="bg-red-100 p-3 rounded-full text-red-600"><Phone className="w-5 h-5" /></div><div className="space-y-2"><p className="font-bold text-gray-800">{T.phone_title}</p><p className="text-gray-600 text-sm">Landline: 056-518289</p><p className="text-gray-600 text-sm">Anita Gaire: 9845278967</p><p className="text-gray-600 text-sm">Prem Gaire: 9845048863</p></div></div>
          <div className="flex items-start gap-4"><div className="bg-red-100 p-3 rounded-full text-red-600"><Mail className="w-5 h-5" /></div><div><p className="font-bold text-gray-800">{T.email_title}</p><a href="mailto:cdriving47@gmail.com" className="text-red-600 hover:underline text-sm">cdriving47@gmail.com</a></div></div>
          <a href="https://maps.app.goo.gl/ajFQJt3BAUP4dkCM8?g_st=ipc" target="_blank" className="block w-full text-center bg-red-900 text-white py-3 rounded-lg font-bold hover:bg-red-800 flex items-center justify-center gap-2"><Map className="w-5 h-5" /> {T.directions}</a>
      </div>
      <div className="bg-gray-200 rounded-xl overflow-hidden shadow-inner h-96 w-full relative mt-8"><iframe className="absolute inset-0 w-full h-full" src="https://maps.google.com/maps?q=MCQH%2B28+Bharatpur&t=&z=17&ie=UTF8&iwloc=&output=embed" style={{border:0}} allowFullScreen={true} loading="lazy" title="Location Map"></iframe></div>
  </div>
)};

const AdminPanel = ({ securitySettings, updateSecurity, onExit, rates, setRates }: any) => {
  const [adminTab, setAdminTab] = useState('pending');
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  
  const parseSchedule = (str: string) => {
    if (!str) return {};
    const s: { [key: string]: string } = {};
    str.split('\n').forEach(line => { const [d, t] = line.split(' @ '); if (d && t) s[d] = t; });
    return s;
  };

  const [pName, setPName] = useState(''); const [pPhone, setPPhone] = useState(''); const [pDuration, setPDuration] = useState('15 Days'); const [pDaily, setPDaily] = useState('60 Mins'); const [pNotes, setPNotes] = useState('');
  const [pSchedule, setPSchedule] = useState<{ [key: string]: string }>({});
  const [editSchedule, setEditSchedule] = useState<{ [key: string]: string }>({});
  const [tempRates, setTempRates] = useState(rates);
  const [tempQuestion, setTempQuestion] = useState(securitySettings.question); const [tempAnswer, setTempAnswer] = useState(securitySettings.answer); const [securityMessage, setSecurityMessage] = useState('');

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => { setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    return () => unsubscribe();
  }, []);

  const openEdit = (b: any) => { setEditingBooking(b); setEditSchedule(parseSchedule(b.date)); };

  const handleSaveBookingEdit = async () => {
    if(!editingBooking) return;
    const dateString = Object.entries(editSchedule).sort().map(([d, t]) => `${d} @ ${t}`).join('\n');
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', editingBooking.id), { 
      clientName: editingBooking.clientName, clientPhone: editingBooking.clientPhone,
      price: Number(editingBooking.finalPrice), date: dateString,
      status: editingBooking.status === 'pending' ? 'approved' : editingBooking.status
    });
    setEditingBooking(null); setAdminTab('active');
  };

  const updateProgress = async (booking: any, increment: number) => { const newProgress = (booking.progress || 0) + increment; if (newProgress < 0) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', booking.id), { progress: newProgress }); };
  const deleteBooking = async (id: string) => { if(confirm("Delete this?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'bookings', id)); };
  const sendConfirmation = (booking: any) => { const msg = `Namaste ${booking.clientName},\n\nBooking Confirmed!\n\n*Package:* ${booking.packageName}\n*Price:* ${formatPrice(booking.price)}\n\nPlease arrive 5 minutes early.\nContact: 9845048863`; window.open(`https://wa.me/${booking.clientPhone}?text=${encodeURIComponent(msg)}`, '_blank'); };
  const sendTestMessage = (booking: any) => { const msg = `Namaste ${booking.clientName}, this is a message from New Chitwan Driving. Please contact us.`; window.open(`sms:${booking.clientPhone}?body=${encodeURIComponent(msg)}`, '_blank'); };

  const handleAddPrivate = async () => {
     if(!pName) return alert("Name Required");
     let price = 0;
     if (pDuration === '1 Day') price = rates['1 Day']; else if (pDuration === '15 Days') price = pDaily === '60 Mins' ? rates['15 Days'] : rates['15 Days (30m)']; else price = pDaily === '60 Mins' ? rates['30 Days'] : rates['30 Days (30m)'];
     const pkgName = pDuration === '1 Day' ? 'Private (1 Day)' : `${pDuration} Private Course (${pDaily})`;
     const dateString = Object.entries(pSchedule).sort().map(([d, t]) => `${d} @ ${t}`).join('\n');
     await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), { clientName: pName, clientPhone: pPhone, packageName: pkgName, duration: pDuration, dailyTime: pDaily, date: dateString, price: price, instructor: 'Prem Bahadur Gaire', type: 'private', status: 'private', notes: pNotes, progress: 0, createdAt: serverTimestamp() });
     alert("Private Booking Added!"); setAdminTab('active'); setPName(''); setPPhone(''); setPNotes(''); setPSchedule({});
  };

  const handleUpdateSecurity = () => { if (tempQuestion.length < 5 || tempAnswer.length < 3) { setSecurityMessage('Invalid Q/A length'); return; } updateSecurity('question', tempQuestion); updateSecurity('answer', tempAnswer); setSecurityMessage('Updated!'); };
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'approved' || b.status === 'private');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-red-100 animate-fade-in overflow-hidden flex flex-col h-[calc(100vh-100px)] relative">
      {editingBooking && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-lg mb-4">Edit Booking</h3>
            <div className="space-y-3">
               <div><label className="text-xs text-gray-500 font-bold">Client</label><input className="w-full p-2 border rounded" value={editingBooking.clientName} onChange={(e: any) => setEditingBooking({...editingBooking, clientName: e.target.value})}/></div>
               <div><label className="text-xs text-gray-500 font-bold">Phone</label><input className="w-full p-2 border rounded" value={editingBooking.clientPhone} onChange={(e: any) => setEditingBooking({...editingBooking, clientPhone: e.target.value})}/></div>
               <div><label className="text-xs text-gray-500 font-bold">Price</label><input type="number" className="w-full p-2 border rounded font-bold text-red-600" value={editingBooking.finalPrice} onChange={(e: any) => setEditingBooking({...editingBooking, finalPrice: e.target.value})}/></div>
               <div><label className="text-xs text-gray-500 font-bold">Schedule Editor</label><CustomCalendar schedule={editSchedule} setSchedule={setEditSchedule} targetDays={100} /></div>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={() => setEditingBooking(null)} className="flex-1 py-2 border rounded">Cancel</button><button onClick={handleSaveBookingEdit} className="flex-1 py-2 bg-red-900 text-white rounded font-bold">Save</button></div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row border-b border-gray-100 h-full">
        <div className="bg-gray-50 md:w-64 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0">
          <button onClick={() => setAdminTab('pending')} className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${adminTab === 'pending' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><AlertTriangle className="w-4 h-4" /> Pending ({pendingBookings.length})</button>
          <button onClick={() => setAdminTab('active')} className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${adminTab === 'active' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><CalIcon className="w-4 h-4" /> Active</button>
          <button onClick={() => setAdminTab('private')} className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${adminTab === 'private' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><Plus className="w-4 h-4" /> Add Private</button>
          <button onClick={() => setAdminTab('settings')} className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${adminTab === 'settings' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><Settings className="w-4 h-4" /> Settings</button>
          <button onClick={onExit} className="p-3 rounded-lg flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 mt-auto"><RefreshCcw className="w-4 h-4" /> Logout</button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {adminTab === 'pending' && (
            <div className="space-y-3">
              {pendingBookings.length === 0 ? <p className="text-gray-400 italic">No new requests.</p> : pendingBookings.map((b) => (
                <div key={b.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div><p className="font-bold text-gray-800">{b.clientName} <span className="text-xs font-normal text-gray-500">({b.clientPhone})</span></p><p className="text-sm text-gray-600">{b.packageName}</p><div className="text-sm text-orange-600 bg-orange-50 p-2 rounded mt-1 break-words">{b.date}</div></div>
                  <div className="flex gap-2"><button onClick={() => deleteBooking(b.id)} className="px-3 py-2 border border-red-200 text-red-500 rounded text-sm hover:bg-red-50">Reject</button><button onClick={() => openEdit({...b, finalPrice: b.price, newDate: b.date})} className="px-3 py-2 bg-red-800 text-white rounded text-sm font-bold hover:bg-red-900">Review</button></div>
                </div>
              ))}
            </div>
          )}
          {adminTab === 'active' && (
            <div className="space-y-4">
               {activeBookings.length === 0 ? <p className="text-gray-400 italic">No active students.</p> : activeBookings.map((b) => (
                 <div key={b.id} className="p-4 border rounded-lg hover:bg-gray-50 relative group">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2"><p className="font-bold text-gray-800 text-lg">{b.clientName}</p><button onClick={() => deleteBooking(b.id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button></div>
                          <p className="text-sm text-gray-500">{b.packageName}</p>
                          {b.notes && <p className="text-xs text-amber-600 bg-amber-50 p-1 rounded mt-1 inline-block">📝 {b.notes}</p>}
                          <div className="flex items-center gap-2 mt-1"><p className="text-xs font-bold text-blue-600 bg-blue-50 p-1 rounded break-words max-w-xs whitespace-pre-wrap">{b.date}</p><button onClick={() => openEdit({...b, finalPrice: b.price, newDate: b.date})}><Edit3 className="w-3 h-3 text-gray-400 hover:text-blue-500" /></button></div>
                        </div>
                        <div className="text-right"><p className="font-bold text-gray-700">{formatPrice(b.price)}</p></div>
                    </div>
                    {(b.packageName.includes('15') || b.packageName.includes('30')) && (<div className="bg-gray-100 p-3 rounded mb-3"><div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>Course Progress</span><span>Day {b.progress || 0}</span></div><div className="flex items-center gap-2"><button onClick={() => updateProgress(b, -1)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><Minus className="w-4 h-4" /></button><div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all" style={{ width: `${((b.progress || 0) / (b.packageName.includes('30') ? 30 : 15)) * 100}%` }}></div></div><button onClick={() => updateProgress(b, 1)} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"><Plus className="w-4 h-4" /></button></div></div>)}
                    <div className="pt-3 border-t flex justify-end gap-2">
                      <a href={`tel:${b.clientPhone}`} className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold hover:bg-gray-200">Call</a>
                      <button onClick={() => sendTestMessage(b)} className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold hover:bg-blue-200 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Msg</button>
                      <button onClick={() => sendConfirmation(b)} className="px-3 py-1 bg-[#25D366] text-white rounded text-xs font-bold hover:opacity-90 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Info</button>
                    </div>
                 </div>
               ))}
            </div>
          )}
          {adminTab === 'private' && (
             <div className="max-w-md space-y-4">
                 <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded border border-amber-200">Private Booking</div>
                 <div className="grid grid-cols-2 gap-2"><select value={pDuration} onChange={(e: any) => setPDuration(e.target.value)} className="p-2 border rounded"><option>1 Day</option><option>15 Days</option><option>30 Days</option></select><select value={pDaily} onChange={(e: any) => setPDaily(e.target.value)} className="p-2 border rounded"><option>30 Mins</option><option>60 Mins</option></select></div>
                 <input type="text" placeholder="Name" className="w-full p-2 border rounded" value={pName} onChange={(e: any) => setPName(e.target.value)} />
                 <input type="text" placeholder="Phone" className="w-full p-2 border rounded" value={pPhone} onChange={(e: any) => setPPhone(e.target.value)} />
                 <div className="border p-2 rounded"> <p className="text-xs font-bold mb-2">Select Dates:</p><CustomCalendar schedule={pSchedule} setSchedule={setPSchedule} targetDays={100} /> </div>
                 <textarea placeholder="Notes (e.g. Cash Paid)" className="w-full p-2 border rounded" value={pNotes} onChange={(e: any) => setPNotes(e.target.value)} />
                 <button onClick={handleAddPrivate} className="w-full bg-red-900 text-white p-3 rounded-lg font-bold">Save to Active</button>
             </div>
          )}
           {adminTab === 'settings' && (
            <div className="max-w-md space-y-6">
              <h2 className="text-xl font-bold">Admin Settings</h2>
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4"><h3 className="font-bold text-gray-700 mb-2">Change Admin PIN</h3><input type="text" className="w-full p-2 border rounded" value={securitySettings.pin} onChange={(e: any) => updateSecurity('pin', e.target.value)} /></div>
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200"><h3 className="font-bold text-gray-700 mb-2">Update Rates</h3>{Object.keys(tempRates).map(key => (<div key={key} className="mb-2"><label className="text-xs font-bold text-gray-500 block">{key}</label><input type="number" className="w-full p-2 border rounded" value={tempRates[key]} onChange={(e: any) => setTempRates({...tempRates, [key]: Number(e.target.value)})} /></div>))}<button onClick={() => { setRates(tempRates); alert("Rates Saved!"); }} className="w-full py-2 bg-red-900 text-white rounded text-sm font-bold mt-2">Update Prices</button></div>
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
  const [view, setView] = useState('home'); 
  const [lang, setLang] = useStickyState('en', 'ncdc_lang'); 
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPin, setNewPin] = useState('');
  const [recoveryStep, setRecoveryStep] = useState('question'); 
  const [securitySettings, setSecuritySettings] = useStickyState({ pin: '1234', question: 'What is the name of your first pet?', answer: 'lucky' }, 'ncdc_security_v3');
  const [rates, setRates] = useStickyState({ '1 Day': 1500, '15 Days': 15000, '15 Days (30m)': 10000, '30 Days': 25000, '30 Days (30m)': 18000 }, 'ncdc_rates_v2');

  const handleLogin = (e: any) => { e.preventDefault(); if (loginInput === securitySettings.pin) { setView('admin'); setLoginError(''); setLoginInput(''); } else { setLoginError('Incorrect PIN'); } };
  
  const handleRecover = (e: any) => {
    e.preventDefault();
    if (recoveryStep === 'question') {
        if (recoveryAnswer.toLowerCase().trim() === securitySettings.answer.toLowerCase().trim()) { setRecoveryStep('reset'); setLoginError(''); } else { setLoginError('Incorrect Answer'); }
    } else {
        if (newPin.length < 4) { setLoginError('PIN must be at least 4 digits'); return; }
        setSecuritySettings((prev: any) => ({ ...prev, pin: newPin }));
        alert("PIN Reset Successful!"); setView('admin'); setRecoveryStep('question'); setRecoveryAnswer(''); setNewPin(''); setLoginError('');
    }
  };

  const updateSecurity = (field: string, value: string) => { setSecuritySettings((prev: any) => ({ ...prev, [field]: value })); };
  const handleAddBooking = async (data: any) => { if(db) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), { ...data, createdAt: serverTimestamp() }); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans select-none flex flex-col" style={{ WebkitUserSelect: 'none' }}>
      <style>{`img { pointer-events: none; } .animate-fade-in { animation: fadeIn 0.4s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <Navbar setView={setView} activeView={view} lang={lang} setLang={setLang} />
      <main className="flex-grow">
        {view === 'home' && <HomePage setView={setView} lang={lang} />}
        {view === 'about' && <AboutPage lang={lang} />}
        {view === 'education' && <EducationPage lang={lang} setView={setView} />}
        {view === 'likhit' && <QuizView lang={lang} setView={setView} />}
        {view === 'contact' && <ContactPage lang={lang} />}
        {view === 'booking' && <div className="max-w-4xl mx-auto p-4 pt-8"><BookingView onAddBooking={handleAddBooking} rates={rates} lang={lang} /></div>}
        
        {view === 'login' && (
          <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl animate-fade-in border-t-4 border-red-800">
              <div className="text-center mb-6"><h2 className="font-bold text-xl text-gray-800">Admin Login</h2></div>
              <form onSubmit={handleLogin}>
                <input type="password" value={loginInput} onChange={(e: any) => setLoginInput(e.target.value)} placeholder="Enter PIN" className="w-full p-3 border rounded-lg text-center tracking-widest text-lg outline-none focus:border-red-500 mb-4" autoFocus />
                {loginError && <p className="text-red-500 text-sm text-center mb-4">{loginError}</p>}
                <button type="submit" className="w-full p-3 bg-red-900 text-white rounded-lg font-bold hover:bg-red-800">Login</button>
              </form>
              <button onClick={() => { setView('recovery'); setLoginError(''); }} className="w-full mt-4 text-xs text-gray-400 hover:text-red-500 text-center underline">Forgot PIN?</button>
            </div>
          </div>
        )}

        {view === 'recovery' && (
           <div className="min-h-[60vh] flex items-center justify-center p-4">
             <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl animate-fade-in">
                <h2 className="font-bold text-xl mb-4 text-center">{recoveryStep === 'question' ? 'Reset PIN' : 'Set New PIN'}</h2>
                <form onSubmit={handleRecover}>
                  {recoveryStep === 'question' ? (
                    <>
                        <p className="text-sm text-gray-500 mb-2">Security Question:</p>
                        <p className="font-bold text-gray-800 mb-4 p-3 bg-gray-50 rounded border">{securitySettings.question}</p>
                        <input type="text" placeholder="Your Answer" value={recoveryAnswer} onChange={(e: any) => setRecoveryAnswer(e.target.value)} className="w-full p-3 border rounded mb-4" />
                    </>
                  ) : (
                    <input type="text" placeholder="New PIN" value={newPin} onChange={(e: any) => setNewPin(e.target.value)} className="w-full p-3 border rounded mb-4 text-center tracking-widest text-xl" autoFocus />
                  )}
                  {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
                  <button type="submit" className="w-full bg-red-900 text-white p-3 rounded font-bold">{recoveryStep === 'question' ? 'Verify Answer' : 'Save New PIN'}</button>
                  <button type="button" onClick={() => { setView('login'); setRecoveryStep('question'); }} className="w-full mt-2 text-sm text-gray-400 text-center block">Back to Login</button>
                </form>
             </div>
           </div>
        )}

        {view === 'admin' && <div className="max-w-6xl mx-auto p-4"><AdminPanel securitySettings={securitySettings} updateSecurity={updateSecurity} rates={rates} setRates={setRates} onExit={() => setView('home')} /></div>}
      </main>
      <footer className="bg-red-950 text-red-200 py-8 text-center text-sm">
        <p className="mb-2 text-white font-bold">New Chitwan Driving Training Centre</p>
        <p>Bharatpur Height, Chitwan (Same building as Eye Express)</p>
        <p className="text-xs mt-1">Email: cdriving47@gmail.com</p>
        <p className="mt-4 opacity-50">{t[lang as 'en'|'np'].footer_rights} • PAN: 301569099</p>
<p className="text-xs mt-1">DESIGNED BY SANGAM FOR NEW CHITWAN</p>
      </footer>
    </div>
  );
}

