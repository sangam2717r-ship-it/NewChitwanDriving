import React, { useState } from "react";
import {
  Shield,
  Lock,
  Calendar,
  Clock,
  Car,
  MapPin,
  Phone,
  MessageCircle,
  Menu,
  X,
  ChevronRight,
  User,
  FileText,
  Droplet,
  Users,
} from "lucide-react";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Form State including the new fields from your screenshot
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "", // New Field
    citizenshipNo: "", // New Field
    bloodGroup: "A+", // New Field
    fmhName: "", // New Field (Father/Mother/Husband)
    course: "Bike Trial",
    date: "",
    time: "",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create WhatsApp message with all details
    const message =
      `*New Booking Request*%0A%0A` +
      `*Name:* ${formData.fullName}%0A` +
      `*Phone:* ${formData.phone}%0A` +
      `*Address:* ${formData.address}%0A` +
      `*Citizenship No:* ${formData.citizenshipNo}%0A` +
      `*Blood Group:* ${formData.bloodGroup}%0A` +
      `*Guardian (F/M/H):* ${formData.fmhName}%0A` +
      `*Course:* ${formData.course}%0A` +
      `*Date:* ${formData.date}%0A` +
      `*Time:* ${formData.time}`;

    // Replace with your actual WhatsApp number
    const whatsappNumber = "9779855056777";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navigation */}
      <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8" />
              <span className="font-bold text-lg md:text-xl tracking-wide">
                New Chitwan Driving
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#home"
                  className="hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition"
                >
                  Home
                </a>
                <a
                  href="#courses"
                  className="hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition"
                >
                  Courses
                </a>
                <a
                  href="#book"
                  className="bg-white text-blue-700 hover:bg-gray-100 px-4 py-2 rounded-md font-bold transition shadow-sm"
                >
                  Book Now
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md hover:bg-blue-600 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-blue-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#home"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
                onClick={toggleMenu}
              >
                Home
              </a>
              <a
                href="#courses"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
                onClick={toggleMenu}
              >
                Courses
              </a>
              <a
                href="#book"
                className="block px-3 py-2 rounded-md text-base font-medium bg-blue-900 hover:bg-blue-600"
                onClick={toggleMenu}
              >
                Book Now
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div
        id="home"
        className="bg-blue-600 text-white py-16 md:py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Learn to Drive with Confidence
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Professional instructors, modern vehicles, and a track record of
            success in Chitwan.
          </p>
          <a
            href="#book"
            className="inline-flex items-center bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
          >
            Start Learning Today <ChevronRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Info & Features */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="text-blue-600" /> Why Choose Us?
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Safe & Secure</h3>
                  <p className="text-gray-600 text-sm">
                    Dual-control vehicles and fully insured training sessions.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Flexible Timing</h3>
                  <p className="text-gray-600 text-sm">
                    Morning, day, and evening slots available to suit your
                    schedule.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-1">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Expert Instructors</h3>
                  <p className="text-gray-600 text-sm">
                    Patient, certified instructors with years of experience.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div
            id="courses"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Our Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                <div className="font-bold text-lg mb-1">Bike Trial</div>
                <div className="text-blue-600 font-bold">
                  Rs. 500{" "}
                  <span className="text-gray-400 text-sm font-normal">
                    / session
                  </span>
                </div>
              </div>
              <div className="border rounded-xl p-4 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                <div className="font-bold text-lg mb-1">Scooter Trial</div>
                <div className="text-blue-600 font-bold">
                  Rs. 500{" "}
                  <span className="text-gray-400 text-sm font-normal">
                    / session
                  </span>
                </div>
              </div>
              <div className="border rounded-xl p-4 hover:border-blue-500 transition cursor-pointer bg-gray-50">
                <div className="font-bold text-lg mb-1">Car Training</div>
                <div className="text-blue-600 font-bold">
                  Contact for pricing
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div
          id="book"
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" /> Book Your Slot
            </h2>
            <p className="text-blue-100 mt-1">
              Fill in the details below to reserve your time.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Client Full Name"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="98xxxxxxxx"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Address (New) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Bharatpur-10, Chitwan"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Citizenship No (New) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Citizenship Number
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="citizenshipNo"
                  placeholder="Citizenship No."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={formData.citizenshipNo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Blood Group (New) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <div className="relative">
                <Droplet className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  name="bloodGroup"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* F/M/H Name (New) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                F/M/H Name
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="fmhName"
                  placeholder="Father/Mother/Husband Name"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={formData.fmhName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Course
              </label>
              <select
                name="course"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                value={formData.course}
                onChange={handleInputChange}
              >
                <option value="Bike Trial">Bike Trial</option>
                <option value="Scooter Trial">Scooter Trial</option>
                <option value="Car Training">Car Training</option>
                <option value="Learner's License">
                  Learner's License Form
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" /> Confirm Booking via WhatsApp
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              You will be redirected to WhatsApp to send these details.
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-white">
            <Car className="h-6 w-6" />
            <span className="font-bold text-xl">New Chitwan Driving</span>
          </div>
          <p className="mb-4 text-sm">
            Providing quality driving education since 2010.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="hover:text-white transition">
              <MessageCircle className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-white transition">
              <MapPin className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-white transition">
              <Phone className="h-6 w-6" />
            </a>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} New Chitwan Driving Training Centre.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
