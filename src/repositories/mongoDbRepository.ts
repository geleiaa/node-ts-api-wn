import { Error, Model } from "mongoose";
import { DatabaseInternalError, DatabaseUnknownClientError, DatabaseValidationError, Repository } from "./repository";
import { FilterOptions, WithId } from "./Irepositories";
import logger from "@src/logger";
import { CUSTOM_VALIDATION } from "@src/models/usersModel";
import { BaseModel } from '@src/models/baseModel';


export abstract class MongoDBRespository<T extends BaseModel> extends Repository<T> {
    constructor(private model: Model<T>) {
        super()
    }

    public async create(data: T) {
        try {
            const model = new this.model(data);
            const createdData = await model.save();
            return createdData.toJSON<WithId<T>>();
        } catch (err) {
            this.handleError(err);
        }
    }

    public async find(filter: FilterOptions) {
        try {
            const data = await this.model.find(filter);
            return data.map((d) => d.toJSON<WithId<T>>());
        } catch (error) {
            this.handleError(error);
        }
    }

    public async findOne(options: FilterOptions) {
        try {
            const data = await this.model.findOne(options);
            return data?.toJSON<WithId<T>>();
        } catch (error) {
            this.handleError(error);
        }
    }

    public async deleteAll() {
        await this.model.deleteMany({});
    }

    protected handleError(error: unknown): never {
        if (error instanceof Error.ValidationError) {
            const duplicatedKindErrors = Object.values(error.errors).filter(
                (err) =>
                    err.name === 'ValidatorError' &&
                    err.kind === CUSTOM_VALIDATION.DUPLICATED
            );
            if (duplicatedKindErrors.length) {
                throw new DatabaseValidationError(error.message);
            }

            throw new DatabaseUnknownClientError(error.message);
        }
        logger.warn('Database error', error);
        throw new DatabaseInternalError(
            'Something unexpected happened to the database'
        );
    }
}
