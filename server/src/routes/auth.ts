import { Router } from "express";
import type { Response } from "express";
import { config } from "../config";
import type { ParamsDictionary } from "express-serve-static-core";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validateBody";
import {
  loginSchema,
  registerSchema,
  type LoginBody,
  type RegisterBody,
} from "../validation/auth";
import * as authService from "../services/auth/authService";

const router = Router();

const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  });
};

router.post("/register", validateBody(registerSchema), asyncHandler<ParamsDictionary, unknown, RegisterBody>(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  res.json({ status: "ok", message: "User created successfully", user, token });
}));

router.post("/login", validateBody(loginSchema), asyncHandler<ParamsDictionary, unknown, LoginBody>(async (req, res) => {
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
