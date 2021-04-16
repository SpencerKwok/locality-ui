import algoliasearch from "algoliasearch";
const client = algoliasearch(
  process.env.ALGOLIA_ID || "",
  process.env.ALGOLIA_ADMIN_KEY || ""
);
const index = client.initIndex(process.env.ALGOLIA_INDEX || "");

const algoliaClient = {};
algoliaClient.getObject = async (objectID, options = {}) => {
  let object,
    error = null;
  await index
    .getObject(objectID, options)
    .then((res) => (object = res))
    .catch((err) => {
      console.log(err);
      error = {
        code: 500,
        message: err.message,
      };
    });
  return [object, error];
};

algoliaClient.getObjects = async (objectIDs, options = {}) => {
  let objects,
    error = null;
  await index
    .getObjects(objectIDs, options)
    .then(({ results }) => (objects = results))
    .catch((err) => {
      console.log(err);
      error = {
        code: 500,
        message: err.message,
      };
    });
  return [objects, error];
};

algoliaClient.partialUpdateObject = async (object, options = {}) => {
  let error = null;
  await index.partialUpdateObject(object, options).catch((err) => {
    console.log(err);
    error = {
      code: 500,
      message: err.message,
    };
  });
  return error;
};

algoliaClient.saveObject = async (object, options = {}) => {
  let error = null;
  await index.saveObject(object, options).catch((err) => {
    console.log(err);
    error = {
      code: 500,
      message: err.message,
    };
  });
  return error;
};

algoliaClient.saveObjects = async (objects, options = {}) => {
  let error = null;
  await index.saveObjects(objects, options).catch((err) => {
    console.log(err);
    error = {
      code: 500,
      message: err.message,
    };
  });
  return error;
};

algoliaClient.deleteObjects = async (objectIDs) => {
  let error = null;
  await index.deleteObjects(objectIDs).catch((err) => {
    console.log(err);
    error = {
      code: 500,
      message: err.message,
    };
  });
  return error;
};

algoliaClient.search = async (query, options = {}) => {
  let error = null;
  let results = {};
  await index
    .search(query, options)
    .then((res) => {
      results = {
        facets: res.facets,
        hits: res.hits,
        nbHits: res.nbHits,
      };
    })
    .catch((err) => {
      console.log(err);
      error = {
        code: 500,
        message: err.message,
      };
    });
  return [results, error];
};

export default algoliaClient;
