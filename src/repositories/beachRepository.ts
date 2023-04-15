import { Beach } from "@src/models/beachModel";
import { BeachRepository, WithId } from "./Irepositories";
import { MongoDBRespository } from "./mongoDbRepository";

export class BeachMongoRepository extends MongoDBRespository<Beach> implements BeachRepository {
    constructor(beachModel = Beach) {
        super(beachModel);
    }

    async findAllBeachesForUser(userId: string): Promise<WithId<Beach>[]> {
        return await this.find({ userId });
    }
}
