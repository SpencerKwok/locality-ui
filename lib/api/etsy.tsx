import { ETSY_API_KEY } from "lib/env";

export type Tree = Array<{ name: string; children: Tree }>;
const helper = (tree: Tree): Array<string> => {
  if (tree.length === 0) {
    return [];
  }
  let departments = Array<string>();
  tree.forEach(({ name, children }) => {
    departments.push(name);
    departments = [...departments, ...helper(children)];
  });
  return Array.from(new Set(departments)).sort();
};

const etsyClient: {
  getTaxonomy: () => Promise<Array<string>>;
} = {
  getTaxonomy: async () => {
    let result = Array<string>();
    await fetch(
      `http://openapi.etsy.com/v2/taxonomy/seller/get?api_key=${ETSY_API_KEY}`
    )
      .then(async (data) => data.json() as Promise<{ results: Tree }>)
      .then((tree) => {
        result = helper(tree.results);
      })
      .catch((err) => {
        console.log(err);
      });
    return result;
  },
};

export default etsyClient;
