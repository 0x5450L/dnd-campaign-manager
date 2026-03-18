export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message || 'App Error');
    this.statusCode = statusCode;
  }
}