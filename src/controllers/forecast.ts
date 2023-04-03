import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';

@Controller('forecast')
export class ForecastController {
  @Get('')
  public getForLoggedUser(req: Request, res: Response): void {
    res.status(200).json({
      message: 'lalau',
    });
  }
}
