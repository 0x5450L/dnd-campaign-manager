import { Router } from "express";
import type { Response } from "express";
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

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
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
  res.clearCookie("token");
  res.json({ status: "ok", message: "Logout successful" });
});

export default router;
