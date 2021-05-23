import { camelCase, mapKeys } from "lodash";

import AlgoliaSearch from "algoliasearch";
const client = AlgoliaSearch(
  process.env.ALGOLIASEARCH_APPLICATION_ID || "",
  process.env.ALGOLIASEARCH_API_KEY || ""
);
const index = client.initIndex(process.env.ALGOLIASEARCH_INDEX || "");

const algoliaClient: { [key: string]: any } = {};

algoliaClient.getObject = async (objectID: string, options = {}) => {
  let object,
    error = null;
  await index
    .getObject(objectID, options)
    .then((res) => (object = res))
    .catch((err) => {
      console.log(err);
      error = err.message;
    });
  return [object, error];
};

algoliaClient.getObjects = async (
  objectIDs: readonly string[],
  options = {}
) => {
  let objects,
    error = null;
  await index
    .getObjects(objectIDs, options)
    .then(({ results }) => (objects = results))
    .catch((err) => {
      console.log(err);
      error = err.message;
    });
  return [objects, error];
};

algoliaClient.partialUpdateObject = async (
  object: Record<string, any>,
  options = {}
) => {
  let error = null;
  await index.partialUpdateObject(object, options).catch((err) => {
    console.log(err);
    error = err.message;
  });
  return error;
};

algoliaClient.saveObject = async (
  object: Readonly<Record<string, any>>,
  options = {}
) => {
  let error = null;
  await index.saveObject(object, options).catch((err) => {
    console.log(err);
    error = err.message;
  });
  return error;
};

algoliaClient.saveObjects = async (
  objects: Readonly<Record<string, any>>[],
  options = {}
) => {
  let error = null;
  await index.saveObjects(objects, options).catch((err) => {
    console.log(err);
    error = err.message;
  });
  return error;
};

algoliaClient.deleteObjects = async (objectIDs: readonly string[]) => {
  let error = null;
  await index.deleteObjects(objectIDs).catch((err) => {
    console.log(err);
    error = err.message;
  });
  return error;
};

algoliaClient.search = async (query: string, options = {}) => {
  let error = null;
  let results = {};
  await index
    .search(query, options)
    .then((res) => {
      results = {
        facets: res.facets,
        hits: res.hits.map((hit) => ({
          ...mapKeys(hit, (v, k) => camelCase(k)),
        })),
        nbHits: res.nbHits,
      };
    })
    .catch((err) => {
      console.log(err);
      error = err.message;
    });
  return [results, error];
};

export default algoliaClient;
