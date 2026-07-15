import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt";
import { AppError } from "../../utils/errors";
import * as authRepo from "./authRepository";

export const register = async (body: {
  email: string;
  password: string;
  displayName: string;
}) => {
  const { email, password, displayName } = body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await authRepo.createUser(email, passwordHash, displayName);
  const token = generateToken(user.id);
  return { user: { email, displayName, id: user.id }, token };
};

export const login = async (body: { email: string; password: string }) => {
  const user = await authRepo.findByEmail(body.email);
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = generateToken(user.id);
  return {
    user: { email: user.email, displayName: user.displayName, id: user.id },
    token,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await authRepo.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return { email: user.email, displayName: user.displayName, id: user.id };
};
