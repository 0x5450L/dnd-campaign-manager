export const getTokenFromCookie = (cookieHeader: string | undefined): string | undefined => {
  if (!cookieHeader) return undefined;
  return cookieHeader.split(/;\s*/).find(cookie => cookie.startsWith('token='))?.split('=')[1];
};