import { HttpError } from "../helpers/index.js";
import { HttpCode } from "../constants/user-constants.js";

const isEmptyBody = (req, res, next) => {
  const { length } = Object.keys(req.body);
  if (!length) {
    return next(HttpError(HttpCode.BAD_REQUEST, "Fields must be required"));
  }
  next();
};

export default isEmptyBody;
