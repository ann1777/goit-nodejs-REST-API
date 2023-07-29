import { HttpError } from "../helpers/index.js";
import { HttpCode } from "../constants/user-constants.js";

const validateBody = (schema) => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(HttpError(HttpCode.BAD_REQUEST, error.message));
    }
    next();
  };

  return func;
};

export default validateBody;
