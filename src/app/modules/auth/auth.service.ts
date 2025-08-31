import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatusCode from "http-status-codes";
import bcrypt from "bcryptjs";
import { createTokens } from "../../utils/usertokens";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password: plainPassword } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatusCode.NOT_FOUND, "User doesn't exist");
  }

  const isPasswordMatch = await bcrypt.compare(plainPassword as string, isUserExist.password as string);

  if (!isPasswordMatch) {
    throw new AppError(httpStatusCode.BAD_REQUEST, "Password doesn't match");
  }

  const tokens = createTokens(isUserExist);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = isUserExist.toObject();

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: rest,
  };
};

export const AuthServices = {
  credentialsLogin,
};
