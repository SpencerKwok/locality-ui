import { Router } from "express";

import add from "./add/add.js";
import get from "./get/get.js";
import wldelete from "./delete/delete.js";

const router = Router();

router.use("/add", add);
router.use("/get", get);
router.use("/delete", wldelete);

export default router;
