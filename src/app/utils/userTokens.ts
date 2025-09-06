import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { IsActive, IsApproved, IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_ACCESS_SECRET,
    envVars.JWT.JWT_ACCESS_EXPIRES
  );
  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_REFRESH_SECRET,
    envVars.JWT.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

  if (!isUserExist) {
    throw new AppError(status.BAD_REQUEST, "User does not exist");
  }
  if (isUserExist.isActive === IsActive.BLOCK) {
    // || isUserExist.isActive === IsActive.INACTIVE)
    throw new AppError(status.BAD_REQUEST, `User is ${isUserExist.isActive}`);
  }
  if (isUserExist.isApproved === IsApproved.SUSPEND) {
    throw new AppError(
      status.BAD_REQUEST,
      `Agent is ${isUserExist.isApproved}`
    );
  }
  if (isUserExist.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "User is deleted");
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_ACCESS_SECRET,
    envVars.JWT.JWT_ACCESS_EXPIRES
  );

  return accessToken;
};
