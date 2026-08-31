import type { ObjectId } from "mongodb";

export interface CustomerSite {
    _id: ObjectId;
    name: string;
    municipalityId: ObjectId;
    address: string;
}

export interface Customer {
    name: string;
    sites: CustomerSite[];
    createdAt: Date;
    updatedAt: Date;
}