export type PhaseTone = 'blue' | 'emerald';

export interface Phase {
  number: string;       // "1" | "2" | "3"
  label: string;        // "Phase 1"
  period: string;       // "2026–2027"
  title: string;
  image: { src: string; alt: string };
  tone: PhaseTone;
  featured?: boolean;   // highlights the peak phase
  badge?: string;       // small pill on the image
  points: string[];
}

export const phases: Phase[] = [
  {
    number: '1',
    label: 'Phase 1',
    period: '2026–2027',
    title: 'Stabilization',
    image: {
      src: '/img/phases/stabilization.jpg',
      alt: 'Emergency triage and stabilization services at SPMH',
    },
    tone: 'blue',
    points: [
      'Emergency triage strengthened; MNCAH services stabilized',
      'Critical clinical cadres recruited; CPD framework operational',
      'EMR baseline deployed; CT scanner installed',
      'ICU readiness established; IPC systems strengthened',
      'Board restructuring; ethics & risk systems operationalized',
    ],
  },
  {
    number: '2',
    label: 'Phase 2',
    period: '2028–2029',
    title: 'Expansion',
    image: {
      src: '/img/phases/expansion.jpg',
      alt: 'Expansion of critical care and diagnostic infrastructure at SPMH',
    },
    tone: 'blue',
    featured: true,
    badge: 'Peak Phase',
    points: [
      'Dialysis unit operational; NICU established',
      'Theatre expansion; advanced diagnostics (MRI) online',
      'Specialist recruitment scaled; leadership pipeline launched',
      'Full EMR integration hospital-wide; telemedicine scaled',
      'PPP investments activated; donor diversification',
    ],
  },
  {
    number: '3',
    label: 'Phase 3',
    period: '2030',
    title: 'Consolidation & Excellence',
    image: {
      src: '/img/phases/consolidation.jpg',
      alt: 'SPMH 2030 vision — accredited Level 5 teaching hospital',
    },
    tone: 'emerald',
    points: [
      'Full Level 5 readiness and accreditation compliance',
      'Accredited internship training hospital status',
      'Fully integrated digital hospital ecosystem',
      'Leadership succession institutionalized',
      'Population health impact demonstrated across catchment',
    ],
  },
];