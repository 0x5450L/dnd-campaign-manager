type ApiErrorData = {
  status: string;
  error: {
    message: string;
    statusCode: number;
  };
};

export class ApiError extends Error {
  status: number;
  data: ApiErrorData;

  constructor(status: number, data: ApiErrorData) {
    super(data.error.message || 'API Error');
    this.status = status;
    this.data = data;
  };
};