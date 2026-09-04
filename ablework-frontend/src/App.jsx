import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import RegisterSelect from './pages/RegisterSelect';
import ApplicantRegister from './pages/ApplicantRegister';
import EmployerRegister from './pages/EmployerRegister';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import ApplicantDashboard from './pages/ApplicantDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AbbyChatbot from './components/AbbyChatbot';
import AdminDashboard from './pages/AdminDashboard';

// Navigation Pages & Home (Added Home import to fix the root route)
import {
  Home,
  About,
  Policy,
  Terms,
  Contact
} from './pages/NavigationPages';
import { AccessibilityProvider } from './context/AccessibilityContext';

// --- NEW: Wrapper Component to hide overlays on Admin routes ---
function GlobalOverlays() {
  const location = useLocation();
  
  // If the current path includes "/admin", do not render these components
  if (location.pathname.includes('/admin')) {
    return null;
  }

  return (
    <>
      <AccessibilityToolbar />
      <AbbyChatbot />
    </>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <Router>
        <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300 relative">
          
          {/* Replaced individual components with the new conditionally rendered wrapper */}
          <GlobalOverlays />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-select" element={<RegisterSelect />} />
            <Route path="/register/applicant" element={<ApplicantRegister />} />
            <Route path="/register/employer" element={<EmployerRegister />} />
            <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>

        </div>
      </Router>
    </AccessibilityProvider>
  );
}

export default App;