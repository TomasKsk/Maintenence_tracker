import type { 
    Request, 
    Response,
    NextFunction
} from "express";

import {
    createCustomerService,
    getCustomersService
} from "../services/customers.service.js"

export async function createCustomer (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await createCustomerService(req.body);

        return res.status(201).json({
            message: "Customer created",
            customerId: result.insertedId
        });

    } catch ( error ) {
        next(error);
    };
};



export async function getCustomers (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const customers = await getCustomersService();

        return res
            .status(200)
            .json(customers);

    } catch ( error ) {
        next(error)
    };
};