import { StormGlass } from '@src/clients/stormGlass';
import { ForecastPoint } from '@src/clients/interfaces/IstormGlass';
import { InternalError } from '@src/utils/errors/internal-error';
import { Beach, BeachForecast, TimeForcast } from '@src/services/interfaces/Iforecast';


export class ForecastProcessingInternalError extends InternalError {
    constructor(message: string) {
        super(`Unexpected error during the forecast processing: ${message}`);
    }
}

export class Forecast {
    constructor(protected stormGlass = new StormGlass()) { }

    public async processForecastForBeaches(
        beaches: Beach[]
    ): Promise<TimeForcast[]> {
        const pointWithCurrentSource: BeachForecast[] = []; // recebe array de beaches
        try {
            for (const beach of beaches) {
                const points = await this.stormGlass.fetchPoint(beach.lat, beach.lng); // fetch dos dados da previsão
                const enrichedBeachData = this.enrichedBeachData(points, beach);
                pointWithCurrentSource.push(...enrichedBeachData);
            }

            return this.mapForecastByTime(pointWithCurrentSource);
        } catch (err) {
            throw new ForecastProcessingInternalError((err as Error).message);
        }
    }

    private enrichedBeachData(points: ForecastPoint[], beach: Beach): BeachForecast[] {
        return points.map((e) => ({
            // merge da previsão com dados da beach
            //...{},
            ...{
                name: beach.name,
                lat: beach.lat,
                lng: beach.lng,
                position: beach.position,
                rating: 1,
            },
            ...e,
        }));
    }

    private mapForecastByTime(forecast: BeachForecast[]): TimeForcast[] {
        const forecastByTime: TimeForcast[] = [];

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
