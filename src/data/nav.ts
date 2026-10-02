import { SITE } from './site';

const P = SITE.paths;

export interface NavItem {
  label: string;
  href: string;
  submenu?: SubmenuKey;
}

export type SubmenuKey =
  | 'apply'
  | 'collaborate'
  | 'research'
  | 'teach'
  | 'level5';

export const navItems: NavItem[] = [
  { label: 'Home',        href: P.home },
  { label: 'Apply',       href: P.apply,       submenu: 'apply' },
  { label: 'Collaborate', href: P.collaborate, submenu: 'collaborate' },
  { label: 'Research',    href: P.research,    submenu: 'research' },
  { label: 'Teach',       href: P.teach,       submenu: 'teach' },
  { label: 'Level 5',     href: P.level5,      submenu: 'level5' },
  { label: 'Resources',   href: P.resources },
];

export interface MegamenuLink {
  label: string;
  href: string;
  cta?: boolean;
  download?: boolean;
}

export interface MegamenuSection {
  title: string;
  icon: string;              // FontAwesome icon name (without 'fa-')
  badge?: string;
  items: MegamenuLink[];
}

export interface Megamenu {
  sections: MegamenuSection[];
}

export const megamenus: Record<SubmenuKey, Megamenu> = {
  apply: {
    sections: [
      {
        title: 'Clinical Training',
        icon: 'stethoscope',
        items: [
          { label: 'Programme Overview',   href: P.applyClinical },
          { label: 'Nursing (6–12 weeks)', href: `${P.applyClinical}#nursing` },
          { label: 'Lab & Diagnostics',    href: `${P.applyClinical}#lab` },
          { label: 'Pharmacy',             href: `${P.applyClinical}#pharmacy` },
          { label: 'Outpatient & Community', href: `${P.applyClinical}#outpatient` },
          { label: 'Apply Now →',          href: P.applyForm, cta: true },
        ],
      },
      {
        title: 'Internship',
        badge: 'Level 5 pathway',
        icon: 'graduation-cap',
        items: [
          { label: 'Programme Overview', href: P.applyIntern },
          { label: 'Eligibility & Cadres', href: `${P.applyIntern}#eligibility` },
          { label: 'Competency Framework', href: `${P.applyIntern}#competencies` },
          { label: 'Preceptor Assignment', href: `${P.applyIntern}#preceptors` },
          { label: 'Apply Now →',          href: P.applyForm, cta: true },
        ],
      },
      {
        title: 'Community Health',
        icon: 'people-group',
        items: [
          { label: 'CHP Training (4 weeks)', href: P.applyCHW },
          { label: 'Field Locations',        href: `${P.applyCHW}#locations` },
          { label: 'Apply Now →',            href: P.applyForm, cta: true },
        ],
      },
    ],
  },

  collaborate: {
    sections: [
      {
        title: 'Get Started',
        icon: 'handshake',
        items: [
          { label: 'Partnership Overview',   href: P.collaborate },
          { label: 'Partnership Categories', href: `${P.collaborate}#categories` },
          { label: 'Submit Inquiry →',       href: P.collabInquiry, cta: true },
        ],
      },
      {
        title: 'Framework',
        icon: 'file-contract',
        items: [
          { label: 'MOU Process & Template', href: P.collabMou },
          { label: 'Partnership Standards',  href: `${P.collabMou}#standards` },
          { label: 'Download MOU',           href: '/files/mou-template.pdf', download: true },
        ],
      },
      {
        title: 'Our Partners',
        icon: 'building',
        items: [
          { label: 'Partner Directory', href: P.collabDirectory },
          { label: 'Active Partnerships', href: `${P.collabDirectory}#active` },
        ],
      },
    ],
  },

  research: {
    sections: [
      {
        title: 'Research Areas',
        icon: 'flask',
        items: [
          { label: 'Community Health',       href: `${P.researchAreas}#community-health` },
          { label: 'Epidemiology',           href: `${P.researchAreas}#epidemiology` },
          { label: 'Quality Improvement',    href: `${P.researchAreas}#qi` },
          { label: 'Maternal & Child Health', href: `${P.researchAreas}#mncah` },
          { label: 'All Key Result Areas →', href: P.researchAreas },
        ],
      },
      {
        title: 'Collaborate',
        icon: 'microscope',
        items: [
          { label: 'Research Protocols',    href: P.researchProtocols },
          { label: 'Ethics Review Process', href: P.researchEthics },
          { label: 'Propose a Project →',   href: P.researchPropose, cta: true },
        ],
      },
      {
        title: 'Resources',
        icon: 'book',
        items: [
          { label: 'Protocol Templates',     href: `${P.researchProtocols}#templates` },
          { label: 'Researcher Guidelines',  href: '/files/research-guidelines.pdf', download: true },
          { label: 'Data Management',        href: `${P.researchProtocols}#data-management` },
        ],
      },
    ],
  },

  teach: {
    sections: [
      {
        title: 'Continuing Education',
        icon: 'chalkboard-user',
        items: [
          { label: 'CME Calendar',       href: `${P.teachCme}#calendar` },
          { label: 'Upcoming Trainings', href: P.teachCme },
          { label: 'CPD Credits',        href: `${P.teachCme}#credits` },
          { label: 'Register →',         href: `${P.teachCme}#register`, cta: true },
        ],
      },
      {
        title: 'Faculty',
        icon: 'user-tie',
        items: [
          { label: 'Faculty Directory',   href: P.teachFaculty },
          { label: 'Teaching Materials',  href: P.teachResources },
          { label: 'Preceptor Handbook',  href: '/files/preceptor-handbook.pdf', download: true },
        ],
      },
    ],
  },

  level5: {
    sections: [
      {
        title: 'The Journey',
        icon: 'graduation-cap',
        items: [
          { label: '2030 Vision',           href: P.level5Vision },
          { label: 'Strategic Roadmap',     href: P.level5Roadmap },
          { label: 'Facilities & Infrastructure', href: P.level5Facilities },
        ],
      },
      {
        title: 'Accreditation',
        icon: 'clipboard-check',
        items: [
          { label: 'MoH/KMPDC Standards',   href: P.level5Accred },
          { label: 'Readiness Assessment',  href: `${P.level5Accred}#readiness` },
          { label: 'Impact Metrics',        href: P.level5Metrics },
        ],
      },
    ],
  },
};

/* Grid column helper — number of sections in a megamenu → tailwind class */
export const gridCols: Record<number, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};
export const colsFor = (n: number) => gridCols[n] ?? 'lg:grid-cols-3';