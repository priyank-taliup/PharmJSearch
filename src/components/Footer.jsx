import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-md bg-sky-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
                  <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">
                Pharmacy<span className="text-sky-400">Jobs</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting pharmacy professionals with top healthcare employers across the United States.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Job Seekers
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-sky-400 transition-colors">Browse All Jobs</Link></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Pharmacy Resources</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Salary Guide</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Career Advice</a></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Employers
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-sky-400 transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} PharmacyJobs. All rights reserved.</p>
          <p>Built for pharmacy professionals.</p>
        </div>
      </div>
    </footer>
  );
}
