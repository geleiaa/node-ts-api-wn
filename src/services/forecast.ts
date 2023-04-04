import { ForecastPoint, StormGlass } from "@src/clients/stormGlass";

export enum BeachPosition {
    S = 'S',
    E = 'E',
    W = 'W',
    N = 'N'
}

export interface Beach {
    name: string;
    position: BeachPosition;
    lat: number;
    lng: number;
    user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class Forecast {
    constructor(protected stormGlass = new StormGlass()) {}

    public async processForecastForBeaches(beaches: Beach[]): Promise<BeachForecast[]> {
        const pointWithCurrentSource: BeachForecast[] = []; // recebe array de beaches
        for (const beach of beaches) { 
            const points = await this.stormGlass.fetchPoint(beach.lat, beach.lng) // fetch dos dados da previsão
            const enrichedBeachData = points.map(e => ({ // merge da previsão com dados da beach
                ... {
                    name: beach.name,
                    lat: beach.lat,
                    lng: beach.lng,
                    position: beach.position,
                    rating: 1
                },
                ... e,

            }));
            pointWithCurrentSource.push(...enrichedBeachData);
        }

        return pointWithCurrentSource;
    }
}