import { liteClient } from 'algoliasearch/lite';

const client = liteClient('NJPHRZGPX7','4b6ad1774d05f5f066c0958bb82f1101');
const response = await client.searchSingleIndex({
  indexName: 'posts_en',
  searchParams: { query: 'story', attributesToRetrieve: ['title','locale'] }
});
console.log(response.hits.map(hit => ({ title: hit.title, locale: hit.locale })));
