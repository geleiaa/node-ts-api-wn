import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import logger from '@src/logger';
import { AuthMiddleware } from '@src/middlewares/authMid';
import { Beach } from '@src/models/beachModel';
import { Request, Response } from 'express';
import { ErrosController } from './erros';

@Controller('beaches')
@ClassMiddleware(AuthMiddleware)
export class BeachesController extends ErrosController{
  @Post()
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({ ...req.body, ...{ user: req.decoded?.id } });
      const result = await beach.save();

      res.status(201).send(result);
    } catch (error) {
      logger.error(error);
      this.sendCreateUpdateErrorResponse(res, (error as Error))
    }
  }
}
