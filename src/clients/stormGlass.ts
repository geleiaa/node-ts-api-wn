import { InternalError } from '@src/utils/errors/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUTIL from '@src/utils/requests';
import {
  ForecastPoint,
  StormGlassForecastResponse,
  StormGlassPoint,
} from '@src/clients/interfaces/IstormGlass';
import { TimeUtil } from '@src/utils/time';
import CacheUtil from '@src/utils/cache';
import logger from '@src/logger';

export class ClientReqError extends InternalError {
  constructor(message: string) {
    const InternalMessage =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${InternalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormglassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

  readonly stormGlassAPISource = 'noaa';

  constructor(protected request = new HTTPUTIL.Request(), protected cache = CacheUtil) { }

  public async fetchPoint(lat: number, lng: number): Promise<ForecastPoint[]> {

    const cachedForecastPoints = this.getPointsFromCache(this.getCacheKey(lat, lng));

    if (!cachedForecastPoints) {
      const fetchForecastPoints = await this.getForecastPointsFromApi(lat, lng);
      this.setForecastPointsInCache(this.getCacheKey(lat, lng), fetchForecastPoints);
      return fetchForecastPoints;
    }

    return cachedForecastPoints;
  }

  private async getForecastPointsFromApi(lat: number, lng: number): Promise<ForecastPoint[]> {
    const endTimestamp = TimeUtil.getUnixTimeForAFutureDay(1);
    try {
      const resp = await this.request.get<StormGlassForecastResponse>(
        `${stormglassResourceConfig.get('apiUrl')}/weather/point?params=${this.stormGlassAPIParams
        }&source=${this.stormGlassAPISource
        }&lat=${lat}&lng=${lng}&end=${endTimestamp}`,
        {
          headers: {
            Authorization: stormglassResourceConfig.get('apiToken'),
          },
        }
      );

      return this.normalizeResponse(resp.data);
    } catch (err) {
      if (err instanceof Error && HTTPUTIL.Request.isRequestError(err)) {
        const error = HTTPUTIL.Request.extractErrorData(err);

        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(error.data)} Code: ${error.status}`
        );
      }
      throw new ClientReqError((err as Error).message);
    }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoints.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }

  private isValidPoints(point: Partial<StormGlassPoint>): boolean {
    // check se a resp da api SG esta inteira [C02P01-2]
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }

  private getPointsFromCache(key: string): ForecastPoint[] | undefined {
    const forecastPointsFromCache = this.cache.get<ForecastPoint[]>(key);

    if (!forecastPointsFromCache) {
      return;
    }

    logger.info(`Usando cache dos forecast points para key: ${key}`);

    return forecastPointsFromCache;
  }

  private getCacheKey(lat: number, lng: number): string {
    return `forecast_points_${lat}_${lng}`;
  }

  private setForecastPointsInCache(key: string, forecastPoints: ForecastPoint[]): boolean {
    logger.info(`Cacheando os forecast points para a key: ${key}`);
    return this.cache.set(key, forecastPoints, stormglassResourceConfig.get('cacheTTL')
    );
  }
}
