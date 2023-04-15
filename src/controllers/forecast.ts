import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware,
} from '@overnightjs/core';
import { AuthMiddleware } from '@src/middlewares/authMid';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';
import { ErrosController } from './erros';
import rateLimit from 'express-rate-limit';
import ApiError from '@src/utils/errors/api-errors';
import { BeachRepository } from '@src/repositories/Irepositories';
import logger from '@src/logger';

const forecast = new Forecast();

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute in milliseconds
  max: 10,
  keyGenerator(req: Request): string {
    return req.ip;
  },
  handler(_, res: Response): void {
    res.status(429).send(
      ApiError.format({
        code: 429,
        message: "Too many requests to the '/forecast endpoint'",
      })
    );
  },
});

@Controller('forecast')
@ClassMiddleware(AuthMiddleware)
export class ForecastController extends ErrosController {
  constructor(private beachRepo: BeachRepository) {
    super();
  }

  @Get('')
  @Middleware(rateLimiter)
  public async getForLoggedUser(req: Request, res: Response): Promise<void> {
    try {

      if (!req.decoded?.userId) {
        this.sendErrorResponse(res, {
          code: 500,
          message: 'Something went wrong',
        });
        logger.error('Missing userId');
        return;
      }

      const beaches = await this.beachRepo.findAllBeachesForUser(req.decoded?.userId);
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (err) {
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
