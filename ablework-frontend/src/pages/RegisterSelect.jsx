import { Link } from 'react-router-dom';

export default function RegisterSelect() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-4 gap-8">
      
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">Join AbleWork</h1>
        <p className="text-lg text-[var(--text-secondary)]">Please choose how you would like to use our platform:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        
        {/* Applicant Card */}
        <Link 
          to="/register/applicant"
          className="p-8 bg-[var(--bg-card)] rounded-2xl shadow-xl border-4 border-transparent hover:border-[var(--border-accent)] flex flex-col items-center text-center transition-all cursor-pointer group"
        >
          <div className="text-5xl mb-4">👨‍💻</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--border-accent)]">I am a Job Seeker</h2>
          <p className="text-sm text-[var(--text-secondary)]">Looking for accessible jobs and career opportunities.</p>
        </Link>

        {/* Employer Card */}
        <Link 
          to="/register/employer"
          className="p-8 bg-[var(--bg-card)] rounded-2xl shadow-xl border-4 border-transparent hover:border-[var(--border-accent)] flex flex-col items-center text-center transition-all cursor-pointer group"
        >
          <div className="text-5xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--border-accent)]">I am an Employer</h2>
          <p className="text-sm text-[var(--text-secondary)]">Looking to hire inclusive talent and post job listings.</p>
        </Link>

      </div>

      <p className="mt-4 text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link to="/" className="font-bold text-[var(--border-accent)] hover:underline">Log in</Link>
      </p>

    </main>
  );
}