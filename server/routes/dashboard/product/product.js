import rateLimit from "express-rate-limit";
import { Router } from "express";

import { productDelete } from "../common/common.js";
import pAdd from "./add/add.js";
import pDelete from "./delete/delete.js";
import pUpdate from "./update/update.js";

const router = Router();

router.use("/add", pAdd);
router.use("/delete", pDelete);
router.use("/update", pUpdate);

export default router;
