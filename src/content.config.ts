import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cme = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cme' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    time: z.string(),                     // e.g. "08:30 – 12:30 EAT"
    location: z.string(),
    format: z.enum(['In-person', 'Hybrid', 'Online']),
    category: z.enum([
      'Emergency & Trauma',
      'Maternal & Newborn',
      'NCD Management',
      'Infection Prevention',
      'Digital Health',
      'Ethics & Professionalism',
      'Other',
    ]),
    credits: z.string().optional(),       // e.g. "4 CPD credits"
    audience: z.array(z.string()).default([]),
    facilitator: z.string().optional(),
    registrationOpen: z.boolean().default(true),
    description: z.string(),
  }),
});

export const collections = { cme };