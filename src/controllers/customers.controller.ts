import type { Request, Response } from "express";

import {
    createCustomerService,
    getCustomersService
} from "../services/customers.servis.js"

export async function createCustomer (
    req: Request,
    res: Response
) {
    try {
        const result = await createCustomerService(req.body);

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



export async function getCustomers (
    req: Request,
    res: Response
) {
    try {
        const customers = await getCustomersService();
        return res.status(200).json(customers);

    } catch ( error ) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to load customers"
        });
    };
};