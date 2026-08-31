import express from "express";

import municipalitiesRouter from "./routes/municipalities.routes.js";
import customerRouter from "./routes/customers.routes.js";

const app = express();

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.use(
    "/api/municipalities",
    municipalitiesRouter
);

app.use(
    "/api/customers",
    customerRouter
)

export default app;