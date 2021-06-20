import Xss from "xss";

import { addHttpsProtocol, productAdd } from "../../../../lib/api/dashboard";
import { runMiddlewareBusiness } from "../../../../lib/api/middleware";
import SumoLogic from "../../../../lib/api/sumologic";
import { ProductAddSchema } from "../../../../common/ValidationSchema";

import type {
  ProductAddRequest,
  ProductAddResponse,
} from "../../../../common/Schema";
import type { NextApiResponse } from "next";
import type { NextApiRequestWithLocals } from "../../../../lib/api/middleware";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(
  req: NextApiRequestWithLocals,
  res: NextApiResponse
) {
  await runMiddlewareBusiness(req, res);

  if (req.method !== "POST") {
    SumoLogic.log({
      level: "info",
      method: "dashboard/product/add",
      message: "Incorrect method",
    });
    res.status(400).json({ error: "Must be POST method" });
    return;
  }

  const reqBody: ProductAddRequest = req.body;
  try {
    await ProductAddSchema.validate(reqBody, { abortEarly: false });
  } catch (err) {
    SumoLogic.log({
      level: "warning",
      method: "dashboard/product/add",
      message: `Invalid payload: ${err.inner}`,
      params: { body: reqBody, error: err },
    });
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  // Already checked to be valid in ProductAddSchema and runMiddlewareBusiness
  const { id } = req.locals.user;
  const businessId: number = id === 0 ? reqBody.id : id;
  const name: string = Xss(reqBody.product.name.trim());
  const departments: Array<string> = reqBody.product.departments.map(
    (department) => Xss(department.trim())
  );
  const description: string = Xss(reqBody.product.description.trim());
  const link: string = addHttpsProtocol(Xss(reqBody.product.link.trim()));
  const priceRange: FixedLengthArray<[number, number]> =
    reqBody.product.priceRange;
  const tags: Array<string> = reqBody.product.tags.map((tag) =>
    Xss(tag.trim())
  );
  const variantImages: Array<string> = reqBody.product.variantImages.map(
    (img) => Xss(img.trim())
  );
  const variantTags: Array<string> = reqBody.product.variantTags.map((tag) =>
    Xss(tag.trim())
  );
  if (variantTags.length <= 0) {
    variantTags.push("");
  }

  const products = await productAdd(businessId, [
    {
      name,
      departments,
      description,
      link,
      priceRange,
      tags,
      variantImages,
      variantTags,
    },
  ]);
  if (!products) {
    SumoLogic.log({
      level: "error",
      method: "dashboard/product/add",
      message: "Failed to add product: Missing response",
      params: { body: reqBody },
    });
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const body: ProductAddResponse = {
    product: products[0],
  };

  res.status(200).json(body);
}
