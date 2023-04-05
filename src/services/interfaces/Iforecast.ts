import { ForecastPoint } from "@src/clients/interfaces/IstormGlass";

export enum BeachPosition {
    S = 'S',
    E = 'E',
    W = 'W',
    N = 'N',
}

export interface Beach {
    name: string;
    position: BeachPosition;
    lat: number;
    lng: number;
    user: string;
}

export interface TimeForcast {
    time: string;
    forecast: BeachForecast[];
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}