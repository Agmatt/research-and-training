/**
 * SEO helpers — constants and utilities shared by all schema builders.
 */
import { SITE } from '../data/site';

export const SCHEMA_IDS = {
  organization: 'https://spmh.co.ke/#organization',
  website:      'https://spmh.co.ke/#website',

  /* Subdomain-scoped IDs */
  webpage:      `${SITE.url}/#webpage`,
  breadcrumb:   `${SITE.url}/#breadcrumb`,
  clinical:     `${SITE.url}/#clinical-training`,
  internship:   `${SITE.url}/#internship`,
  cme:          `${SITE.url}/#cme`,
  research:     `${SITE.url}/#research`,
  faq:          `${SITE.url}/#faq`,
} as const;

/* Update when the landing page copy materially changes. */
export const LAST_MODIFIED = '2026-10-02';

export type JsonLd = Record<string, unknown>;