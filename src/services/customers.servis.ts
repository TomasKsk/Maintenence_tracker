import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";

import type {
    Customer,
    CustomerSite,
    CreateCustomerInput,
    CreateCustomerSiteInput
} from "../types/customer.js";

function validateCustomer (
    name: unknown,
    sites: unknown
) {
    if (
        typeof name !== "string" ||
        name.trim().length < 2
    ) {
        throw new Error(
            "Customer name is required"
        );
    }

    if (
        !Array.isArray(sites) ||
        sites.length === 0
    ) {
        throw new Error(
            "At least one site is required"
        );
    }
};

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
        throw new Error(
            "Invalid municipality ID"
        )
    }

    const db = getDatabase();

    const objectId = new ObjectId( municipalityId );

    const municipality = await db
        .collection("municipalities")
        .findOne({
            _id: objectId
        });

    if (!municipality) {
        throw new Error(
            "Municipality does not exist"
        );
    }
    
    return objectId;
};


async function createCustomerSites (
    sites: CreateCustomerSiteInput[]
): Promise<CustomerSite[]> {

    const customerSites: CustomerSite[] = [];

    for (const site of sites) {
        if (!isValidSite( site )) {
            throw new Error(
                "Invalid site data"
            )
        };

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

export async function createCustomerService (
    data: CreateCustomerInput
) {
    const { name, sites } = data;

    validateCustomer( name, sites );

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