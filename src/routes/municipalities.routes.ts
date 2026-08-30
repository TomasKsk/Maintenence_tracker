import { Router } from "express";
import { searchMunicipalities } from "../controllers/municipalities.controller.js";

const router = Router();

router.get("/", searchMunicipalities);

export default router;