const algoliasearch = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_ID || "",
  process.env.ALGOLIA_ADMIN_KEY || ""
);
const index = client.initIndex(process.env.ALGOLIA_INDEX || "");

exports.getObject = async (objectId) => {
  let result = null;
  await index
    .getObject(objectId)
    .then((res) => (result = res))
    .catch((err) => console.log(err));
  return result;
};

exports.partialUpdateObject = async (object, options) => {
  await index
    .partialUpdateObject(object, options)
    .catch((err) => console.log(err));
};

exports.saveObject = async (object, options) => {
  await index.saveObject(object, options).catch((err) => console.log(err));
};

exports.deleteObject = async (objectID) => {
  await index.deleteObject(objectID).catch((err) => console.log(err));
};

exports.search = async (query, parameters) => {
  let results = [];
  await index
    .search(query, parameters)
    .then((res) => {
      results = res;
    })
    .catch((err) => console.log(err));
  return results;
};
