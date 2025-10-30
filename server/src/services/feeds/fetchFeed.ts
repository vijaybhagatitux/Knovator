import { env } from '../../config/env.js';
import { parseXmlToItems } from './parse.js';

export async function fetchFeedToItems(url: string) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), env.FETCH_TIMEOUT_MS);
  const res = await fetch(url, { signal: ctl.signal });
  clearTimeout(t);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const xml = await res.text();
  return parseXmlToItems(xml);
}
