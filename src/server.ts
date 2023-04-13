import './utils/module-alias'; /*<---*/
import { Application, json } from 'express';
import { Server } from '@overnightjs/core';
import { ForecastController } from '@src/controllers/forecast';
import { BeachesController } from '@src/controllers/beaches';
import { UsersController } from './controllers/users';
import { apiErrorValidator } from './middlewares/api-error-validator';
import * as database from '@src/database';
import logger from './logger';
import cors from 'cors';
import PinoHttp from 'pino-http';

import swaggerUi from 'swagger-ui-express';
import apiJsonFile from './swagger.json';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

export class SetupServer extends Server {
  constructor(private port = 1234) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docsSetup();
    this.setupControllers();
    await this.databaseSetup();
    this.setupErrorHandlers();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info('Server up in port:' + this.port);
    });
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(json());
    this.app.use(cors());
    this.app.use(PinoHttp(logger));
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();
    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiJsonFile));
    this.app.use(OpenApiValidator.middleware({
      apiSpec: apiJsonFile as OpenAPIV3.Document,
      validateRequests: false, //will be implemented in step2
      validateResponses: false, //will be implemented in step2
    }));
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }
}
