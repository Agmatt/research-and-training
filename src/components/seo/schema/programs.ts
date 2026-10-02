import { SITE } from '../../../data/site';
import { SCHEMA_IDS, type JsonLd } from '../../../lib/seo';

export const clinicalTrainingProgram: JsonLd = {
  '@type': 'EducationalOccupationalProgram',
  '@id': SCHEMA_IDS.clinical,
  name: 'Clinical Training & Attachment Programme',
  description:
    "Structured clinical rotations across nursing, laboratory, pharmacy, and outpatient departments under certified preceptors at St. Paul's Mission Hospital, Homa Bay.",
  provider: { '@id': SCHEMA_IDS.organization },
  educationalCredentialAwarded: 'Certificate of Clinical Attachment Completion',
  timeToComplete: 'P6W',
  programType: 'ClinicalAttachment',
  occupationalCategory: [
    'Nursing',
    'Medical Laboratory',
    'Pharmacy',
    'Clinical Medicine',
  ],
  url: `${SITE.url}${SITE.paths.applyClinical}`,
};

export const internshipProgram: JsonLd = {
  '@type': 'EducationalOccupationalProgram',
  '@id': SCHEMA_IDS.internship,
  name: 'Internship Programme',
  description:
    "Structured internship placements for clinical officers, nurses, and selected allied health cadres, forming part of SPMH's Level 5 teaching hospital pathway.",
  provider: { '@id': SCHEMA_IDS.organization },
  timeToComplete: 'P12M',
  programType: 'Internship',
  url: `${SITE.url}${SITE.paths.applyIntern}`,
};

export const cmeProgram: JsonLd = {
  '@type': 'EducationalOccupationalProgram',
  '@id': SCHEMA_IDS.cme,
  name: 'Continuing Medical Education (CME) Programme',
  description:
    'Modular CME sessions, case-based teaching, and faculty exchange collaboration for practising health professionals in Western Kenya.',
  provider: { '@id': SCHEMA_IDS.organization },
  educationalCredentialAwarded: 'CPD Credits',
  programType: 'ContinuingEducation',
  url: `${SITE.url}${SITE.paths.teachCme}`,
};

export const programsSchema: JsonLd[] = [
  clinicalTrainingProgram,
  internshipProgram,
  cmeProgram,
];