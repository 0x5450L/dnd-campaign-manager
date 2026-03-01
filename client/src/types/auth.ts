export type User = {
  email: string;
  displayName: string;
  id: string;
}

export type LoginResponse = {
  status: 'ok' | 'error';
  message: string;
  user: User;
  token: string;
}

export type RegisterResponse = LoginResponse;

export type MeResponse = {
  status: 'ok' | 'error';
  message: string;
  user: User;
}