import './utils/module-alias'; /*<---*/
import { Application, json } from 'express';
import { Server } from '@overnightjs/core';
import { ForecastController } from '@src/controllers/forecast';
import { BeachesController } from '@src/controllers/beaches';
import { UsersController } from './controllers/users';
import * as database from '@src/database';

export class SetupServer extends Server {
  constructor(private port = 1234) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log('Server up in port:', this.port);
      
    })
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();
    this.addControllers([forecastController, beachesController, usersController]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }
}
