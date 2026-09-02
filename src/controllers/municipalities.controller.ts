import type { NextFunction, Request, Response } from "express";
import { getDatabase } from "../config/database.js";

function normalizeSearchName (name: string) {
    return name
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
};

function escapeRegex (value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export async function searchMunicipalities(
    req: Request,
    res: Response,
    next: NextFunction
) {
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
        next(error)
    }
}