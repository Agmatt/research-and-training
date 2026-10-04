import { SITE } from '../../../data/site';
import { SCHEMA_IDS, type JsonLd } from '../../../lib/seo';

export interface Crumb {
  name: string;
  item: string;
}

export function buildBreadcrumbs(crumbs: Crumb[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    '@id': SCHEMA_IDS.breadcrumb,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };
}

export const landingBreadcrumbs: JsonLd = buildBreadcrumbs([
  { name: 'Home', item: `${SITE.mainSite.url}/` },
  { name: 'Training & Research', item: `${SITE.url}/` },
]);
