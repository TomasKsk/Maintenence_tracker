import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import { AppError } from "../errors/AppErrors.js";

import type {
    Customer,
    CustomerSite,
    CreateCustomerInput,
    CreateCustomerSiteInput
} from "../types/customer.js";


function isValidSite (
    value: unknown
): value is CreateCustomerSiteInput {

    if (
        typeof value !== "object" ||
        value === null ||
        !("name" in value) ||
        !("address" in value) ||
        !("municipalityId" in value)
    ) {
        return false;
    }

    return (
        typeof value.name === "string" &&
        value.name.trim().length >= 2 &&

        typeof value.address === "string" &&
        value.address.trim().length >= 2 &&

        typeof value.municipalityId === "string" &&
        value.municipalityId.trim().length >= 2
    );
};

async function resolveMunicipalityId (
    municipalityId: string
) {
    if (!ObjectId.isValid(municipalityId)) {
        throw new AppError(
            "Invalid municipality ID",
            400
        );
    }

    const db = getDatabase();

    const objectId = new ObjectId( municipalityId );

    const municipality = await db
        .collection("municipalities")
        .findOne({
            _id: objectId
        });

    if (!municipality) {
        throw new AppError(
            "Municipality does not exist",
            400
        );
    }
    
    return objectId;
};



async function createCustomerSites (
    sites: CreateCustomerSiteInput[]
): Promise<CustomerSite[]> {

    const customerSites: CustomerSite[] = [];

    for (const site of sites) {
        
        const municipalityId = await resolveMunicipalityId( site.municipalityId );
        
        const currentDate = new Date();

        customerSites.push({
            _id: new ObjectId(),
            name: site.name.trim(),
            address: site.address.trim(),
            municipalityId,
            createdAt: currentDate,
            updatedAt: currentDate
        })
    };

    return customerSites;
}

function isCreateCustomerInput (
    value: unknown
): value is CreateCustomerInput {

    if (
        typeof value !== "object" ||
        value === null ||
        !("name" in value) ||
        !("sites" in value)
    ) {
        return false;
    }

    return (
        typeof value.name === "string" &&
        value.name.trim().length >= 2 &&
        Array.isArray(value.sites) &&
        value.sites.length > 0 &&
        value.sites.every(isValidSite)
    );
};

export async function createCustomerService (
    data: unknown
) {
    if (!isCreateCustomerInput(data)) {
        throw new AppError(
            "Invalid customer data",
            400
        );
    }

    const { name, sites } = data;

    const customerSites = await createCustomerSites( sites );

    const currentDate = new Date();

    const customer: Customer = {
        name: name.trim(),
        sites: customerSites,
        createdAt: currentDate,
        updatedAt: currentDate
    };

    const db = getDatabase();

    return db
        .collection<Customer>("customers")
        .insertOne(customer);
}

const customerAggregation = [
    {
        $unwind: "$sites"
    },
    {
        $lookup: {
            from: "municipalities",
            localField: "sites.municipalityId",
            foreignField: "_id",
            as: "municipality"
        }
    },
    {
        $unwind: "$municipality"
    },
    {
        $set: {
            "sites.municipality": "$municipality"
        }
    },
    {
        $unset: "municipality"
    },
    {
        $group: {
            _id: "$_id",
            name: {
                $first: "$name"
            },
            sites: {
                $push: "$sites"
            },
            createdAt: {
                $first: "$createdAt"
            },
            updatedAt: {
                $first: "$updatedAt"
            }
        }
    }
];

export async function getCustomersService () {

    const db = getDatabase();

    return db
        .collection<Customer>("customers")
        .aggregate( customerAggregation )
        .toArray();
};