const algoliasearch = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_ID || "",
  process.env.ALGOLIA_SEARCH_KEY || ""
);
const index = client.initIndex(process.env.ALGOLIA_INDEX || "");

exports.findObjects = async (query, parameters) => {
  let results = [];
  await index
    .search(query, parameters)
    .then((res) => {
      results = res;
    })
    .catch((err) => console.log(err));
  return results;
};
