import type {
    ErrorRequestHandler
} from "express";

import { AppError } from "../errors/AppErrors.js";

export const errorHandler: ErrorRequestHandler = (
    error,
    req,
    res,
    next
) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            message: error.message
        });

        return;
    }

    console.error(error);

    res.status(500).json({
        message: "Internal server error"
    });
};