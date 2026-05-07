import { Link } from 'react-router-dom';

const JOB_TYPE_COLORS = {
  'Full-time': 'bg-green-100 text-green-700',
  'Part-time': 'bg-amber-100 text-amber-700',
  Contract: 'bg-purple-100 text-purple-700',
  PRN: 'bg-rose-100 text-rose-700',
};

const SOURCE_COLORS = {
  Indeed: 'bg-blue-50 text-blue-600',
  LinkedIn: 'bg-sky-50 text-sky-700',
};

function postedLabel(daysAgo) {
  if (daysAgo === null || daysAgo === undefined) return '';
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return '1 day ago';
  return `${daysAgo} days ago`;
}

export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col gap-4">
      {/* Top row: logo + meta */}
      <div className="flex items-start gap-4">
        {/* Company logo or initials fallback */}
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={job.company}
            className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-100 p-1 flex-shrink-0 shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
          style={{
            backgroundColor: job.companyColor || '#0284c7',
            display: job.companyLogo ? 'none' : 'flex',
          }}
        >
          {job.companyInitials}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            to={`/jobs/${job.id}`}
            className="text-base font-semibold text-slate-800 hover:text-sky-600 transition-colors line-clamp-1"
          >
            {job.title}
          </Link>
          <p className="text-sm text-slate-500 mt-0.5">{job.company}</p>
        </div>

        {/* Source badge */}
        <span
          className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
            SOURCE_COLORS[job.source] || 'bg-slate-100 text-slate-600'
          }`}
        >
          {job.source}
        </span>
      </div>

      {/* Details row */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {/* Location */}
        <span className="flex items-center gap-1">
          <svg
            className="w-4 h-4 flex-shrink-0 text-slate-400"
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
          {job.location}
        </span>

        <span className="text-slate-300">•</span>

        {/* Salary */}
        <span className="flex items-center gap-1">
          <svg
            className="w-4 h-4 flex-shrink-0 text-slate-400"
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
          {job.salary}
        </span>
      </div>

      {/* Bottom row: badges + apply */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Job type */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              JOB_TYPE_COLORS[job.type] || 'bg-slate-100 text-slate-600'
            }`}
          >
            {job.type}
          </span>

          {/* Posted */}
          <span className="text-xs text-slate-400">{postedLabel(job.postedDaysAgo)}</span>
        </div>

        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors"
        >
          View Job
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
