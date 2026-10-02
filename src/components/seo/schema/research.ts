import { SITE } from '../../../data/site';
import { SCHEMA_IDS, type JsonLd } from '../../../lib/seo';

export const researchProgram: JsonLd = {
  '@type': 'ResearchProject',
  '@id': SCHEMA_IDS.research,
  name: 'SPMH Health Research Collaboration Programme',
  description:
    "Collaborative health research at St. Paul's Mission Hospital across four Key Result Areas: community health, epidemiology, quality improvement, and maternal & child health.",
  parentOrganization: { '@id': SCHEMA_IDS.organization },
  url: `${SITE.url}${SITE.paths.research}`,
};