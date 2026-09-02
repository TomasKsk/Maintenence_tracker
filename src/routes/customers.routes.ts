import { Router } from "express";

import { 
    createCustomer, 
    getCustomers 
} from "../controllers/customers.controller.js";

const router = Router();

router.post("/", createCustomer);
router.get("/", getCustomers)

export default router;