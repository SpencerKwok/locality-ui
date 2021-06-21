import { ETSY_API_KEY } from "lib/env";
import SumoLogic from "lib/api/sumologic";

import type { NextApiRequest, NextApiResponse } from "next";
import type { DepartmentsResponse } from "common/Schema";

type Tree = Array<{ name: string; children: Tree }>;
const helper = (tree: Tree) => {
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

async function init() {
  return await fetch(
    `http://openapi.etsy.com/v2/taxonomy/seller/get?api_key=${ETSY_API_KEY}`
  )
    .then((data) => data.json())
    .then((tree) => helper(tree.results));
}

let departments: Array<string> = [];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    SumoLogic.log({
      level: "info",
      method: "departments/get",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be GET method" });
    return;
  }

  if (!departments || departments.length <= 0) {
    try {
      departments = await init();
    } catch (err) {
      SumoLogic.log({
        level: "error",
        method: "departments/get",
        message: `Failed to fetch Etsy taxonomy: ${err.message}`,
      });
    }
  }

  const body: DepartmentsResponse = { departments };
  res.status(200).json(body);
}
