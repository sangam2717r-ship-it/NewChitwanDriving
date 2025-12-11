import React, { useState, useEffect } from "react";
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
  Settings,
  LogOut,
  Trash2,
  CheckCircle,
  Plus,
  DollarSign,
} from "lucide-react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

// --- Types ---
interface Booking {
  id?: string;
  fullName: string;
  phone: string;
  address: string;
  citizenshipNo: string;
  bloodGroup: string;
  fmhName: string;
  category: "Bike" | "Scooter" | "Car";
  duration: "30 Mins" | "1 Hour" | "15 Days" | "30 Days";
  price: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Completed";
  createdAt: any;
}

// Complex Settings Structure for all price variations
interface PriceSettings {
  bike30min: string;
  bike1hr: string;
  bike15days: string;
  bike30days: string;
  scooter30min: string;
  scooter1hr: string;
  scooter15days: string;
  scooter30days: string;
  car30min: string;
  car1hr: string;
  car15days: string;
  car30days: string;
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState<"home" | "admin" | "login">("home");
  const [user, setUser] = useState<any>(null);

  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [prices, setPrices] = useState<PriceSettings>({
    bike30min: "500",
    bike1hr: "900",
    bike15days: "5000",
    bike30days: "9000",
    scooter30min: "500",
    scooter1hr: "900",
    scooter15days: "5000",
    scooter30days: "9000",
    car30min: "1000",
    car1hr: "1800",
    car15days: "15000",
    car30days: "25000",
  });

  // Admin Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    citizenshipNo: "",
    bloodGroup: "A+",
    fmhName: "",
    category: "Bike" as "Bike" | "Scooter" | "Car",
    duration: "30 Mins" as "30 Mins" | "1 Hour" | "15 Days" | "30 Days",
    date: "",
    time: "",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // --- Effects ---

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && view === "login") setView("admin");
    });
    return () => unsubscribe();
  }, [view]);

  useEffect(() => {
    // 1. Fetch Prices
    const settingsUnsub = onSnapshot(
      doc(db, "settings", "prices"),
      (docSnap) => {
        if (docSnap.exists()) {
          setPrices(docSnap.data() as PriceSettings);
        }
      }
    );

    // 2. Fetch Bookings (Admin only)
    let bookingsUnsub = () => {};
    if (user) {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      bookingsUnsub = onSnapshot(q, (snapshot) => {
        const books = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Booking)
        );
        setBookings(books);
      });
    }

    return () => {
      settingsUnsub();
      bookingsUnsub();
    };
  }, [user]);

  // --- Helpers ---

  // Calculate current price based on selection
  const getCurrentPrice = (cat: string, dur: string) => {
    const key = `${cat.toLowerCase()}${dur
      .replace(" ", "")
      .toLowerCase()}` as keyof PriceSettings;
    return prices[key] || "0";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setView("admin");
    } catch (err: any) {
      setError(err.message); // Show exact firebase error
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView("home");
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const price = getCurrentPrice(formData.category, formData.duration);

      // 1. Save to Firebase
      await addDoc(collection(db, "bookings"), {
        ...formData,
        price,
        status: "Pending",
        createdAt: new Date(),
      });

      // 2. WhatsApp Notification
      const message =
        `*New Booking Request*%0A%0A` +
        `*Name:* ${formData.fullName}%0A` +
        `*Phone:* ${formData.phone}%0A` +
        `*Course:* ${formData.category} (${formData.duration})%0A` +
        `*Price:* Rs. ${price}%0A` +
        `*Date:* ${formData.date}`;

      window.open(`https://wa.me/9779855056777?text=${message}`, "_blank");

      alert("Booking Request Sent Successfully!");
      setFormData({ ...formData, fullName: "", phone: "" }); // Clear main fields
    } catch (err) {
      console.error(err);
      alert("Error submitting booking. Please try again.");
    }
  };

  const handleUpdatePrices = async () => {
    // Save to "settings/prices" document
    await updateDoc(doc(db, "settings", "prices"), { ...prices });
    alert("Prices updated successfully!");
  };

  const updateBookingStatus = async (
    id: string,
    newStatus: "Confirmed" | "Completed"
  ) => {
    await updateDoc(doc(db, "bookings", id), { status: newStatus });
  };

  const deleteBooking = async (id: string) => {
    if (window.confirm("Delete this booking?")) {
      await deleteDoc(doc(db, "bookings", id));
    }
  };

  // --- Views ---

  if (view === "login") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
            Admin Login
          </h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm break-words">
              {error}
            </div>
          )}
          {resetSent && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              Password reset email sent!
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={handleForgotPassword}
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
            <span className="mx-2">|</span>
            <button
              onClick={() => setView("home")}
              className="text-gray-500 hover:underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "admin" && user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded transition"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Price Settings */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" /> Update Prices (Rs.)
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {/* Bike Section */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-2">Bike</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">30 Mins</label>
                        <input
                          value={prices.bike30min}
                          onChange={(e) =>
                            setPrices({ ...prices, bike30min: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">1 Hour</label>
                        <input
                          value={prices.bike1hr}
                          onChange={(e) =>
                            setPrices({ ...prices, bike1hr: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">15 Days</label>
                        <input
                          value={prices.bike15days}
                          onChange={(e) =>
                            setPrices({ ...prices, bike15days: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">30 Days</label>
                        <input
                          value={prices.bike30days}
                          onChange={(e) =>
                            setPrices({ ...prices, bike30days: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scooter Section */}
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h3 className="font-bold text-purple-800 mb-2">Scooter</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">30 Mins</label>
                        <input
                          value={prices.scooter30min}
                          onChange={(e) =>
                            setPrices({
                              ...prices,
                              scooter30min: e.target.value,
                            })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">1 Hour</label>
                        <input
                          value={prices.scooter1hr}
                          onChange={(e) =>
                            setPrices({ ...prices, scooter1hr: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">15 Days</label>
                        <input
                          value={prices.scooter15days}
                          onChange={(e) =>
                            setPrices({
                              ...prices,
                              scooter15days: e.target.value,
                            })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">30 Days</label>
                        <input
                          value={prices.scooter30days}
                          onChange={(e) =>
                            setPrices({
                              ...prices,
                              scooter30days: e.target.value,
                            })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Car Section */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-2">Car</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">30 Mins</label>
                        <input
                          value={prices.car30min}
                          onChange={(e) =>
                            setPrices({ ...prices, car30min: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">1 Hour</label>
                        <input
                          value={prices.car1hr}
                          onChange={(e) =>
                            setPrices({ ...prices, car1hr: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">15 Days</label>
                        <input
                          value={prices.car15days}
                          onChange={(e) =>
                            setPrices({ ...prices, car15days: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs">30 Days</label>
                        <input
                          value={prices.car30days}
                          onChange={(e) =>
                            setPrices({ ...prices, car30days: e.target.value })
                          }
                          className="w-full border p-1 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUpdatePrices}
                    className="w-full bg-gray-800 text-white py-2 rounded text-sm hover:bg-gray-900"
                  >
                    Save All Prices
                  </button>
                </div>
              </div>
            </div>

            {/* Booking List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5" /> Recent Bookings
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4">Name / Phone</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bookings.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold">{book.fullName}</div>
                          <div className="text-gray-500">{book.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-blue-600">
                            {book.category}
                          </div>
                          <div>{book.duration}</div>
                        </td>
                        <td className="p-4 font-bold">Rs. {book.price}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              book.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : book.status === "Confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {book.status}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() =>
                              updateBookingStatus(book.id!, "Completed")
                            }
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteBooking(book.id!)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main View ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8" />
              <span className="font-bold text-lg md:text-xl tracking-wide">
                New Chitwan Driving
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#home"
                  className="hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition"
                >
                  Home
                </a>
                <button
                  onClick={() => setView("login")}
                  className="hover:bg-blue-600 px-3 py-2 rounded-md font-medium transition flex items-center gap-1"
                >
                  <Lock className="h-4 w-4" /> Admin
                </button>
                <a
                  href="#book"
                  className="bg-white text-blue-700 hover:bg-gray-100 px-4 py-2 rounded-md font-bold transition shadow-sm"
                >
                  Book Now
                </a>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md hover:bg-blue-600"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-blue-800 p-2">
            <button
              onClick={() => setView("login")}
              className="block w-full text-left px-3 py-2 hover:bg-blue-600 rounded"
            >
              Admin Login
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <div
        id="home"
        className="bg-blue-600 text-white py-16 md:py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Master the Road
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Professional Driving Training in Chitwan
          </p>
          <a
            href="#book"
            className="inline-flex items-center bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 shadow-lg transition"
          >
            Book Your Spot <ChevronRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="text-blue-600" /> Our Services
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Bike & Scooter</h3>
                  <p className="text-gray-600 text-sm">
                    Trials (30m/1h) or Full Training (15/30 Days)
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                  <Car className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Car Training</h3>
                  <p className="text-gray-600 text-sm">
                    Comprehensive packages for new drivers.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Dynamic Booking Form */}
        <div
          id="book"
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" /> Book Now
            </h2>
          </div>

          <form onSubmit={handleSubmitBooking} className="p-6 md:p-8 space-y-5">
            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="w-full px-3 py-2 rounded-lg border"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 py-2 rounded-lg border"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-3 py-2 rounded-lg border"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Citizenship No
                </label>
                <input
                  type="text"
                  name="citizenshipNo"
                  className="w-full px-3 py-2 rounded-lg border"
                  value={formData.citizenshipNo}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  className="w-full px-3 py-2 rounded-lg border bg-white"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  F/M/H Name
                </label>
                <input
                  type="text"
                  name="fmhName"
                  className="w-full px-3 py-2 rounded-lg border"
                  value={formData.fmhName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold text-gray-700 mb-3">Course Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Category
                  </label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 rounded-lg border bg-white font-bold text-blue-800"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Car">Car</option>
                  </select>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration / Package
                  </label>
                  <select
                    name="duration"
                    className="w-full px-3 py-2 rounded-lg border bg-white"
                    value={formData.duration}
                    onChange={handleInputChange}
                  >
                    <option value="30 Mins">Trial - 30 Mins</option>
                    <option value="1 Hour">Trial - 1 Hour</option>
                    <option value="15 Days">Training - 15 Days</option>
                    <option value="30 Days">Training - 30 Days</option>
                  </select>
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
                <span className="text-gray-600">Estimated Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs. {getCurrentPrice(formData.category, formData.duration)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full px-3 py-2 rounded-lg border"
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
                  className="w-full px-3 py-2 rounded-lg border"
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" /> Confirm & Send to WhatsApp
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
