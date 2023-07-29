import User from "../models/user.js";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import HttpError from "../helpers/HTTPError.js";
import { HttpCode } from "../constants/user-constants.js";
import bodyWrapper from "../decorators/bodyWrapper.js";

const { JWT_SECRET_KEY } = process.env;

export const checkJwt = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization?.split(" ");
  const payload = jwt.verify(token, JWT_SECRET_KEY);
  const user = await User.findOne({ _id: payload.id });
  if (bearer !== "Bearer" || !token || !user || !user.token) {
    throw new HttpError(HttpCode.UNAUTHORIZED, "Unauthorized");
  }
  try {
    const { id } = jwt.verify(token, JWT_SECRET_KEY);
    const user = await User.findById({ id });
    if (!user || !user.token) {
      throw HttpError(HttpCode.UNAUTHORIZED);
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    throw HttpError(HttpCode.UNAUTHORIZED, "Unauthorized");
  }
};

export default bodyWrapper(checkJwt);
