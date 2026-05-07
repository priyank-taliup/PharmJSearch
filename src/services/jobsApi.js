/**
 * PharmacyJobs API Service — powered by JSearch (RapidAPI)
 * Data sourced from Google for Jobs: LinkedIn, Indeed, Glassdoor, ZipRecruiter & more.
 *
 * Docs: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 *
 * NOTE: For production, move API calls to a server-side proxy so the key
 * isn't visible in browser network requests.
 */

import axios from 'axios';

// ---------------------------------------------------------------------------
// JSearch client
// ---------------------------------------------------------------------------

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const BASE_URL = 'https://jsearch.p.rapidapi.com';

const headers = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': 'jsearch.p.rapidapi.com',
};

// ---------------------------------------------------------------------------
// Employment type mappings  (our UI label ↔ JSearch value)
// ---------------------------------------------------------------------------

const TYPE_TO_JSEARCH = {
  'Full-time': 'FULLTIME',
  'Part-time': 'PARTTIME',
  Contract: 'CONTRACTOR',
  PRN: 'CONTRACTOR', // closest equivalent in JSearch
};

const JSEARCH_TO_TYPE = {
  FULLTIME: 'Full-time',
  PARTTIME: 'Part-time',
  CONTRACTOR: 'Contract',
  INTERN: 'Internship',
};

// postedWithin value (days) → JSearch date_posted param
const POSTED_MAP = {
  '1': 'today',
  '7': 'week',
  '30': 'month',
};

// ---------------------------------------------------------------------------
// Normalizer — converts a JSearch job object to our app's shape
// ---------------------------------------------------------------------------

function normalizeJob(j) {
  const city = j.job_city || '';
  const state = j.job_state || '';
  const country = j.job_country || '';
  const location =
    j.job_is_remote
      ? 'Remote'
      : [city, state].filter(Boolean).join(', ') || country || 'Location not specified';

  let salary = 'Not specified';
  if (j.job_min_salary && j.job_max_salary) {
    const fmt = (n) =>
      j.job_salary_period === 'HOUR'
        ? `$${Math.round(n)}/hr`
        : `$${(n / 1000).toFixed(0)}k`;
    salary = `${fmt(j.job_min_salary)} – ${fmt(j.job_max_salary)}`;
    if (j.job_salary_period === 'YEAR') salary += ' / yr';
  } else if (j.job_min_salary) {
    salary = j.job_salary_period === 'HOUR'
      ? `$${Math.round(j.job_min_salary)}/hr+`
      : `$${(j.job_min_salary / 1000).toFixed(0)}k+ / yr`;
  }

  const postedDate = j.job_posted_at_datetime_utc
    ? new Date(j.job_posted_at_datetime_utc)
    : null;
  const postedDaysAgo = postedDate
    ? Math.max(0, Math.round((Date.now() - postedDate.getTime()) / 86400000))
    : null;

  return {
    id: j.job_id,
    title: j.job_title,
    company: j.employer_name || 'Unknown Employer',
    companyLogo: j.employer_logo || null,
    companyInitials: (j.employer_name || 'JB').slice(0, 3).toUpperCase(),
    location,
    type: JSEARCH_TO_TYPE[j.job_employment_type] || j.job_employment_type || 'Full-time',
    salary,
    postedDaysAgo,
    source: j.job_publisher || 'JSearch',
    applyUrl: j.job_apply_link,
    description: j.job_description || '',
    requirements: j.job_highlights?.Qualifications || [],
    responsibilities: j.job_highlights?.Responsibilities || [],
    benefits: j.job_highlights?.Benefits || [],
  };
}

// ---------------------------------------------------------------------------
// MOCK_JOBS — used as fallback when API key is missing
// ---------------------------------------------------------------------------

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Staff Pharmacist',
    company: 'CVS Health',
    companyInitials: 'CVS',
    companyColor: '#cc0000',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$120,000 – $140,000 / yr',
    postedDaysAgo: 1,
    source: 'Indeed',
    applyUrl: 'https://jobs.cvs.com',
    description:
      'CVS Health is seeking a licensed Staff Pharmacist to join our busy retail pharmacy team in New York. You will ensure the safe and accurate dispensing of medications, counsel patients, and collaborate with healthcare providers to optimize therapy outcomes.',
    requirements: [
      'Doctor of Pharmacy (PharmD) degree',
      'Active New York State Pharmacist license',
      'Strong communication and customer service skills',
      'Ability to work weekends and holidays',
      'Immunization certification preferred',
    ],
    responsibilities: [
      'Dispense medications accurately and efficiently',
      'Counsel patients on medication use, side effects, and drug interactions',
      'Review and verify prescriptions for accuracy and appropriateness',
      'Collaborate with physicians and other healthcare providers',
      'Maintain compliance with state and federal pharmacy regulations',
      'Supervise pharmacy technicians and interns',
    ],
    benefits: [
      'Health, dental, and vision insurance',
      '401(k) with company match',
      'Paid time off and holidays',
      'Tuition reimbursement',
      'Employee discount program',
    ],
  },
  {
    id: '2',
    title: 'Clinical Pharmacist – Oncology',
    company: 'Memorial Sloan Kettering',
    companyInitials: 'MSK',
    companyColor: '#003087',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$145,000 – $175,000 / yr',
    postedDaysAgo: 2,
    source: 'LinkedIn',
    applyUrl: 'https://careers.mskcc.org',
    description:
      'Join the world-renowned Memorial Sloan Kettering Cancer Center as a Clinical Pharmacist specializing in Oncology. You will work alongside multidisciplinary teams to provide specialized pharmaceutical care to cancer patients.',
    requirements: [
      'PharmD with PGY-1 and PGY-2 Oncology residency (or equivalent)',
      'Board Certified Oncology Pharmacist (BCOP) preferred',
      'Active New York pharmacist license',
      'Strong clinical knowledge in chemotherapy protocols',
    ],
    responsibilities: [
      'Review and verify chemotherapy orders',
      'Participate in multidisciplinary tumor board rounds',
      'Provide drug information and pharmacokinetic consultations',
      'Educate patients and caregivers on chemotherapy regimens',
      'Conduct medication reconciliation for oncology patients',
    ],
    benefits: [
      'Competitive salary + sign-on bonus',
      'Comprehensive benefits package',
      'CME allowance',
      'On-site parking',
      'Retirement savings plan',
    ],
  },
  {
    id: '3',
    title: 'Pharmacy Technician',
    company: 'Walgreens',
    companyInitials: 'WAG',
    companyColor: '#e31837',
    location: 'Chicago, IL',
    type: 'Part-time',
    salary: '$18 – $22 / hr',
    postedDaysAgo: 3,
    source: 'Indeed',
    applyUrl: 'https://jobs.walgreens.com',
    description:
      'Walgreens is hiring a Part-time Pharmacy Technician to support our team in delivering outstanding patient care. This role assists the pharmacist in dispensing medications and provides excellent customer service.',
    requirements: [
      'High school diploma or GED',
      'Illinois Pharmacy Technician registration or license',
      'PTCB certification preferred',
      'Retail or pharmacy experience a plus',
    ],
    responsibilities: [
      'Assist pharmacist in filling and dispensing prescriptions',
      'Process insurance claims and resolve billing issues',
      'Maintain inventory and order stock',
      'Provide excellent customer service at the pharmacy counter',
      'Maintain a clean and organized pharmacy workspace',
    ],
    benefits: [
      'Flexible scheduling',
      'Employee discount',
      'Paid training',
      '401(k) for eligible employees',
    ],
  },
  {
    id: '4',
    title: 'Hospital Pharmacist – PRN',
    company: 'Johns Hopkins Hospital',
    companyInitials: 'JHH',
    companyColor: '#002d72',
    location: 'Baltimore, MD',
    type: 'PRN',
    salary: '$65 – $75 / hr',
    postedDaysAgo: 5,
    source: 'LinkedIn',
    applyUrl: 'https://careers.hopkinsmedicine.org',
    description:
      'Johns Hopkins Hospital is seeking a PRN (as-needed) Hospital Pharmacist to support our inpatient pharmacy operations. Flexible scheduling available including nights and weekends.',
    requirements: [
      'PharmD or BS Pharmacy',
      'Active Maryland pharmacist license',
      'Hospital pharmacy experience required (2+ years)',
      'Ability to work flexible shifts including nights/weekends',
    ],
    responsibilities: [
      'Process and verify inpatient medication orders',
      'Perform clinical pharmacy services as assigned',
      'Assist with medication reconciliation',
      'Support sterile compounding operations',
    ],
    benefits: [
      'Competitive PRN rate',
      'Flexible scheduling',
      'Access to JHH resources and training',
    ],
  },
  {
    id: '5',
    title: 'Compounding Pharmacist',
    company: 'Strive Pharmacy',
    companyInitials: 'SP',
    companyColor: '#0f766e',
    location: 'Scottsdale, AZ',
    type: 'Full-time',
    salary: '$115,000 – $130,000 / yr',
    postedDaysAgo: 7,
    source: 'Indeed',
    applyUrl: 'https://strivepharmacy.com/careers',
    description:
      "Strive Pharmacy, a leading compounding pharmacy, is looking for an experienced Compounding Pharmacist to join our growing team. You'll work in a state-of-the-art facility preparing custom medications.",
    requirements: [
      'PharmD or BS in Pharmacy',
      'Active Arizona pharmacist license',
      'USP 795/797/800 knowledge required',
      'PCAB accreditation experience preferred',
    ],
    responsibilities: [
      'Compound sterile and non-sterile preparations',
      'Ensure compliance with USP chapters and state regulations',
      'Perform quality control checks on compounded products',
      'Consult with prescribers on custom formulations',
    ],
    benefits: [
      'Competitive salary',
      'Health and dental insurance',
      'PTO + paid holidays',
      'Professional development budget',
    ],
  },
  {
    id: '6',
    title: 'Retail Pharmacist',
    company: 'Rite Aid',
    companyInitials: 'RA',
    companyColor: '#005daa',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    salary: '$125,000 – $148,000 / yr',
    postedDaysAgo: 4,
    source: 'Indeed',
    applyUrl: 'https://careers.riteaid.com',
    description:
      'Rite Aid is seeking a dedicated Retail Pharmacist who is passionate about patient care. You will manage day-to-day pharmacy operations, dispense medications, and deliver high-quality clinical services.',
    requirements: [
      'PharmD degree',
      'Active California pharmacist license',
      'CPE Monitor account in good standing',
      'Immunization certification (or willingness to obtain)',
    ],
    responsibilities: [
      'Oversee daily pharmacy operations and workflow',
      'Dispense and counsel patients on medications',
      'Administer vaccines and perform point-of-care testing',
      'Manage pharmacy technicians and interns',
      'Ensure regulatory compliance',
    ],
    benefits: [
      'Medical, dental, vision coverage',
      'Generous PTO',
      '401(k) with employer match',
      'Relocation assistance available',
    ],
  },
  {
    id: '7',
    title: 'Ambulatory Care Pharmacist',
    company: 'Kaiser Permanente',
    companyInitials: 'KP',
    companyColor: '#00a0df',
    location: 'Oakland, CA',
    type: 'Full-time',
    salary: '$150,000 – $180,000 / yr',
    postedDaysAgo: 6,
    source: 'LinkedIn',
    applyUrl: 'https://jobs.kaiserpermanente.org',
    description:
      'Kaiser Permanente is seeking an Ambulatory Care Pharmacist to work in our integrated care clinics. You will manage complex medication therapy, collaborate with physicians, and support chronic disease management programs.',
    requirements: [
      'PharmD with PGY-1 residency (ambulatory care focus preferred)',
      'Board Certified Pharmacotherapy Specialist (BCPS) or BCACP',
      'Active California pharmacist license',
      'Experience in diabetes, hypertension, or anticoagulation management',
    ],
    responsibilities: [
      'Manage chronic disease medication therapy (diabetes, HTN, dyslipidemia)',
      'Conduct comprehensive medication reviews',
      'Collaborate with physicians in patient care rounds',
      'Provide patient education on medication adherence',
    ],
    benefits: [
      'Excellent salary + incentives',
      'Full benefits suite',
      'Pension plan',
      'CME reimbursement',
      'Work-life balance',
    ],
  },
  {
    id: '8',
    title: 'Pharmacy Director',
    company: 'Ascension Health',
    companyInitials: 'AH',
    companyColor: '#7c3aed',
    location: 'Nashville, TN',
    type: 'Full-time',
    salary: '$170,000 – $210,000 / yr',
    postedDaysAgo: 10,
    source: 'LinkedIn',
    applyUrl: 'https://ascension.org/careers',
    description:
      'Ascension Health is seeking a strategic and experienced Pharmacy Director to lead pharmacy operations across multiple hospital facilities in the Nashville region. This is a senior leadership role.',
    requirements: [
      'PharmD required; MBA or MHA preferred',
      'Active Tennessee pharmacist license',
      '5+ years of progressive pharmacy management experience',
      'ASHP accreditation experience preferred',
      'Strong leadership and financial management skills',
    ],
    responsibilities: [
      'Lead and manage pharmacy departments across facilities',
      'Develop and implement pharmacy strategic plans',
      'Oversee formulary management and medication safety',
      'Manage pharmacy budgets and financial performance',
      'Lead, develop, and mentor pharmacy staff',
    ],
    benefits: [
      'Executive compensation package',
      'Annual performance bonus',
      'Full benefits + executive perks',
      'Relocation assistance',
    ],
  },
  {
    id: '9',
    title: 'Long-Term Care Pharmacist',
    company: 'Omnicare (CVS Health)',
    companyInitials: 'OC',
    companyColor: '#cc0000',
    location: 'Dallas, TX',
    type: 'Full-time',
    salary: '$118,000 – $135,000 / yr',
    postedDaysAgo: 8,
    source: 'Indeed',
    applyUrl: 'https://jobs.cvs.com',
    description:
      'Omnicare, a CVS Health company, is hiring a Long-Term Care Pharmacist to serve nursing facilities and assisted living communities. You will ensure appropriate medication use and regulatory compliance in LTC settings.',
    requirements: [
      'PharmD or BS Pharmacy',
      'Active Texas pharmacist license',
      'LTC or consultant pharmacy experience preferred',
      'Knowledge of OBRA regulations',
    ],
    responsibilities: [
      'Review medication regimens for LTC residents',
      'Perform drug regimen reviews and generate recommendations',
      'Consult with facility staff on medication-related issues',
      'Ensure compliance with state and federal LTC regulations',
    ],
    benefits: [
      'Competitive pay',
      'Full benefits package',
      'Company vehicle or mileage reimbursement',
      '401(k)',
    ],
  },
  {
    id: '10',
    title: 'Remote Clinical Pharmacist – Telepharmacy',
    company: 'PipelineRx',
    companyInitials: 'PRx',
    companyColor: '#059669',
    location: 'Remote',
    type: 'Contract',
    salary: '$55 – $70 / hr',
    postedDaysAgo: 2,
    source: 'LinkedIn',
    applyUrl: 'https://pipelinerx.com/careers',
    description:
      'PipelineRx offers a unique remote clinical pharmacist role in telepharmacy. Review and verify medication orders remotely for partner hospitals. Enjoy the flexibility of working from home while making a clinical impact.',
    requirements: [
      'PharmD or BS Pharmacy',
      'Active license in at least one US state (multi-state preferred)',
      'Hospital pharmacy experience required',
      'Reliable high-speed internet and home office',
    ],
    responsibilities: [
      'Remotely verify inpatient medication orders',
      'Provide clinical pharmacy services via telepharmacy platform',
      'Communicate with bedside nurses and prescribers',
      'Document interventions in client EMR systems',
    ],
    benefits: [
      'Fully remote',
      'Flexible contract hours',
      'Competitive 1099 rate',
      'Multi-state licensing support',
    ],
  },
  {
    id: '11',
    title: 'Pharmacy Residency Director',
    company: 'UCSF Medical Center',
    companyInitials: 'UCSF',
    companyColor: '#052049',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$165,000 – $195,000 / yr',
    postedDaysAgo: 14,
    source: 'LinkedIn',
    applyUrl: 'https://careers.ucsf.edu',
    description:
      'UCSF Medical Center is seeking a visionary Pharmacy Residency Program Director to lead ASHP-accredited PGY-1 and PGY-2 residency programs. This combined clinical and administrative role offers an exciting opportunity to shape the next generation of clinical pharmacists.',
    requirements: [
      'PharmD with completed residency training',
      'Active California pharmacist license',
      'Significant clinical pharmacy experience (5+ years)',
      'Experience directing or coordinating residency programs preferred',
      'Board certification required',
    ],
    responsibilities: [
      'Direct and coordinate all pharmacy residency programs',
      'Recruit, mentor, and evaluate pharmacy residents',
      'Maintain ASHP accreditation standards',
      'Develop and refine residency curricula',
      'Lead scholarly activities and research initiatives',
    ],
    benefits: [
      'Top-tier academic medical center salary',
      'Research and publication support',
      'Full UC benefits',
      'Generous vacation and CME',
    ],
  },
  {
    id: '12',
    title: 'Specialty Pharmacy Technician',
    company: 'Shields Health Solutions',
    companyInitials: 'SHS',
    companyColor: '#1d4ed8',
    location: 'Boston, MA',
    type: 'Full-time',
    salary: '$22 – $28 / hr',
    postedDaysAgo: 3,
    source: 'Indeed',
    applyUrl: 'https://shieldshealthsolutions.com/careers',
    description:
      'Shields Health Solutions is growing its specialty pharmacy operations at leading health systems. We are seeking a Specialty Pharmacy Technician to support the dispensing of high-cost specialty medications.',
    requirements: [
      'High school diploma or equivalent',
      'Massachusetts pharmacy technician license',
      'PTCB certification preferred',
      '1+ year of specialty or retail pharmacy experience',
    ],
    responsibilities: [
      'Assist in dispensing specialty medications',
      'Coordinate patient access and prior authorizations',
      'Process specialty pharmacy insurance claims',
      'Support clinical pharmacists with patient intake',
    ],
    benefits: [
      'Competitive hourly rate',
      'Health and dental insurance',
      'Career growth opportunities',
      'Paid training and certification support',
    ],
  },
];

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Search pharmacy jobs via JSearch.
 * Falls back to MOCK_JOBS when the API key is not configured.
 *
 * @param {Object} params
 * @param {string} params.query        - Title or company keyword
 * @param {string} params.location     - City, state, or "Remote"
 * @param {string} params.jobType      - "Full-time" | "Part-time" | "Contract" | "PRN" | ""
 * @param {string} params.postedWithin - "1" | "7" | "30" | ""
 * @returns {Promise<{ jobs: Array, total: number }>}
 */
export async function searchJobs({
  query = '',
  location = '',
  jobType = '',
  postedWithin = '',
} = {}) {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    return useMockSearch({ query, location, jobType, postedWithin });
  }

  // Build the JSearch query string
  const baseQuery = query.trim() || 'pharmacy technician';
  const searchQuery = location.trim()
    ? `${baseQuery} in ${location.trim()}`
    : `${baseQuery}`;

  // Detect country from location string; default to Canada (GTA focus)
  const loc = location.trim().toLowerCase();
  const country =
    loc.includes(', on') || loc.includes(', bc') || loc.includes(', ab') ||
    loc.includes(', qc') || loc.includes('toronto') || loc.includes('ontario') ||
    loc.includes('canada')
      ? 'ca'
      : 'us';

  const params = {
    query: searchQuery,
    page: '1',
    num_pages: '2',
    country,
    language: 'en_US',
  };

  if (jobType && TYPE_TO_JSEARCH[jobType]) {
    params.employment_types = TYPE_TO_JSEARCH[jobType];
  }

  if (postedWithin && POSTED_MAP[postedWithin]) {
    params.date_posted = POSTED_MAP[postedWithin];
  }

  try {
    const { data } = await axios.get(`${BASE_URL}/search`, { headers, params });
    const jobs = (data.data || []).map(normalizeJob);
    return { jobs, total: jobs.length };
  } catch (err) {
    console.error('JSearch error:', err.response?.data || err.message);
    // Fallback to mock on error so the UI never breaks during development
    return useMockSearch({ query, location, jobType, postedWithin });
  }
}

/**
 * Get full details for a single job by its JSearch job_id.
 * Falls back to MOCK_JOBS when the API key is not configured.
 *
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getJobById(id) {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_JOBS.find((j) => j.id === id) ?? null;
  }

  try {
    const { data } = await axios.get(`${BASE_URL}/job-details`, {
      headers,
      params: { job_id: id, extended_publisher_details: 'false' },
    });
    const job = data.data?.[0];
    return job ? normalizeJob(job) : null;
  } catch (err) {
    console.error('JSearch job-details error:', err.response?.data || err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mock fallback helper
// ---------------------------------------------------------------------------

function useMockSearch({ query, location, jobType, postedWithin }) {
  const q = query.trim().toLowerCase();
  const loc = location.trim().toLowerCase();

  let results = MOCK_JOBS.filter((job) => {
    const matchQuery =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q);
    const matchLocation =
      !loc ||
      job.location.toLowerCase().includes(loc) ||
      job.location.toLowerCase() === 'remote';
    const matchType = !jobType || job.type === jobType;
    const matchDate =
      !postedWithin || job.postedDaysAgo <= parseInt(postedWithin, 10);
    return matchQuery && matchLocation && matchType && matchDate;
  });

  return { jobs: results, total: results.length };
}
