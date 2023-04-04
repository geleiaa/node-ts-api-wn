export class InternalError extends Error {
  constructor(
    public message: string,
    protected statuscode: number = 500,
    protected descript?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
