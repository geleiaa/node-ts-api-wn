import { Beach } from '@src/models/beachModel';
import { User } from '@src/models/usersModel';
import AuthService from '@src/services/userAuth';

describe('Beaches Models tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john2@mail.com',
    password: '1234',
  };

  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user._id);
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

      expect(resp.status).toBe(422);
      expect(resp.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      });

      // it.skip('should return 500 when there is any error other than validation error', async () => {
      //   //TODO think in a way to throw a 500 FORÇAR ERRO 500!!!!!
      // });
    });
  });
});
