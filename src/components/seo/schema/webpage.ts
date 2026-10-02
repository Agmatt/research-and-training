import { SITE } from '../../../data/site';
import { SCHEMA_IDS, LAST_MODIFIED, type JsonLd } from '../../../lib/seo';

export interface WebPageOptions {
  title: string;
  description: string;
  path?: string;            // subdomain-root-relative, defaults to '/'
  type?: string;            // schema.org @type, defaults to MedicalWebPage
  primaryImage?: string;    // absolute URL
  aboutId?: string;         // override @id of `about`
}

export function buildWebPage(opts: WebPageOptions): JsonLd {
  const {
    title,
    description,
    path = '/',
    type = 'MedicalWebPage',
    primaryImage = `${SITE.url}/img/og/landing.jpg`,
    aboutId = SCHEMA_IDS.organization,
  } = opts;

  const url = `${SITE.url}${path === '/' ? '/' : path}`;

  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'en-KE',
    isPartOf: { '@id': SCHEMA_IDS.website },
    about: { '@id': aboutId },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: primaryImage,
      width: 1200,
      height: 630,
    },
    breadcrumb: { '@id': SCHEMA_IDS.breadcrumb },
    dateModified: LAST_MODIFIED,
    potentialAction: {
      '@type': 'ApplyAction',
      name: 'Apply for Clinical Attachment',
      target: `${SITE.url}${SITE.paths.applyForm}`,
    },
  };
}