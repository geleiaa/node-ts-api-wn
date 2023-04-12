import _ from 'lodash';
import { StormGlass } from '@src/clients/stormGlass';
import { ForecastPoint } from '@src/clients/interfaces/IstormGlass';
import { InternalError } from '@src/utils/errors/internal-error';
import {
  Beach,
  BeachForecast,
  TimeForecast,
} from '@src/services/interfaces/Iforecast';
import logger from '@src/logger';
import { Rating } from './rating';

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass(), protected RatingService: typeof Rating = Rating) { }

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    try {
      const beachForecast = await this.calculateRating(beaches);
      const timeForecast = this.mapForecastByTime(beachForecast);

      return timeForecast.map((t) => ({
        time: t.time,
        forecast: _.orderBy(t.forecast, ['rating'], ['desc']),
        // TODO Allow ordering to be dynamic
        // Sorts the beaches by its ratings
        // https://github.com/waldemarnt/node-typescript-api/pull/32
      }));

    } catch (err) {
      logger.error(err);
      throw new ForecastProcessingInternalError((err as Error).message);
    }
  }

  private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
    const pointWithCurrentSource: BeachForecast[] = []; // recebe array de beaches
    logger.info(`Preparando forecast para ${beaches.length} beaches`);
    for (const beach of beaches) {
      const rating = new this.RatingService(beach);
      const points = await this.stormGlass.fetchPoint(beach.lat, beach.lng); // fetch dos dados da previsão
      const enrichedBeachData = this.enrichedBeachData(points, beach, rating);
      pointWithCurrentSource.push(...enrichedBeachData);
    }
    return pointWithCurrentSource;
  }

  private enrichedBeachData(
    points: ForecastPoint[],
    beach: Beach,
    rating: Rating
  ): BeachForecast[] {
    return points.map((point) => ({
      // merge da previsão com dados da beach
      ...{},
      ...{
        name: beach.name,
        lat: beach.lat,
        lng: beach.lng,
        position: beach.position,
        rating: rating.getRateForPoint(point),
      },
      ...point,
    }));
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];

    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }
    return forecastByTime;
  }
}
