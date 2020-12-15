const algoliasearch = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_ID || "",
  process.env.ALGOLIA_ADMIN_KEY || ""
);
const index = client.initIndex(process.env.ALGOLIA_INDEX || "");

exports.saveObjects = async (objects) => {
  try {
    await index
      .saveObjects(objects, {
        autoGenerateObjectIDIfNotExist: true,
      })
      .then(({ objectIDs }) => {
        console.log(`Successfully added objects with IDs: ${objectIDs}`);
      });
  } catch (err) {
    console.log(err);
  }
};
