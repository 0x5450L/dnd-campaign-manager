import { ApiError } from "./errors";

export const apiClient = async <T>(url: string, options: RequestInit): Promise<T> => {
  const token = localStorage.getItem('dndCampaignManagerJWT');
  
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  options.headers = { ...options.headers, 'Content-Type': 'application/json' };

  const response = await fetch(url, options);

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}
