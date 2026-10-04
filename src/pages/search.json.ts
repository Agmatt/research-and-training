import type { APIRoute } from 'astro';
import { searchIndex } from '../data/searchIndex';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};