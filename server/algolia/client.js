const algoliasearch = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_ID || "",
  process.env.ALGOLIA_ADMIN_KEY || ""
);
const index = client.initIndex(process.env.ALGOLIA_INDEX || "");

exports.getObject = async (objectID) => {
  let object,
    error = null;
  await index
    .getObject(objectID)
    .then((res) => (object = res))
    .catch((err) => {
      console.log(err);
      error = err;
    });
  return [object, error];
};

exports.partialUpdateObject = async (object, options) => {
  let error = null;
  await index.partialUpdateObject(object, options).catch((err) => {
    console.log(err);
    error = err;
  });
  return error;
};

exports.saveObject = async (object, options) => {
  let error = null;
  await index.saveObject(object, options).catch((err) => {
    console.log(err);
    error = err;
  });
  return error;
};

exports.deleteObject = async (objectID) => {
  let error = null;
  await index.deleteObject(objectID).catch((err) => {
    console.log(err);
    error = err;
  });
  return error;
};

exports.search = async (query, parameters) => {
  let hits,
    error = null;
  await index
    .search(query, parameters)
    .then((res) => (hits = res.hits))
    .catch((err) => {
      console.log(err);
      error = err;
    });
  return [hits, error];
};
