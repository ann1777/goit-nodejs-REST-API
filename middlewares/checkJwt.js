import User from "../models/user.js";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import HttpError from "../helpers/HTTPError.js";
import bodyWrapper from "../decorators/bodyWrapper.js";

const { JWT_SECRET_KEY } = process.env;

const checkJwt = async (req, res, next) => {
  try {
    const [bearer, token] = req.header.authorization?.split(" ");
    const payload = jwt.verify(token, JWT_SECRET_KEY);
    const user = await User.findOne({ _id: payload.id });
    if (bearer !== "Bearer" || !token || !user || !user.token) {
      throw new HttpError(401, "Unauthorized");
    }
    req.user = user;
    next();
  } catch (error) {
    throw HttpError(401, error.message);
  }
};

export default bodyWrapper(checkJwt);
