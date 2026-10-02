export interface Step {
  number: string;
  title: string;
  description: string;
  timing: string;
  tone: 'primary' | 'success';
}

export const steps: Step[] = [
  {
    number: '1',
    title: 'Submit Application',
    description: 'Complete our online form with your academic details and preferred rotation dates.',
    timing: 'Takes 15 minutes',
    tone: 'primary',
  },
  {
    number: '2',
    title: 'HR Verification',
    description: 'We confirm your academic status and check placement availability.',
    timing: '3–5 working days',
    tone: 'primary',
  },
  {
    number: '3',
    title: 'Preceptor Match',
    description: 'We assign you a certified clinical mentor in your chosen department.',
    timing: '1–2 weeks before start',
    tone: 'primary',
  },
  {
    number: '4',
    title: 'Clinical Rotation',
    description: 'Begin hands-on training with real patients and clinical teams.',
    timing: '6–12 weeks',
    tone: 'primary',
  },
  {
    number: '5',
    title: 'Certification',
    description: 'Receive certificate of completion and detailed evaluation feedback.',
    timing: '',
    tone: 'success',
  },
];