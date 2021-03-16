const algoliasearch = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_ID || "",
  process.env.ALGOLIA_ADMIN_KEY || ""
);
const index = client.initIndex(process.env.ALGOLIA_INDEX || "");

exports.getObject = async (objectID, options) => {
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

exports.partialUpdateObject = async (object, options) => {
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

exports.saveObject = async (object, options) => {
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

exports.deleteObject = async (objectID) => {
  let error = null;
  await index.deleteObject(objectID).catch((err) => {
    console.log(err);
    error = {
      code: 500,
      message: err.message,
    };
  });
  return error;
};

exports.search = async (query, options) => {
  let error = null;
  let results = {};
  await index
    .search(query, options)
    .then((res) => {
      results = {
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
