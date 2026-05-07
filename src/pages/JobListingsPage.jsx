import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchJobs } from '../services/jobsApi';
import JobCard from '../components/JobCard';

const DEFAULT_QUERY = 'pharmacy technician';
const DEFAULT_LOCATION = 'Toronto, ON';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'PRN', 'Internship'];
const POSTED_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Last 24 hours', value: '1' },
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
];

export default function JobListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state (controlled inputs)
  const [query, setQuery] = useState(searchParams.get('q') || DEFAULT_QUERY);
  const [location, setLocation] = useState(searchParams.get('loc') || DEFAULT_LOCATION);

  // Filter state
  const [jobType, setJobType] = useState(searchParams.get('type') || '');
  const [postedWithin, setPostedWithin] = useState(searchParams.get('posted') || '');

  // Results state
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const runSearch = useCallback(
    async ({ q = query, loc = location, type = jobType, posted = postedWithin } = {}) => {
      setLoading(true);
      try {
        const result = await searchJobs({
          query: q,
          location: loc,
          jobType: type,
          postedWithin: posted,
        });
        setJobs(result.jobs);
        setTotal(result.total);
      } finally {
        setLoading(false);
      }
    },
    [query, location, jobType, postedWithin]
  );

  // Run on mount and whenever URL params change
  useEffect(() => {
    const q = searchParams.get('q') || DEFAULT_QUERY;
    const loc = searchParams.get('loc') || DEFAULT_LOCATION;
    const type = searchParams.get('type') || '';
    const posted = searchParams.get('posted') || '';

    setQuery(q);
    setLocation(loc);
    setJobType(type);
    setPostedWithin(posted);

    runSearch({ q, loc, type, posted });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleSearch(e) {
    e.preventDefault();
    const params = {};
    if (query) params.q = query;
    if (location) params.loc = location;
    if (jobType) params.type = jobType;
    if (postedWithin) params.posted = postedWithin;
    setSearchParams(params);
  }

  function handleTypeToggle(type) {
    const newType = jobType === type ? '' : type;
    setJobType(newType);
    const params = {};
    if (query) params.q = query;
    if (location) params.loc = location;
    if (newType) params.type = newType;
    if (postedWithin) params.posted = postedWithin;
    setSearchParams(params);
  }

  function handlePostedChange(value) {
    setPostedWithin(value);
    const params = {};
    if (query) params.q = query;
    if (location) params.loc = location;
    if (jobType) params.type = jobType;
    if (value) params.posted = value;
    setSearchParams(params);
  }

  function clearAllFilters() {
    setQuery(DEFAULT_QUERY);
    setLocation(DEFAULT_LOCATION);
    setJobType('');
    setPostedWithin('');
    setSearchParams({});
  }

  const hasActiveFilters = query || location || jobType || postedWithin;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero / Search Section ── */}
      <div className="bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wide">
                🏥 Pharmacy &amp; Healthcare
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Find Your Next Pharmacy Role
            </h1>
            <p className="text-sky-100 text-lg mb-8">
              Browse hundreds of pharmacist, technician, and clinical pharmacy positions across the US.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-2 shadow-lg"
            >
              {/* Job title / keyword */}
              <div className="flex-1 flex items-center gap-2 px-3">
                <svg
                  className="w-5 h-5 text-slate-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Job title, keyword, or company"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full py-2 text-slate-800 placeholder-slate-400 bg-transparent outline-none text-sm"
                />
              </div>

              <div className="hidden sm:block w-px bg-slate-200 my-1" />

              {/* Location */}
              <div className="flex-1 flex items-center gap-2 px-3">
                <svg
                  className="w-5 h-5 text-slate-400 flex-shrink-0"
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
                <input
                  type="text"
                  placeholder="City, state, or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full py-2 text-slate-800 placeholder-slate-400 bg-transparent outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors text-sm flex-shrink-0"
              >
                Search Jobs
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar Filters ── */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Job Type
                </h3>
                <div className="space-y-2">
                  {JOB_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeToggle(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        jobType === type
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posted Within */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Date Posted
                </h3>
                <div className="space-y-2">
                  {POSTED_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePostedChange(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        postedWithin === opt.value
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Job Results ── */}
          <main className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                {loading ? (
                  <span className="text-slate-400">Searching…</span>
                ) : (
                  <>
                    <span className="font-semibold text-slate-800">{total}</span>{' '}
                    {total === 1 ? 'job' : 'jobs'} found
                    {(query || location) && (
                      <>
                        {query && (
                          <span>
                            {' '}for <span className="font-medium text-sky-700">"{query}"</span>
                          </span>
                        )}
                        {location && (
                          <span>
                            {' '}in <span className="font-medium text-sky-700">{location}</span>
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </p>

              {/* Active filter pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {jobType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                    {jobType}
                    <button onClick={() => handleTypeToggle(jobType)} className="hover:text-sky-900">
                      ×
                    </button>
                  </span>
                )}
                {postedWithin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                    {POSTED_OPTIONS.find((o) => o.value === postedWithin)?.label}
                    <button onClick={() => handlePostedChange('')} className="hover:text-sky-900">
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && jobs.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-700 font-semibold text-lg mb-1">No jobs found</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Try adjusting your search or clearing the filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Job Cards */}
            {!loading && jobs.length > 0 && (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
