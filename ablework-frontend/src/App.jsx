import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import RegisterSelect from './pages/RegisterSelect';
import ApplicantRegister from './pages/ApplicantRegister';
import EmployerRegister from './pages/EmployerRegister';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import AbbyChatbot from './components/AbbyChatbot';

// NEW: Navigation Pages
import {
  About,
  Policy,
  Careers,
  Terms,
  Contact
} from './pages/NavigationPages';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300 relative">
        
        <AccessibilityToolbar />

        <Routes>

          {/* EXISTING ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-select" element={<RegisterSelect />} />
          <Route path="/register/applicant" element={<ApplicantRegister />} />
          <Route path="/register/employer" element={<EmployerRegister />} />


          {/* NEW NAVIGATION ROUTES */}
          <Route path="/about" element={<About />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />

        </Routes>

        <AbbyChatbot />

      </div>
    </Router>
  );
}

export default App;