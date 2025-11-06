import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { algoliasearch } from 'algoliasearch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');
const cachePath = path.join(__dirname, '.algolia-cache.json');
const CACHE_VERSION = 1;

const appId = process.env.ALGOLIA_APP_ID ?? process.env.PUBLIC_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY ?? process.env.ALGOLIA_WRITE_API_KEY;

const indexNames = {
  ua: process.env.ALGOLIA_INDEX_UA ?? process.env.ALGOLIA_INDEX_NAME_UA ?? process.env.ALGOLIA_INDEX_NAME ?? 'posts_ua',
  ru: process.env.ALGOLIA_INDEX_RU ?? process.env.ALGOLIA_INDEX_NAME_RU ?? 'posts_ru',
  en: process.env.ALGOLIA_INDEX_EN ?? process.env.ALGOLIA_INDEX_NAME_EN ?? 'posts_en',
};

const isFullSync = process.argv.includes('--full');

if (!appId || !adminKey) {
  console.error('Algolia sync aborted: ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY must be set.');
  process.exit(1);
}

const client = algoliasearch(appId, adminKey);

const FEED_PATHS = {
  ua: path.join(distDir, 'ua', 'feed-full.json'),
  ru: path.join(distDir, 'ru', 'feed-full.json'),
  en: path.join(distDir, 'en', 'feed-full.json'),
};

const TYPE_FALLBACKS = {
  ua: {
    article: { label: 'Карти внутрішнього світу', path: '/ua/blog/type/article/' },
    note: { label: 'Іскри й проблиски', path: '/ua/blog/type/note/' },
    story: { label: 'Історії-дзеркала', path: '/ua/blog/type/story/' },
  },
  ru: {
    article: { label: 'Карты внутреннего мира', path: '/ru/blog/type/article/' },
    note: { label: 'Искры и проблески', path: '/ru/blog/type/note/' },
    story: { label: 'Истории-зеркала', path: '/ru/blog/type/story/' },
  },
  en: {
    article: { label: 'Inner World Maps', path: '/en/blog/type/article/' },
    note: { label: 'Sparks and Glimmers', path: '/en/blog/type/note/' },
    story: { label: 'Mirror Stories', path: '/en/blog/type/story/' },
  },
};

function resolveTypeMeta(locale, type) {
  const localeMap = TYPE_FALLBACKS[locale] ?? TYPE_FALLBACKS.ua;
  return localeMap[type] ?? localeMap.article;
}

async function loadCache() {
  try {
    const raw = await fs.readFile(cachePath, 'utf8');
    const data = JSON.parse(raw);
    if (data.version !== CACHE_VERSION) {
      console.warn('Algolia cache version mismatch, ignoring stored manifest.');
      return {};
    }
    return data.locales ?? {};
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Warning: unable to read Algolia cache at ${cachePath}. ${error.message}`);
    }
    return {};
  }
}

async function saveCache(localesManifest) {
  const payload = JSON.stringify(
    {
      version: CACHE_VERSION,
      locales: localesManifest,
    },
    null,
    2,
  );
  await fs.writeFile(cachePath, `${payload}\n`, 'utf8');
}

async function readFeed(locale) {
  const feedPath = FEED_PATHS[locale];
  try {
    const raw = await fs.readFile(feedPath, 'utf8');
    const data = JSON.parse(raw);
    return data.items ?? [];
  } catch (error) {
    console.warn(`Warning: unable to read feed for locale "${locale}" at ${feedPath}. ${error.message}`);
    return [];
  }
}

function mapRecord(locale, item) {
  if (item?.type === 'about') {
    return null;
  }

  const url = item.url ?? item.id;
  const slug = url ? new URL(url).pathname.replace(/\/$/, '') : item.id ?? Math.random().toString(36).slice(2);
  const rawType = typeof item.type === 'string' && item.type.trim() ? item.type.trim() : 'note';
  const normalizedType =
    rawType === 'article' || rawType === 'story' || rawType === 'note' ? rawType : 'note';
  const typeMeta = resolveTypeMeta(locale, normalizedType);
  const typeLabel =
    (typeof item.type_label === 'string' && item.type_label.trim()) || typeMeta.label;
  const typePath =
    (typeof item.type_url === 'string' && item.type_url.trim()) ||
    typeMeta.path;
  const content = item.content_text ?? '';
  const summarySnippet = typeof item.summary === 'string' && item.summary.trim().length > 0 ? item.summary.trim() : '';
  const snippetSource = summarySnippet || content;
  const snippet = snippetSource;
  return {
    objectID: `${locale}:${slug}`,
    locale,
    title: item.title ?? slug,
    url,
    description: snippet,
    snippet,
    content,
    tags: item.tags ?? [],
    publishedAt: item.date_published ?? null,
    updatedAt: item.date_modified ?? null,
    type: normalizedType,
    typeLabel,
    typeUrl: typePath,
  };
}

function createSignature(record) {
  const hash = crypto.createHash('sha256');
  hash.update(
    JSON.stringify({
      title: record.title,
      url: record.url,
      description: record.description,
      snippet: record.snippet,
      content: record.content,
      tags: record.tags,
      publishedAt: record.publishedAt,
      updatedAt: record.updatedAt,
      type: record.type,
      typeLabel: record.typeLabel,
      typeUrl: record.typeUrl,
    }),
  );
  return hash.digest('hex');
}

async function pushLocale(locale, previousManifest) {
  const items = await readFeed(locale);
  if (items.length === 0) {
    console.warn(`No feed items found for locale "${locale}". Skipping Algolia sync for this locale.`);
    return previousManifest;
  }

  const records = items
    .map((item) => mapRecord(locale, item))
    .filter((record) => record !== null);
  const indexName = indexNames[locale];
  const nextManifest = {};

  if (isFullSync) {
    console.log(`Full sync: replacing ${records.length} records in index ${indexName}...`);
    await client.replaceAllObjects({
      indexName,
      objects: records,
      autoGenerateObjectIDIfNotExist: false,
    });
    for (const record of records) {
      nextManifest[record.objectID] = {
        hash: createSignature(record),
        updatedAt: record.updatedAt ?? null,
      };
    }
    console.log(`Locale ${locale}: full sync completed for Algolia index "${indexName}".`);
    return nextManifest;
  }

  const toSave = [];
  const toDelete = [];
  let created = 0;
  let updated = 0;
  for (const record of records) {
    const signature = createSignature(record);
    nextManifest[record.objectID] = {
      hash: signature,
      updatedAt: record.updatedAt ?? null,
    };
    const previousEntry = previousManifest?.[record.objectID];
    if (!previousEntry) {
      created += 1;
      toSave.push(record);
      continue;
    }
    if (previousEntry.hash !== signature) {
      updated += 1;
      toSave.push(record);
    }
  }

  if (previousManifest) {
    for (const objectID of Object.keys(previousManifest)) {
      if (!nextManifest[objectID]) {
        toDelete.push(objectID);
      }
    }
  }

  if (toSave.length > 0) {
    await client.saveObjects({
      indexName,
      objects: toSave,
      autoGenerateObjectIDIfNotExist: false,
    });
  }

  if (toDelete.length > 0) {
    await client.deleteObjects({
      indexName,
      objectIDs: toDelete,
    });
  }

  if (toSave.length === 0 && toDelete.length === 0) {
    console.log(`Locale ${locale}: Algolia index "${indexName}" is up to date.`);
  } else {
    const ops = [
      created > 0 ? `${created} new` : null,
      updated > 0 ? `${updated} updated` : null,
      toDelete.length > 0 ? `${toDelete.length} removed` : null,
    ]
      .filter(Boolean)
      .join(', ');
    console.log(`Locale ${locale}: applied changes to Algolia index "${indexName}" (${ops}).`);
  }

  return nextManifest;
}

async function main() {
  try {
    const previousCache = await loadCache();
    const nextCache = {};
    const locales = ['ua', 'ru', 'en'];

    for (const locale of locales) {
      nextCache[locale] = await pushLocale(locale, previousCache[locale] ?? {});
    }

    await saveCache(nextCache);
    console.log(`Algolia sync complete (${isFullSync ? 'full' : 'incremental'} run).`);
  } catch (error) {
    console.error('Algolia sync failed:', error);
    process.exit(1);
  }
}

await main();
