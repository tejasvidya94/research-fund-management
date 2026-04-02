import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { getRoleName } from "../../App";

const uniLogo = "/University_logo.png";

const departments = [
  "Department of Architecture",
  "Department of Atmospheric Science",
  "Department of Biochemistry",
  "Department of Biomedical Engineering",
  "Department of Biotechnology",
  "Department of Chemistry",
  "Department of Commerce",
  "Department of Computer Science",
  "Department of Computer Science & Engineering",
  "Department of Culture & Media Studies",
  "Department of Data Science & Analytics",
  "Department of Economics",
  "Department of Education",
  "Department of English",
  "Department of Environmental Science",
  "Department of Health Sciences",
  "Department of Hindi",
  "Department of Hotel and Tourism Management",
  "Department of Linguistics",
  "Department of Management",
  "Department of Mathematics",
  "Department of Microbiology",
  "Department of Pharmacy",
  "Department of Physics",
  "Department of Public Policy, Law and Governance",
  "Department of Social work",
  "Department of Society - Technology Interface",
  "Department of Sports Bio-Sciences",
  "Department of Sports Biomechanics",
  "Department of Sports Psychology",
  "Department of Statistics",
  "Department of Vocational Studies and Skill Development",
  "Department of Yoga",
  "Department of Electronics and Communication Engineering(ECE)"
];

export default function Landing({ onLogin }) {
  const [isSignup, setIsSignup] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:via-black dark:to-gray-900 flex flex-col">
      {/* HEADER */}
      <header className="w-full bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={uniLogo} alt="University Logo" className="w-16 h-16" />
            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">CURAJ Research</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <nav className="relative flex gap-8 text-blue-700 dark:text-blue-400 font-semibold">
            {["home", "about", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className="relative py-2"
              >
                {section === "contact" ? "Contact Us" : section.charAt(0).toUpperCase() + section.slice(1)}

                {activeSection === section && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 -bottom-0 h-[5px] bg-blue-700 dark:bg-blue-400 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col justify-center items-center px-6 py-24 mt-12">
        <AnimatePresence mode="wait">
          {activeSection === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center"
            >
              {/* LEFT SIDE */}
              <div className="text-center md:text-left space-y-6">
                <h1 className="text-5xl font-bold text-blue-700 dark:text-blue-400">
                  University Research Portal
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  Empower professors, HODs, Deans, R&D teams, Finance Officers, and Registrars to collaborate and manage
                  university research efficiently in one unified platform.
                </p>
              </div>

              {/* RIGHT SIDE */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                {/* TAB HEADER */}
                <div className="relative flex bg-blue-100 dark:bg-gray-700 rounded-full p-1 mb-8">
                  <motion.div
                    layout
                    className={`absolute top-1 bottom-1 ${
                      isSignup ? "left-1 right-1/2" : "left-1/2 right-1"
                    } bg-blue-600 dark:bg-blue-500 rounded-full`}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  ></motion.div>

                  <button
                    onClick={() => setIsSignup(true)}
                    className={`relative z-10 w-1/2 py-2 font-semibold transition ${
                      isSignup ? "text-white" : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setIsSignup(false)}
                    className={`relative z-10 w-1/2 py-2 font-semibold transition ${
                      !isSignup ? "text-white" : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                {/* FORM AREA */}
                <div className="min-h-[360px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isSignup ? (
                      <motion.div
                        key="signup"
                        initial={{ x: 80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -80, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                      >
                        <SignupForm onLogin={onLogin} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signin"
                        initial={{ x: -80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 80, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                      >
                        <SigninForm onLogin={onLogin} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl text-center space-y-6"
            >
              <h2 className="text-4xl font-bold text-blue-700 dark:text-blue-400">About CURAJ Research</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                CURAJ Research is an academic collaboration platform designed to
                streamline university-level research workflows. It empowers
                professors, HODs, deans, R&D teams, finance officers, registrars, and departments to track progress,
                share resources, and publish research outcomes effectively.
              </p>
            </motion.div>
          )}

          {activeSection === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="max-w-md text-center space-y-6"
            >
              <h2 className="text-4xl font-bold text-blue-700 dark:text-blue-400">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Have questions or suggestions? We'd love to hear from you.
              </p>
              <form className="flex flex-col gap-4">
                <input type="text" placeholder="Your Name" className="input" />
                <input type="email" placeholder="Your Email" className="input" />
                <textarea placeholder="Your Message" className="input h-32"></textarea>
                <button className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  Send Message
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SignupForm({ onLogin }) {
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const payload = {
      name:        formData.get('name'),
      email:       formData.get('email'),
      password:    formData.get('password'),
      designation: designation,
      department:  formData.get('department') || 'N/A'
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('token', data.token);     // ← sessionStorage
        onLogin({ ...data.user, role: getRoleName(data.user.designation) });
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 text-center mb-2">
        Create an Account
      </h2>

      <select
        className="input"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
        required
      >
        <option value="">Select Designation</option>
        <option value="professor">Professor</option>
        <option value="hod">HOD</option>
        <option value="dean">Dean</option>
        <option value="r&d_helper">R&D Helper</option>
        <option value="r&d_main">R&D Main</option>
        <option value="academic_integrity_officer">Academic Integrity Officer (AIQ)</option>
        <option value="finance_officer_helper">Finance Officer Helper</option>
        <option value="finance_officer_main">Finance Officer Main</option>
        <option value="registrar">Registrar</option>
        <option value="vc_office">VC Office</option>
        <option value="vice_chancellor">Vice Chancellor</option>
        <option value="fund">Fund Department</option>
      </select>

      <input type="text" name="name" placeholder="Full Name" className="input" required />
      <input type="email" name="email" placeholder="Email" className="input" required />

      {!["vice_chancellor","vc_office","fund","rnd","r&d_helper","rnd_helper","r&d_main","rnd_main","academic_integrity_officer","aio","finance_officer_helper","finance_officer_main","registrar"].includes(designation) && (
        <select name="department" className="input" required>
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      )}

      <input type="password" name="password" placeholder="Password" className="input" required />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Signing Up…' : 'Sign Up'}
      </button>
    </form>
  );
}

function SigninForm({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    formData.get('email'),
          password: formData.get('password')
        })
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('token', data.token);     // ← sessionStorage
        onLogin({ ...data.user, role: getRoleName(data.user.designation) });
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 text-center mb-2">
        Welcome Back
      </h2>
      <input type="email" name="email" placeholder="Email" className="input" required />
      <input type="password" name="password" placeholder="Password" className="input" required />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? 'Signing In…' : 'Sign In'}
      </button>
    </form>
  );
}