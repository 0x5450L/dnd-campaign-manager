export type User = {
  email: string;
  name: string;
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