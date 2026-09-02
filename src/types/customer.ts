import type { ObjectId } from "mongodb";

export interface CustomerSite {
    _id: ObjectId;
    name: string;
    municipalityId: ObjectId;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Customer {
    name: string;
    sites: CustomerSite[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCustomerSiteInput {
    name: string;
    address: string;
    municipalityId: string;
}

export interface CreateCustomerInput {
    name: string;
    sites: CreateCustomerSiteInput[];
}