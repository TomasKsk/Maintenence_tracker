import express from "express";
import { 
    MongoClient,
} from "mongodb";

import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static("public"));

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
};

const client = new MongoClient(mongoUri);

await client.connect();

const db = client.db("maintenanceApp");
await db.collection("municipalities").createIndex(
    { officialKey: 1 },
    { unique: true }
);

console.log("Connected to mongoDB");

function normalizeSearchName (name: string) {
    return name
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
};

function escapeRegex (value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

app.get("/api/municipalities", async (req, res) => {

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


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

