import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: true,
  trimValues: true
});

export function parseXmlToItems(xml: string) {
  const json = parser.parse(xml);
  const items = json?.rss?.channel?.item ?? json?.feed?.entry ?? [];
  return Array.isArray(items) ? items : [items];
}
