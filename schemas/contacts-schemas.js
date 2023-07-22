import Joi from "joi";
import {
  emailDateRegexp,
  nameDateRegexp,
  phoneDateRegexp,
} from "../constants/contacts-constants.js";

const contactAddSchema = Joi.object({
  name: Joi.string().pattern(nameDateRegexp).required().messages({
    "any.required": `"name" must be exist`,
  }),
  email: Joi.string().email().pattern(emailDateRegexp).required().messages({
    "any.required": `"email" must be exist`,
  }),
  phone: Joi.string().pattern(phoneDateRegexp).required().messages({
    "any.required": `"phone" must be exist`,
  }),
  favorite: Joi.boolean().required(),
});

const updateFavoriteContactSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

export default {
  contactAddSchema,
  updateFavoriteContactSchema,
};
