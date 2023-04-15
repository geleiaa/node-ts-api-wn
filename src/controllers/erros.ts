import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/usersModel';
import { DatabaseError, DatabaseUnknownClientError, DatabaseValidationError } from '@src/repositories/repository';
import ApiError, { APIError } from '@src/utils/errors/api-errors';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class ErrosController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (
      error instanceof DatabaseValidationError ||
      error instanceof DatabaseUnknownClientError
      ) {
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

  private handleClientErrors(error: DatabaseError): {
    code: number;
    error: string;
  } {
    if (error instanceof DatabaseValidationError) {
      return { code: 409, error: error.message };
    }
    return { code: 400, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiErr: APIError): Response {
    return res.status(apiErr.code).send(ApiError.format(apiErr));
  }
}
