import { Beach, ExistingBeach } from "@src/models/beachModel";
import { User } from "@src/models/usersModel";

export type WithId<T> = { id: string } & T;
// export interface WithId<T> extends ExistingBeach {
//     id: string & T;
// }

export type FilterOptions = Record<string, unknown>;

export interface BaseRepository<T> {
    create(data: T): Promise<WithId<T>>;
    findOne(options: FilterOptions): Promise<WithId<T> | undefined>;
    find(options: FilterOptions): Promise<WithId<T>[]>;
    deleteAll(): Promise<void>;
}

export interface BeachRepository extends BaseRepository<Beach> {
    findAllBeachesForUser(userId: string): Promise<WithId<Beach>[]>;
}

export interface UserRepository extends BaseRepository<User> {
    findOneById(id: string): Promise<WithId<User> | undefined>;
    findOneByEmail(email: string): Promise<WithId<User> | undefined>;
}
