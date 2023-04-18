import { StormGlass } from '@src/clients/stormGlass';
import stormGlassRespNornalizedExample from '@test/fixtures/stormglass_normalized_example.json';
import {
  Forecast,
  ForecastProcessingInternalError,
} from '@src/services/forecast';
import { Beach, BeachPosition } from '@src/services/interfaces/Iforecast';
import { ExistingBeach } from '@src/models/beachModel';

jest.mock('@src/clients/stormGlass');

describe('Forecast Service', () => {
  const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>;

  const Defaultbeaches: ExistingBeach[] = [
    {
      id: 'fake-id1',
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
      userId: 'fake-id',
    },
    {
      id: 'fake-id2',
      lat: -33.792726,
      lng: 141.289824,
      name: 'Dee Why',
      position: BeachPosition.S,
      userId: 'fake-id',
    },
  ];

  it('should return the forecast for mutiple beaches in the same hour with different ratings order by rating', async () => {
    mockedStormGlassService.fetchPoint.mockResolvedValueOnce([
      {
        swellDirection: 123.41,
        swellHeight: 0.21,
        swellPeriod: 3.67,
        time: '2020-04-26T00:00:00+00:00',
        waveDirection: 232.12,
        waveHeight: 0.46,
        windDirection: 310.48,
        windSpeed: 100,
      },
    ]);
    mockedStormGlassService.fetchPoint.mockResolvedValueOnce([
      {
        swellDirection: 64.26,
        swellHeight: 0.15,
        swellPeriod: 13.89,
        time: '2020-04-26T00:00:00+00:00',
        waveDirection: 231.38,
        waveHeight: 2.07,
        windDirection: 299.45,
        windSpeed: 100,
      },
    ]);

    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 141.289824,
            name: 'Dee Why',
            position: 'S',
            rating: 3,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 13.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 2.07,
            windDirection: 299.45,
            windSpeed: 100,
          },
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
          },
        ],
      },
    ];
    const forecast = new Forecast(mockedStormGlassService);
    const beachesWithRating = await forecast.processForecastForBeaches(Defaultbeaches);
    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('return lista das beaches', async () => {
    mockedStormGlassService.fetchPoint.mockResolvedValue(
      stormGlassRespNornalizedExample
    );

    const beaches: ExistingBeach[] = [
      {
        id: 'fake-id1',
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        userId: 'fake-id',
      },
    ];
    
    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 3.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 0.47,
            windDirection: 299.45,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T01:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T01:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
          },
        ],
      },
      {
        time: '2020-04-26T02:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 182.56,
            swellHeight: 0.28,
            swellPeriod: 3.44,
            time: '2020-04-26T02:00:00+00:00',
            waveDirection: 232.86,
            waveHeight: 0.46,
            windDirection: 321.5,
            windSpeed: 100,
          },
        ],
      },
    ];

    const forecast = new Forecast(mockedStormGlassService);
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);
    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('return uma lista vazia se não houver beaches', async () => {
    const forecast = new Forecast();
    const resp = await forecast.processForecastForBeaches([]);
    expect(resp).toEqual([]);
  });

  it('return erro se houver problema no processo de rating', async () => {
    mockedStormGlassService.fetchPoint.mockRejectedValue('Error fetching data');

    const forecast = new Forecast(mockedStormGlassService);
    await expect(
      forecast.processForecastForBeaches(Defaultbeaches)
    ).rejects.toThrowError(ForecastProcessingInternalError);
  });
});
