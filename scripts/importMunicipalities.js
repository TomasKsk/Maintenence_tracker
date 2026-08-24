import ExcelJS from "exceljs";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const workbook = new ExcelJS.Workbook();

await workbook.xlsx.readFile(
  "./data/raw/gemeindeverzeichnis.xlsx"
);

const workSheet = workbook.getWorksheet("municipalities");
const municipalities = [];
const uniqueMunicipalities = new Map();

function parseLongLatNumbers(value) {
    return Number(
        String(value).replace(",", ".")
    );
};

workSheet.eachRow( row => {
    const recordType = row.getCell(1).value;

    if (recordType !== "60") {
        return;
    }

    const municipality = {
        officialKey: [
            row.getCell(3).value,
            row.getCell(4).value,
            row.getCell(5).value,
            row.getCell(6).value,
            row.getCell(7).value,
        ].join(""),

        name: row.getCell(8).value,

        postalCode: row.getCell(14).value,

        location: {
            type: "Point",
            coordinates: [
                parseLongLatNumbers(row.getCell(15).value),
                parseLongLatNumbers(row.getCell(16).value)
            ]
        }

    };

    municipalities.push(municipality);
});

municipalities.forEach(municipality => {
    uniqueMunicipalities.set(
        municipality.officialKey,
        municipality
    );
});

const municipalUniqueResults = [
    ...uniqueMunicipalities.values()
];

const client = new MongoClient(process.env.MONGODB_URI);

try {
    await client.connect();

    const db = client.db("maintenanceApp");
    const municipalitiesCollection = db.collection("municipalities");

    await municipalitiesCollection.createIndex(
        { officialKey: 1 },
        { unique: true }
    );

    const bulkOperations = municipalUniqueResults.map((municipality) => ({
        updateOne: {
            filter: {
                officialKey: municipality.officialKey
            },

            update: {
                $set: municipality
            },

            upsert: true
        }
    }));

    const result = await municipalitiesCollection.bulkWrite(
        bulkOperations,
        {
            ordered: false
        }
    )

    console.log("Import finished");
    console.log("Matched:", result.matchedCount);
    console.log("Modified:", result.modifiedCount);
    console.log("Inserted:", result.upsertedCount);

} catch (error) {

    console.error("Import failed:", error);

} finally {

    await client.close();
    console.log("MongoDB connection closed");

};

