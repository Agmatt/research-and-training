/**
 * Single source of truth for URLs, emails, and cross-domain links.
 * Every component that references the hospital or the subdomain
 * should read from here — never hardcode.
 */

export const SITE = {
  /* ---- Subdomain (this site) ---- */
  url: 'https://training-and-research.spmh.co.ke',
  name: 'SPMH Training & Research',
  shortName: 'SPMH T&R',
  tagline: 'Academics, Research & Training',

  /* ---- Main hospital site (external) ---- */
  mainSite: {
    url: 'https://www.spmh.co.ke',
    name: "St. Paul's Mission Hospital",
    about: 'https://www.spmh.co.ke/about',
    contact: 'https://www.spmh.co.ke/contact',
    governance: 'https://www.spmh.co.ke/governance',
    strategicPlan: 'https://www.spmh.co.ke/strategic-plan',
    services: 'https://www.spmh.co.ke/services',
    donate: 'https://www.spmh.co.ke/donate',
  },

  /* ---- Diocese ---- */
  diocese: {
    name: 'Catholic Diocese of Homa Bay',
    url: 'https://catholichomabay.org',
  },

  /* ---- Contact emails ---- */
  emails: {
    academics:    'academics@spmh.co.ke',
    partnerships: 'partnerships@spmh.co.ke',
    research:     'research@spmh.co.ke',
    general:      'info@stpaulshospitalhb.co.ke',
  },

  /* ---- Physical / institutional ---- */
  address: {
    poBox: 'P.O. Box 426',
    town: 'Homa Bay',
    region: 'Homa Bay County',
    country: 'Kenya',
    countryCode: 'KE',
  },

  /* ---- Socials ---- */
  socials: {
    facebook: 'https://facebook.com/spmhhomabay',
    x:        'https://x.com/spmhhomabay',
    tiktok:   'https://tiktok.com/@spmhhomabay',
    linkedin: 'https://linkedin.com/company/spmhhomabay',
  },

  /* ---- Operating hours ---- */
  hours: 'Mon–Fri · 8:00 AM – 5:00 PM (EAT)',

  /* ---- Internal paths (subdomain root-relative) ---- */
  paths: {
    home:         '/',
    apply:        '/apply',
    applyClinical:'/apply/clinical',
    applyIntern:  '/apply/internship',
    applyCHW:     '/apply/community-health',
    applyForm:    '/apply/form',

    collaborate:       '/collaborate',
    collabInquiry:     '/collaborate/inquiry',
    collabMou:         '/collaborate/mou',
    collabDirectory:   '/collaborate/directory',

    research:          '/research',
    researchAreas:     '/research/areas',
    researchProtocols: '/research/protocols',
    researchEthics:    '/research/ethics',
    researchPropose:   '/research/propose',

    teach:             '/teach',
    teachCme:          '/teach/cme',
    teachFaculty:      '/teach/faculty-directory',
    teachResources:    '/teach/resources',

    level5:            '/level-5',
    level5Vision:      '/level-5/vision',
    level5Roadmap:     '/level-5/roadmap',
    level5Facilities:  '/level-5/facilities',
    level5Accred:      '/level-5/accreditation',
    level5Metrics:     '/level-5/metrics',

    resources:    '/resources',
    faq:          '/faq',
    privacy:      '/privacy',
    terms:        '/terms-of-attachment',
    accreditationStandards: '/accreditation-standards',
    contact:      '/contact',
  },
} as const;

export type SitePaths = typeof SITE.paths;