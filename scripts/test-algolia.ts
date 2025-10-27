import algoliasearch from 'algoliasearch/lite';

async function main() {
  const appId = 'NJPHRZGPX7';
  const apiKey = '4b6ad1774d05f5f066c0958bb82f1101';
  const client = algoliasearch(appId, apiKey);
  const index = client.initIndex('posts_en');
  const response = await index.search('story');
  console.log('hits:', response.hits.length);
  console.log(response.hits[0]);
}

main().catch(console.error);
