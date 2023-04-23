#### A ideia dessa aplicação é, usando a API de meteorologia da https://stormglass.io/, fornecer informções sobre as condições do clima em determinadas praias e mostrar ao usuário qual praia está adequada para a prática do surf.

* curso do Waldemar neto: https://youtube.com/playlist?list=PLz_YTBuxtxt6_Zf1h-qzNsvVt46H8ziKh

* repo do curso: https://github.com/waldemarnt/node-typescript-api


### routes

se quiser ver a documentação com mais detalhes, importe o arquivo /src/swagger.json para o Swagger Editor https://editor.swagger.io/

![routes](https://github.com/geleiaa/node-ts-api-wn/blob/main/images/routes.png)


### O que tem de Clean Architecture:

#### Na implmentação foi aplicado vários conceitos de *Clean Archtecture* como:  

1. A escrita de código clara com nomes de váriaveis e funções sendo descritivos e implmentações complexas mas que não dificultam o entendimento.

2. Uma divisão do código em camadas seguindo padrões de **Abstração** com **Repositories** e **Interfaces**.

3. Ainda na divisão das camadas, a parte de regra de negócios é o "core" da aplicação usando padrões de domínio como **Entities** e **Models** visando facilitar o uso da aplicação.

### o que tem de TDD:

No decorrer do desenvolvimento foi seguido a prática do TDD. Ja tendo uma ideia de como os serviços seriam implementados e da resposta esperada, os testes foram desenvolvidos antes de escrever a funcionalidade do serviço em si, seguindo o básico do TDD...

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
