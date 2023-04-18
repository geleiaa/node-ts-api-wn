import { FlattenMaps } from "mongoose";
import { BaseRepository, FilterOptions, WithId } from "./Irepositories";


export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class DatabaseValidationError extends DatabaseError {}

export class DatabaseUnknownClientError extends DatabaseError {}

export class DatabaseInternalError extends DatabaseError {}

export abstract class Repository<T> implements BaseRepository<T> {
    public abstract create(data: T): Promise<FlattenMaps<WithId<T>>>;
    public abstract find(filter: FilterOptions): Promise<FlattenMaps<WithId<T>>[]>;
    public abstract findOne(options: FilterOptions): Promise<FlattenMaps<WithId<T>> | undefined>;
    public abstract deleteAll(): Promise<void>;
}
