import { Beach } from '@src/models/beachModel';

describe('Beaches Models tests', () => {
  beforeAll(async () => Beach.deleteMany({}));
  describe('Quando criar uma beach', () => {
    it('deve criar uma beach', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const resp = await global.testRequest.post('/beaches').send(newBeach);

      expect(resp.status).toBe(201);
      expect(resp.body).toEqual(expect.objectContaining(newBeach));
    });

    it('return erro  de validação do mongoose', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const resp = await global.testRequest.post('/beaches').send(newBeach);

      expect(resp.status).toBe(422);
      expect(resp.body).toEqual({
        error:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" at path "lat"',
      });

      it.skip('should return 500 when there is any error other than validation error', async () => {
        //TODO think in a way to throw a 500 FORÇAR ERRO 500!!!!!
      });
    });
  });
});
