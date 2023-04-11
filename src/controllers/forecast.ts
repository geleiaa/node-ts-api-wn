import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import logger from '@src/logger';
import { AuthMiddleware } from '@src/middlewares/authMid';
import { Beach } from '@src/models/beachModel';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';
import { ErrosController } from './erros';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(AuthMiddleware)
export class ForecastController extends ErrosController {
  @Get('')
  public async getForLoggedUser(req: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (err) {
      this.sendErrorResponse(res, { code: 500, message: 'Something went wrong' });
    }
  }
}
