import { StormGlass } from '@src/clients/stormGlass';
import * as HTTPUTIL from '@src/utils/requests';
import stormGlassRespExample from '@test/fixtures/stormglass_resp_example.json';
import stormGlassRespNornalizedExample from '@test/fixtures/stormglass_normalized_example.json';

jest.mock('@src/utils/requests');

describe('StormGlass client', () => {

  const MockedRequestClass = HTTPUTIL.Request as jest.Mocked<typeof HTTPUTIL.Request>;
  //const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockedRequest = new HTTPUTIL.Request() as jest.Mocked<HTTPUTIL.Request>;

  it('return dados normalizados da Api StormGlass', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({ data: stormGlassRespExample } as HTTPUTIL.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const resp = await stormGlass.fetchPoint(lat, lng);

    expect(resp).toEqual(stormGlassRespNornalizedExample);
  });

  it('deve excluir dados incompletos vindo da api', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };

    mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUTIL.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const resp = await stormGlass.fetchPoint(lat, lng);

    expect(resp).toEqual([]);
  });

  it('return erro se a request p/ api externa falhar', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoint(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('return error da api StormGlass quando bater o limit de reqs dia', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    class FakeAxiosError extends Error {
      constructor(public response: object) {
        super();
      }
    }

    mockedRequest.get.mockRejectedValue(
      new FakeAxiosError({
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      })
    );

    MockedRequestClass.isRequestError.mockReturnValue(true);

    MockedRequestClass.extractErrorData.mockReturnValue({
      status: 429,
      data: { errors: ['Rate Limit reached'] },
    });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoint(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
