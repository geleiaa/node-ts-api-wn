import '@src/utils/module-alias';
import { Application, json } from 'express';
import { Server } from '@overnightjs/core';
import { ForecastController } from './controllers/forecast';

export class SetupServer extends Server {
  constructor(private port = 1234) {
    super();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
  }
}
