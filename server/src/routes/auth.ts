import { Router } from "express";
import type { Response } from "express";
import { config } from "../config";
import type { ParamsDictionary } from "express-serve-static-core";
import { asyncHandler } from "../utils/asyncHandler";
import { createRateLimit } from "../middleware/rateLimit";
import { validateBody } from "../middleware/validateBody";
import { SESSION_TTL_SECONDS } from "../constants/session";
import {
  loginSchema,
  registerSchema,
  type LoginBody,
  type RegisterBody,
} from "../validation/auth";
import * as authService from "../services/auth/authService";

const router = Router();

const AUTH_COOKIE_MAX_AGE_MS = SESSION_TTL_SECONDS * 1000;

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

const failedLoginRateLimit = createRateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 10,
  message: "Too many failed sign-in attempts, try again later",
  countWhen: (res) => res.statusCode === 401,
});

const loginFloodRateLimit = createRateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 60,
  message: "Too many sign-in attempts, wait a moment",
});

const registerRateLimit = createRateLimit({
  windowMs: ONE_HOUR_MS,
  max: 10,
  message: "Too many accounts created from here, try again later",
});

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  });
};

router.post("/register", registerRateLimit, validateBody(registerSchema), asyncHandler<ParamsDictionary, unknown, RegisterBody>(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  res.json({ status: "ok", message: "User created successfully", user, token });
}));

router.post("/login", loginFloodRateLimit, failedLoginRateLimit, validateBody(loginSchema), asyncHandler<ParamsDictionary, unknown, LoginBody>(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  setAuthCookie(res, token);
  res.json({ status: "ok", message: "Login successful", user, token });
}));

router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
  });
  res.json({ status: "ok", message: "Logout successful" });
});

export default router;
