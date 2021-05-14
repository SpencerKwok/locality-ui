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

let departments = [];
fetch(
  `http://openapi.etsy.com/v2/taxonomy/seller/get?api_key=${process.env.ETSY_API_KEY}`
)
  .then((data) => data.json())
  .then((tree) => {
    departments = helper(tree.results);
  });

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  res.status(200).json({ departments });
}
