import { HttpCode } from "../constants/user-constants.js";
const handleMongooseError = (error, data, next) => {
  error.status = HttpCode.BAD_REQUEST;
  next();
};

export default handleMongooseError;
