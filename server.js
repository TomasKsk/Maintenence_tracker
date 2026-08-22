import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static("public"));

const client = new MongoClient(process.env.MONGODB_URI);

await client.connect();

const db = client.db("maintenanceApp");
console.log("Connected to mongoDB");

app.post("/api/cities", async (req, res) => {
    try {
        await db.collection("cities").insertOne(city);

        // res.redirect("/");
    } catch (error) {
        console.log(error)
        res.status(500).send("Failed to create city");
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

