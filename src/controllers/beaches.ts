import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { AuthMiddleware } from '@src/middlewares/authMid';
import { Beach } from '@src/models/beachModel';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('beaches')
@ClassMiddleware(AuthMiddleware)
export class BeachesController {
  @Post()
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({ ...req.body, ...{ user: req.decoded?.id } });
      const result = await beach.save();

      res.status(201).send(result);
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(422).send({ error: err.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
}
