import { Beach } from '@src/models/beachModel';
import { BeachPosition } from '@src/services/interfaces/Iforecast';
import stormGlassRespExample from '@test/fixtures/stormglass_resp_example.json';
import forecastResponse from '@test/fixtures/api-forecast-resp.json';
import nock from 'nock';
import AuthService from '@src/services/userAuth';
import CacheUtil from '@src/utils/cache';
import { UserMongoRepository } from '@src/repositories/userRepository';

describe('Beach forecast funct test', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john2@mail.com',
    password: '1234',
  };

  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    const userRepo = new UserMongoRepository();
    await userRepo.deleteAll();
    const user = await userRepo.create(defaultUser)

    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
      userId: user.id,
    };

    await new Beach(defaultBeach).save();
    token = AuthService.generateToken(user.id);
    CacheUtil.clearAllCache();
  });

  it('return a forecast', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
        end: /(.*)/,
      })
      .reply(200, stormGlassRespExample);

    const { body, status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });
    expect(status).toBe(200);
    expect(body).toEqual(forecastResponse);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v1/weather/point')
      .query({ lat: '-33.792726', lng: '151.289824' })
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest
      .get(`/forecast`)
      .set({ 'x-access-token': token });

    expect(status).toBe(500);
  });
});
