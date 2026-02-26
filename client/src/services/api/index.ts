export const apiClient = async <T>(url: string, options: RequestInit): Promise<T> => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  options.headers = { ...options.headers, 'Content-Type': 'application/json' };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as T;
}
