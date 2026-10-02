import { SCHEMA_IDS, type JsonLd } from '../../../lib/seo';

export interface FaqEntry {
  q: string;
  a: string;
}

/**
 * Single source of truth for FAQ content.
 * FAQ.astro and faqSchema both read from this array.
 */
export const landingFaq: FaqEntry[] = [
  {
    q: 'What is the duration of clinical attachment at SPMH?',
    a: "Clinical attachments at St. Paul's Mission Hospital range from 6 to 12 weeks, depending on your academic programme's requirements. Nursing attachments are typically 6 to 12 weeks, while laboratory, pharmacy, and outpatient rotations can be arranged for 4 to 12 weeks. Exact durations are confirmed during HR verification.",
  },
  {
    q: 'What documents are required for clinical attachment application?',
    a: 'You will need a current letter from your academic institution, a copy of your student ID, your national ID or passport, proof of medical insurance, and a completed SPMH attachment application form. International applicants should also provide a valid visa or work permit where applicable.',
  },
  {
    q: 'Does SPMH offer medical internship placements?',
    a: 'SPMH offers structured internship placements for clinical officers, nurses, and selected allied health cadres. Medical officer internship placements form part of our Level 5 teaching hospital pathway and will expand as our accredited internship training capacity is established between 2028 and 2030.',
  },
  {
    q: 'What research areas does SPMH collaborate on?',
    a: 'SPMH collaborates on research in community health, epidemiology, quality improvement, and maternal and child health. We welcome proposals aligned to our four Key Result Areas and require ethical review through our Research Ethics Committee before commencement.',
  },
  {
    q: 'Is SPMH an accredited internship training hospital?',
    a: 'SPMH is a Level 4 mission hospital currently on a phased pathway to Level 5 teaching hospital accreditation by 2030. We host structured attachments and selected internship placements, and are building the infrastructure, faculty, and accreditation required for full internship training hospital status.',
  },
  {
    q: 'How long does the clinical attachment application process take?',
    a: 'The application takes about 15 minutes to complete online. HR verification takes 3 to 5 working days, and preceptor matching is confirmed 1 to 2 weeks before your start date. Total turnaround from submission to confirmed placement is typically 2 to 3 weeks.',
  },
  {
    q: 'Can international students apply for clinical attachment at SPMH?',
    a: 'Yes. SPMH welcomes international students for clinical attachments, provided they meet Kenyan immigration requirements and provide proof of medical insurance. International placements are arranged through our institutional partnership pathway and typically require 4 to 8 weeks of lead time.',
  },
];

export const faqSchema: JsonLd = {
  '@type': 'FAQPage',
  '@id': SCHEMA_IDS.faq,
  mainEntity: landingFaq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};