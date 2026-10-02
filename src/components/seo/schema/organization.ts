import { SITE } from '../../../data/site';
import { SCHEMA_IDS, type JsonLd } from '../../../lib/seo';

export const organizationSchema: JsonLd = {
  '@type': ['MedicalOrganization', 'EducationalOrganization'],
  '@id': SCHEMA_IDS.organization,
  name: SITE.mainSite.name,
  alternateName: [
    'SPMH',
    'SPMH Homa Bay',
    "St. Paul's Mission Hospital Homa Bay",
  ],
  url: SITE.mainSite.url,
  logo: `${SITE.mainSite.url}/logos/logo.png`,
  description:
    'A faith-based Level 4 mission hospital under the Catholic Diocese of Homa Bay, providing integrated and compassionate healthcare, clinical training, and health research in Homa Bay County, Kenya.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.poBox,
    addressLocality: SITE.address.town,
    addressRegion: SITE.address.region,
    addressCountry: SITE.address.countryCode,
  },
  email: SITE.emails.general,
  parentOrganization: {
    '@type': 'Organization',
    name: SITE.diocese.name,
    url: SITE.diocese.url,
  },
  memberOf: [
    { '@type': 'Organization', name: 'Christian Health Association of Kenya (CHAK)' },
    { '@type': 'Organization', name: 'Catholic Health Commission of Kenya' },
  ],
  medicalSpecialty: ['Obstetric', 'Pediatric', 'Surgical', 'Emergency', 'CommunityHealth'],
  sameAs: [
    SITE.socials.facebook,
    SITE.socials.x,
    SITE.socials.tiktok,
    SITE.socials.linkedin,
  ],
};

export const websiteSchema: JsonLd = {
  '@type': 'WebSite',
  '@id': SCHEMA_IDS.website,
  url: SITE.mainSite.url,
  name: SITE.mainSite.name,
  publisher: { '@id': SCHEMA_IDS.organization },
  inLanguage: 'en-KE',
};