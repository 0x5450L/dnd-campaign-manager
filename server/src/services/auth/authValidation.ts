import { AppError } from "../../utils/errors";

type RegisterBody = {
  email?: string;
  password?: string;
  displayName?: string;
};

export const requireRegisterFields = (body: RegisterBody) => {
  if (!body.email || !body.password || !body.displayName) {
    throw new AppError(400, "Email, password and name are required");
  }
  return { email: body.email, password: body.password, displayName: body.displayName };
};
