import { User } from "@src/models/usersModel";
import { UserRepository } from "./Irepositories";
import { MongoDBRespository } from "./mongoDbRepository";

export class UserMongoRepository extends MongoDBRespository<User> implements UserRepository {
    constructor(userModel = User) {
        super(userModel);
    }

    async findOneById(id: string) {
        return this.findOne({ _id: id });
    }

    async findOneByEmail(email: string) {
        return await this.findOne({ email });
    }
}