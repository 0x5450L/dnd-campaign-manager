type ApiErrorData = {
  status: string;
  message: string;
  error?: string;
};

export class ApiError extends Error {
  status: number;
  data: ApiErrorData;

  constructor(status: number, data: ApiErrorData) {
    super(data.message || 'API Error');
    this.status = status;
    this.data = data;
  };
};