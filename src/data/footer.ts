import { SITE } from './site';

const P = SITE.paths;

export interface FooterContact {
  label: string;
  email: string;
}

export interface FooterLink {
  label: string;
  href: string;
  download?: boolean;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSocial {
  label: string;
  href: string;
  icon: string;
}

export const footerContacts: FooterContact[] = [
  { label: 'Applications & Attachments', email: SITE.emails.academics },
  { label: 'Partnerships',               email: SITE.emails.partnerships },
  { label: 'Research & Ethics',          email: SITE.emails.research },
];

export const footerColumns: FooterColumn[] = [
  {
    title: 'Programmes',
    links: [
      { label: 'Clinical Training',     href: P.applyClinical },
      { label: 'Internship',            href: P.applyIntern },
      { label: 'Community Health',      href: P.applyCHW },
      { label: 'CPD / CME',             href: P.teachCme },
      { label: 'Research Collaboration',href: P.research },
      { label: 'Partnerships',          href: P.collaborate },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Internship Manual',     href: '/files/internship-manual.pdf',     download: true },
      { label: 'Preceptor Handbook',    href: '/files/preceptor-handbook.pdf',    download: true },
      { label: 'Research Guidelines',   href: '/files/research-guidelines.pdf',   download: true },
      { label: 'MOU Template',          href: '/files/mou-template.pdf',          download: true },
      { label: 'All Downloads',         href: P.resources },
      { label: 'FAQ',                   href: P.faq },
    ],
  },
  {
    title: 'Institution',
    links: [
      { label: 'SPMH Main Site',        href: SITE.mainSite.url,        external: true },
      { label: 'About SPMH',            href: SITE.mainSite.about,      external: true },
      { label: 'Strategic Plan 2026–2030', href: SITE.mainSite.strategicPlan, external: true },
      { label: 'Level 5 Pathway',       href: P.level5 },
      { label: 'Governance',            href: SITE.mainSite.governance, external: true },
      { label: 'Catholic Diocese of Homa Bay', href: SITE.diocese.url,  external: true },
    ],
  },
];

export const footerSocials: FooterSocial[] = [
  { label: 'Facebook', href: SITE.socials.facebook, icon: 'fa-facebook-f' },
  { label: 'X',        href: SITE.socials.x,        icon: 'fa-x-twitter'  },
  { label: 'TikTok',   href: SITE.socials.tiktok,   icon: 'fa-tiktok'     },
  { label: 'LinkedIn', href: SITE.socials.linkedin, icon: 'fa-linkedin-in' },
];

export const footerLegal: FooterLink[] = [
  { label: 'Privacy',                 href: P.privacy },
  { label: 'Terms of Attachment',     href: P.terms },
  { label: 'Accreditation Standards', href: P.accreditationStandards },
];