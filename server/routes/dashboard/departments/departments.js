import algolia from "../../../algolia/client.js";
import psql from "../../../postgresql/client.js";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import sqlString from "sqlstring";
import xss from "xss";

const DepartmentToId = new Map([
  ["Baby", 1],
  ["Beauty & Personal Care", 2],
  ["Clothing, Shoes, & Jewellery", 3],
  ["Entertainment", 4],
  ["Electronics", 5],
  ["Everything Else/Other", 6],
  ["Food & Drinks", 7],
  ["Home & Kitchen", 8],
  ["Pet", 9],
  ["Toys & Games", 10],
]);

const router = Router();
router.post(
  "/update",
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 5 minutes
    max: 5000,
    message:
      "Too many departments update requests from this IP, please try again after 5 minutes",
  }),
  async (req, res) => {
    const f = async (companyId, departments) => {
      const [_, psqlDepartmentsError] = await psql.query(
        sqlString.format("UPDATE companies SET departments=E? WHERE id=?", [
          departments.join(":"),
          companyId,
        ])
      );
      if (psqlDepartmentsError) {
        res.send(JSON.stringify({ error: psqlDepartmentsError }));
        return;
      }

      /*
      // Update all items with new departments
      const [products, psqlProductsError] = await psql.query(
        sqlString.format("SELECT id FROM products SET WHERE company_id=?", [
          companyId,
        ])
      );
      if (psqlProductsError) {
        res.send(JSON.stringify({ error: psqlProductsError }));
        return;
      }

      const productIds = products.rows.map(({ id }) => `${companyId}_${id}`);
      const [
        productObjects,
        algoliaGetProductsError,
      ] = await algolia.getObjects(productIds);
      if (algoliaGetProductsError) {
        res.send(JSON.stringify({ error: algoliaGetProductsError }));
        return;
      }

      const newProducts = productObjects.map((product) => {
        return {
          ...product,
          departments: departments,
        };
      });
      algolia.saveObjects(newProducts, {
        autoGenerateObjectIDIfNotExist: false,
      });
      */

      res.send(JSON.stringify({ departments: departments }));
    };

    let departments = req.body.departments;
    if (!Array.isArray(departments)) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid departments" },
        })
      );
      return;
    }
    try {
      departments = departments
        .map((department) => xss(department.trim()))
        .filter(Boolean);
    } catch (err) {
      res.send(
        JSON.stringify({
          error: { code: 400, message: "Invalid departments" },
        })
      );
      return;
    }

    const companyId = req.cookies["companyId"];
    if (companyId === "0") {
      if (Number.isInteger(req.body.id)) {
        await f(req.body.id, departments);
      } else {
        res.send(
          JSON.stringify({
            error: { code: 400, message: "Invalid company id" },
          })
        );
      }
    } else {
      await f(parseInt(companyId), departments);
    }
  }
);

export default router;
