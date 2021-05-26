import { ETSY_API_KEY } from "../../../lib/env";

function helper(tree) {
  if (tree.length === 0) {
    return [];
  }

  let departments = [];
  tree.forEach(({ name, children }) => {
    departments.push(name);
    departments = [...departments, ...helper(children)];
  });

  return [...new Set(departments)].sort();
}

async function init() {
  return await fetch(
    `http://openapi.etsy.com/v2/taxonomy/seller/get?api_key=${ETSY_API_KEY}`
  )
    .then((data) => data.json())
    .then((tree) => helper(tree.results));
}

let departments = null;
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  if (!departments) {
    departments = await init();
  }

  res.status(200).json({ departments });
}
