import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import RegisterSelect from './pages/RegisterSelect';
import ApplicantRegister from './pages/ApplicantRegister';
import EmployerRegister from './pages/EmployerRegister';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import ApplicantDashboard from './pages/ApplicantDashboard';
import AbbyChatbot from './components/AbbyChatbot';
import GlobalAccessibilityBar from './components/AccessibilityToolbar';

// NEW: Navigation Pages
import {
  About,
  Policy,
  Careers,
  Terms,
  Contact
} from './pages/NavigationPages';
import { AccessibilityProvider } from './context/AccessibilityContext';


function App() {
  return (
    <AccessibilityProvider>  
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
          <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />


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
     </AccessibilityProvider>
  );
}

export default App;