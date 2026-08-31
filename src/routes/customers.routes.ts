import { Router } from "express";
import { createCustomer } from "../controllers/customers.controller.js";

const router = Router();

router.post("/", createCustomer);

export default router;