import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AccessibilityContext } from '../context/AccessibilityContext';

export default function Login() {
  const { mode } = useContext(AccessibilityContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const tapTargetSize = mode === 'Assist' ? 'py-4 px-6 text-xl' : 'py-2 px-4';
  const inputSize = mode === 'Assist' ? 'p-4 text-xl' : 'p-2';

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] transition-colors duration-300 p-4">
      
      <div className="w-full max-w-md p-8 bg-[var(--bg-card)] rounded-lg shadow-xl border-t-8 border-[var(--border-accent)] transition-colors duration-300">
        
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6 text-center" tabIndex="0">
          Sign In to AbleWork
        </h1>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6" aria-label="Sign in form">
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[var(--text-secondary)]" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputSize} border-2 border-gray-300 rounded bg-white text-black focus:border-[var(--border-accent)]`}
              placeholder="Enter your email"
              aria-label="Email Address Input Field"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[var(--text-secondary)]" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputSize} border-2 border-gray-300 rounded bg-white text-black focus:border-[var(--border-accent)]`}
              placeholder="Enter your password"
              aria-label="Password Input Field"
              required
            />
          </div>

          <button
            type="submit"
            className={`mt-2 ${tapTargetSize} bg-[var(--border-accent)] hover:opacity-80 rounded font-bold text-white shadow-md w-full cursor-pointer`}
            aria-label="Submit login credentials"
          >
            Log In
          </button>
        </form>

        {/* Link to Registration Selection */}
        <p className="mt-6 text-center text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <Link to="/register-select" className="font-bold text-[var(--border-accent)] hover:underline" aria-label="Navigate to register account page">
            Create one
          </Link>
        </p>  

      </div>
    </main>
  );
}