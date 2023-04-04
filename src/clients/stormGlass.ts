import { InternalError } from '@src/utils/errors/internal-error';
import { AxiosError, AxiosStatic } from 'axios';

export interface StormGlassPointSource {
    [key: string]: number;
}

export interface StormGlassPoint {
    time: string;
    readonly waveHeight: StormGlassPointSource;
    readonly waveDirection: StormGlassPointSource;
    readonly swellDirection: StormGlassPointSource;
    readonly swellHeight: StormGlassPointSource;
    readonly swellPeriod: StormGlassPointSource;
    readonly windDirection: StormGlassPointSource;
    readonly windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
    hours: StormGlassPoint[];
}

export interface ForecastPoint {
    time: string;
    waveHeight: number;
    waveDirection: number;
    swellDirection: number;
    swellHeight: number;
    swellPeriod: number;
    windDirection: number;
    windSpeed: number;
}

export class ClientReqError extends InternalError {
    constructor(message: string) {
        const InternalMessage = 'Unexpected error when trying to communicate to StormGlass'
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

export class StormGlass {
    readonly stormGlassAPIParams =
        'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

    readonly stormGlassAPISource = 'noaa';

    constructor(protected request: AxiosStatic) { }

    public async fetchPoint(lat: number, lng: number): Promise<ForecastPoint[]> {
        try {
            const resp = await this.request.get(`https://api.stormglass.io/v2/weather/point?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&lat=${lat}&lng=${lng}`,
                {
                    headers: {
                        'Authorization': 'example-api-key'
                    },
                }
            )

            return this.normalizeResponse(resp.data);
        } catch (err) {
            const axiosError = err as AxiosError;
            if (
                axiosError instanceof Error &&
                axiosError.response &&
                axiosError.response.status
            ) {
                throw new StormGlassResponseError(
                    `Error: ${JSON.stringify(axiosError.response.data)} Code: ${axiosError.response.status
                    }`
                );
            }
            throw new ClientReqError((err as Error).message);
        }
    }

    private normalizeResponse(points: StormGlassForecastResponse): ForecastPoint[] {
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

    private isValidPoints(point: Partial<StormGlassPoint>): boolean { // check se a resp da api SG esta inteira [C02P01-2]
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
}