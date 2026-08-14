import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import RegisterSelect from './pages/RegisterSelect';
import ApplicantRegister from './pages/ApplicantRegister';
import EmployerRegister from './pages/EmployerRegister';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import AbbyChatbot from './components/AbbyChatbot';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300 relative">
        
        <AccessibilityToolbar />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register-select" element={<RegisterSelect />} />
          <Route path="/register/applicant" element={<ApplicantRegister />} />
          <Route path="/register/employer" element={<EmployerRegister />} />
        </Routes>

        <AbbyChatbot />

      </div>
    </Router>
  );
}

export default App;