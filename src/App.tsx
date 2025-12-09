import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Settings,
  ChevronRight,
  BarChart2,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";

const App = () => {
  const [lang, setLang] = useState("np"); // Default to Nepali
  const [activeTab, setActiveTab] = useState("dashboard");

  // Corrected translation object without duplicates
  const translations = {
    en: {
      Dashboard: "Dashboard",
      Sessions: "Sessions",
      Students: "Students",
      Settings: "Settings",
      "Total Days": "Total Days",
      "First Session": "First Session",
      "Last Session": "Last Session",
      "Attendance Rate": "Attendance Rate",
      "Upcoming Classes": "Upcoming Classes",
      "Recent Activity": "Recent Activity",
      "View All": "View All",
      "Active Students": "Active Students",
      "Average Score": "Average Score",
      Language: "Language",
      "Switch to Nepali": "Switch to Nepali",
      "Switch to English": "Switch to English",
      "Welcome Back": "Welcome Back, Instructor",
      "Class Schedule": "Class Schedule",
      Mathematics: "Mathematics",
      Science: "Science",
      English: "English",
      Nepali: "Nepali",
      "Social Studies": "Social Studies",
      Present: "Present",
      Absent: "Absent",
      Late: "Late",
    },
    np: {
      Dashboard: "ड्यासबोर्ड",
      Sessions: "कक्षाहरू",
      Students: "विद्यार्थीहरू",
      Settings: "सेटिङहरू",
      "Total Days": "जम्मा दिन",
      "First Session": "पहिलो कक्षा",
      "Last Session": "अन्तिम कक्षा",
      "Attendance Rate": "उपस्थिति दर",
      "Upcoming Classes": "आगामी कक्षाहरू",
      "Recent Activity": "हालको गतिविधि",
      "View All": "सबै हेर्नुहोस्",
      "Active Students": "सक्रिय विद्यार्थीहरू",
      "Average Score": "औसत अंक",
      Language: "भाषा",
      "Switch to Nepali": "नेपालीमा परिवर्तन गर्नुहोस्",
      "Switch to English": "अंग्रेजीमा परिवर्तन गर्नुहोस्",
      "Welcome Back": "स्वागत छ, शिक्षक",
      "Class Schedule": "कक्षा तालिका",
      Mathematics: "गणित",
      Science: "विज्ञान",
      English: "अंग्रेजी",
      Nepali: "नेपाली",
      "Social Studies": "सामाजिक शिक्षा",
      Present: "उपस्थित",
      Absent: "अनुपस्थित",
      Late: "ढिलो",
    },
  };

  const t = (key) => translations[lang][key] || key;

  const stats = [
    { title: "Total Days", value: "142", icon: Calendar, color: "bg-blue-500" },
    {
      title: "Active Students",
      value: "45",
      icon: User,
      color: "bg-purple-500",
    },
    {
      title: "Attendance Rate",
      value: "92%",
      icon: BarChart2,
      color: "bg-green-500",
    },
    {
      title: "Average Score",
      value: "78.5",
      icon: BookOpen,
      color: "bg-orange-500",
    },
  ];

  const upcomingClasses = [
    { subject: "Mathematics", time: "10:00 AM", level: "Grade 10", icon: "📐" },
    { subject: "Science", time: "11:30 AM", level: "Grade 9", icon: "🔬" },
    { subject: "Nepali", time: "01:00 PM", level: "Grade 8", icon: "🇳🇵" },
  ];

  const recentActivity = [
    {
      action: "Attendance Marked",
      subject: "Mathematics",
      time: "2 hours ago",
      status: "success",
    },
    {
      action: "Assignment Uploaded",
      subject: "Science",
      time: "4 hours ago",
      status: "info",
    },
    {
      action: "Student Registered",
      subject: "Ramesh Adhikari",
      time: "1 day ago",
      status: "warning",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="text-xl font-bold text-gray-800">Sikshya App</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {["Dashboard", "Sessions", "Students", "Settings"].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item.toLowerCase())}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                activeTab === item.toLowerCase()
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item === "Dashboard" && <BarChart2 size={20} />}
              {item === "Sessions" && <Clock size={20} />}
              {item === "Students" && <User size={20} />}
              {item === "Settings" && <Settings size={20} />}
              <span className="font-medium">{t(item)}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              RD
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Ram Dahal</p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("Welcome Back")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString(
                lang === "np" ? "ne-NP" : "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setLang(lang === "en" ? "np" : "en")}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">{lang === "en" ? "🇳🇵" : "🇺🇸"}</span>
              {lang === "en" ? "Nepali" : "English"}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-opacity-100`}
                  >
                    <stat.icon
                      className={`w-6 h-6 ${stat.color.replace(
                        "bg-",
                        "text-"
                      )}`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                    +2.5%
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">
                  {t(stat.title)}
                </h3>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Classes */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">
                  {t("Upcoming Classes")}
                </h2>
                <button className="text-indigo-600 text-sm font-medium hover:underline">
                  {t("View All")}
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingClasses.map((cls, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors group cursor-pointer border border-transparent hover:border-indigo-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                          {cls.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 group-hover:text-indigo-700">
                            {t(cls.subject)}
                          </h4>
                          <p className="text-sm text-gray-500">{cls.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-indigo-600 font-semibold bg-indigo-100 px-3 py-1 rounded-full text-xs">
                          <Clock size={12} />
                          {cls.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Session Info / Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">
                {t("Recent Activity")}
              </h2>
              <div className="space-y-6">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== recentActivity.length - 1 && (
                      <div className="absolute left-2.5 top-8 bottom-[-1.5rem] w-0.5 bg-gray-100"></div>
                    )}
                    <div
                      className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 border-2 ${
                        activity.status === "success"
                          ? "border-green-500 bg-green-50"
                          : activity.status === "info"
                          ? "border-blue-500 bg-blue-50"
                          : "border-orange-500 bg-orange-50"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.subject} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    {t("First Session")}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    08:00 AM
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {t("Last Session")}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    04:00 PM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
