import { Model, Schema } from 'mongoose';
import { handleSaveError, runValidateAtUpdate } from './hooks.js';
import { emailRegexp } from '../constants/user-constants.js';

import Joi from 'joi';
import { emailDateRegexp } from '../constants/contacts-constants.js';
const subOpts = ['starter', 'pro', 'business'];
const userSchema = new Schema(
  {
    email: {
      type: String,
      match: emailRegexp,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: [true, 'Set password for user'],
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    token: String,
    avatarURL: String,
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre('findOneAndUpdate', runValidateAtUpdate);
userSchema.post('save', handleSaveError);

const registerSchema = Joi.object({
  subscription: Joi.string().valid(...subOpts),
  email: Joi.string().pattern(emailDateRegexp).required(),
  password: Joi.string().min(6).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(emailDateRegexp).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailDateRegexp).required(),
  password: Joi.string().min(6).required(),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...subOpts)
    .required(),
});
userSchema.post('findOneAndUpdate', handleSaveError);

const User = new Model('user', {
  userSchema,
  registerSchema,
  emailSchema,
  loginSchema,
  updateSubscriptionSchema,
});

export default User;
