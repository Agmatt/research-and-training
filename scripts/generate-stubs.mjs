#!/usr/bin/env node
/**
 * generate-stubs.mjs
 * Creates stub Astro pages for every route linked from the navbar.
 * Safe to re-run: skips files that already exist unless --force is passed.
 *
 * Usage:
 *   node scripts/generate-stubs.mjs
 *   node scripts/generate-stubs.mjs --force
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PAGES_DIR = join(ROOT, 'src', 'pages');
const force = process.argv.includes('--force');

/* ============================================================
   PAGE DEFINITIONS
   Each entry produces one .astro file.
   `title` and `description` are used for SEO + visible header.
   `parent` (optional) adds a breadcrumb level.
   ============================================================ */
const pages = [
  /* ---------- APPLY ---------- */
  {
    path: 'apply/index',
    title: 'Apply — Clinical Training, Internship & Community Health',
    description:
      "Apply for clinical attachment, internship, or community health training at St. Paul's Mission Hospital, Homa Bay. Structured programmes for students and health professionals.",
    section: 'Apply',
  },
  {
    path: 'apply/clinical',
    title: 'Clinical Training & Attachment',
    description:
      'Structured clinical rotations across nursing, laboratory, pharmacy, and outpatient departments at SPMH Homa Bay.',
    section: 'Apply',
    parent: { label: 'Apply', href: '/apply' },
  },
  {
    path: 'apply/internship',
    title: 'Internship Programme',
    description:
      'Structured internship placements for clinical officers, nurses, and selected allied health cadres at SPMH Homa Bay.',
    section: 'Apply',
    parent: { label: 'Apply', href: '/apply' },
  },
  {
    path: 'apply/community-health',
    title: 'Community Health Training',
    description:
      'Field-based community health training with CHP-led systems across Homa Bay County.',
    section: 'Apply',
    parent: { label: 'Apply', href: '/apply' },
  },
  {
    path: 'apply/form',
    title: 'Apply — Online Application Form',
    description:
      'Submit your clinical attachment or internship application online. Response within 3–5 working days.',
    section: 'Apply',
    parent: { label: 'Apply', href: '/apply' },
  },

  /* ---------- COLLABORATE ---------- */
  {
    path: 'collaborate/index',
    title: 'Collaborate — Partnerships & Institutional Engagement',
    description:
      'Build sustainable partnerships with SPMH — student pipelines, joint research, faculty exchange, and formal MOUs.',
    section: 'Collaborate',
  },
  {
    path: 'collaborate/inquiry',
    title: 'Partnership Inquiry',
    description:
      'Tell us about your institution and partnership interests. We respond within 48 hours.',
    section: 'Collaborate',
    parent: { label: 'Collaborate', href: '/collaborate' },
  },
  {
    path: 'collaborate/mou',
    title: 'MOU Process & Template',
    description:
      'Formal memorandum of understanding framework for academic and institutional partnerships with SPMH.',
    section: 'Collaborate',
    parent: { label: 'Collaborate', href: '/collaborate' },
  },
  {
    path: 'collaborate/directory',
    title: 'Partner Directory',
    description:
      "Academic, health system, and development partners working with St. Paul's Mission Hospital.",
    section: 'Collaborate',
    parent: { label: 'Collaborate', href: '/collaborate' },
  },

  /* ---------- RESEARCH ---------- */
  {
    path: 'research/index',
    title: 'Research at SPMH — Collaboration & Ethics',
    description:
      'Collaborative health research across four Key Result Areas: community health, epidemiology, quality improvement, and maternal & child health.',
    section: 'Research',
  },
  {
    path: 'research/areas',
    title: 'Research Areas — Our Four KRAs',
    description:
      'Community health, epidemiology, quality improvement, and maternal & child health — the four Key Result Areas guiding research at SPMH.',
    section: 'Research',
    parent: { label: 'Research', href: '/research' },
  },
  {
    path: 'research/protocols',
    title: 'Research Protocols & Templates',
    description:
      'Protocol templates, data management guidance, and study design resources for researchers collaborating with SPMH.',
    section: 'Research',
    parent: { label: 'Research', href: '/research' },
  },
  {
    path: 'research/ethics',
    title: 'Ethics Review Process',
    description:
      'How to submit a research proposal to the SPMH Research Ethics Committee, and what to expect during review.',
    section: 'Research',
    parent: { label: 'Research', href: '/research' },
  },
  {
    path: 'research/propose',
    title: 'Propose a Research Project',
    description:
      "Submit a research proposal aligned with SPMH's Key Result Areas and mission. Ethics review and collaboration framework included.",
    section: 'Research',
    parent: { label: 'Research', href: '/research' },
  },

  /* ---------- TEACH ---------- */
  {
    path: 'teach/index',
    title: 'Teach — CME, Faculty & Teaching Resources',
    description:
      "Continuing medical education, faculty development, and teaching resources at St. Paul's Mission Hospital.",
    section: 'Teach',
  },
  {
    path: 'teach/cme',
    title: 'Continuing Medical Education (CME)',
    description:
      'Modular CME sessions, CPD credits, case-based teaching, and clinical updates for practising health professionals in Western Kenya.',
    section: 'Teach',
    parent: { label: 'Teach', href: '/teach' },
  },
  {
    path: 'teach/faculty-directory',
    title: 'Faculty & Preceptors Directory',
    description:
      'Certified clinical preceptors and faculty who supervise attachments and internships at SPMH.',
    section: 'Teach',
    parent: { label: 'Teach', href: '/teach' },
  },
  {
    path: 'teach/resources',
    title: 'Teaching Resources',
    description:
      'Preceptor handbook, teaching materials, and structured learning resources for clinical educators at SPMH.',
    section: 'Teach',
    parent: { label: 'Teach', href: '/teach' },
  },

  /* ---------- LEVEL 5 ---------- */
  {
    path: 'level-5/index',
    title: 'Level 5 Pathway — Vision, Roadmap & Accreditation',
    description:
      "How St. Paul's Mission Hospital is advancing toward Level 5 teaching hospital accreditation by 2030.",
    section: 'Level 5',
  },
  {
    path: 'level-5/vision',
    title: '2030 Vision',
    description:
      "The 2030 vision, mission, and strategic pillars guiding SPMH's transformation into a Level 5 teaching hospital.",
    section: 'Level 5',
    parent: { label: 'Level 5', href: '/level-5' },
  },
  {
    path: 'level-5/roadmap',
    title: 'Strategic Roadmap 2026–2030',
    description:
      'Phased roadmap: Stabilization (2026–27), Expansion (2028–29), Consolidation & Excellence (2030).',
    section: 'Level 5',
    parent: { label: 'Level 5', href: '/level-5' },
  },
  {
    path: 'level-5/facilities',
    title: 'Facilities & Infrastructure',
    description:
      'Current clinical infrastructure and planned expansion — ICU/HDU, theatres, diagnostics, and digital systems.',
    section: 'Level 5',
    parent: { label: 'Level 5', href: '/level-5' },
  },
  {
    path: 'level-5/accreditation',
    title: 'MoH & KMPDC Accreditation Standards',
    description:
      "How SPMH is aligning to Kenya's Ministry of Health and KMPDC standards for Level 5 teaching hospital accreditation.",
    section: 'Level 5',
    parent: { label: 'Level 5', href: '/level-5' },
  },
  {
    path: 'level-5/metrics',
    title: 'Impact Metrics',
    description:
      'Honest, phased metrics on the pathway toward Level 5 teaching hospital accreditation.',
    section: 'Level 5',
    parent: { label: 'Level 5', href: '/level-5' },
  },

  /* ---------- RESOURCES + FAQ ---------- */
  {
    path: 'resources',
    title: 'Resources & Downloads',
    description:
      'Internship manual, preceptor handbook, MOU template, research guidelines, and all SPMH downloads.',
    section: 'Resources',
  },
  {
    path: 'faq',
    title: 'Frequently Asked Questions',
    description:
      'Common questions about clinical attachment, internship, research collaboration, and partnerships at SPMH.',
    section: 'FAQ',
  },
];

/* ============================================================
   TEMPLATE
   ============================================================ */
function stubTemplate(p) {
  // Depth: how many folders deep the page is under src/pages/
  //   'resources'        → 1 segment → prefix '../'
  //   'apply/index'      → 2 segments → prefix '../../'
  //   'level-5/roadmap'  → 2 segments → prefix '../../'
  const segments = p.path.split('/').length;
  const prefix = '../'.repeat(segments);

  // Canonical route — strip '/index' so 'apply/index' becomes '/apply'
  const routePath = '/' + p.path.replace(/\/index$/, '');

  // Section landing path — e.g. 'Level 5' → '/level-5'
  const sectionPath = '/' + p.section.toLowerCase().replace(/\s+/g, '-');

  // Breadcrumb chain: Home → T&R → Section. No parent crumb (section IS the parent).
  const crumbItems = [
    "{ name: 'Home', item: `${SITE.mainSite.url}/` }",
    "{ name: 'Training & Research', item: `${SITE.url}/` }",
    `{ name: ${JSON.stringify(p.section)}, item: \`\${SITE.url}${sectionPath}\` }`,
  ];

  return `---
import LandingLayout from '${prefix}layouts/LandingLayout.astro';
import BaseHead from '${prefix}components/seo/BaseHead.astro';
import { buildWebPage } from '${prefix}components/seo/schemas/webpage';
import { buildBreadcrumbs } from '${prefix}components/seo/schemas/breadcrumbs';
import { SITE } from '${prefix}data/site';

const title = ${JSON.stringify(p.title)};
const description = ${JSON.stringify(p.description)};
const path = ${JSON.stringify(routePath)};
const canonical = \`\${SITE.url}\${path}\`;

const breadcrumbCrumbs = [
  ${crumbItems.join(',\n  ')},
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    buildWebPage({ title, description, path }),
    buildBreadcrumbs(breadcrumbCrumbs),
  ],
};
---

<LandingLayout currentPage="${p.section}">
  <BaseHead
    slot="head"
    title={title}
    description={description}
    canonical={canonical}
    jsonLd={schema}
    noindex={true}
  />

  <section class="relative bg-slate-50 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <nav aria-label="Breadcrumb" class="text-xs uppercase tracking-wider text-slate-500 mb-6">
        <ol class="flex flex-wrap items-center gap-2">
          {breadcrumbCrumbs.map((crumb, i) => (
            <li class="flex items-center gap-2">
              {i === breadcrumbCrumbs.length - 1 ? (
                <span class="text-secondary font-semibold">{crumb.name}</span>
              ) : (
                <a
                  href={crumb.item.startsWith(SITE.url) ? crumb.item.replace(SITE.url, '') || '/' : crumb.item}
                  class="hover:text-primary transition-colors"
                >
                  {crumb.name}
                </a>
              )}
              {i < breadcrumbCrumbs.length - 1 && (
                <span aria-hidden="true" class="text-slate-300">/</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div class="max-w-3xl">
        <span class="eyebrow">${p.section}</span>
        <h1 class="mt-4 text-4xl sm:text-5xl font-bold text-secondary text-balance">
          ${p.title.split(' — ')[0]}
        </h1>
        <p class="mt-6 text-lg text-slate-600 leading-relaxed">
          ${p.description}
        </p>
      </div>
    </div>
  </section>

  <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-3xl mx-auto text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-primary mb-6">
        <i class="fas fa-hard-hat text-2xl" aria-hidden="true"></i>
      </div>
      <h2 class="text-2xl sm:text-3xl font-bold text-secondary">
        This page is being built
      </h2>
      <p class="mt-4 text-slate-600 leading-relaxed">
        We're actively building out the <strong>${p.section}</strong> section of
        this site. The content you're looking for will land here shortly.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/" class="btn-primary px-5 py-2.5">
          <i class="fas fa-arrow-left text-xs" aria-hidden="true"></i>
          Back to home
        </a>
        <a href="/faq" class="btn-secondary px-5 py-2.5">
          Check the FAQ
        </a>
      </div>

      <p class="mt-8 text-xs text-slate-400">
        Need this urgently? Email
        <a href="mailto:academics@spmh.co.ke" class="text-primary hover:underline">
          academics@spmh.co.ke
        </a>.
      </p>
    </div>
  </section>
</LandingLayout>
`;
}

/* ============================================================
   RUN
   ============================================================ */
async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  let created = 0;
  let skipped = 0;

  for (const page of pages) {
    const outPath = join(PAGES_DIR, `${page.path}.astro`);

    if (!force && (await exists(outPath))) {
      console.log(`  skip  ${page.path}.astro (exists)`);
      skipped++;
      continue;
    }

    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, stubTemplate(page), 'utf8');
    console.log(`  ✓     ${page.path}.astro`);
    created++;
  }

  console.log('');
  console.log(
    `Created ${created} stub page${created === 1 ? '' : 's'}, skipped ${skipped}.`,
  );
  console.log(`Total routes defined: ${pages.length}.`);
}

run().catch((err) => {
  console.error('generate-stubs failed:', err);
  process.exit(1);
});
