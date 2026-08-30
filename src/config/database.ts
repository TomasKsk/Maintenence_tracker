import { 
    MongoClient,
    type Db
} from "mongodb";

let db: Db;

export async function connectDatabase() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not defined");
    };


    const client = new MongoClient(mongoUri);

    await client.connect();

    db = client.db("maintenanceApp");

    console.log("Connected to MongoDb");

    return db;
};
 
export function getDatabase() {
    if (!db) {
        throw new Error("Database is not connected");
    }

    return db;
};

