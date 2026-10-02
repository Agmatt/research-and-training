/**
 * Composer — one import, one array, one @graph.
 * index.astro calls landingSchema() and hands the result to BaseHead.
 */
import { organizationSchema, websiteSchema } from './organization';
import { buildWebPage } from './webpage';
import { programsSchema } from './programs';
import { researchProgram } from './research';
import { faqSchema } from './faq';
import type { JsonLd } from '../../../lib/seo';

const landingBreadcrumbs = {
  '@type': 'BreadcrumbList',
  itemListElement: [],
};

export interface LandingSchemaInput {
  title: string;
  description: string;
}

export function landingSchema({ title, description }: LandingSchemaInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      websiteSchema,
      buildWebPage({ title, description }),
      landingBreadcrumbs,
      ...programsSchema,
      researchProgram,
      faqSchema,
    ],
  };
}