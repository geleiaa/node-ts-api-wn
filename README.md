### routes  
![routes](https://github.com/geleiaa/node-ts-api-wn/blob/main/images/routes.png)

### app workflow
![appwork](https://github.com/geleiaa/node-ts-api-wn/blob/main/images/simple-workflow.png)

#### create beach
![createbeach](https://github.com/geleiaa/node-ts-api-wn/blob/main/images/create-beach.png)

#### create user
![createbeach](https://github.com/geleiaa/node-ts-api-wn/blob/main/images/create-user.png)

devNotes: [c09p03] 
> 0 - verify type error 
``` src/repositories/mongoDbRepository.ts:14:11 - error TS2416: Property 'create' in type 'MongoDBRespository<T>' is not assignable to the same property in base type 'Repository<T>'.
      Type '(data: T) => Promise<FlattenMaps<WithId<T>>>' is not assignable to type '(data: T) => Promise<WithId<T>>'.
        Type 'Promise<FlattenMaps<WithId<T>>>' is not assignable to type 'Promise<WithId<T>>'.
          Type 'FlattenMaps<WithId<T>>' is not assignable to type 'WithId<T>'.
            Type 'FlattenMaps<WithId<T>>' is not assignable to type '{ id: string; }'.
              Types of property 'id' are incompatible.
                Type 'WithId<T>["id"] extends Map<any, any> ? AnyObject : WithId<T>["id"] extends TreatAsPrimitives ? WithId<T>["id"] : FlattenMaps<...>' is not assignable to type 'string'.
                  Type 'AnyObject | (WithId<T>["id"] extends TreatAsPrimitives ? WithId<T>["id"] : FlattenMaps<WithId<T>["id"]>)' is not assignable to type 'string'.
                    Type 'AnyObject' is not assignable to type 'string'.

    14     async create(data: T) 
                 ~~~~~~ 
```

> 1 - implement dinamical rating order em services/forecast.ts
> 2 - implement unit tests to time.ts

> 3 - implement promise all to call ext api em services/forecast.ts
