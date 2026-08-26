import express from "express";
import { 
    MongoClient,
    MongoServerError
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

app.post("/api/cities", async (req, res) => {
    try {
        console.log("Request body:", req.body);

        const city = {
        name: req.body.name,
        country: req.body.country
        };

        const result = await db
            .collection("cities")
            .insertOne(city);

        console.log("Inserted ID:", result.insertedId);

        res.status(201).json({
            message: "City created",
            cityId: result.insertedId
        });

    } catch (error: unknown) {
        if (
            error instanceof MongoServerError &&
            error.code === 11000
        ) {
            console.log("Duplicate city:", req.body);

            return res
                .status(409)
                .json({
                    message: "City already exists"
                });
        }

        console.error(error);

        res
        .status(500)
        .json({
            message: "Failed to create city"
        });
    }
});

app.get("/api/cities", async (req, res) => {
    try {
        const cities = await db
            .collection("cities")
            .find()
            .toArray();

        res.status(200).json(cities);

    } catch(error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load cities"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

