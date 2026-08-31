import type { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { getDatabase } from "../config/database.js";

import type {
    Customer,
    CustomerSite
} from "../types/customer.js";

export async function createCustomer (
    req: Request,
    res: Response
) {
    try {
        const { name, sites } = req.body;

        if (
            typeof name !== "string" ||
            name.trim().length < 2
        ) {
            return res.status(400).json({
                message: "Customer name is required"
            });
        }

        if (
            !Array.isArray(sites) ||
            sites.length === 0
        ) {
            return res.status(400).json({
                message: "At least one site is required"
            });
        }

        const customerSites: CustomerSite[] = [];
        const db = getDatabase();

        const validationPoints = [
            "name", 
            "address", 
            "municipalityId"
        ] as const;

        for (const site of sites) {
            for (const validationKey of validationPoints) {

                if (
                    typeof site[validationKey] !== "string" ||
                    site[validationKey].trim().length < 2
                ) {
                    return res.status(400).json({
                        message: `Site ${validationKey} is required`
                    });
                }
            }
            
            if (!ObjectId.isValid(site.municipalityId)) {
                return res.status(400).json({
                    message: "Invalid municipality ID"
                });
            }

            const municipalityId = new ObjectId(
                site.municipalityId
            );

            const municipality = await db
                .collection("municipalities")
                .findOne({
                    _id: municipalityId
                });

            if (!municipality) {
                return res.status(400).json({
                    message: "Municipality does not exist"
                });
            }

            customerSites.push({
                _id: new ObjectId(),
                name: site.name.trim(),
                address: site.address.trim(),
                municipalityId
            })
        };

        const currentDate = new Date();

        const customer: Customer = {
            name: name.trim(),
            sites: customerSites,
            createdAt: currentDate,
            updatedAt: currentDate
        };

        const result = await db
            .collection<Customer>("customers")
            .insertOne(customer);

        return res.status(201).json({
            message: "Customer created",
            customerId: result.insertedId
        });


    } catch ( error ) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to create customer"
        });
    };
};