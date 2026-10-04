export interface SearchEntry {
  title: string;
  href: string;
  section: string;
  description: string;
  keywords?: string[];
  icon?: string;      // FontAwesome icon name (without 'fa-')
}

export const searchIndex: SearchEntry[] = [
  /* ---------- TOP-LEVEL ---------- */
  { title: 'Home', href: '/', section: 'Main', description: 'Training & Research landing page for SPMH Homa Bay.', keywords: ['homepage', 'start', 'spmh'], icon: 'home' },
  { title: 'Apply', href: '/apply', section: 'Main', description: 'Apply for clinical attachment, internship, or community health training.', keywords: ['application', 'student', 'enrol'], icon: 'user-graduate' },
  { title: 'Collaborate', href: '/collaborate', section: 'Main', description: 'Partnership opportunities with SPMH.', keywords: ['partnership', 'mou', 'institutional'], icon: 'handshake' },
  { title: 'Research', href: '/research', section: 'Main', description: 'Research collaboration at SPMH.', keywords: ['study', 'kra', 'protocols'], icon: 'flask' },
  { title: 'Teach', href: '/teach', section: 'Main', description: 'Teaching, CME, and faculty resources.', keywords: ['cme', 'faculty', 'cpd'], icon: 'chalkboard-user' },
  { title: 'Level 5', href: '/level-5', section: 'Main', description: 'The pathway to Level 5 teaching hospital accreditation by 2030.', keywords: ['roadmap', 'accreditation', 'vision'], icon: 'graduation-cap' },
  { title: 'Resources', href: '/resources', section: 'Main', description: 'Downloads, handbooks, and templates.', keywords: ['downloads', 'pdf', 'handbook'], icon: 'book' },
  { title: 'FAQ', href: '/faq', section: 'Main', description: 'Frequently asked questions about training and research.', keywords: ['questions', 'answers', 'help'], icon: 'circle-question' },

  /* ---------- APPLY ---------- */
  { title: 'Clinical Attachment', href: '/apply/clinical', section: 'Apply → Clinical', description: '6–12 week rotations in nursing, lab, pharmacy, outpatient, and community.', keywords: ['nursing', 'pharmacy', 'lab', 'rotation', 'attachment'], icon: 'heart-pulse' },
  { title: 'Internship Programme', href: '/apply/internship', section: 'Apply → Internship', description: '12-month internship placements for clinical officers, nurses, and allied cadres.', keywords: ['intern', 'clinical officer', 'level 5'], icon: 'graduation-cap' },
  { title: 'Community Health Training', href: '/apply/community-health', section: 'Apply → Community', description: 'Field-based community health training with CHP-led systems.', keywords: ['chp', 'outreach', 'field', 'public health'], icon: 'people-group' },
  { title: 'Application Form', href: '/apply/form', section: 'Apply → Form', description: 'Online application form for all three programmes.', keywords: ['form', 'submit', 'apply'], icon: 'file-pen' },

  /* ---------- COLLABORATE ---------- */
  { title: 'Partnership Inquiry', href: '/collaborate/inquiry', section: 'Collaborate → Inquiry', description: 'Submit a partnership inquiry — response within 48 hours.', keywords: ['inquiry', 'contact', 'partner'], icon: 'envelope' },
  { title: 'MOU Framework', href: '/collaborate/mou', section: 'Collaborate → MOU', description: 'Our standard memorandum of understanding framework and process.', keywords: ['mou', 'agreement', 'template'], icon: 'file-contract' },
  { title: 'Partner Directory', href: '/collaborate/directory', section: 'Collaborate → Directory', description: 'Academic, health system, and development partners.', keywords: ['partners', 'list', 'directory'], icon: 'building' },

  /* ---------- RESEARCH ---------- */
  { title: 'Research Areas', href: '/research/areas', section: 'Research → Areas', description: 'Our four Key Result Areas: community health, epidemiology, quality, MNCAH.', keywords: ['kra', 'key result areas'], icon: 'diagram-project' },
  { title: 'Community Health KRA', href: '/research/areas#community-health', section: 'Research → Community Health', description: 'CHP-led systems, referral coordination, and continuum of care.', keywords: ['chp', 'community', 'referral'], icon: 'people-group' },
  { title: 'Epidemiology KRA', href: '/research/areas#epidemiology', section: 'Research → Epidemiology', description: 'Communicable and non-communicable disease burden and surveillance.', keywords: ['surveillance', 'disease', 'outbreak'], icon: 'virus' },
  { title: 'Quality Improvement KRA', href: '/research/areas#qi', section: 'Research → Quality', description: 'Patient safety, infection prevention, and quality standards.', keywords: ['qi', 'patient safety', 'ipc'], icon: 'chart-line' },
  { title: 'Maternal & Child Health KRA', href: '/research/areas#mncah', section: 'Research → MNCAH', description: 'Maternal, newborn, child, and adolescent health outcomes.', keywords: ['mncah', 'maternal', 'child', 'neonatal'], icon: 'baby' },
  { title: 'Research Protocols', href: '/research/protocols', section: 'Research → Protocols', description: 'Protocol templates, data management, and study design resources.', keywords: ['template', 'protocol', 'data'], icon: 'file-lines' },
  { title: 'Ethics Review Process', href: '/research/ethics', section: 'Research → Ethics', description: 'How to submit a proposal to the SPMH Research Ethics Committee.', keywords: ['ethics', 'review', 'committee', 'irb'], icon: 'clipboard-check' },
  { title: 'Propose a Research Project', href: '/research/propose', section: 'Research → Propose', description: 'Submit a research concept note aligned with our KRAs.', keywords: ['propose', 'submit', 'concept note'], icon: 'lightbulb' },

  /* ---------- TEACH ---------- */
  { title: 'CME Programme', href: '/teach/cme', section: 'Teach → CME', description: 'Modular CME sessions, CPD credits, and clinical updates.', keywords: ['cme', 'cpd', 'credits', 'training'], icon: 'chalkboard-user' },
  { title: 'CME Calendar', href: '/teach/cme/calendar', section: 'Teach → CME Calendar', description: 'Upcoming CME sessions and workshops.', keywords: ['calendar', 'schedule', 'upcoming', 'events'], icon: 'calendar' },
  { title: 'Faculty Directory', href: '/teach/faculty-directory', section: 'Teach → Faculty', description: 'Certified preceptors and clinical faculty at SPMH.', keywords: ['preceptor', 'faculty', 'supervisor'], icon: 'user-tie' },
  { title: 'Teaching Resources', href: '/teach/resources', section: 'Teach → Resources', description: 'Preceptor handbooks, teaching materials, and assessment tools.', keywords: ['handbook', 'materials', 'teaching'], icon: 'book-open' },

  /* ---------- LEVEL 5 ---------- */
  { title: '2030 Vision', href: '/level-5/vision', section: 'Level 5 → Vision', description: 'Vision, mission, core values, and six strategic pillars.', keywords: ['vision', 'mission', 'values', 'pillars'], icon: 'compass' },
  { title: 'Strategic Roadmap', href: '/level-5/roadmap', section: 'Level 5 → Roadmap', description: 'Three phases — Stabilization, Expansion, Consolidation & Excellence.', keywords: ['roadmap', 'phases', 'milestones'], icon: 'route' },
  { title: 'Facilities & Infrastructure', href: '/level-5/facilities', section: 'Level 5 → Facilities', description: 'Current infrastructure and planned expansion.', keywords: ['icu', 'theatre', 'beds', 'diagnostics'], icon: 'hospital' },
  { title: 'Accreditation', href: '/level-5/accreditation', section: 'Level 5 → Accreditation', description: 'Alignment with MoH and KMPDC Level 5 standards.', keywords: ['moh', 'kmpdc', 'accreditation', 'standards'], icon: 'clipboard-check' },
  { title: 'Impact Metrics', href: '/level-5/metrics', section: 'Level 5 → Metrics', description: 'Baseline metrics and 2030 targets for the pathway.', keywords: ['metrics', 'kpis', 'targets'], icon: 'chart-line' },

  /* ---------- LEGAL ---------- */
  { title: 'Privacy Policy', href: '/privacy', section: 'Legal', description: 'How we collect, use, and protect personal data.', keywords: ['privacy', 'data protection', 'gdpr', 'personal data'], icon: 'shield' },
  { title: 'Terms of Attachment', href: '/terms-of-attachment', section: 'Legal', description: 'Terms governing clinical attachment and internship placements.', keywords: ['terms', 'conditions', 'placement'], icon: 'file-contract' },
  { title: 'Accreditation Standards', href: '/accreditation-standards', section: 'Legal', description: 'The national standards SPMH measures its pathway against.', keywords: ['standards', 'moh', 'kmpdc'], icon: 'clipboard-check' },

  /* ---------- LANDING PAGE ANCHORS ---------- */
  { title: 'Where We\'re Going', href: '/#where-were-going', section: 'Home → Vision', description: 'Our 2030 pathway phases.', keywords: ['phases', 'vision', 'roadmap', '2030'], icon: 'route' },
  { title: 'Partnership Pathways', href: '/#pathways', section: 'Home → Pathways', description: 'Six ways to collaborate with SPMH.', keywords: ['pathways', 'clinical', 'research', 'cme', 'partnership'], icon: 'handshake' },
  { title: 'Research at SPMH', href: '/#research', section: 'Home → Research', description: 'Our research hub and four Key Result Areas.', keywords: ['research', 'kra', 'hub'], icon: 'flask' },
  { title: 'Faculty & Preceptors', href: '/#faculty', section: 'Home → Faculty', description: 'The clinicians who supervise attachments and internships.', keywords: ['faculty', 'preceptors', 'supervisors'], icon: 'user-tie' },
  { title: 'How It Works', href: '/#how-it-works', section: 'Home → Process', description: 'Five-step pathway from application to certification.', keywords: ['process', 'steps', 'how', 'apply'], icon: 'list-check' },
  { title: 'Student Application', href: '/#student-application', section: 'Home → Apply', description: 'Submit a clinical attachment or internship application.', keywords: ['apply', 'form', 'student'], icon: 'file-pen' },

  /* ---------- FAQ ITEMS ---------- */
  { title: 'What is the duration of clinical attachment?', href: '/faq', section: 'FAQ', description: 'Attachments range from 6 to 12 weeks depending on your academic programme.', keywords: ['duration', 'how long', 'weeks', 'attachment'], icon: 'circle-question' },
  { title: 'What documents are required?', href: '/faq', section: 'FAQ', description: 'Institutional letter, student ID, national ID or passport, medical insurance, application form.', keywords: ['documents', 'requirements', 'needed'], icon: 'circle-question' },
  { title: 'Does SPMH offer medical internship placements?', href: '/faq', section: 'FAQ', description: 'Yes — for clinical officers, nurses, and selected allied health cadres.', keywords: ['internship', 'medical officer', 'intern'], icon: 'circle-question' },
  { title: 'What research areas does SPMH collaborate on?', href: '/faq', section: 'FAQ', description: 'Community health, epidemiology, quality improvement, and maternal & child health.', keywords: ['research areas', 'kra', 'collaborate'], icon: 'circle-question' },
  { title: 'Is SPMH an accredited internship training hospital?', href: '/faq', section: 'FAQ', description: 'We are on a phased pathway to Level 5 accreditation by 2030.', keywords: ['accredited', 'internship hospital', 'level 5'], icon: 'circle-question' },
  { title: 'How long does the application process take?', href: '/faq', section: 'FAQ', description: 'Approximately 15 minutes to apply; 3–5 days for HR verification.', keywords: ['process', 'how long', 'timeline', 'verification'], icon: 'circle-question' },
  { title: 'Can international students apply?', href: '/faq', section: 'FAQ', description: 'Yes, subject to Kenyan immigration requirements and proof of medical insurance.', keywords: ['international', 'foreign', 'visa'], icon: 'circle-question' },
];