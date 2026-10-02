export interface ResearchArea {
  title: string;
  description: string;
  icon: string;
}

export const researchAreas: ResearchArea[] = [
  {
    title: 'Community Health KRA',
    description:
      'CHP-led systems, referral coordination, and continuum-of-care integration within Homa Bay County.',
    icon: 'people-group',
  },
  {
    title: 'Epidemiology',
    description:
      'Communicable and non-communicable disease burden, surveillance, and outbreak preparedness.',
    icon: 'virus',
  },
  {
    title: 'Quality Improvement',
    description:
      'Patient safety, infection prevention, and accreditation-aligned care standards.',
    icon: 'chart-line',
  },
  {
    title: 'Maternal & Child Health',
    description:
      'Maternal, newborn, child, and adolescent health outcomes with focus on preventable mortality.',
    icon: 'baby',
  },
];

export interface ResearchLinkGroup {
  title: string;
  links: { label: string; href: string; external?: boolean; download?: boolean; cta?: boolean }[];
}

export const researchLinkGroups: ResearchLinkGroup[] = [
  {
    title: 'Collaborate',
    links: [
      { label: 'Research Protocols', href: '/research/protocols' },
      { label: 'Ethics Review Process', href: '/research/ethics' },
      { label: 'Active Projects', href: '/research#projects' },
      { label: 'Propose a Project →', href: '/research/propose', cta: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Protocol Templates', href: '/research/protocols#templates' },
      { label: 'Researcher Guidelines', href: '/files/research-guidelines.pdf', download: true },
      { label: 'Data Management', href: '/research/protocols#data-management' },
    ],
  },
  {
    title: 'Collaboration Domains',
    links: [
      { label: 'Academic institutions & universities', href: '/collaborate' },
      { label: 'County and national health agencies', href: '/collaborate' },
      { label: 'Development partners & NGOs', href: '/collaborate' },
      { label: 'Faith-based health networks', href: '/collaborate' },
    ],
  },
];