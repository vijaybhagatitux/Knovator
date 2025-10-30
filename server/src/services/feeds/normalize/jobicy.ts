import crypto from 'crypto';

const stableId = (guid: any, link?: string) => {
  const g = typeof guid === 'object' && guid?.['#text'] ? guid['#text'] : guid;
  if (g && String(g).trim()) return String(g).trim();
  return crypto.createHash('sha1').update(link || '').digest('hex');
};

const pickHtml = (item: any) =>
  typeof item['content:encoded'] === 'string' && item['content:encoded'].trim()
    ? item['content:encoded']
    : (typeof item.description === 'string' ? item.description : '');

const toDate = (s?: string) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export function normalizeJobicy(item: any, sourceUrl: string) {
  const url = item.link ?? '';
  return {
    source: 'jobicy',
    sourceUrl,
    externalId: stableId(item.guid, url),
    title: item.title ?? '',
    company: item['job_listing:company'] ?? item.company ?? '',
    location: item['job_listing:location'] ?? '',
    type: item['job_listing:job_type'] ?? '',
    description: pickHtml(item),
    salary: '',
    url,
    publishedAt: toDate(item.pubDate),
    raw: item
  };
}
