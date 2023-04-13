import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/usersModel';
import ApiError, { APIError } from '@src/utils/errors/api-errors';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class ErrosController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErro = this.handleClientErrors(error);
      res
        .status(clientErro.code)
        .send(
          ApiError.format({ code: clientErro.code, message: clientErro.error })
        );
    } else {
      logger.error(error);
      res
        .status(500)
        .send(ApiError.format({ code: 500, message: 'Internal Server Error' }));
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): {
    code: number;
    error: string;
  } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) =>
        err.name === 'ValidatorError' &&
        err.kind === CUSTOM_VALIDATION.DUPLICATED
    );
    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiErr: APIError): Response {
    return res.status(apiErr.code).send(ApiError.format(apiErr));
  }
}
