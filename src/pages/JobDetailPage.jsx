import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById } from '../services/jobsApi';

const JOB_TYPE_COLORS = {
  'Full-time': 'bg-green-100 text-green-700',
  'Part-time': 'bg-amber-100 text-amber-700',
  Contract: 'bg-purple-100 text-purple-700',
  PRN: 'bg-rose-100 text-rose-700',
};

function postedLabel(daysAgo) {
  if (daysAgo === null || daysAgo === undefined) return '';
  if (daysAgo === 0) return 'Posted today';
  if (daysAgo === 1) return 'Posted 1 day ago';
  return `Posted ${daysAgo} days ago`;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    getJobById(id).then((result) => {
      if (!result) setNotFound(true);
      else setJob(result);
      setLoading(false);
    });
  }, [id]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
              <div className="h-3 bg-slate-100 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 404 state
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Job Not Found</h2>
          <p className="text-slate-500 mb-6">This listing may have been removed or expired.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg font-medium text-sm hover:bg-sky-700 transition-colors"
          >
            ← Back to Job Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition-colors mb-6 group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex items-start gap-5 mb-6">
                {/* Company logo or initials fallback */}
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-100 p-1.5 flex-shrink-0 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: job.companyColor || '#0284c7',
                    display: job.companyLogo ? 'none' : 'flex',
                  }}
                >
                  {job.companyInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-slate-800 leading-tight">{job.title}</h1>
                  <p className="text-slate-500 mt-1 text-base">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        JOB_TYPE_COLORS[job.type] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {job.type}
                    </span>
                    <span className="text-xs text-slate-400">{postedLabel(job.postedDaysAgo)}</span>
                    <span className="text-xs text-slate-400">via {job.source}</span>
                  </div>
                </div>
              </div>

              {/* Key details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4.5 h-4.5 text-sky-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Location</p>
                    <p className="text-sm font-semibold text-slate-700">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4.5 h-4.5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Salary</p>
                    <p className="text-sm font-semibold text-slate-700">{job.salary}</p>
                  </div>
                </div>
              </div>

              {/* Apply button (mobile – visible below lg) */}
              <div className="mt-5 lg:hidden">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 px-6 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors shadow-sm"
                >
                  Apply Now on {job.source}
                </a>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4">About This Role</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Key Responsibilities</h2>
                <ul className="space-y-2.5">
                  {job.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                      <svg
                        className="w-4 h-4 mt-0.5 text-sky-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Requirements</h2>
                <ul className="space-y-2.5">
                  {job.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                      <svg
                        className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Sticky Sidebar ── */}
          <aside className="hidden lg:block">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-20 space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">{job.title}</h3>
                <p className="text-sm text-slate-500">{job.company}</p>
              </div>

              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 px-4 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors shadow-sm text-sm"
              >
                Apply Now on {job.source}
              </a>

              <div className="text-xs text-center text-slate-400">
                You will be redirected to {job.source} to complete your application.
              </div>

              {/* Benefits */}
              {job.benefits && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Benefits
                  </h4>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <svg
                          className="w-3.5 h-3.5 text-sky-500 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/"
                  className="block w-full text-center py-2.5 px-4 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  ← All Jobs
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
