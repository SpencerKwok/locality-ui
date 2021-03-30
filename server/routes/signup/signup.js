import { Router } from "express";

import company from "./company/company.js";
import customer from "./customer/customer.js";

const router = Router();

router.use("/company", company);
router.use("/customer", customer);

export default router;
