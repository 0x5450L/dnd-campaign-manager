export const getTokenFromCookie = (cookieHeader: string | undefined): string | undefined => {
  if (!cookieHeader) return undefined;
  return cookieHeader.split('; ').find(cookie => cookie.startsWith('token='))?.split('=')[1];
};