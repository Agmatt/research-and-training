export interface Pathway {
  title: string;
  description: string;
  image: { src: string; alt: string };
  icon: string;              // FontAwesome icon, without "fa-"
  meta: { icon: string; label: string };
  href: string;
}

export const pathways: Pathway[] = [
  {
    title: 'Clinical Training',
    description:
      'Structured rotations across nursing, lab, pharmacy, and outpatient departments under certified preceptors.',
    image: {
      src: '/gallery/training.jpg',
      alt: 'Student and preceptor at a patient bedside',
    },
    icon: 'stethoscope',
    meta: { icon: 'clock', label: '6–12 weeks' },
    href: '/apply/clinical',
  },
  {
    title: 'Research & Innovation',
    description:
      'Joint studies in community health, epidemiology, and quality improvement initiatives.',
    image: {
      src: '/gallery/research.jpg',
      alt: 'Research team reviewing data in the laboratory',
    },
    icon: 'microscope',
    meta: { icon: 'clock', label: '3–12 months' },
    href: '/research',
  },
  {
    title: 'CME Programs',
    description:
      'Faculty exchange, case-based teaching, and continuing medical education sessions.',
    image: {
      src: '/gallery/cme.jpg',
      alt: 'Continuing medical education session in progress',
    },
    icon: 'graduation-cap',
    meta: { icon: 'book-open', label: 'Modular' },
    href: '/teach/cme',
  },
  {
    title: 'Administration & Systems',
    description:
      'Hands-on experience in HR, finance, procurement, and health information systems.',
    image: {
      src: '/gallery/admin.jpg',
      alt: 'Health records and administration staff at work',
    },
    icon: 'building',
    meta: { icon: 'gears', label: 'Operations' },
    href: '/apply#admin',
  },
  {
    title: 'International Partnerships',
    description:
      'Formal MOUs with regional and international institutions for sustainable collaboration.',
    image: {
      src: '/gallery/partnership.jpg',
      alt: 'MOU signing with international partner institution',
    },
    icon: 'globe',
    meta: { icon: 'file-contract', label: 'Multi-year' },
    href: '/collaborate',
  },
  {
    title: 'Community Health Programs',
    description:
      'Student involvement in outreach and public health initiatives across Western Kenya.',
    image: {
      src: '/gallery/2.jpg',
      alt: 'Community Health Promoter during a field outreach visit',
    },
    icon: 'people-group',
    meta: { icon: 'location-dot', label: 'Field-based' },
    href: '/apply/community-health',
  },
];