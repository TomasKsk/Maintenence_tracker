import ExcelJS from "exceljs";

const workbook = new ExcelJS.Workbook();

await workbook.xlsx.readFile(
  "./data/raw/gemeindeverzeichnis.xlsx"
);

const workSheet = workbook.worksheets[1]
const municipalities = [];
const uniqueMunicipalities = new Map();

function parseLongLatNumbers(value) {
    return Number(
        String(value).replace(",", ".")
    );
};

workSheet.eachRow((row, rowNumber) => {
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

console.log(municipalities.slice(0,10));
console.log("Total: ", municipalities.length);
console.log("Total uniques: ", municipalUniqueResults.length)
