import crypto from 'crypto';

const stableId = (guid: any, link?: string) => {
  const g = typeof guid === 'object' && guid?.['#text'] ? guid['#text'] : guid;
  if (g && String(g).trim()) return String(g).trim();
  return crypto.createHash('sha1').update(link || '').digest('hex');
};

const toDate = (s?: string) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export function normalizeHigherEd(item: any, sourceUrl: string) {
  // HigherEdJobs RSS is fairly standard; fields may vary
  const url = item.link ?? '';
  return {
    source: 'higheredjobs',
    sourceUrl,
    externalId: stableId(item.guid, url),
    title: item.title ?? '',
    company: item.author ?? item['dc:creator'] ?? '',
    location: Array.isArray(item.category) ? item.category.join(', ') : (item.category || ''),
    type: '',
    description: item.description ?? '',
    salary: '',
    url,
    publishedAt: toDate(item.pubDate),
    raw: item
  };
}
