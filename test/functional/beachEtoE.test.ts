import { Beach } from '@src/models/beachModel';
import { UserMongoRepository } from '@src/repositories/userRepository';
import AuthService from '@src/services/userAuth';

describe('Beaches Models tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john2@mail.com',
    password: '1234',
  };

  let token: string;

  beforeEach(async () => {
    const userRepo = new UserMongoRepository();
    await Beach.deleteMany({});
    await userRepo.deleteAll();
    const user = await userRepo.create(defaultUser)
    token = AuthService.generateToken(user.id);
  });

  describe('Quando criar uma beach', () => {
    it('deve criar uma beach', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const resp = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);

      expect(resp.status).toBe(201);
      expect(resp.body).toEqual(expect.objectContaining(newBeach));
    });

    it('return erro de validação do mongoose', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const resp = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);

      expect(resp.status).toBe(400);
      expect(resp.body).toEqual({
        code: 400,
        error: 'Bad Request',
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      });
    });

    it('should return 500 when there is any error other than validation error', async () => {
      //TODO think in a way to throw a 500 FORÇAR ERRO 500!!!!!

      jest
        .spyOn(Beach.prototype, 'save')
        .mockRejectedValueOnce('fail to create beach');
      const newBeach = {
        lat: -33.792726,
        lng: 46.43243,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .send(newBeach)
        .set({ 'x-access-token': token });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        code: 500,
        error: 'Internal Server Error',
        message: 'Something went wrong!',
      });
    });
  });
});
