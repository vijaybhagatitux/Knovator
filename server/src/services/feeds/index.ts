import { normalizeJobicy } from './normalize/jobicy.js';
import { normalizeHigherEd } from './normalize/higheredjobs.js';

export function normalizeBySourceUrl(item: any, sourceUrl: string) {
  if (/jobicy\.com/.test(sourceUrl)) return normalizeJobicy(item, sourceUrl);
  if (/higheredjobs\.com/.test(sourceUrl)) return normalizeHigherEd(item, sourceUrl);
  // default: echo minimal
  return {
    source: 'unknown',
    sourceUrl,
    externalId: String(item.guid || item.link || Math.random()),
    title: item.title || '',
    company: item.author || '',
    location: item.category || '',
    type: '',
    description: item.description || '',
    salary: '',
    url: item.link || '',
    publishedAt: item.pubDate ? new Date(item.pubDate) : null,
    raw: item
  };
}
