import { User } from "@src/models/usersModel";

describe('User Funct tests', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });
    describe('Create Users', () => {
        it('return user created', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '12345'
            }

            const resp = await global.testRequest.post('/users').send(newUser);
            expect(resp.status).toBe(201);
            expect(resp.body).toEqual(expect.objectContaining(newUser));
        })

        it('return 422 validation error', async () => {
            const newUser = {
                email: 'john@mail.com',
                password: '1234',
            };
            const resp = await global.testRequest.post('/users').send(newUser);

            expect(resp.status).toBe(422);
            expect(resp.body).toEqual({
                code: 422,
                error: 'Users validation failed: name: Path `name` is required.',
            });
        });

        it('return 409 se email ja existir no banco', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };
            await global.testRequest.post('/users').send(newUser);
            const resp = await global.testRequest.post('/users').send(newUser);

            expect(resp.status).toBe(409);
            expect(resp.body).toEqual({
                code: 409,
                error: 'Users validation failed: email: email ja cadastrado!!.',
            });
        });
    })
})