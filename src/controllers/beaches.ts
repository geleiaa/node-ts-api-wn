  import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import logger from '@src/logger';
import { AuthMiddleware } from '@src/middlewares/authMid';
import { Beach } from '@src/models/beachModel';
import { Request, Response } from 'express';
import { ErrosController } from './erros';
import { BeachRepository } from '@src/repositories/Irepositories';

@Controller('beaches')
@ClassMiddleware(AuthMiddleware)
export class BeachesController extends ErrosController {
  constructor(private beachRepo: BeachRepository) {
    super();
  }

  @Post()
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.beachRepo.create({ ...req.body, ...{ userId: req.decoded?.userId } });

      res.status(201).send(result);
    } catch (error) {
      logger.error(error);
      this.sendCreateUpdateErrorResponse(res, error as Error);
    }
  }
}
