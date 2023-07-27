import Joi from "joi";
import { emailRegexp } from "../constants/user-constants.js";

const userSignUpSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const userSignInSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

export default { userSignUpSchema, userSignInSchema };
