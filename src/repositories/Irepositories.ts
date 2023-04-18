import { Beach } from "@src/models/beachModel";
import { User } from "@src/models/usersModel";
import { FlattenMaps } from "mongoose";

export type WithId<T> = { id: string } & T;
// export interface WithId<T> extends ExistingBeach {
//     id: string & T;
// }

export type FilterOptions = Record<string, unknown>;

export interface BaseRepository<T> {
    create(data: T): Promise<FlattenMaps<WithId<T>>>;
    findOne(options: FilterOptions): Promise<FlattenMaps<WithId<T>> | undefined>;
    find(options: FilterOptions): Promise<FlattenMaps<WithId<T>>[]>;
    deleteAll(): Promise<void>;
}

export interface BeachRepository extends BaseRepository<Beach> {
    findAllBeachesForUser(userId: string): Promise<WithId<Beach>[]>;
}

export interface UserRepository extends BaseRepository<User> {
    findOneById(id: string): Promise<WithId<User> | undefined>;
    findOneByEmail(email: string): Promise<WithId<User> | undefined>;
}
