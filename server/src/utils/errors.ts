export class AppError extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super(message || 'App Error');
    this.statusCode = statusCode;
    this.message = message;
  }
}