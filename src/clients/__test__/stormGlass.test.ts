import { StormGlass } from "@src/clients/stormGlass";
import axios from 'axios';
import stormGlassRespExample from '@test/fixtures/stormglass_resp_example.json';
import stormGlassRespNornalizedExample from '@test/fixtures/stormglass_normalized_example.json';

jest.mock('axios');

describe('StormGlass client', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    it('return dados normalizados da Api StormGlass', async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockResolvedValue({ data: stormGlassRespExample });

        const stormGlass = new StormGlass(mockedAxios);
        const resp = await stormGlass.fetchPoint(lat, lng);

        expect(resp).toEqual(stormGlassRespNornalizedExample);
    })

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

        mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

        const stormGlass = new StormGlass(mockedAxios);
        const resp = await stormGlass.fetchPoint(lat, lng);

        expect(resp).toEqual([]);
    })

    it('return erro se a request p/ api externa falhar', async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockRejectedValue({ message: 'Network Error' });

        const stormGlass = new StormGlass(mockedAxios);

        await expect(stormGlass.fetchPoint(lat, lng)).rejects.toThrow(
            'Unexpected error when trying to communicate to StormGlass: Network Error'
        );
    })

    it('return error da api StormGlass quando bater o limit de reqs dia', async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        class FakeAxiosError extends Error {
            constructor(public response: object) {
                super();
            }
        }

        mockedAxios.get.mockRejectedValue(
            new FakeAxiosError({
                status: 429,
                data: { errors: ['Rate Limit reached'] },
            })
        );

        const stormGlass = new StormGlass(mockedAxios);

        await expect(stormGlass.fetchPoint(lat, lng)).rejects.toThrow(
            'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
        );
    });
})