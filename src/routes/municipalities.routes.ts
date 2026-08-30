import { Router } from "express";
import { getDatabase } from "../config/database.js";

const router = Router();

function normalizeSearchName (name: string) {
    return name
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
};

function escapeRegex (value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

router.get("/", async (req, res) => {

    try {
        
        const search = req.query.search;
        const reqLimit = Math.abs(Number(req.query.limit));
        const searchLimit = Math.min(reqLimit || 20, 20);

        if (
            typeof search !== "string" ||
            search.trim().length < 3
        ) {
            return res.status(400).json({
                message: "Search must contain at least 3 characters"
            });
        };

        const normalizedSearch = normalizeSearchName(search.trim());
        const escapedSearch = escapeRegex(normalizedSearch);

        const db = getDatabase();

        const municipalities = await db
            .collection("municipalities")
            .find({
                searchName: {
                    $regex: `^${escapedSearch}`
                }
            })
            .limit(searchLimit)
            .toArray();

        return res.status(200).json(municipalities);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to load municipalities"
        })
    }
});

export default router;