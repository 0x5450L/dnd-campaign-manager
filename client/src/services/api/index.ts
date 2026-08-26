import { ApiError, type ApiErrorData } from "./errors";

const readBody = async (response: Response): Promise<unknown> => {
  const raw = await response.text();
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw.slice(0, 300) };
  }
};

export const apiClient = async <T>(url: string, options: RequestInit): Promise<T> => {
  options.headers = { ...options.headers, 'Content-Type': 'application/json' };
  options.credentials = 'include';

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError(0, { message: "Could not reach the server" });
  }

  const body = await readBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, (body ?? {}) as ApiErrorData);
  }

  return body as T;
}
